from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


# 태스크 우선순위
TaskPriority = Literal[
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
]


# 태스크 상태
TaskStatus = Literal[
    "TODO",
    "IN_PROGRESS",
    "DONE",
]


# 태스크 공통 스키마
class TaskBase(BaseModel):
    project_id: int = Field(..., description="프로젝트 ID")

    wbs_code: str = Field(
        ...,
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


# 태스크 등록용 스키마
class TaskCreate(TaskBase):
    pass


# 태스크 수정용 스키마
class TaskUpdate(BaseModel):
    project_id: Optional[int] = None
    wbs_code: Optional[str] = Field(None, max_length=10,)

    task_name: Optional[str] = Field(
        None,
        max_length=50,
    )

    description: Optional[str] = None

    assignee_name: Optional[str] = Field(
        None,
        max_length=20,
    )

    department: Optional[str] = Field(
        None,
        max_length=20,
    )

    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None

    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None

    note: Optional[str] = None


# 태스크 조회 응답용 스키마
class TaskResponse(TaskBase):
    id: int

    is_archived: bool
    archived_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 태스크 등록 API 응답 스키마
class TaskCreateResponse(BaseModel):
    status_code: int
    message: str
    data: TaskResponse

# 태스크 수정 API 응답 스키마
class TaskUpdateResponse(BaseModel):
    status_code: int
    message: str
    data: TaskResponse
