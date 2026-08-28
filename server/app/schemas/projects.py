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
    project_code: str = Field(..., max_length=10)
    project_name: str = Field(..., max_length=50)
    manager_name: str = Field(..., max_length=20)
    department: str = Field(..., max_length=20)
    start_date: datetime
    due_date: datetime
    status: str 
    project_description: Optional[str] = None
    updated_by: Optional[str] = Field(None, max_length=20)

# 응답용 스키마
class ProjectInDB(ProjectsBase):
    id : int
    updated_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    progress_rate: int = 0
    total_task: int = 0
    delayed_task: int = 0
    complete_task: int = 0

    model_config = ConfigDict(from_attributes=True)

# 목록 응답
class ProjectsList(BaseModel):
    items: List[ProjectInDB]
    total: int
    page: int
    size: int
    pages: int