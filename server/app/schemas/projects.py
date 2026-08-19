from datetime import datetime
from typing import Optional,List
from pydantic import BaseModel, Field, ConfigDict

# 기본 스키마
class ProjectsBase(BaseModel):
    project_code: str = Field(..., max_length=10)
    project_name: str = Field(..., max_length=50)
    manager_name: str = Field(..., max_length=20)
    department: str = Field(..., max_length=20)
    start_date: datetime
    due_date: datetime
    status: str = "IN_PROGRESS"
    project_description: Optional[str] = None

#수정 스키마
class UpdateProject(ProjectsBase):
    project_code: Optional[str] = Field(None, max_length=10)
    project_name: Optional[str] = Field(None, max_length=50)
    manager_name: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=20)
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    project_description: Optional[str] = None

# 응답용 스키마
class ProjectInDB(ProjectsBase):
    id : int
    updated_by: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# 목록 응답
class ProjectsList(BaseModel):
    items: List[ProjectInDB]
    total: int
    page: int
    size: int
    pages: int