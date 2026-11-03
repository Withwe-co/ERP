"""캡스에서 최초 수신한 직원별 하루 근태."""
from datetime import datetime, timezone
from sqlalchemy import CheckConstraint, Column, Date, DateTime, ForeignKey, Integer, String, Time, UniqueConstraint
from app.core.database import Base


class EmployeeAttendance(Base):
    __tablename__ = "employee_attendance"
    __table_args__ = (
        CheckConstraint("check_out >= check_in", name="ck_attendance_same_day"),
        UniqueConstraint("employee_id", "work_date", name="uq_attendance_employee_date"),
        UniqueConstraint("caps_user_id", "work_date", name="uq_attendance_caps_date"),
    )

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    caps_user_id = Column(String(50), nullable=False)
    work_date = Column(Date, nullable=False, index=True)
    check_in = Column(Time, nullable=False)
    check_out = Column(Time, nullable=False)
    source_filename = Column(String(255), nullable=False)
    imported_at = Column(DateTime(timezone=True), nullable=False,
                         default=lambda: datetime.now(timezone.utc))
