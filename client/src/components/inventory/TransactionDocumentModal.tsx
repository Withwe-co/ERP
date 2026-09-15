// client/src/components/inventory/TransactionDocumentModal.tsx - 개선된 버전
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Upload, FileText, X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
`;

const CurrentFileSection = styled.div<{ hasFile: boolean }>`
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.hasFile ? '#f0f9ff' : '#fefce8'};
  border-radius: 8px;
  border: 1px solid ${props => props.hasFile ? '#bfdbfe' : '#fde047'};
  
  .current-file-title {
    font-weight: 600;
    color: ${props => props.hasFile ? '#1e40af' : '#a16207'};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .current-file-info {
    color: #374151;
    font-size: 0.9rem;
    margin-bottom: 12px;
  }
  
  .current-file-actions {
    display: flex;
    gap: 8px;
  }
`;

const UploadArea = styled.div<{ dragOver: boolean; hasError: boolean }>`
  border: 2px dashed ${props => 
    props.hasError ? '#ef4444' : 
    props.dragOver ? '#3b82f6' : '#d1d5db'
  };
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  background: ${props => 
    props.hasError ? '#fef2f2' :
    props.dragOver ? '#eff6ff' : '#f9fafb'
  };
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 24px;
  
  &:hover {
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
    background: ${props => props.hasError ? '#fef2f2' : '#eff6ff'};
  }
  
  .upload-icon {
    margin-bottom: 16px;
    color: ${props => 
      props.hasError ? '#ef4444' :
      props.dragOver ? '#3b82f6' : '#6b7280'
    };
  }
  
  .upload-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${props => props.hasError ? '#dc2626' : '#374151'};
    margin-bottom: 8px;
  }
  
  .upload-subtitle {
    color: ${props => props.hasError ? '#dc2626' : '#6b7280'};
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const SelectedFilePreview = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    
    .file-icon {
      color: #16a34a;
    }
    
    .file-details {
      .file-name {
        font-weight: 600;
        color: #166534;
        margin-bottom: 4px;
        word-break: break-all;
      }
      
      .file-size {
        font-size: 0.85rem;
        color: #16a34a;
      }
    }
  }
  
  .remove-file {
    margin-left: 12px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
`;

const CloseButtonStyled = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const FileValidationMessage = styled.div<{ type: 'success' | 'error' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 16px;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        `;
      case 'error':
        return `
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        `;
      case 'warning':
        return `
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        `;
    }
  }}
