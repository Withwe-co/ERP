// client/src/components/purchase/ApprovalModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Check, X, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';
import { PurchaseRequest } from '../../types';

interface ApprovalModalProps {
  request: PurchaseRequest;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: 'approve' | 'reject', comments?: string) => void;
  loading?: boolean;
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const RequestInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: ${props => props.theme.spacing.sm};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .label {
    font-weight: 500;
    color: ${props => props.theme.colors.textSecondary};
  }
  
  .value {
    font-weight: 600;
    color: ${props => props.theme.colors.text};
  }
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-family: inherit;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.sm};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const WarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.warning}10;
  border: 1px solid ${props => props.theme.colors.warning}30;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.warning};
  
  svg {
    flex-shrink: 0;
  }
`;

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    if (action) {
      onSubmit(action, comments || undefined);
    }
  };

  const handleClose = () => {
    setAction(null);
    setComments('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="구매 요청 승인"
      size="lg"
    >
      <ModalContent>
        <RequestInfo>
          <div className="info-row">
            <span className="label">요청번호:</span>
            <span className="value">{request.requestNumber}</span>
          </div>
          <div className="info-row">
            <span className="label">품목명:</span>
            <span className="value">{request.itemName}</span>
          </div>
          <div className="info-row">
            <span className="label">수량:</span>
            <span className="value">{request.quantity.toLocaleString()}개</span>
          </div>
          <div className="info-row">
            <span className="label">예상금액:</span>
            <span className="value">₩{request.totalBudget.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="label">요청자:</span>
            <span className="value">{request.requesterName} ({request.department})</span>
          </div>
          <div className="info-row">
            <span className="label">요청일:</span>
            <span className="value">{new Date(request.requestDate).toLocaleDateString('ko-KR')}</span>
          </div>
        </RequestInfo>

        {request.justification && (
          <div>
            <h4>              구매 사유 및 링크 <span style={{ color: 'red' }}>*</span>
</h4>
            <p style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              {request.justification}
            </p>
          </div>
        )}

        <CommentSection>
          <label htmlFor="comments">승인/거절 의견</label>
          <TextArea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="승인 또는 거절 사유를 입력해주세요... (선택사항)"
          />
        </CommentSection>

        {action === 'reject' && (
          <WarningBox>
            <AlertTriangle size={20} />
            <span>거절 시 요청자에게 알림이 전송되며, 요청이 거절 상태로 변경됩니다.</span>
          </WarningBox>
        )}

        <ActionButtons>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={() => setAction('reject')}
            disabled={loading}
          >
            <X size={16} />
            거절
          </Button>
          <Button
            variant="success"
            onClick={() => setAction('approve')}
            disabled={loading}
          >
            <Check size={16} />
            승인
          </Button>
          {action && (
            <Button
              onClick={handleSubmit}
              loading={loading}
              variant={action === 'approve' ? 'success' : 'danger'}
            >
              {action === 'approve' ? '승인 확정' : '거절 확정'}
            </Button>
          )}
        </ActionButtons>
      </ModalContent>
    </Modal>
  );
};

export default ApprovalModal;

