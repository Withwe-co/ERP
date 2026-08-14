// client/src/components/purchase/ExcelBulkUpload.tsx
import React, { useState } from 'react';
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
  Loader
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { purchaseApi } from '../../services/api';

interface ExcelBulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  created_count: number;
  request_numbers: string[]; 
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoSection = styled(Card)`
  background: ${props => props.theme.colors.background};
  border-left: 4px solid ${props => props.theme.colors.info};
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .info-icon {
      color: ${props => props.theme.colors.info};
    }
    
    .info-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${props => props.theme.colors.text};
    }
  }
  
  .info-content {
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .bullet {
        width: 4px;
        height: 4px;
        background: ${props => props.theme.colors.primary};
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
    }
    
    .template-description {
      color: ${props => props.theme.colors.textSecondary};
      font-size: 14px;
      line-height: 1.5;
    }
  }
  
  .template-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 16px 0;
    
    .column-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: ${props => props.theme.colors.background};
      border-radius: 6px;
      font-size: 13px;
      
      .required-mark {
        color: ${props => props.theme.colors.error};
        font-weight: bold;
      }
      
      .column-name {
        color: ${props => props.theme.colors.text};
      }
    }
  }
`;

const UploadArea = styled.div<{ isDragOver: boolean; disabled?: boolean }>`
  border: 2px dashed ${props => 
    props.disabled 
      ? props.theme.colors.border 
      : props.isDragOver 
        ? props.theme.colors.primary 
        : props.theme.colors.border
  };
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => 
    props.disabled
      ? props.theme.colors.background
      : props.isDragOver 
        ? props.theme.colors.primary + '05' 
        : props.theme.colors.surface
  };
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    border-color: ${props => props.disabled ? props.theme.colors.border : props.theme.colors.primary};
    background: ${props => props.disabled ? props.theme.colors.background : props.theme.colors.primary + '05'};
  }
  
  .upload-icon {
    margin-bottom: 16px;
    color: ${props => props.theme.colors.primary};
    opacity: 0.7;
  }
  
  .upload-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.theme.colors.text};
  }
  
  .upload-subtitle {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .upload-hint {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 12px;
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
    }
    
    .progress-percentage {
      font-size: 14px;
      color: ${props => props.theme.colors.textSecondary};
    }
  }
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background: ${props => props.theme.colors.background};
    border-radius: 4px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: ${props => props.theme.colors.primary};
      transition: width 0.3s ease;
      border-radius: 4px;
    }
  }
  
  .progress-status {
    margin-top: 12px;
    font-size: 14px;
    color: ${props => props.theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ResultSection = styled.div<{ success: boolean }>`
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .result-icon {
      color: ${props => props.success ? props.theme.colors.success : props.theme.colors.error};
    }
    
    .result-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${props => props.success ? props.theme.colors.success : props.theme.colors.error};
    }
  }
  
  .result-summary {
    background: ${props => props.success ? props.theme.colors.success + '10' : props.theme.colors.error + '10'};
    border: 1px solid ${props => props.success ? props.theme.colors.success + '30' : props.theme.colors.error + '30'};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: ${props => props.theme.colors.textSecondary};
      }
      
      .value {
        font-weight: 600;
        color: ${props => props.theme.colors.text};
      }
    }
  }
  
  .error-details {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 8px;
    
    .error-item {
      padding: 12px 16px;
      border-bottom: 1px solid ${props => props.theme.colors.border};
      
      &:last-child {
        border-bottom: none;
      }
      
      .error-row {
        font-weight: 600;
        color: ${props => props.theme.colors.error};
        margin-bottom: 4px;
      }
      
      .error-message {
        font-size: 14px;
        color: ${props => props.theme.colors.textSecondary};
      }
    }
  }
  
  .request-numbers {
    margin-top: 16px;
    
    .numbers-title {
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .numbers-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .number-tag {
        display: inline-block;
        padding: 4px 8px;
        background: ${props => props.theme.colors.primary}15;
        color: ${props => props.theme.colors.primary};
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
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
  
  .left-actions {
    display: flex;
    gap: 12px;
  }
  
  .right-actions {
    display: flex;
    gap: 12px;
  }
`;

const requiredColumns = [
  { name: '품목명', required: true, description: '구매할 품목의 이름' },
  { name: '카테고리', required: true, description: '품목 분류' },
  { name: '수량', required: true, description: '구매 수량 (숫자)' },
  { name: '부서', required: true, description: '요청 부서' },
  { name: '구매사유', required: true, description: '구매가 필요한 이유' },
  { name: '사양', required: false, description: '제품 사양 및 요구사항' },
  { name: '예상단가', required: false, description: '예상 단가 (원)' },
  { name: '공급업체', required: false, description: '구매처' },
  { name: '긴급도', required: false, description: '낮음/보통/높음/긴급' },
  { name: '희망납기일', required: false, description: 'YYYY-MM-DD 형식' },
  { name: '프로젝트명', required: false, description: '관련 프로젝트' },
  { name: '링크', required: false, description: '링크' },
];

const ExcelBulkUpload: React.FC<ExcelBulkUploadProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');

  const uploadMutation = useMutation({
    mutationFn: purchaseApi.uploadExcel,
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
      
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests-stats'] });
      
      const successMsg = `${result.created_count}개 구매요청이 성공적으로 등록되었습니다!`;
      toast.success(successMsg);
      
      onSuccess();
    },
    onError: (error: any, _, context) => {
      if (context?.progressInterval) {
        clearInterval(context.progressInterval);
      }
      
      setCurrentStep('result');
      setUploadResult({
        success: false,
        created_count: 0,
        request_numbers: [],
        errors: [{ row: 0, field: 'file', message: error.message }],
      });
      
      toast.error(error.message);
    },
  });

  const downloadTemplateMutation = useMutation({
    mutationFn: purchaseApi.downloadTemplate,
    onSuccess: () => {
      toast.success('템플릿이 다운로드되었습니다.');
    },
    onError: () => {
      toast.error('템플릿 다운로드에 실패했습니다.');
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // 파일 확장자 검증
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Excel 파일만 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('파일을 먼저 선택해주세요.');
      return;
    }
    
    setUploadProgress(0);
    uploadMutation.mutate(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (uploadMutation.isPending) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploadMutation.isPending) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInputClick = () => {
    if (uploadMutation.isPending) return;
    const input = document.getElementById('excel-file-input') as HTMLInputElement;
    input?.click();
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  const handleClose = () => {
    resetUpload();
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Excel 일괄 업로드"
      size="xl"
    >
      <UploadContainer>
        {/* 안내 정보 */}
        <InfoSection>
          <div className="info-header">
            <FileText className="info-icon" size={20} />
            <div className="info-title">업로드 안내</div>
          </div>
          <div className="info-content">
            <div className="info-item">
              <div className="bullet" />
              <span>Excel 템플릿을 다운로드하여 양식에 맞게 데이터를 입력해주세요.</span>
            </div>
            <div className="info-item">
              <div className="bullet" />
              <span>필수 항목은 반드시 입력해야 하며, 빈 값이 있으면 오류가 발생합니다.</span>
            </div>
            <div className="info-item">
              <div className="bullet" />
              <span>최대 1,000건까지 한 번에 업로드할 수 있습니다.</span>
            </div>
            <div className="info-item">
              <div className="bullet" />
              <span>파일 크기는 10MB를 초과할 수 없습니다.</span>
            </div>
          </div>
        </InfoSection>

        {/* 템플릿 정보 */}
        <TemplateSection>
          <div className="template-header">
            <div className="template-title">Excel 템플릿 양식</div>
            <div className="template-description">
              아래 컬럼들이 포함된 Excel 템플릿을 다운로드하여 사용하세요.
            </div>
          </div>
          
          <div className="template-columns">
            {requiredColumns.map((column, index) => (
              <div key={index} className="column-item">
                {column.required && <span className="required-mark">*</span>}
                <span className="column-name">{column.name}</span>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => downloadTemplateMutation.mutate()}
            disabled={downloadTemplateMutation.isPending}
            loading={downloadTemplateMutation.isPending}
          >
            <Download size={16} />
            Excel 템플릿 다운로드
          </Button>
        </TemplateSection>

        {/* 파일 업로드 영역 */}
        {!uploadResult && (
          <UploadArea
            isDragOver={dragOver}
            disabled={uploadMutation.isPending}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleFileInputClick}
          >
            <FileSpreadsheet size={48} className="upload-icon" />
            <div className="upload-title">
              {selectedFile ? selectedFile.name : 'Excel 파일을 선택하세요'}
            </div>
            <div className="upload-subtitle">
              {selectedFile 
                ? `파일 크기: ${formatFileSize(selectedFile.size)}`
                : '파일을 여기에 끌어다 놓거나 클릭하여 선택하세요'
              }
            </div>
            <div className="upload-hint">
              .xlsx, .xls 파일만 지원됩니다 (최대 10MB)
            </div>
          </UploadArea>
        )}

        <HiddenInput
          id="excel-file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          disabled={uploadMutation.isPending}
        />

        {/* 업로드 진행률 */}
        {uploadMutation.isPending && (
          <ProgressSection>
            <div className="progress-header">
              <div className="progress-title">업로드 진행중...</div>
              <div className="progress-percentage">{uploadProgress}%</div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="progress-status">
              <Loader size={16} className="animate-spin" />
              <span>Excel 파일을 분석하고 구매 요청을 생성하는 중...</span>
            </div>
          </ProgressSection>
        )}

        {/* 업로드 결과 */}
        {uploadResult && (
          <ResultSection success={uploadResult.success}>
            <div className="result-header">
              <div className="result-icon">
                {uploadResult.success ? (
                  <CheckCircle size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="result-title">
                {uploadResult.success ? '업로드 완료!' : '업로드 실패'}
              </div>
            </div>

            <div className="result-summary">
              <div className="summary-item">
                <span className="label">처리된 요청:</span>
                <span className="value">{uploadResult.created_count}건</span>
              </div>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="summary-item">
                  <span className="label">오류 발생:</span>
                  <span className="value">{uploadResult.errors.length}건</span>
                </div>
              )}
            </div>

            {/* 성공한 요청 번호들 */}
            {uploadResult.success && uploadResult.request_numbers?.length > 0 && (
              <div className="request-numbers">
                <div className="numbers-title">생성된 구매 요청 번호:</div>
                <div className="numbers-list">
                  {uploadResult.request_numbers.map((number, index) => (
                    <span key={index} className="number-tag">
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 오류 상세 내역 */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="error-details">
                {uploadResult.errors.map((error, index) => (
                  <div key={index} className="error-item">
                    <div className="error-row">
                      행 {error.row}: {error.field}
                    </div>
                    <div className="error-message">
                      {error.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ResultSection>
        )}

        {/* 버튼 그룹 */}
        <ButtonGroup>
          <div className="left-actions">
            {uploadResult && (
              <Button variant="outline" onClick={resetUpload}>
                다시 업로드
              </Button>
            )}
          </div>
          
          <div className="right-actions">
            <Button variant="outline" onClick={handleClose}>
              닫기
            </Button>
            {selectedFile && !uploadResult && !uploadMutation.isPending && (
              <Button onClick={handleUpload}>
                <Upload size={16} />
                업로드 시작
              </Button>
            )}
          </div>
        </ButtonGroup>
      </UploadContainer>
    </Modal>
  );
};

export default ExcelBulkUpload;