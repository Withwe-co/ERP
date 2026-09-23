"""보고서 API"""

from datetime import date
from io import BytesIO
import json
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile
from PIL import Image
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError, TimeoutError
from sqlalchemy.orm import Session, load_only

from app.core.database import get_db
from app.models.reports import Reports
from app.schemas.reports import (ReportCalendarStatus, ReportCreateBase, ReportInDBBase, ReportUpdateBase, ReportWithEmployee,)
from app.models.employees import Employees


router = APIRouter()


@router.post("/{report_type}", response_model=ReportInDBBase)
async def create_report(report_type: Literal["daily", "weekly"],request: Request,db: Session = Depends(get_db),)-> ReportInDBBase:
    """
        summary : 일일/주간 보고서 생성 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - request (Request) : 보고서 JSON 또는 첨부 파일이 포함된 FormData
            - db (Session) : DB 세션

        desc :
            - 일일 또는 주간 보고서를 생성하고, 생성된 보고서 데이터를 반환
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 같은 직원과 보고 유형, 기준 날짜의 보고서가 이미 존재하는 경우에는 409 에러를 반환
            - 경로와 요청 데이터의 report_type이 일치하지 않는 경우에는 422 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
            - 드롭한 첨부 파일을 본문의 해당 위치에 연결한 뒤 저장

    """
    # JSON 요청과 파일이 포함된 FormData 요청을 같은 생성 모델로 검증한다.
    files: list[UploadFile] = []
    upload_ids: list[str] = []
    if request.headers.get('content-type', '').startswith('multipart/form-data'):
        form = await request.form()
        try:
            payload = json.loads(str(form.get('report')))
            report_in = ReportCreateBase.model_validate(payload)
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc
        files = form.getlist('files')
        upload_ids = [str(value) for value in form.getlist('upload_ids')]
    else:
        try:
            report_in = ReportCreateBase.model_validate(await request.json())
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc

    # 첨부 ID와 본문 노드의 대응을 확인하고 저장할 파일을 준비한다.
    if len(files) != len(upload_ids) or len(set(upload_ids)) != len(upload_ids) or len(files) > 10:
        raise HTTPException(status_code=422, detail='첨부 파일 목록이 올바르지 않습니다.')
    pending_nodes = {}
    stack = [report_in.content]
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            attrs = node.get('attrs') or {}
            if attrs.get('uploadId'):
                if attrs['uploadId'] in pending_nodes:
                    raise HTTPException(status_code=422, detail='첨부 파일 ID가 중복되었습니다.')
                pending_nodes[attrs['uploadId']] = node
            stack.extend(node.get('content') or [])
    if set(pending_nodes) != set(upload_ids):
        raise HTTPException(status_code=422, detail='본문과 첨부 파일 목록이 일치하지 않습니다.')

    attachments = []
    allowed_file_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.zip', '.ppt', '.pptx', '.hwp', '.hwpx', '.png', '.jpg', '.jpeg', '.gif', '.webp'}
    for file, upload_id in zip(files, upload_ids):
        content = await file.read(10 * 1024 * 1024 + 1)
        if not content or len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail='첨부 파일은 각각 10MB 이하만 허용됩니다.')
        node = pending_nodes[upload_id]
        if node.get('type') == 'reportImage':
            try:
                image = Image.open(BytesIO(content))
                image.verify()
                image_format = image.format
            except Exception as exc:
                raise HTTPException(status_code=400, detail='이미지 파일 형식이 올바르지 않습니다.') from exc
            extension = { 'PNG': '.png', 'JPEG': '.jpg', 'GIF': '.gif', 'WEBP': '.webp' }.get(image_format)
            if extension is None:
                raise HTTPException(status_code=400, detail='PNG, JPEG, GIF, WebP 이미지만 허용됩니다.')
            target_attr = 'src'
        elif node.get('type') == 'reportFile':
            extension = Path((file.filename or '').replace('\\', '/')).suffix.lower()
            if extension not in allowed_file_extensions:
                raise HTTPException(status_code=400, detail='지원하지 않는 첨부 파일 형식입니다.')
            target_attr = 'href'
        else:
            raise HTTPException(status_code=422, detail='본문 첨부 노드가 올바르지 않습니다.')
        file_path = Path('uploads/report_attachments') / f'{uuid4()}{extension}'
        attachments.append((file_path, content, node, target_attr))

    # 경로의 보고 유형을 데이터베이스에 저장하는 대문자 형식으로 변환한다.
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 경로와 요청 본문의 보고 유형이 같은지 확인한다.
    if report_in.report_type != normalized_report_type:
        raise HTTPException(status_code=422,detail=f"{report_name} 보고서는 report_type이 {normalized_report_type}여야 합니다.")

    # 주간 보고서의 기준 날짜가 해당 주의 월요일인지 확인한다.
    if normalized_report_type == "WEEKLY" and report_in.period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 period_start는 월요일이어야 합니다.")

    # 같은 직원·보고 유형·기준 날짜의 보고서가 이미 있는지 확인한다.
    existing_report = db.query(Reports).filter(Reports.employee_id == report_in.employee_id,Reports.report_type == normalized_report_type,Reports.period_start == report_in.period_start,).first()

    # 같은 조건의 보고서가 이미 존재하면 409 에러 반환
    if existing_report is not None:
        raise HTTPException(status_code=409,detail=f"해당 직원과 날짜의 {report_name} 보고서가 이미 존재합니다.")

    # 파일 주소를 드롭 위치의 노드에 넣고 제출 완료 보고서를 생성한다.
    saved_paths = []
    try:
        if attachments:
            Path('uploads/report_attachments').mkdir(parents=True, exist_ok=True)
        for file_path, content, node, target_attr in attachments:
            saved_paths.append(file_path)
            file_path.write_bytes(content)
            node['attrs'][target_attr] = f'/uploads/report_attachments/{file_path.name}'
            node['attrs'].pop('uploadId', None)
    except OSError as exc:
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail='보고서 첨부 파일 저장에 실패했습니다.') from exc

    report = Reports(
        employee_id=report_in.employee_id,
        report_type=normalized_report_type,
        period_start=report_in.period_start,
        content=report_in.content,
        submitted=True,
    )

    try:
        # 새 보고서를 저장한 뒤 생성된 식별자와 시간을 반영한다.
        db.add(report)
        db.commit()
        db.refresh(report)
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 생성 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 생성 중 데이터베이스 오류가 발생했습니다.",) from exc

    # 저장이 완료된 보고서 데이터를 반환한다.
    return report


