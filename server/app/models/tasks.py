'''태스크 데이터베이스 모델을 정의하는 모듈'''

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from app.core.database import Base

# 베이스를 상속받아야 SQLAlchemy가 Task라는 클래스가 ORM Model임을 알 수 있음
class Task(Base):
    """태스크 정보를 저장하는 tasks 테이블."""

    __tablename__ = "tasks"

    # 태스크 고유 ID
    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # 태스크가 속한 프로젝트 ID
    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    # 태스크가 속한 WBS 코드
    wbs_code = Column(
        String(10),
        nullable=False,
        index=True,
    )

    # 태스크명
    task_name = Column(
        String(50),
        nullable=False,
    )

    # 태스크 설명
    description = Column(
        Text,
        nullable=True,
    )

    # 담당자명
    assignee_name = Column(
        String(20),
        nullable=False,
    )

    # 담당 부서
    department = Column(
        String(20),
        nullable=False,
    )

    # 우선순위: LOW, NORMAL, HIGH, URGENT
    priority = Column(
        String(10),
        nullable=False,
        default="NORMAL",
    )

    # 상태: TODO, IN_PROGRESS, DONE
    status = Column(
        String(20),
        nullable=False,
        default="TODO",
    )

    # 시작 예정일
    planned_start_date = Column(
        Date,
        nullable=False,
    )

    # 완료 예정일
    planned_end_date = Column(
        Date,
        nullable=False,
    )

    # 비고
    note = Column(
        Text,
        nullable=True,
    )

    # 보관 여부
    is_archived = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # 보관 시간
    archived_at = Column(
        DateTime,
        nullable=True,
    )

    # 생성 시간
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(ZoneInfo("Asia/Seoul")),
    )

    # 마지막 수정 시간
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(ZoneInfo("Asia/Seoul")),
        onupdate=lambda: datetime.now(ZoneInfo("Asia/Seoul")),
    )
