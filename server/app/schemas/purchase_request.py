# server/app/schemas/purchase_request.py
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.enums import RequestStatus, UrgencyLevel, ItemCategory, PurchaseMethod  # 공유 Enum 사용

# 기본 스키마
class PurchaseRequestBase(BaseModel):
    item_name: str = Field(..., max_length=200, description="품목명")
    specifications: Optional[str] = Field(None, description="사양")
    quantity: int = Field(default=1, ge=1, description="수량")
    unit: str = Field(default="개", max_length=20, description="단위")
    estimated_unit_price: Optional[float] = Field(default=0.0, ge=0, description="예상 단가")
    total_budget: Optional[float] = Field(None, description="총 예산")
    currency: str = Field(default="KRW", max_length=10, description="통화")
    category: str = Field(..., description="카테고리")
    urgency: str = Field(..., description="긴급도")
    purchase_method: Optional[str] = Field(None, description="구매 방법")
    requester_name: str = Field(..., max_length=100, description="요청자명")
    department: str = Field(..., max_length=100, description="부서")
    position: Optional[str] = Field(None, max_length=100, description="직책")
    justification: Optional[str] = Field(None, description="구매 사유")
    status: str = Field(default="SUBMITTED", description="상태")
    class Config:
        from_attributes = True


# 생성용 스키마
class PurchaseRequestCreate(BaseModel):
    item_name: str
    specifications: Optional[str] = None
    quantity: int
    unit: Optional[str] = "개"
    estimated_unit_price: Optional[float] = None
    total_budget: Optional[float] = None
    currency: Optional[str] = "KRW"
    category: str
    urgency: str
    purchase_method: Optional[str] = None
    requester_name: str
    requester_email: Optional[str] = None
    department: str
    position: Optional[str] = None
    justification: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None


# 업데이트용 스키마
class PurchaseRequestUpdate(BaseModel):
    item_name: Optional[str] = Field(None, max_length=200, description="품목명")
    specifications: Optional[str] = Field(None, description="사양")
    quantity: Optional[int] = Field(None, ge=1, description="수량")
    unit: Optional[str] = Field(None, max_length=20, description="단위")
    estimated_unit_price: Optional[float] = Field(None, ge=0, description="예상 단가")
    currency: Optional[str] = Field(None, max_length=10, description="통화")
    
    category: Optional[str] = Field(None, description="카테고리")
    urgency: Optional[UrgencyLevel] = Field(None, description="긴급도")
    
    requester_name: Optional[str] = Field(None, max_length=100, description="요청자명")
    requester_email: Optional[str] = Field(None, max_length=255, description="요청자 이메일")
    department: Optional[str] = Field(None, max_length=100, description="부서")
    phone_number: Optional[str] = Field(None, max_length=20, description="연락처")
    
    project: Optional[str] = Field(None, max_length=200, description="프로젝트")
    budget_code: Optional[str] = Field(None, max_length=50, description="예산코드")
    
    preferred_supplier: Optional[str] = Field(None, max_length=200, description="선호 공급업체")
    
    justification: Optional[str] = Field(None, description="구매 사유")
    additional_notes: Optional[str] = Field(None, description="비고")
    
    status: Optional[RequestStatus] = Field(None, description="상태")


# 승인/거절용 스키마
class PurchaseRequestApproval(BaseModel):
    action: str = Field(..., pattern="^(approve|reject)$", description="승인 액션")
    comments: Optional[str] = Field(None, description="승인/거절 코멘트")
    approval_level: Optional[int] = Field(None, description="승인 레벨")
    
# 응답용 스키마 (단순화)
class PurchaseRequestInDB(PurchaseRequestBase):
    id: int
    request_number: Optional[str]
    total_budget: float
    status: RequestStatus
    
    # 승인 관련 (단순화)
    approval_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # 완료 처리 관련
    completed_date: Optional[datetime] = None
    completed_by: Optional[str] = None
    completion_notes: Optional[str] = None
    inventory_item_id: Optional[int] = None
    
    # 시스템 필드
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    priority_score: int
    
    model_config = ConfigDict(from_attributes=True)

class PurchaseRequest(PurchaseRequestInDB):
    pass

# 목록 응답
class PurchaseRequestList(BaseModel):
    items: List[PurchaseRequest]
    total: int
    page: int
    size: int
    pages: int

# 통계 스키마 - 수정된 부분
class PurchaseRequestStats(BaseModel):
    total: int
    approved: int
    rejected: int
    completed: Optional[int] = 0
    this_month: int
    total_budget: float
    
    model_config = ConfigDict(from_attributes=True)
    
# 검색 필터
class PurchaseRequestFilter(BaseModel):
    search: Optional[str] = None
    status: Optional[RequestStatus] = None
    category: Optional[ItemCategory] = None
    urgency: Optional[UrgencyLevel] = None
    department: Optional[str] = None
    requester_name: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    
# 완료 처리용 스키마 (구매 요청 완료 → 품목 생성에 필요)
class PurchaseRequestCompletionData(BaseModel):
    received_quantity: Optional[int] = None
    receiver_name: Optional[str] = None
    receiver_email: Optional[str] = None
    received_date: Optional[datetime] = None
    location: Optional[str] = "창고"
    condition: Optional[str] = "good"
    notes: Optional[str] = None
    completed_by: Optional[str] = "시스템"
    
    
