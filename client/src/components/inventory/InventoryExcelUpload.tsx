// client/src/components/inventory/InventoryExcelUpload.tsx - 수정된 버전
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  Loader,
  Package,
  Database,
  Info,
  ArrowLeft,
  X,
  RefreshCw
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ExcelUploadGuide from '../common/ExcelUploadGuide';
import { inventoryApi } from '../../services/api';

interface InventoryExcelUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  created_count: number;
  updated_count?: number;
  created_items: string[];
  updated_items?: string[];
  total_processed?: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  message?: string;
}

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 500px;
`;

const InfoSection = styled(Card)`
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-left: 4px solid #0ea5e9;
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .info-icon {
      color: #0ea5e9;
    }
    
    .info-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #0c4a6e;
    }
  }
  
  .info-content {
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #0c4a6e;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .bullet {
        width: 4px;
        height: 4px;
        background: #0ea5e9;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }
  }
`;

const TemplateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .template-header {
    .template-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1f2937;
    }
    
    .template-description {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.5;
    }
  }
  
  .template-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 12px;
  }
`;

const UploadArea = styled.div<{ isDragOver: boolean; disabled?: boolean }>`
  border: 2px dashed ${props => 
    props.disabled 
      ? '#d1d5db' 
      : props.isDragOver 
        ? '#3b82f6' 
        : '#d1d5db'
  };
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  background: ${props => 
    props.disabled
      ? '#f9fafb'
      : props.isDragOver 
        ? '#eff6ff' 
        : '#ffffff'
  };
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  position: relative;
  
  &:hover {
    border-color: ${props => props.disabled ? '#d1d5db' : '#3b82f6'};
    background: ${props => props.disabled ? '#f9fafb' : '#eff6ff'};
  }
  
  .upload-icon {
    margin-bottom: 16px;
    color: ${props => props.disabled ? '#9ca3af' : '#3b82f6'};
    opacity: 0.8;
  }
  
  .upload-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
  }
  
  .upload-subtitle {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .upload-hint {
    color: #9ca3af;
    font-size: 12px;
  }
  
  .file-info {
    margin-top: 12px;
    padding: 12px;
    background: #f0f9ff;
    border-radius: 8px;
    border: 1px solid #bae6fd;
    
    .file-name {
      font-weight: 500;
      color: #0c4a6e;
      margin-bottom: 4px;
    }
    
    .file-size {
      font-size: 12px;
      color: #0369a1;
    }
  }
`;

