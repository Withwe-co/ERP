from enum import Enum

class RequestStatus(str, Enum):
    DRAFT = "DRAFT"                 # 🔥 추가 - 임시저장
    SUBMITTED = "SUBMITTED"         # 요청됨
    PENDING_APPROVAL = "PENDING_APPROVAL"  # 승인 대기 (필요시)
    APPROVED = "APPROVED"           # 승인됨
    REJECTED = "REJECTED"           # 거절됨
    COMPLETED = "COMPLETED"         # 완료됨
    CANCELLED = "CANCELLED"         # 취소됨

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"
    EMERGENCY = "EMERGENCY"

class ItemCategory(str, Enum):
    OFFICE_SUPPLIES = "OFFICE_SUPPLIES"        # 사무 용품
    ELECTRONICS = "ELECTRONICS"                # 전자제품/IT 장비
    FURNITURE = "FURNITURE"                    # 가구
    SOFTWARE = "SOFTWARE"                      # 소프트웨어
    MAINTENANCE = "MAINTENANCE"                # 유지보수
    SERVICES = "SERVICES"                      # 서비스
    OTHER = "OTHER"                           # 기타

class PurchaseMethod(str, Enum):
    DIRECT = "DIRECT"
    QUOTATION = "QUOTATION"
    CONTRACT = "CONTRACT"
    FRAMEWORK = "FRAMEWORK"
    MARKETPLACE = "MARKETPLACE"
    