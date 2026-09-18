from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ReportCreateBase(BaseModel):
    employee_id: int = Field(..., description='직원 ID')
    period_start: date = Field(..., description='보고 대상 날짜 또는 주 시작일')
    content: str = Field(..., min_length=1, max_length=5000, description='보고 내용')
    submitted: bool = Field(False, description='제출 여부')


class ReportUpdateBase(BaseModel):
    period_start: Optional[date] = Field(None, description='보고 대상 날짜 또는 주 시작일')
    content: Optional[str] = Field(None, min_length=1, max_length=5000, description='보고 내용')
    submitted: Optional[bool] = Field(None, description='제출 여부')


class ReportInDBBase(BaseModel):
    id: int
    employee_id: int
    period_start: date
    content: str
    submitted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
