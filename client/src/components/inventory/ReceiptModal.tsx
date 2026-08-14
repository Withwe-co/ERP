// client/src/components/inventory/ReceiptModal.tsx - 개선된 버전
import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Upload, X, ChevronDown, Image } from 'lucide-react';
import Button from '../common/Button';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  min-height: 400px;
  background: white;
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

// 부서 선택을 위한 Select 컴포넌트 스타일
const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SelectLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const SelectButton = styled.button<{ isOpen: boolean; hasError?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 4px;
  background: white;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.hasError ? '#ef4444' : '#3b82f6'};
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  
  .placeholder {
    color: #9ca3af;
  }
  
  .chevron {
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
    color: #6b7280;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const OptionItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  background: ${props => props.isSelected ? '#3b82f6' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#374151'};
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${props => props.isSelected ? '#3b82f6' : '#f8fafc'};
  }
`;

// 🔥 개선된 이미지 업로드 섹션
const ImageUploadSection = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#3b82f6' : '#d1d5db'};
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  background: ${props => props.isDragging ? '#eff6ff' : '#f9fafb'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }
  
  /* 드래그 중일 때 효과 */
  ${props => props.isDragging && `
    border-color: #1d4ed8;
    background: #dbeafe;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  `}
`;

const DragOverlay = styled.div<{ isDragging: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  display: ${props => props.isDragging ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #1d4ed8;
  font-size: 18px;
  z-index: 10;
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  aspect-ratio: 1;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-button {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover .remove-button {
    opacity: 1;
  }
`;

const ImageCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  font-size: 14px;
  color: #0c4a6e;
  
  .icon {
    color: #0ea5e9;
  }
