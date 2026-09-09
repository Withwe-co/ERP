from typing import List
from pydantic import BaseModel, Field, ConfigDict

# 기본 스키마
class EmployeesBase(BaseModel):
    name: str = Field(..., max_length=20)
    position: str = Field(..., max_length=20)
    total_leave: float = Field(..., le=999.9)
    used_leave: float = Field(0.0, le=999.9)

# 수정 스키마
class UpdateEmployee(EmployeesBase):
    name: str = Field(..., max_length=20)
    position: str = Field(..., max_length=20)
    total_leave: float = Field(..., le=999.9)
    used_leave: float = Field(0.0, le=999.9)

# 응답용 스키마
class EmployeeInDB(EmployeesBase):
    id: int
    name: str
    position: str
    total_leave: float
    used_leave: float

    model_config = ConfigDict(from_attributes=True)

# 목록 응답
class EmployeesList(BaseModel):
    items: List[EmployeeInDB]
    total: int
    page: int
    size: int
    pages: int