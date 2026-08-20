from datetime import datetime, date
from typing import Optional,List
from pydantic import BaseModel, Field, ConfigDict

# 기본 스키마
class WbsBase(BaseModel):
    wbs_code: str = Field(..., max_length=10)
    wbs_name: str = Field(..., max_length=50)
    parent_wbs: Optional[str] = Field(None, max_length=10)
    wbs_order: Optional[int] = None
    start_date: date
    due_date: date
    wbs_description: Optional[str] = None

# 수정 스키마
class UpdateWbs(WbsBase):
    wbs_code: Optional[str] = Field(None, max_length=10)
    wbs_name: Optional[str] = Field(None, max_length=50)
    parent_wbs: Optional[str] = Field(None, max_length=10)
    wbs_order: Optional[int] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    wbs_description: Optional[str] =None
    updated_by: Optional[str] = Field(None, max_length=20)