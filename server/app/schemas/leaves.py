from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from server.app.schemas.projects import ProjectInDB

# 기본 스키마
class LeaveBase(BaseModel):
    employee_id: int = Field(..., description="직원 ID")
    leave_type: str = Field(..., max_length=20, description="휴가 유형")
    start_date: datetime = Field(..., description="시작일")
    end_date: datetime = Field(..., description="종료일")
    total_days: float = Field(..., description="총 일수")

# 수정 스키마
class UpdateLeave(LeaveBase):
    employee_id: int = Field(..., description="직원 ID")
    leave_type: str = Field(..., max_length=20, description="휴가 유형")
    start_date: datetime = Field(..., description="시작일")
    end_date: datetime = Field(..., description="종료일")
    total_days: float = Field(..., description="총 일수")