# server/app/schemas/purchase_request.py - PurchaseRequestResponse 수정

class PurchaseRequestResponse(BaseModel):
    # 필수 필드들
    id: int
    item_name: str = "품목명 없음"
    quantity: int = 1
    requester_name: str = "요청자 없음" 
    department: str = "부서 없음"
    urgency: str = "NORMAL"
    status: str = "SUBMITTED"
    created_at: str
    
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    priority_score: Optional[int] = 0
    
    # 선택적 필드들 (모두 기본값 제공)
    request_number: Optional[str] = None
    specifications: Optional[str] = None
    unit: str = "개"
    estimated_unit_price: float = 0.0
    total_budget: float = 0.0
    currency: str = "KRW"
    category: Optional[str] = None
    purchase_method: Optional[str] = None
    requester_email: Optional[str] = None
    position: Optional[str] = None
    phone_number: Optional[str] = None
    project: Optional[str] = None
    budget_code: Optional[str] = None
    cost_center: Optional[str] = None
    preferred_supplier: Optional[str] = None
    supplier_contact: Optional[str] = None
    request_date: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    required_by_date: Optional[str] = None
    approval_level: Optional[int] = None
    current_approver: Optional[str] = None
    approved_date: Optional[str] = None
    approved_by: Optional[str] = None
    rejected_date: Optional[str] = None
    rejected_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    justification: str = ""
    business_case: Optional[str] = None
    notes: Optional[str] = None
    attachment_urls: Optional[str] = None
    is_active: bool = True
    updated_at: Optional[str] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    priority_score: float = 0.0
    estimated_approval_time: int = 0
    actual_approval_time: int = 0

    @classmethod
    def from_orm(cls, obj):
        """DB 객체에서 안전하게 변환"""
        try:
            return cls(
                # 필수 필드들 (안전한 기본값 제공)
                id=getattr(obj, 'id', 0),
                item_name=getattr(obj, 'item_name', '품목명 없음') or '품목명 없음',
                quantity=getattr(obj, 'quantity', 1) or 1,
                requester_name=getattr(obj, 'requester_name', '요청자 없음') or '요청자 없음',
                department=getattr(obj, 'department', '부서 없음') or '부서 없음',
                urgency=getattr(obj, 'urgency', 'NORMAL') or 'NORMAL',
                status=getattr(obj, 'status', 'SUBMITTED') or 'SUBMITTED',
                
                # 날짜 필드들 (안전하게 변환)
                created_at=cls._safe_date_convert(getattr(obj, 'request_date', None)) or 
                          cls._safe_date_convert(getattr(obj, 'created_at', None)) or 
                          datetime.now().isoformat(),
                
                # 숫자 필드들 (안전한 기본값)
                estimated_unit_price=float(getattr(obj, 'estimated_unit_price', 0) or 0),
                total_budget=float(getattr(obj, 'total_budget', 0) or 0),
                priority_score=float(getattr(obj, 'priority_score', 0) or 0),
                
                # 문자열 필드들
                request_number=getattr(obj, 'request_number', None),
                specifications=getattr(obj, 'specifications', None),
                unit=getattr(obj, 'unit', '개') or '개',
                currency=getattr(obj, 'currency', 'KRW') or 'KRW',
                category=getattr(obj, 'category', None),
                purchase_method=getattr(obj, 'purchase_method', None),
                requester_email=getattr(obj, 'requester_email', None),
                position=getattr(obj, 'position', None),
                justification=getattr(obj, 'justification', '') or '',
                
                # 선택적 날짜 필드들
                request_date=cls._safe_date_convert(getattr(obj, 'request_date', None)),
                expected_delivery_date=cls._safe_date_convert(getattr(obj, 'expected_delivery_date', None)),
                approved_date=cls._safe_date_convert(getattr(obj, 'approved_date', None)),
                updated_at=cls._safe_date_convert(getattr(obj, 'updated_at', None)),
                
                # 기타 필드들
                is_active=bool(getattr(obj, 'is_active', True)),
                estimated_approval_time=int(getattr(obj, 'estimated_approval_time', 0) or 0),
                actual_approval_time=int(getattr(obj, 'actual_approval_time', 0) or 0),
            )
        except Exception as e:
            print(f" from_orm 변환 실패: {e}")
            # 최소한의 안전한 객체 반환
            return cls(
                id=getattr(obj, 'id', 0),
                item_name=getattr(obj, 'item_name', '품목명 없음'),
                quantity=getattr(obj, 'quantity', 1),
                requester_name=getattr(obj, 'requester_name', '요청자 없음'),
                department=getattr(obj, 'department', '부서 없음'),
                urgency=getattr(obj, 'urgency', 'NORMAL'),
                status=getattr(obj, 'status', 'SUBMITTED'),
                created_at=datetime.now().isoformat()
            )
    
    @staticmethod
    def _safe_date_convert(date_obj):
        """날짜 객체를 안전하게 ISO 문자열로 변환"""
        if date_obj is None:
            return None
        try:
            if hasattr(date_obj, 'isoformat'):
                return date_obj.isoformat()
            elif isinstance(date_obj, str):
                return date_obj
            else:
                return str(date_obj)
        except:
            return None

    class Config:
        from_attributes = True