`;

interface InventoryItem {
  id: number;
  item_name: string;
  transaction_document_url?: string;
  transaction_upload_date?: string;
  transaction_uploaded_by?: string;
}

interface TransactionDocumentModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (file: File) => void;
  loading?: boolean;
}

const TransactionDocumentModal: React.FC<TransactionDocumentModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  if (!isOpen || !item) return null;

  const validateFile = (file: File): { isValid: boolean; message: string; type: 'success' | 'error' | 'warning' } => {
    // 파일 형식 검증
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel' // xls
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'PDF, 이미지 파일 또는 Excel 파일만 업로드 가능합니다.',
        type: 'error'
      };
    }
    
    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        message: '파일 크기는 10MB를 초과할 수 없습니다.',
        type: 'error'
      };
    }
    
    // 파일 크기 경고 (5MB 이상)
    if (file.size > 5 * 1024 * 1024) {
      return {
        isValid: true,
        message: '파일 크기가 큽니다. 업로드에 시간이 걸릴 수 있습니다.',
        type: 'warning'
      };
    }
    
    return {
      isValid: true,
      message: '업로드 가능한 파일입니다.',
      type: 'success'
    };
  };

  const handleFileSelect = useCallback((file: File) => {
    setUploadError('');
    
    const validation = validateFile(file);
    setValidationMessage(validation);
    
    if (validation.isValid) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setValidationMessage({
        type: 'error',
        message: '한 번에 하나의 파일만 업로드할 수 있습니다.'
      });
      return;
    }
    
    const file = files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (selectedFile) {
      setUploadError('');
      onSubmit(selectedFile);
      setSelectedFile(null);
      setValidationMessage(null);
    }
  };

  const handleViewCurrent = () => {
    if (item.transaction_document_url) {
       window.open(item.transaction_document_url, '_blank');
      /*const fullUrl = item.transaction_document_url.startsWith('http') 
        ? item.transaction_document_url 
        // : `http://192.168.0.16:8000${item.transaction_document_url}`;
        : `http://221.44.183.165:8000${item.transaction_document_url}`;
      window.open(fullUrl, '_blank');*/

    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationMessage(null);
    setUploadError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📄';
  };

  const hasCurrentFile = Boolean(item.transaction_document_url);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>거래명세서 관리 - {item.item_name}</h2>
          <CloseButtonStyled onClick={onClose}>
            <X size={20} />
          </CloseButtonStyled>
        </ModalHeader>
        
        <ModalContent>
          {/* 현재 업로드된 파일 표시 */}
          <CurrentFileSection hasFile={hasCurrentFile}>
            <div className="current-file-title">
              {hasCurrentFile ? (
                <>
                  <CheckCircle size={18} />
                  현재 업로드된 거래명세서
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  거래명세서가 업로드되지 않음
                </>
              )}
            </div>
            
            {hasCurrentFile ? (
              <>
                <div className="current-file-info">
                  업로드일: {item.transaction_upload_date ? 
                    new Date(item.transaction_upload_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '정보 없음'}
                  {item.transaction_uploaded_by && (
                    <> • 업로드자: {item.transaction_uploaded_by}</>
                  )}
                </div>
                <div className="current-file-actions">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewCurrent}
                    style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      border: '1px solid #3b82f6'
                    }}
                  >
                    <ExternalLink size={14} />
                    현재 파일 보기
                  </Button>
                </div>
              </>
            ) : (
              <div className="current-file-info">
                이 품목에는 아직 거래명세서가 업로드되지 않았습니다. 
                구매 관련 서류를 체계적으로 관리하기 위해 거래명세서를 업로드해 주세요.
              </div>
            )}
          </CurrentFileSection>

          {/* 파일 업로드 영역 */}
          <UploadArea
            dragOver={dragOver}
            hasError={Boolean(uploadError)}
            onDragOver={(e) => { 
              e.preventDefault(); 
              setDragOver(true); 
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={handleFileInput}
          >
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <div className="upload-title">
              {hasCurrentFile ? '새 파일로 교체' : '거래명세서 파일 업로드'}
            </div>
            <div className="upload-subtitle">
              PDF, 이미지 파일 또는 Excel 파일을 드래그하거나 클릭하여 선택하세요<br />
              <strong>지원 형식:</strong> PDF, JPG, PNG, XLSX, XLS<br />
              <strong>최대 크기:</strong> 10MB
            </div>
          </UploadArea>

          {/* 업로드 오류 표시 */}
          {uploadError && (
            <FileValidationMessage type="error">
              <AlertCircle size={16} />
              {uploadError}
            </FileValidationMessage>
          )}

          {/* 파일 검증 메시지 */}
          {validationMessage && (
            <FileValidationMessage type={validationMessage.type}>
              {validationMessage.type === 'success' && <CheckCircle size={16} />}
              {validationMessage.type === 'error' && <AlertCircle size={16} />}
              {validationMessage.type === 'warning' && <AlertCircle size={16} />}
              {validationMessage.message}
            </FileValidationMessage>
          )}

          {/* 선택된 파일 미리보기 */}
          {selectedFile && (
            <SelectedFilePreview>
              <div className="file-info">
                <div style={{ fontSize: '1.5rem' }}>
                  {getFileTypeIcon(selectedFile.type)}
                </div>
                <div className="file-details">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </div>
                </div>
              </div>
              <div className="remove-file">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveFile}
                  title="파일 제거"
                >
                  <X size={16} />
                </Button>
              </div>
            </SelectedFilePreview>
          )}

          {/* 안내 메시지 */}
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#fef3c7', 
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            <strong>💡 팁:</strong> 거래명세서를 업로드하면 해당 품목의 구매 관련 서류를 체계적으로 관리할 수 있습니다. 
            업로드된 파일은 언제든지 조회하고 다운로드할 수 있으며, 새 파일로 교체도 가능합니다.
          </div>
        </ModalContent>
        
        <div style={{ padding: '24px' }}>
          <ButtonGroup>
            <Button 
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              disabled={!selectedFile || loading || validationMessage?.type === 'error'}
              loading={loading}
            >
              {loading ? '업로드 중...' : (hasCurrentFile ? '파일 교체' : '업로드 등록')}
            </Button>
          </ButtonGroup>
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TransactionDocumentModal;