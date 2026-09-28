# server/app/models/purchase_request.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.core.database import Base
from app.enums import RequestStatus, UrgencyLevel, ItemCategory, PurchaseMethod
from datetime import datetime, timezone


class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"
    # 실제 DB에 존재하는 컬럼들만 포함
    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String, unique=True, nullable=False)
    item_name = Column(String, nullable=False)
    specifications = Column(Text, nullable=True)
    quantity = Column(Integer, nullable=False)
    unit = Column(String, nullable=False)
    estimated_unit_price = Column(Float, nullable=True)
    total_budget = Column(Float, nullable=True)
    currency = Column(String, default="KRW")
    category = Column(String, nullable=False)
    urgency = Column(String, nullable=False)
    purchase_method = Column(String, nullable=True)
    requester_name = Column(String, nullable=False)
    requester_email = Column(String, nullable=False)
    department = Column(String, nullable=False)
    position = Column(String, nullable=True)
    justification = Column(Text, nullable=True)
    status = Column(String, nullable=False, default='SUBMITTED')
    request_date = Column(DateTime, default=func.now())
    required_by_date = Column(DateTime, nullable=True)  # 추가
    expected_delivery_date = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    priority_score = Column(Integer, default=0, nullable=False)
    # 관계 설정
    # inventory_item = relationship("UnifiedInventory", back_populates="purchase_requests")
    
    def __repr__(self):
        return f"<PurchaseRequest {self.request_number}: {self.item_name}>"

    def generate_request_number(self):
        """요청번호 자동 생성"""
        from datetime import datetime
        now = datetime.now()
        prefix = f"PR{now.strftime('%Y%m')}"
        return f"{prefix}{self.id:06d}"
    
    def calculate_priority_score(self):
        """우선순위 점수 계산"""
        score = 0
        
        # 긴급도에 따른 점수
        urgency_scores = {
            UrgencyLevel.LOW: 10,
            UrgencyLevel.NORMAL: 30,
            UrgencyLevel.HIGH: 70,
            UrgencyLevel.URGENT: 90,
            UrgencyLevel.EMERGENCY: 100
        }
        score += urgency_scores.get(self.urgency, 30)
        
        # 예산 규모에 따른 점수 (높을수록 더 높은 점수)
        if self.total_budget:
            if self.total_budget >= 10000000:  # 1천만원 이상
                score += 50
            elif self.total_budget >= 5000000:  # 500만원 이상
                score += 30
            elif self.total_budget >= 1000000:  # 100만원 이상
                score += 20
            else:
                score += 10
        
        # 요청일로부터 경과 시간 (오래된 요청일수록 높은 점수)
        if self.created_at:
            # 수정: 타임존 정보 통일
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            
            # created_at이 naive datetime인 경우 UTC로 가정
            if self.created_at.tzinfo is None:
                created_at_aware = self.created_at.replace(tzinfo=timezone.utc)
            else:
                created_at_aware = self.created_at
                
            days_elapsed = (now - created_at_aware).days
            score += min(days_elapsed * 5, 50)  # 최대 50점
        
        self.priority_score = score
        return score