@router.get("/statuses", response_model=list[ReportWithEmployee])
def read_report_statuses(daily_period_start: date = Query(..., description="일일 보고 대상 날짜"),weekly_period_start: date = Query(..., description="주간 보고 시작일"),db: Session = Depends(get_db),) -> list[ReportWithEmployee]:
    """
        summary : 직원별 일일/주간 보고서 제출 상태 조회 함수

        arg :
            - daily_period_start (date) : 조회할 일일 보고 날짜
            - weekly_period_start (date) : 조회할 주간 보고 시작일
            - db (Session) : DB 세션

        desc :
            - 선택한 일일 보고 날짜와 주간 시작일에 해당하는 보고서 목록을 반환
            - 주간 보고 시작일이 월요일이 아닌 경우에는 422 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
    """
    # 주간 보고서의 기준 날짜가 해당 주의 월요일인지 확인한다.
    if weekly_period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 weekly_period_start는 월요일이어야 합니다.")

    try:
        # 직원 테이블을 연결해 보고서와 필수 직원 이름을 함께 반환한다.
        reports = db.query(Reports, Employees.name.label("employee_name")).join(Employees, Reports.employee_id == Employees.id).filter(or_(and_(Reports.report_type == "DAILY",Reports.period_start == daily_period_start,),and_(Reports.report_type == "WEEKLY",Reports.period_start == weekly_period_start,),)).all()
        return [
            {**ReportInDBBase.model_validate(report).model_dump(), "employee_name": employee_name}
            for report, employee_name in reports
        ]
   
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        raise HTTPException(status_code=504,detail="보고서 상태 조회 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        raise HTTPException(status_code=500,detail="보고서 상태 조회 중 데이터베이스 오류가 발생했습니다.",) from exc


@router.get("/daily/calendar-status", response_model=list[ReportCalendarStatus],)
def read_daily_report_calendar_status(
    employee_id: int = Query(..., description="직원 ID"),
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    db: Session = Depends(get_db),
) -> list[ReportCalendarStatus]:
    """
    일일 업무 보고 달력의 작성 상태를 기간 기준으로 조회한다.
    """

    if start_date > end_date:
        raise HTTPException(status_code=422, detail="조회 종료일은 시작일보다 빠를 수 없습니다.",)

    try:
        reports = (
            db.query(Reports)
            .options(load_only(Reports.id, Reports.period_start, Reports.submitted,),)
            .filter(
                Reports.employee_id == employee_id,
                Reports.report_type == "DAILY",
                Reports.period_start >= start_date,
                Reports.period_start <= end_date,
            )
            .order_by(Reports.period_start.asc())
            .all()
        )

        return reports

    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=("일일 보고서 달력 상태 조회 중 데이터베이스 연결 시간이 초과되었습니다."),) from exc

    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail="일일 보고서 달력 상태 조회 중 데이터베이스 오류가 발생했습니다.",) from exc

        
