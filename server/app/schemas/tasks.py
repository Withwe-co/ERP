"""태스크 API의 요청 및 응답 데이터 스키마를 정의하는 모듈"""
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


# 태스크 우선순위
TaskPriority = Literal["LOW", "NORMAL", "HIGH", "URGENT",]


# 태스크 상태
TaskStatus = Literal["TODO", "IN_PROGRESS", "DONE",]


class TaskBase(BaseModel):
    """태스크 등록 및 조회에서 공통으로 사용하는 기본 스키마"""

    project_id: int = Field(
        ...,
        description="프로젝트 ID"
    )

    wbs_code: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="WBS 코드",
    )

    task_name: str = Field(
        ...,
        max_length=50,
        description="태스크명",
    )

    description: Optional[str] = Field(
        None,
        description="태스크 설명",
    )

    assignee_name: str = Field(
        ...,
        max_length=20,
        description="담당자명",
    )

    department: str = Field(
        ...,
        max_length=20,
        description="담당 부서",
    )

    priority: TaskPriority = Field(
        default="NORMAL",
        description="우선순위",
    )

    status: TaskStatus = Field(
        default="TODO",
        description="태스크 상태",
    )

    planned_start_date: date = Field(
        ...,
        description="시작 예정일",
    )

    planned_end_date: date = Field(
        ...,
        description="완료 예정일",
    )

    note: Optional[str] = Field(
        None,
        description="비고",
    )


class TaskCreate(TaskBase):
    """태스크 등록 요청에 사용하는 스키마"""


class TaskUpdate(BaseModel):
    """태스크 수정 요청에 사용하는 스키마"""
    project_id: Optional[int] = None
    wbs_code: Optional[str] = Field(None, min_length=1, max_length=10,)
    task_name: Optional[str] = Field(None, max_length=50,)
    description: Optional[str] = None
    assignee_name: Optional[str] = Field(None, max_length=20,)
    department: Optional[str] = Field(None, max_length=20,)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    note: Optional[str] = None


class TaskResponse(TaskBase):
    """태스크 조회 결과에 사용하는 응답 스키마"""
    id: int
    kanban_order: int
    is_archived: bool
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TaskCreateResponse(BaseModel):
    """태스크 등록 API의 응답 스키마"""
    status_code: int
    message: str
    data: TaskResponse # data에 TaskResponse 규칙을 만족하는 태스크만 들어갈 수 있음


# 태스크 수정 API 응답 스키마
class TaskUpdateResponse(BaseModel):
    """태스크 수정 API의 응답 스키마"""
    status_code: int
    message: str
    data: TaskResponse

class TaskKanbanOrderUpdate(BaseModel):
    """칸반 상태별 태스크 순서 저장 스키마"""

    TODO: list[int] = Field(default_factory=list)
    IN_PROGRESS: list[int] = Field(default_factory=list)
    DONE: list[int] = Field(default_factory=list)