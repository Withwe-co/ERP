"""보고서 API"""

from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError, TimeoutError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.reports import Reports
from app.schemas.reports import ReportCreateBase, ReportInDBBase, ReportUpdateBase

router = APIRouter()


@router.post("/{report_type}", response_model=ReportInDBBase)
def create_report(report_type: Literal["daily", "weekly"],report_in: ReportCreateBase,db: Session = Depends(get_db),):
    """
        summary : 일일/주간 보고서 생성 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - report_in (ReportCreateBase) : 보고서 생성 요청 데이터
            - db (Session) : DB 세션

        desc :
            - 일일 또는 주간 보고서를 생성하고, 생성된 보고서 데이터를 반환
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 같은 직원과 보고 유형, 기준 날짜의 보고서가 이미 존재하는 경우에는 409 에러를 반환
            - 경로와 요청 데이터의 report_type이 일치하지 않는 경우에는 422 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환

    """
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

    # 요청 데이터를 사용해 제출 완료 상태의 일일 또는 주간 보고서 모델을 생성한다.
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
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 생성 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        db.rollback()
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 생성 중 데이터베이스 오류가 발생했습니다.",) from exc

    # 저장이 완료된 보고서 데이터를 반환한다.
    return report


@router.get("/statuses", response_model=list[ReportInDBBase])
def read_report_statuses(daily_period_start: date = Query(..., description="일일 보고 대상 날짜"),weekly_period_start: date = Query(..., description="주간 보고 시작일"),db: Session = Depends(get_db),):
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
        # 오늘 일일 보고서와 이번 주 주간 보고서를 한 번에 조회한다.
        reports = db.query(Reports).filter(or_(and_(Reports.report_type == "DAILY",Reports.period_start == daily_period_start,),and_(Reports.report_type == "WEEKLY",Reports.period_start == weekly_period_start,),)).all()
        return reports
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        raise HTTPException(status_code=504,detail="보고서 상태 조회 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        raise HTTPException(status_code=500,detail="보고서 상태 조회 중 데이터베이스 오류가 발생했습니다.",) from exc


@router.get("/{report_type}", response_model=ReportInDBBase)
def read_report(report_type: Literal["daily", "weekly"],employee_id: int = Query(..., description="직원 ID"),period_start: date = Query(..., description="보고 대상 날짜 또는 주 시작일"),db: Session = Depends(get_db),):
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
def update_report(report_type: Literal["daily", "weekly"],report_id: int,report_in: ReportUpdateBase,db: Session = Depends(get_db),):
    """
        summary : 일일/주간 보고서 수정 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - report_id (int) : 수정할 보고서 ID
            - report_in (ReportUpdateBase) : 보고서 수정 요청 데이터
            - db (Session) : DB 세션

        desc :
            - 보고 유형과 ID로 일일 또는 주간 보고서를 수정
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 요청한 보고 유형과 ID에 해당하는 보고서가 존재하지 않는 경우에는 404 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
    """
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

    # 요청 데이터를 사용해 보고서의 필드를 업데이트한다.
    for field, value in report_in.model_dump(exclude_unset=True).items():
        setattr(report, field, value)

    try:
        # 변경된 보고서를 저장한다.
        db.commit()
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        db.rollback()
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 수정 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except IntegrityError as exc:
        # 데이터베이스 무결성 제약 조건 위반을 처리한다.
        db.rollback()
        raise HTTPException(status_code=409,detail="데이터베이스 무결성 제약 조건 위반.") from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        db.rollback()
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 수정 중 데이터베이스 오류가 발생했습니다.",) from exc

    # 업데이트된 보고서를 다시 불러온다.
    db.refresh(report)
    return report