@router.get("/{report_type}", response_model=ReportInDBBase)
def read_report(report_type: Literal["daily", "weekly"],employee_id: int = Query(..., description="직원 ID"),period_start: date = Query(..., description="보고 대상 날짜 또는 주 시작일"),db: Session = Depends(get_db),) -> ReportInDBBase:
    """
        summary : 일일/주간 보고서 조회 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - employee_id (int) : 조회할 직원 ID
            - period_start (date) : 보고 대상 날짜 또는 주 시작일
            - db (Session) : DB 세션

        desc :
            - 보고 유형과 기준 날짜로 일일 또는 주간 보고서를 조회
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 요청한 조건에 해당하는 보고서가 존재하지 않는 경우에는 404 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
    """
    # 경로의 보고 유형을 데이터베이스 조회에 사용하는 대문자 형식으로 변환한다.
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 주간 보고서의 기준 날짜가 해당 주의 월요일인지 확인한다.
    if normalized_report_type == "WEEKLY" and period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 period_start는 월요일이어야 합니다.")

    try:
        # 요청한 직원·보고 유형·기준 날짜를 사용해 보고서를 조회한다.
        report = db.query(Reports).filter(Reports.employee_id == employee_id,Reports.report_type == normalized_report_type,Reports.period_start == period_start,).first()

        # 요청한 조건에 해당하는 보고서가 존재하지 않으면 404 에러 반환
        if report is None:
            raise HTTPException(status_code=404,detail=f"해당 직원과 날짜의 {report_name} 보고서를 찾을 수 없습니다.")

        return report
    except HTTPException:
        # 조회 결과가 없을 때 발생한 HTTP 예외를 그대로 반환한다.
        raise
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 조회 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 조회 중 데이터베이스 오류가 발생했습니다.",) from exc


