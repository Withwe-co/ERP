from sqlalchemy import Column,Integer,String,Text,Date,UniqueConstraint
from app.core.database import Base
from zoneinfo import ZoneInfo
from datetime import datetime

class Wbs(Base):
    __tablename__ = "wbs"

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "wbs_code",
            name="uq_wbs_project_wbs_code",
        ),
    )
    """
        wbs 테이블

            Column      |            Type             | Collation | Nullable |   Desc  
        ----------------+-----------------------------+-----------+----------+---------------------------------
        id              | integer                     |           | not null | WBS 고유 ID
        wbs_code        | character varying(10)       |           | not null | WBS 코드
        wbs_name        | character varying(50)       |           | not null | WBS 이름
        parent_wbs      | character varying(10)       |           |          | 상위 WBS
        wbs_description | character varying(500)      |           |          | WBS 설명
        wbs_order       | integer                     |           |          | WBS 표시 순서
        updated_by      | character varying(20)       |           |          | 수정자
        updated_at      | timestamp without time zone |           |          | 수정일
        project_id      | integer                     |           |          | 프로젝트 아이디
        progress_rate   | integer                     |           |          | 진행률
        total_tasks     | integer                     |           |          | 전체 태스크 수
        delayed_tasks   | integer                     |           |          | 지연 태스크 수
        
    """

    id = Column(Integer, primary_key=True, index=True)
    wbs_code = Column(String(10),nullable=False)
    wbs_name = Column(String(50) ,nullable=False)
    parent_wbs = Column(String(10) ,nullable=True)
    wbs_description = Column(Text(500) ,nullable=True)
    wbs_order = Column(Integer ,nullable=True)
    updated_by = Column(String(20) ,nullable=True)
    updated_at=Column(Date, default=lambda: datetime.now(ZoneInfo("Asia/Seoul")), nullable=False)
    project_id = Column(Integer ,nullable=True)
    progress_rate = Column(Integer ,nullable=True)
    total_tasks = Column(Integer ,nullable=True)
    delayed_tasks = Column(Integer ,nullable=True)
