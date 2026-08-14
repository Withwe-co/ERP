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

        id: 프로젝트 고유 ID
        project_code: 프로젝트 코드 
        project_name: 프로젝트 이름
        manager_name: 프로젝트 담당자 이름
        department: 프로젝트 담당 부서
        start_date: 프로젝트 시작일
        due_date: 프로젝트 종료일
        status: 프로젝트 상태 (COMPLETED,IN_PROGRESS,ON_HOLD,CANCELLED,PLANNED)
        project_description: 프로젝트 상세 설명
        updated_by: 프로젝트 정보 마지막 수정자
        updated_at: 프로젝트 정보 마지막 수정일
    """

    id=Column(Integer, primary_key=True, index=True)
    project_code=Column(String, unique=True, nullable=False)
    project_name=Column(String, nullable=False)
    manager_name=Column(String, nullable=False)
    department=Column(String, nullable=False)
    start_date=Column(DateTime, nullable=False)
    due_date=Column(DateTime, nullable=False)
    status=Column(String, nullable=False, default='IN_PROGRESS')
    project_description=Column(Text, nullable=True)
    updated_by=Column(String, nullable=True)
    updated_at=Column(DateTime, default=lambda: datetime.now(ZoneInfo("Asia/Seoul")), nullable=False)
