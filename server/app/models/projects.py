from sqlalchemy import Column,Integer,String,Text,Float,DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.database import Base
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

class Project(Base):
    __tablename__ = "projects"
    """
        projects 테이블
              Column        |            Type             | Collation | Nullable |               Desc
        --------------------+-----------------------------+-----------+----------+--------------------------------------
        id                  | integer                     |           | not null | 프로젝트 ID
        project_code        | character varying(10)       |           | not null | 프로젝트 코드
        project_name        | character varying(50)       |           | not null | 프로젝트명
        manager_name        | character varying(20)       |           | not null | 담당자명
        department          | character varying(20)       |           | not null | 부서
        start_date          | timestamp without time zone |           | not null | 프로젝트 시작일
        due_date            | timestamp without time zone |           | not null | 프로젝트 종료일
        status              | character varying(20)       |           | not null | 프로젝트 상태
        project_description | character varying(500)      |           |          | 프로젝트 설명
        updated_by          | character varying(20)       |           |          | 수정일
        updated_at          | timestamp without time zone |           | not null | 수정자
    """

    id=Column(Integer, primary_key=True, index=True)
    project_code=Column(String(10), unique=True, nullable=False)
    project_name=Column(String(50), nullable=False)
    manager_name=Column(String(20), nullable=False)
    department=Column(String(20), nullable=False)
    start_date=Column(DateTime, nullable=False)
    due_date=Column(DateTime, nullable=False)
    status=Column(String(20), nullable=False, default='IN_PROGRESS')
    project_description=Column(Text(500), nullable=True)
    updated_by=Column(String(20), nullable=True)
    updated_at=Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Seoul")), nullable=False)
