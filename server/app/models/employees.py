from sqlalchemy import Column,Integer, Numeric,String
from app.core.database import Base

class Employees(Base):
    __tablename__ = "employees"

    """
        employees 테이블

          Column    |         Type          | Collation | Nullable |                Desc
        ------------+-----------------------+-----------+----------+---------------------------------------
        id          | integer               |           | not null | 직원 고유 ID
        name        | character varying(20) |           | not null | 직원 이름
        position    | character varying(20) |           | not null | 직급
        total_leave | numeric(3,1)          |           | not null | 총 휴가 일수
        used_leave  | numeric(3,1)          |           | not null | 사용한 휴가 일수
        
    """

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), nullable=False)
    position = Column(String(20), nullable=False)
    total_leave = Column(Numeric(3, 1), nullable=False)
    used_leave = Column(Numeric(3, 1), nullable=False)