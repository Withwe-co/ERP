from datetime import date, datetime, time
from pydantic import BaseModel, ConfigDict


class AttendanceDay(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    work_date: date
    check_in: time
    check_out: time
    imported_at: datetime


class AttendanceImportResult(BaseModel):
    total: int
    imported: int
    skipped_existing: int
    skipped_unregistered: int
    skipped_empty: int
    skipped_not_due: int = 0
    start_date: date | None
    end_date: date | None
