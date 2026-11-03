from sqlalchemy import Column, ForeignKey,Integer,String,DateTime, Numeric
from app.core.database import Base
from zoneinfo import ZoneInfo
from datetime import datetime

class Leaves(Base):
    __tablename__ = "leave_requests"

    """
        leaves 테이블

   Column    |            Type             | Collation | Nullable |                  Default
-------------+-----------------------------+-----------+----------+--------------------------------------------
 id          | integer                     |           | not null | 등록 휴가 ID
 employee_id | integer                     |           | not null | 직원 ID
 leave_type  | character varying(20)       |           | not null | 휴가 유형
 start_date  | timestamp without time zone |           | not null | 시작일
 end_date    | timestamp without time zone |           | not null | 종료일
 total_days  | numeric(3,1)                |           | not null | 총 일수
 created_at  | timestamp without time zone |           | not null | 생성일
        
    """

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    leave_type = Column(String(20), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_days = Column(Numeric(3, 1), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Seoul")), nullable=False)