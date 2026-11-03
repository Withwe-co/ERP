from typing import List
from pydantic import BaseModel, Field, ConfigDict, field_validator


EMPLOYEE_DEPARTMENTS = ("S/W 개발팀", "하드웨어팀", "전장제어팀", "R&D팀", "경영지원팀")


def normalize_department(value):
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError('부서는 선택 목록에 있는 값으로 입력해주세요.')
    value = value.strip()
    if value and value not in EMPLOYEE_DEPARTMENTS:
        raise ValueError('부서는 선택 목록에 있는 값으로 입력해주세요.')
    return value or None


def normalize_caps_user_id(value):
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError('캡스 사용자 ID는 앞자리 0을 포함한 문자열로 입력해주세요.')
    value = value.strip()
    if len(value) > 50:
        raise ValueError('캡스 사용자 ID는 50자 이하여야 합니다.')
    return value or None

# 기본 스키마
class EmployeesBase(BaseModel):
    department: str | None = Field(None, max_length=50)

    @field_validator('department', mode='before')
    @classmethod
    def validate_department(cls, value):
        return normalize_department(value)

    caps_user_id: str | None = Field(None, max_length=50)

    @field_validator('caps_user_id', mode='before')
    @classmethod
    def validate_caps_user_id(cls, value):
        return normalize_caps_user_id(value)

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