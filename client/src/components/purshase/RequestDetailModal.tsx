// client/src/components/purchase/RequestDetailModal.tsx
import React from 'react';
import styled from 'styled-components';
import { Edit, Check, Calendar, User, Package, DollarSign, MapPin, Clock, AlertTriangle, Building, Hash } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface RequestDetailModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onApprove?: () => void;
}

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30px, -30px);
  }
  
  .header-content {
    position: relative;
    z-index: 1;
  }
  
  .request-id {
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .item-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.3;
  }
  
  .meta-info {
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: wrap;
  }
`;

const StatusDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .status-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: linear-gradient(135deg, ${props => props.$color}15, ${props => props.$color}08);
  border: 1px solid ${props => props.$color}25;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$color};
  }
  
  .stat-icon {
    color: ${props => props.$color};
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f3f4f6;
    
    .section-icon {
      padding: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .info-icon {
      color: #667eea;
      flex-shrink: 0;
    }
    
    .info-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }
  }
  
  .info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
    margin-left: 24px;
  }
`;

const SpecsCard = styled.div`
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  
  .specs-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .specs-icon {
      color: #667eea;
    }
    
    .specs-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }
  }
  
  .specs-content {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;
  }
`;

const JustificationSection = styled.div`
  background: linear-gradient(135deg, #fef7cd, #fed7aa);
  border: 1px solid #f59e0b;
  border-radius: 16px;
  padding: 24px;
  
  .justification-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .justification-icon {
      padding: 8px;
      background: #f59e0b;
      color: white;
      border-radius: 10px;
    }
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #92400e;
    }
  }
  
  .justification-content {
    background: white;
    padding: 20px;
    border-radius: 12px;
    line-height: 1.6;
    color: #451a03;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
`;

