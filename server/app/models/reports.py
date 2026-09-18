from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Boolean, CheckConstraint, Column, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint

from app.core.database import Base


class Reports(Base):
    __tablename__ = 'reports'
    __table_args__ = (
        CheckConstraint("report_type IN ('DAILY', 'WEEKLY')", name='ck_reports_report_type'),
        UniqueConstraint('employee_id', 'report_type', 'period_start', name='uq_reports_employee_type_period'),
    )

    """
    reports 테이블

       Column    |            Type             | Collation | Nullable |               Default
    -------------+-----------------------------+-----------+----------+-------------------------------------
    id           | integer                     |           | not null | nextval('reports_id_seq'::regclass)
    employee_id  | integer                     |           | not null |
    report_type  | character varying(10)       |           | not null |
    period_start | date                        |           | not null |
    content      | character varying(5000)     |           | not null |
    submitted    | boolean                     |           | not null | false
    created_at   | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
    updated_at   | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
    """

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey('employees.id'), nullable=False, index=True)
    report_type = Column(String(10), nullable=False)
    period_start = Column(Date, nullable=False)
    content = Column(String(5000), nullable=False)
    submitted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(ZoneInfo('Asia/Seoul')))
    updated_at = Column(DateTime,nullable=False,default=lambda: datetime.now(ZoneInfo('Asia/Seoul')),onupdate=lambda: datetime.now(ZoneInfo('Asia/Seoul')),)
