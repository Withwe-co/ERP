"""파일 수동 가져오기 및 직원별 캘린더 근태 조회."""
from datetime import date, datetime, timedelta, timezone
from pathlib import PurePosixPath
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.attendance import EmployeeAttendance
from app.models.employees import Employees
from app.schemas.attendance import AttendanceDay, AttendanceImportResult
from app.services.attendance_import import MAX_FILE_SIZE, import_attendance

router = APIRouter()


@router.post("/import", response_model=AttendanceImportResult)
def upload_attendance(
    file: UploadFile = File(...),
    completed_days_only: bool = Query(False, description="한국 시간 기준 전날까지의 근무일자만 저장"),
    db: Session = Depends(get_db),
):
    filename = PurePosixPath((file.filename or "").replace("\\", "/")).name
    if not filename.lower().endswith((".xls", ".txt")):
        raise HTTPException(422, "캡스에서 내보낸 XLS 또는 TXT 파일을 선택해주세요.")
    if len(filename) > 255:
        raise HTTPException(422, "파일명은 255자 이하여야 합니다.")
    content = file.file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "파일은 10MB 이하여야 합니다.")
    try:
        max_work_date = None
        if completed_days_only:
            max_work_date = datetime.now(timezone(timedelta(hours=9))).date() - timedelta(days=1)
        return import_attendance(db, content, filename, max_work_date)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(422, str(exc)) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(500, "출퇴근 기록 저장에 실패했습니다. 다시 시도해주세요.") from exc


@router.get("/calendar", response_model=list[AttendanceDay])
def read_attendance_calendar(
    employee_id: int = Query(..., gt=0),
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if start_date > end_date or (end_date - start_date).days > 366:
        raise HTTPException(422, "조회 기간은 시작일 이후 1년 이내로 지정해주세요.")
    if db.get(Employees, employee_id) is None:
        raise HTTPException(404, "직원을 찾을 수 없습니다.")
    return db.query(EmployeeAttendance).filter(
        EmployeeAttendance.employee_id == employee_id,
        EmployeeAttendance.work_date >= start_date,
        EmployeeAttendance.work_date <= end_date,
    ).order_by(EmployeeAttendance.work_date).all()