const UrgencyBadge = styled.span<{ $urgency: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$urgency?.toLowerCase()) {
      case 'low':
        return `
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid #10b981;
        `;
      case 'normal':
        return `
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          border: 1px solid #3b82f6;
        `;
      case 'high':
        return `
          background: linear-gradient(135deg, #fed7aa, #fdba74);
          color: #9a3412;
          border: 1px solid #f97316;
        `;
      case 'urgent':
      case 'emergency':
        return `
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 1px solid #ef4444;
          animation: pulse 2s infinite;
        `;
      default:
        return `
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #374151;
          border: 1px solid #9ca3af;
        `;
    }
  }}
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const CategoryBadge = styled.span<{ $category: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
`;

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onEdit,
  onApprove
}) => {
  const statusLabels: Record<string, string> = {
    'SUBMITTED': '요청됨',
    'COMPLETED': '구매완료',
    'CANCELLED': '취소됨'
  };

  const urgencyLabels: Record<string, string> = {
    'LOW': '낮음',
    'NORMAL': '보통',
    'HIGH': '높음',
    'URGENT': '긴급',
    'EMERGENCY': '응급'
  };

  const categoryLabels: Record<string, string> = {
    'OFFICE_SUPPLIES': '사무용품',
    'ELECTRONICS': 'IT장비',
    'FURNITURE': '가구',
    'SOFTWARE': '소프트웨어',
    'MAINTENANCE': '유지보수',
    'SERVICES': '서비스',
    'OTHER': '기타'
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || amount === 0) return '-';
    return `₩${amount.toLocaleString()}`;
  };

  const canEdit = request.status === 'submitted';
  const canApprove = request.status === 'PENDING_APPROVAL';

  const renderWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#f59e0b', 
              textDecoration: 'underline',
              fontWeight: '600',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#d97706'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="구매 요청 상세정보"
      size="xl"
    >
      <DetailContainer>
        {/* 헤더 섹션 */}
        <HeaderSection>
          <div className="header-content">
            <div className="request-id">
              <Hash size={14} />
              요청번호 #{request.id}
            </div>
            <div className="item-name">{request.item_name || '품목명 없음'}</div>
            <div className="meta-info">
              <StatusDisplay>
                <span className="status-badge">
                  {statusLabels[request.status] || request.status}
                </span>
              </StatusDisplay>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
                <Calendar size={14} />
                {formatDate(request.created_at)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
                <User size={14} />
                {request.requester_name || '요청자 정보없음'}
              </div>
            </div>
          </div>
        </HeaderSection>

        {/* 핵심 정보 요약 */}
        <QuickStats>
          <StatCard $color="#3b82f6">
            <Package className="stat-icon" size={24} />
            <div className="stat-value">{request.quantity?.toLocaleString() || '0'}</div>
            <div className="stat-label">수량 ({request.unit || '개'})</div>
          </StatCard>
          
          <StatCard $color="#10b981">
            <DollarSign className="stat-icon" size={24} />
            <div className="stat-value">{formatCurrency(request.estimated_unit_price)}</div>
            <div className="stat-label">단가</div>
          </StatCard>
          
          <StatCard $color="#f59e0b">
            <DollarSign className="stat-icon" size={24} />
            <div className="stat-value">{formatCurrency(request.total_budget)}</div>
            <div className="stat-label">총 예산</div>
          </StatCard>
          
          <StatCard $color="#ef4444">
            <AlertTriangle className="stat-icon" size={24} />
            <div className="stat-value">{urgencyLabels[request.urgency] || request.urgency}</div>
            <div className="stat-label">긴급도</div>
          </StatCard>
        </QuickStats>

        {/* 사양 정보 */}
        {request.specifications && (
          <SpecsCard>
            <div className="specs-header">
              <Package className="specs-icon" size={16} />
              <span className="specs-label">사양 및 요구사항</span>
            </div>
            <div className="specs-content">
              {request.specifications}
            </div>
          </SpecsCard>
        )}

        {/* 상세 정보 */}
        <Section>
          <div className="section-header">
            <Building className="section-icon" size={20} />
            <h3>프로젝트 및 부서 정보</h3>
          </div>
          <InfoGrid>
            <InfoCard>
              <div className="info-header">
                <Building className="info-icon" size={16} />
                <span className="info-label">소속 부서</span>
              </div>
              <div className="info-value">{request.department || '정보없음'}</div>
            </InfoCard>

            {request.project && (
              <InfoCard>
                <div className="info-header">
                  <Package className="info-icon" size={16} />
                  <span className="info-label">관련 프로젝트</span>
                </div>
                <div className="info-value">{request.project}</div>
              </InfoCard>
            )}

            <InfoCard>
              <div className="info-header">
                <Package className="info-icon" size={16} />
                <span className="info-label">요청자</span>
              </div>
              <div className="info-value">
                <CategoryBadge $category={request.requester_name}>
                  {categoryLabels[request.requester_name] || request.requester_name}
                </CategoryBadge>
              </div>
            </InfoCard>
            <InfoCard>
              <div className="info-header">
                <AlertTriangle className="info-icon" size={16} />
                <span className="info-label">긴급도</span>
              </div>
              <div className="info-value">
                <UrgencyBadge $urgency={request.urgency}>
                  {urgencyLabels[request.urgency] || request.urgency}
                </UrgencyBadge>
              </div>
            </InfoCard>
            <InfoCard>
              <div className="info-header">
                <Building className="info-icon" size={16} />
                <span className="info-label">구매처</span>
              </div>
              <div className="info-value">{request.preferred_supplier || '정보없음'}</div>
            </InfoCard>

            

            {request.preferred_supplier && (
              <InfoCard>
                <div className="info-header">
                  <Building className="info-icon" size={16} />
                  <span className="info-label">구매처</span>
                </div>
                <div className="info-value">{request.preferred_supplier}</div>
              </InfoCard>
            )}

            {request.expected_delivery_date && (
              <InfoCard>
                <div className="info-header">
                  <Calendar className="info-icon" size={16} />
                  <span className="info-label">희망 납기일</span>
                </div>
                <div className="info-value">{formatDate(request.expected_delivery_date)}</div>
              </InfoCard>
            )}
          </InfoGrid>
        </Section>

        {/* 구매 사유 */}
        {request.justification && (
          <JustificationSection>
            <div className="justification-header">
              <AlertTriangle className="justification-icon" size={20} />
              <h3>              구매 사유 및 링크 <span style={{ color: 'red' }}>*</span>
</h3>
            </div>
            <div className="justification-content">
              {renderWithLinks(request.justification)}
            </div>
          </JustificationSection>
        )}

        {/* 액션 버튼 */}
        <ActionButtons>
          <Button variant="outline" onClick={onClose} size="lg">
            닫기
          </Button>
          
          {canEdit && onEdit && (
            <Button onClick={onEdit} size="lg">
              <Edit size={18} />
              수정하기
            </Button>
          )}
          
          {canApprove && onApprove && (
            <Button variant="success" onClick={onApprove} size="lg">
              <Check size={18} />
              승인처리
            </Button>
          )}
        </ActionButtons>
      </DetailContainer>
    </Modal>
  );
};

export default RequestDetailModal;