`;

const ProcessingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 14px;
  margin-top: 12px;
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f59e0b;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 부서 옵션
const DEPARTMENT_OPTIONS = [
  { value: 'H/W 개발팀', label: 'H/W 개발팀' },
  { value: 'S/W 개발팀', label: 'S/W 개발팀' },
  { value: '총무부', label: '총무부' },
  { value: '사무관리팀', label: '사무관리팀' },
  { value: '영업팀', label: '영업팀' },
];

interface ReceiptModalProps {
  item: any;
  onSubmit: (receiptData: any, images?: File[]) => void;
  onCancel: () => void;
  loading?: boolean;
  requireImages?: boolean;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  item,
  onSubmit,
  onCancel,
  loading = false,
  requireImages = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const departmentSelectRef = useRef<HTMLDivElement>(null);
  
  // 부서 선택 관련 상태
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  
  // 기본 폼 데이터
  const [formData, setFormData] = useState({
    received_quantity: 1,
    receiver_name: '',
    receiver_email: '',
    department: '',
    received_date: new Date().toISOString().split('T')[0],
    location: '',
    condition: 'good',
    notes: ''
  });

  // 이미지 관련 상태
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // 🔥 드래그 이벤트 핸들러 개선
  const handleDragEvents = useCallback({
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // 실제로 영역을 벗어났는지 확인
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        setIsDragging(false);
      }
    },
    
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    },
    
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    }
  }, []);

  // 클린업 함수
  React.useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviewUrls]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 부서 선택 핸들러
  const handleDepartmentSelect = (departmentValue: string) => {
    handleInputChange('department', departmentValue);
    setIsDepartmentOpen(false);
  };

  const handleDepartmentToggle = () => {
    setIsDepartmentOpen(!isDepartmentOpen);
  };

  // 🔥 개선된 이미지 처리 함수
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    console.log('🔥 파일 선택됨:', files.length, '개');
    
    setIsProcessingImages(true);

    // 이미지 파일만 필터링 (크기 제한 포함)
    const imageFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isImage) {
        console.warn('🚫 이미지가 아닌 파일 제외:', file.name);
      }
      if (!isValidSize) {
        console.warn('🚫 크기 초과 파일 제외:', file.name, file.size);
      }
      
      return isImage && isValidSize;
    });
    
    if (imageFiles.length === 0) {
      alert('유효한 이미지 파일이 없습니다.\n(JPG, PNG 등 이미지 파일, 10MB 이하만 가능)');
      setIsProcessingImages(false);
      return;
    }

    console.log('✅ 처리할 이미지 파일:', imageFiles.length, '개');

    // 🔥 FileReader를 사용하여 base64로 변환
    const promises = imageFiles.map((file, index) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log(`✅ 이미지 ${index + 1} 로딩 완료:`, file.name);
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.error(`❌ 이미지 ${index + 1} 로딩 실패:`, file.name);
          reject(new Error(`파일 읽기 실패: ${file.name}`));
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const newPreviewUrls = await Promise.all(promises);
      
      // 상태 업데이트
      setSelectedImages(prev => [...prev, ...imageFiles]);
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      console.log('🎉 모든 이미지 처리 완료! 총', newPreviewUrls.length, '개');
      
    } catch (error) {
      console.error('❌ 이미지 처리 중 오류:', error);
      alert(`이미지 처리 중 오류가 발생했습니다:\n${error.message}`);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 파일 입력 변경됨');
    handleFileSelect(e.target.files);
  };

  const removeImage = (index: number) => {
    console.log('🗑️ 이미지 제거:', index);
    
    // base64 URL은 revoke 불필요하지만, blob URL인 경우 처리
    const urlToRemove = imagePreviewUrls[index];
    if (urlToRemove && urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
    }
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미지 필수 체크
    if (requireImages && selectedImages.length === 0) {
      alert('이미지 업로드가 필수입니다.\n최소 1개의 이미지를 업로드해주세요.');
      return;
    }
    
    // 필수 필드 체크
    if (!formData.receiver_name || !formData.department) {
      alert('수령자명과 부서는 필수 입력 항목입니다.');
      return;
    }
    
    console.log('📤 폼 제출:', {
      formData,
      imageCount: selectedImages.length
    });
    
    onSubmit(formData, selectedImages);
  };

  const conditionOptions = [
    { value: 'excellent', label: '최상' },
    { value: 'good', label: '양호' },
    { value: 'damaged', label: '손상' },
    { value: 'defective', label: '불량' }
  ];

  if (!item) {
    return (
      <FormContainer>
        <div>아이템 정보를 불러올 수 없습니다.</div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Title>
        {requireImages ? '수령 완료' : '수령 추가'} - {item.item_name}
      </Title>

      {requireImages && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '0.875rem',
          marginBottom: '16px'
        }}>
          ⚠️ 수령 완료를 위해 이미지 업로드가 필수입니다.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 기본 수령 정보 */}
        <FormGrid>
          <FormGroup>
            <label>수령 수량 *</label>
            <input
              type="number"
              value={formData.received_quantity}
              onChange={(e) => handleInputChange('received_quantity', parseInt(e.target.value) || 1)}
              min="1"
              required
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormGroup>

          <FormGroup>
            <label>수령자명 *</label>
            <input
              type="text"
              value={formData.receiver_name}
              onChange={(e) => handleInputChange('receiver_name', e.target.value)}
              placeholder="수령자명을 입력하세요"
              required
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormGroup>

          <FormGroup>
            <label>수령자 이메일</label>
            <input
              type="email"
              value={formData.receiver_email}
              onChange={(e) => handleInputChange('receiver_email', e.target.value)}
              placeholder="이메일을 입력하세요"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormGroup>

          {/* 부서 선택 드롭다운 */}
          <FormGroup>
            <SelectContainer ref={departmentSelectRef}>
              <SelectLabel>부서 *</SelectLabel>
              
              <SelectButton
                type="button"
                isOpen={isDepartmentOpen}
                onClick={handleDepartmentToggle}
              >
                <span className={formData.department ? '' : 'placeholder'}>
                  {formData.department || '부서를 선택하세요'}
                </span>
                <ChevronDown size={16} className="chevron" />
              </SelectButton>

              <DropdownMenu isOpen={isDepartmentOpen}>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <OptionItem
                    key={dept.value}
                    isSelected={formData.department === dept.value}
                    onClick={() => handleDepartmentSelect(dept.value)}
                  >
                    {dept.label}
                  </OptionItem>
                ))}
              </DropdownMenu>
            </SelectContainer>
          </FormGroup>

          <FormGroup>
            <label>수령일 *</label>
            <input
              type="date"
              value={formData.received_date}
              onChange={(e) => handleInputChange('received_date', e.target.value)}
              required
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormGroup>

          <FormGroup>
            <label>수령 위치</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="수령 위치를 입력하세요"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </FormGroup>
        </FormGrid>

        <FormGroup>
          <label>품목 상태</label>
          <select
            value={formData.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {conditionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>비고</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="추가 메모사항을 입력하세요"
            rows={3}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </FormGroup>

        {/* 🔥 개선된 이미지 업로드 섹션 */}
        <FormGroup>
          <label>
            수령 이미지 {requireImages && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          
          <ImageUploadSection
            isDragging={isDragging}
            onClick={() => fileInputRef.current?.click()}
            {...handleDragEvents}
          >
            <DragOverlay isDragging={isDragging}>
              📷 이미지를 놓아주세요!
            </DragOverlay>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Upload size={40} style={{ color: isDragging ? '#1d4ed8' : '#6b7280' }} />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  {isDragging ? '여기에 이미지를 놓아주세요' : '이미지를 업로드하세요'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  클릭하거나 드래그앤드롭으로 업로드 • JPG, PNG (최대 10MB)
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </ImageUploadSection>

          {/* 🔥 처리 중 표시 */}
          {isProcessingImages && (
            <ProcessingIndicator>
              <div className="spinner"></div>
              이미지를 처리하고 있습니다...
            </ProcessingIndicator>
          )}

          {/* 🔥 개선된 이미지 미리보기 */}
          {selectedImages.length > 0 && (
            <>
              <ImageCounter>
                <Image size={16} className="icon" />
                <strong>{selectedImages.length}개</strong> 이미지가 선택되었습니다
              </ImageCounter>
              
              <ImagePreviewGrid>
                {imagePreviewUrls.map((url, index) => (
                  <ImagePreviewItem key={index}>
                    <img 
                      src={url}
                      alt={`Preview ${index + 1}`} 
                      className="preview-image"
                      onError={(e) => {
                        console.error(`❌ 이미지 로딩 실패 (index: ${index}):`, url.substring(0, 50));
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log(`✅ 이미지 로딩 성공 (index: ${index})`);
                      }}
                    />
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeImage(index)}
                      title="이미지 제거"
                    >
                      <X size={14} />
                    </button>
                  </ImagePreviewItem>
                ))}
              </ImagePreviewGrid>
            </>
          )}
        </FormGroup>

        <ButtonGroup>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading || isProcessingImages || (requireImages && selectedImages.length === 0)}
            style={{
              opacity: loading || isProcessingImages || (requireImages && selectedImages.length === 0) ? 0.5 : 1,
              cursor: loading || isProcessingImages || (requireImages && selectedImages.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '처리 중...' : isProcessingImages ? '이미지 처리 중...' : (requireImages ? '수령 완료' : '수령 추가')}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default ReceiptModal;