const ProgressSection = styled.div`
  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .progress-title {
      font-weight: 500;
      color: #1f2937;
    }
    
    .progress-percentage {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
    }
  }
  
  .progress-bar {
    width: 100%;
    height: 10px;
    background: #f3f4f6;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      transition: width 0.3s ease;
      border-radius: 5px;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
    }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .progress-status {
    margin-top: 12px;
    font-size: 14px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .status-icon {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ResultSection = styled.div<{ success: boolean }>`
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .result-icon {
      color: ${props => props.success ? '#10b981' : '#ef4444'};
    }
    
    .result-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: ${props => props.success ? '#065f46' : '#991b1b'};
    }
  }
  
  .result-summary {
    background: ${props => props.success ? '#ecfdf5' : '#fef2f2'};
    border: 1px solid ${props => props.success ? '#a7f3d0' : '#fecaca'};
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .summary-item {
      text-align: center;
      
      .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: ${props => props.success ? '#059669' : '#dc2626'};
        margin-bottom: 4px;
      }
      
      .label {
        font-size: 12px;
        color: ${props => props.success ? '#065f46' : '#991b1b'};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
  
  .error-details {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    
    .error-header {
      padding: 12px 16px;
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      font-weight: 600;
      color: #991b1b;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    
    .error-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background: #f9fafb;
      }
      
      .error-row {
        font-weight: 600;
        color: #dc2626;
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .error-field {
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 4px;
        font-size: 13px;
      }
      
      .error-message {
        font-size: 13px;
        color: #374151;
        line-height: 1.4;
      }
    }
  }
  
  .success-items {
    margin-top: 20px;
    
    .items-header {
      font-weight: 600;
      margin-bottom: 12px;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      
      .item-code {
        display: inline-block;
        padding: 6px 10px;
        background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        color: #0c4a6e;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        font-family: 'Courier New', monospace;
        border: 1px solid #7dd3fc;
        transition: all 0.2s ease;
        
        &:hover {
          background: linear-gradient(135deg, #bae6fd, #7dd3fc);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  
  .left-actions {
    display: flex;
    gap: 12px;
  }
  
  .right-actions {
    display: flex;
    gap: 12px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
`;

const requiredColumns = [
  { name: '품목코드', required: true, description: '고유한 품목 식별코드 (예: ITM-001)' },
  { name: '품목명', required: true, description: '품목의 이름' },
  { name: '단위', required: true, description: '수량 단위 (개, kg, L 등)' },
  { name: '최소재고', required: true, description: '최소 보유 수량' },
  { name: '카테고리', required: false, description: '품목 분류' },
  { name: '브랜드', required: false, description: '제조사 또는 브랜드' },
  { name: '사양', required: false, description: '제품 상세 사양' },
  { name: '단가', required: false, description: '품목 단가 (원)' },
  { name: '통화', required: false, description: '가격 통화 (KRW, USD 등)' },
  { name: '위치', required: false, description: '보관 위치' },
  { name: '창고', required: false, description: '창고명' },
  { name: '공급업체', required: false, description: '공급업체명' },
  { name: '최대재고', required: false, description: '최대 보유 수량' },
  { name: '설명', required: false, description: '품목 설명' },
  { name: '비고', required: false, description: '추가 메모' },
];

const InventoryExcelUpload: React.FC<InventoryExcelUploadProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  
  // State
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');

  // 개선된 업로드 Mutation
  const uploadMutation = useMutation({
    mutationFn: inventoryApi.uploadExcel,
    onMutate: () => {
      setCurrentStep('processing');
      setUploadProgress(0);
      
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      return { progressInterval };
    },
    onSuccess: (result: UploadResult, _, context) => {
      if (context?.progressInterval) {
        clearInterval(context.progressInterval);
      }
      
      setUploadProgress(100);
      setCurrentStep('result');
      setUploadResult(result);
      
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['unified-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['unified-inventory-stats'] });
      
      // 성공 메시지
      const successMsg = result.updated_count && result.updated_count > 0 
        ? `${result.created_count}개 신규 등록, ${result.updated_count}개 업데이트 완료!`
        : `${result.created_count}개 품목이 성공적으로 등록되었습니다!`;
      
      toast.success(successMsg, {
        position: 'top-center',
        autoClose: 5000,
      });
      
      // 부모 컴포넌트에 성공 알림
      onSuccess();
    },
    onError: (error: any, _, context) => {
      if (context?.progressInterval) {
        clearInterval(context.progressInterval);
      }
      
      setCurrentStep('result');
      setUploadProgress(0);
      
      // 에러 결과 설정
      setUploadResult({
        success: false,
        created_count: 0,
        created_items: [],
        errors: [{ 
          row: 0, 
          field: 'file', 
          message: error.message || '업로드 중 알 수 없는 오류가 발생했습니다.' 
        }],
      });
      
      toast.error(error.message || '업로드에 실패했습니다.', {
        position: 'top-center',
        autoClose: 7000,
      });
    },
  });

  // 개선된 템플릿 다운로드 Mutation
  const downloadTemplateMutation = useMutation({
    mutationFn: inventoryApi.downloadTemplate,
    onSuccess: () => {
      toast.success('템플릿이 성공적으로 다운로드되었습니다!', {
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || '템플릿 다운로드에 실패했습니다.', {
        position: 'top-right',
      });
    },
  });

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    
    console.log(' 파일 선택:', file.name, file.size);
    
    // 파일 확장자 검증
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Excel 파일만 업로드 가능합니다 (.xlsx, .xls)', {
        position: 'top-center',
      });
      return;
    }
    
    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.', {
        position: 'top-center',
      });
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
    setCurrentStep('upload');
    
    toast.success('파일이 선택되었습니다. 업로드 버튼을 클릭하세요.', {
      position: 'top-right',
      autoClose: 3000,
    });
  }, []);

  // 업로드 실행
  const handleUpload = useCallback(() => {
    if (!selectedFile) {
      toast.error('파일을 먼저 선택해주세요.', {
        position: 'top-center',
      });
      return;
    }
    
    console.log(' 업로드 시작:', selectedFile.name);
    uploadMutation.mutate(selectedFile);
  }, [selectedFile, uploadMutation]);

  // 드래그 앤 드롭 핸들러들
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (uploadMutation.isPending) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [uploadMutation.isPending, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!uploadMutation.isPending) {
      setDragOver(true);
    }
  }, [uploadMutation.isPending]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // 파일 입력 클릭
  const handleFileInputClick = useCallback(() => {
    if (uploadMutation.isPending) return;
    const input = document.getElementById('inventory-excel-file-input') as HTMLInputElement;
    input?.click();
  }, [uploadMutation.isPending]);

  // 업로드 초기화
  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setCurrentStep('upload');
  }, []);

  // 모달 닫기
  const handleClose = useCallback(() => {
    if (uploadMutation.isPending) {
      const confirm = window.confirm('업로드가 진행 중입니다. 정말로 취소하시겠습니까?');
      if (!confirm) return;
    }
    
    resetUpload();
    setShowGuide(false);
    onClose();
  }, [uploadMutation.isPending, resetUpload, onClose]);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +  + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="품목 Excel 일괄 업로드"
      size="xl"
    >
      {showGuide ? (
        // 가이드 표시
        <div>
          <ExcelUploadGuide type="inventory" />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '24px', 
            paddingTop: '24px', 
            borderTop: '1px solid #e5e7eb' 
          }}>
            <Button variant="outline" onClick={() => setShowGuide(false)}>
              <ArrowLeft size={16} />
              업로드로 돌아가기
            </Button>
          </div>
        </div>
      ) : (
        // 메인 업로드 UI
        <UploadContainer>
          {/* 안내 정보 */}
          <InfoSection>
            <div className="info-header">
              <Database className="info-icon" size={20} />
              <div className="info-title">품목 일괄 등록 안내</div>
            </div>
            <div className="info-content">
              <div className="info-item">
                <div className="bullet" />
                <span>Excel 템플릿을 다운로드하여 품목 정보를 입력해주세요.</span>
              </div>
              <div className="info-item">
                <div className="bullet" />
                <span>품목코드는 고유해야 하며, 중복 시 기존 품목이 업데이트됩니다.</span>
              </div>
              <div className="info-item">
                <div className="bullet" />
                <span>최대 1,000개 품목까지 한 번에 업로드할 수 있습니다.</span>
              </div>
              <div className="info-item">
                <div className="bullet" />
                <span>파일 크기는 10MB를 초과할 수 없습니다.</span>
              </div>
            </div>
          </InfoSection>

          {/* 템플릿 다운로드 섹션 */}
          <TemplateSection>
            <div className="template-header">
              <div className="template-title">1단계: Excel 템플릿 다운로드</div>
              <div className="template-description">
                먼저 템플릿을 다운로드하여 올바른 형식을 확인하세요. 
                템플릿에는 필수 컬럼과 샘플 데이터가 포함되어 있습니다.
              </div>
            </div>
            
            <div className="template-actions">
              <Button
                variant="primary"
                onClick={() => downloadTemplateMutation.mutate()}
                disabled={downloadTemplateMutation.isPending}
                loading={downloadTemplateMutation.isPending}
              >
                <Download size={16} />
                품목 등록 템플릿 다운로드
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowGuide(true)}
                size="sm"
              >
                <Info size={16} />
                상세 가이드 보기
              </Button>
            </div>
          </TemplateSection>

          {/* 파일 업로드 영역 */}
          {currentStep === 'upload' && (
            <div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#1f2937'
              }}>
                 2단계: Excel 파일 업로드
              </div>
              
              <UploadArea
                isDragOver={dragOver}
                disabled={uploadMutation.isPending}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleFileInputClick}
              >
                {uploadMutation.isPending && (
                  <LoadingOverlay>
                    <Loader size={32} className="status-icon" />
                  </LoadingOverlay>
                )}
                
                <Package size={48} className="upload-icon" />
                
                <div className="upload-title">
                  {selectedFile ? '파일이 선택되었습니다' : 'Excel 파일을 선택하세요'}
                </div>
                
                <div className="upload-subtitle">
                  {selectedFile 
                    ? '아래 업로드 버튼을 클릭하여 업로드를 시작하세요'
                    : '파일을 여기에 끌어다 놓거나 클릭하여 선택하세요'
                  }
                </div>
                
                {selectedFile && (
                  <div className="file-info">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">파일 크기: {formatFileSize(selectedFile.size)}</div>
                  </div>
                )}
                
                <div className="upload-hint">
                  .xlsx, .xls 파일만 지원됩니다 (최대 10MB)
                </div>
              </UploadArea>
            </div>
          )}

          <HiddenInput
            id="inventory-excel-file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            disabled={uploadMutation.isPending}
          />

          {/* 업로드 진행률 */}
          {currentStep === 'processing' && (
            <ProgressSection>
              <div className="progress-header">
                <div className="progress-title">업로드 진행중...</div>
                <div className="progress-percentage">{Math.round(uploadProgress)}%</div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="progress-status">
                <Loader size={16} className="status-icon" />
                <span>Excel 파일을 분석하고 품목을 생성하는 중입니다...</span>
              </div>
            </ProgressSection>
          )}

          {/* 업로드 결과 */}
          {currentStep === 'result' && uploadResult && (
            <ResultSection success={uploadResult.success}>
              <div className="result-header">
                <div className="result-icon">
                  {uploadResult.success ? (
                    <CheckCircle size={32} />
                  ) : (
                    <AlertCircle size={32} />
                  )}
                </div>
                <div className="result-title">
                  {uploadResult.success ? ' 업로드 완료!' : '업로드 실패'}
                </div>
              </div>

              <div className="result-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="value">{uploadResult.created_count}</div>
                    <div className="label">신규 등록</div>
                  </div>
                  
                  {uploadResult.updated_count && uploadResult.updated_count > 0 && (
                    <div className="summary-item">
                      <div className="value">{uploadResult.updated_count}</div>
                      <div className="label">업데이트</div>
                    </div>
                  )}
                  
                  {uploadResult.total_processed && (
                    <div className="summary-item">
                      <div className="value">{uploadResult.total_processed}</div>
                      <div className="label">총 처리</div>
                    </div>
                  )}
                  
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="summary-item">
                      <div className="value">{uploadResult.errors.length}</div>
                      <div className="label">오류 발생</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 성공한 품목 코드들 */}
              {uploadResult.success && uploadResult.created_items.length > 0 && (
                <div className="success-items">
                  <div className="items-header">
                    <Package size={16} />
                    생성된 품목 코드 ({uploadResult.created_items.length}개)
                  </div>
                  <div className="items-grid">
                    {uploadResult.created_items.slice(0, 50).map((code, index) => (
                      <span key={index} className="item-code">
                        {code}
                      </span>
                    ))}
                    {uploadResult.created_items.length > 50 && (
                      <span className="item-code">
                        +{uploadResult.created_items.length - 50}개 더
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 오류 상세 내역 */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="error-details">
                  <div className="error-header">
                    오류 상세 내역 ({uploadResult.errors.length}건)
                  </div>
                  {uploadResult.errors.slice(0, 20).map((error, index) => (
                    <div key={index} className="error-item">
                      <div className="error-row">
                         행 {error.row}
                      </div>
                      <div className="error-field">
                        필드: {error.field}
                      </div>
                      <div className="error-message">
                        {error.message}
                      </div>
                    </div>
                  ))}
                  {uploadResult.errors.length > 20 && (
                    <div className="error-item">
                      <div className="error-message" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                        ... 및 {uploadResult.errors.length - 20}개의 추가 오류
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ResultSection>
          )}

          {/* 버튼 그룹 */}
          <ButtonGroup>
            <div className="left-actions">
              {currentStep === 'result' && (
                <Button variant="outline" onClick={resetUpload}>
                  <RefreshCw size={16} />
                  다시 업로드
                </Button>
              )}
            </div>
            
            <div className="right-actions">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={uploadMutation.isPending}
              >
                <X size={16} />
                {uploadMutation.isPending ? '업로드 중...' : '닫기'}
              </Button>
              
              {selectedFile && currentStep === 'upload' && (
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  loading={uploadMutation.isPending}
                >
                  <Upload size={16} />
                  업로드 시작
                </Button>
              )}
            </div>
          </ButtonGroup>
        </UploadContainer>
      )}
    </Modal>
  );
};

export default InventoryExcelUpload;