@router.put("/{report_type}/{report_id}", response_model=ReportInDBBase)
async def update_report(report_type: Literal["daily", "weekly"],report_id: int,request: Request,db: Session = Depends(get_db),) -> ReportInDBBase:
    """
        summary : 일일/주간 보고서 수정 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - report_id (int) : 수정할 보고서 ID
            - request (Request) : 보고서 JSON 또는 첨부 파일이 포함된 FormData
            - db (Session) : DB 세션

        desc :
            - 보고 유형과 ID로 일일 또는 주간 보고서를 수정
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 요청한 보고 유형과 ID에 해당하는 보고서가 존재하지 않는 경우에는 404 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
            - 새 첨부 파일을 드롭 위치에 연결하고 기존 본문 첨부는 유지
    """
    # JSON 요청과 파일이 포함된 FormData 요청을 같은 수정 모델로 검증한다.
    files: list[UploadFile] = []
    upload_ids: list[str] = []
    if request.headers.get('content-type', '').startswith('multipart/form-data'):
        form = await request.form()
        try:
            payload = json.loads(str(form.get('report')))
            report_in = ReportUpdateBase.model_validate(payload)
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc
        files = form.getlist('files')
        upload_ids = [str(value) for value in form.getlist('upload_ids')]
    else:
        try:
            report_in = ReportUpdateBase.model_validate(await request.json())
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc

    # 새 첨부 ID가 본문 노드와 일치하는지 확인하고 파일을 준비한다.
    if len(files) != len(upload_ids) or len(set(upload_ids)) != len(upload_ids) or len(files) > 10:
        raise HTTPException(status_code=422, detail='첨부 파일 목록이 올바르지 않습니다.')
    pending_nodes = {}
    stack = [report_in.content] if report_in.content else []
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            attrs = node.get('attrs') or {}
            if attrs.get('uploadId'):
                if attrs['uploadId'] in pending_nodes:
                    raise HTTPException(status_code=422, detail='첨부 파일 ID가 중복되었습니다.')
                pending_nodes[attrs['uploadId']] = node
            stack.extend(node.get('content') or [])
    if set(pending_nodes) != set(upload_ids):
        raise HTTPException(status_code=422, detail='본문과 첨부 파일 목록이 일치하지 않습니다.')

    attachments = []
    allowed_file_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.zip', '.ppt', '.pptx', '.hwp', '.hwpx', '.png', '.jpg', '.jpeg', '.gif', '.webp'}
    for file, upload_id in zip(files, upload_ids):
        content = await file.read(10 * 1024 * 1024 + 1)
        if not content or len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail='첨부 파일은 각각 10MB 이하만 허용됩니다.')
        node = pending_nodes[upload_id]
        if node.get('type') == 'reportImage':
            try:
                image = Image.open(BytesIO(content))
                image.verify()
                image_format = image.format
            except Exception as exc:
                raise HTTPException(status_code=400, detail='이미지 파일 형식이 올바르지 않습니다.') from exc
            extension = { 'PNG': '.png', 'JPEG': '.jpg', 'GIF': '.gif', 'WEBP': '.webp' }.get(image_format)
            if extension is None:
                raise HTTPException(status_code=400, detail='PNG, JPEG, GIF, WebP 이미지만 허용됩니다.')
            target_attr = 'src'
        elif node.get('type') == 'reportFile':
            extension = Path((file.filename or '').replace('\\', '/')).suffix.lower()
            if extension not in allowed_file_extensions:
                raise HTTPException(status_code=400, detail='지원하지 않는 첨부 파일 형식입니다.')
            target_attr = 'href'
        else:
            raise HTTPException(status_code=422, detail='본문 첨부 노드가 올바르지 않습니다.')
        file_path = Path('uploads/report_attachments') / f'{uuid4()}{extension}'
        attachments.append((file_path, content, node, target_attr))

    # 경로의 보고 유형을 데이터베이스 조회에 사용하는 대문자 형식으로 변환한다.
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 수정할 주간 기준 날짜가 해당 주의 월요일인지 확인한다.
    if normalized_report_type == "WEEKLY" and report_in.period_start is not None and report_in.period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 period_start는 월요일이어야 합니다.")

    # 요청한 보고 유형과 ID를 사용해 수정할 보고서를 조회한다.
    report = db.query(Reports).filter(Reports.id == report_id,Reports.report_type == normalized_report_type,).first()

    # 요청한 보고 유형과 ID에 해당하는 보고서가 존재하지 않으면 404 에러 반환
    if report is None:
        raise HTTPException(status_code=404,detail=f"해당 ID의 {report_name} 보고서를 찾을 수 없습니다.")

    # 새 파일 주소를 드롭 위치의 노드에 넣고 보고서 필드를 업데이트한다.
    saved_paths = []
    try:
        if attachments:
            Path('uploads/report_attachments').mkdir(parents=True, exist_ok=True)
        for file_path, content, node, target_attr in attachments:
            saved_paths.append(file_path)
            file_path.write_bytes(content)
            node['attrs'][target_attr] = f'/uploads/report_attachments/{file_path.name}'
            node['attrs'].pop('uploadId', None)
    except OSError as exc:
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail='보고서 첨부 파일 저장에 실패했습니다.') from exc

    for field, value in report_in.model_dump(exclude_unset=True).items():
        setattr(report, field, value)

    try:
        # 변경된 보고서를 저장한다.
        db.commit()
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 수정 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except IntegrityError as exc:
        # 데이터베이스 무결성 제약 조건 위반을 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=409,detail="데이터베이스 무결성 제약 조건 위반.") from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 수정 중 데이터베이스 오류가 발생했습니다.",) from exc

    # 업데이트된 보고서를 다시 불러온다.
    db.refresh(report)
    return report
