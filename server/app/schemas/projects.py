from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

# 기본 스키마
class ProjectsBase(BaseModel):
    project_code: str = Field(..., max_length=10, description="프로젝트 코드")
    project_name: str = Field(..., max_length=50, description="프로젝트명")
    manager_name: str = Field(..., max_length=20, description="담당자명")
    department: str = Field(..., max_length=20,description="담당부서")
    start_date: datetime = Field(..., description="시작일")
    due_date: datetime = Field(..., description="종료일")
    status: str = Field(default="IN_PROGRESS", description="진행상태")
    project_description: Optional[str] = Field(None, description="설명")

    model_config = ConfigDict(from_attributes=True)

#수정 스키마
class UpdateProject(ProjectsBase):
    updated_by: Optional[str] = Field(None, max_length=20,description="수정자")
    updated_at: Optional[datetime]=Field(None,description="수정일")