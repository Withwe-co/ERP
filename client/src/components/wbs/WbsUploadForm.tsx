import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useMutation,useQueryClient} from '@tanstack/react-query';

// Components
import {toast} from 'react-toastify';
import {Package,AlertCircle} from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';

// Services
import { WbsApi } from '../../services/api';

interface WbsUploadFormData {
    wbs_code: string;
    wbs_name: string;
    parent_wbs: string;
    wbs_description: string;
    wbs_order: number;
    updated_by: string;
    project_id: number;
}

interface Wbs {
    id: number;
    wbs_code: string;
    wbs_name: string;
    parent_wbs: string;
    wbs_description: string;
    wbs_order: number;
    project_id: number;
}

interface WbsUploadFormProps {
    projectId: number;
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Wbs;
    isEdit?: boolean;
}

// Form 컨테이너 디자인
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

// Form 구역 디자인
const FormSection = styled(Card)`
  margin-bottom: 24px;
  
  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: ${props => props.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 8px;
    
    .section-icon {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

// FormGrid 스타일
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Form 행 구분 스타일
const FormRow = styled.div`
  grid-column: 1 / -1;
`;

// 오류 메시지 스타일
const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// WBS 설명 입력 스타일
const TextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid ${props => props.hasError ? props.theme.colors.error : props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.hasError ? props.theme.colors.error : props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// 등록,수정 버튼 그룹 스타일
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;


const WbsUploadForm: React.FC<WbsUploadFormProps> =({
    projectId,
    onSuccess,
    onCancel,
    initialData,
    isEdit = false
})=>{
    const [errors,setErrors] = useState<Record<string,string>>({});
    const queryClient = useQueryClient();

    // 생성 Mutation
    const createMutation = useMutation({
        mutationFn: WbsApi.createWbs,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectwbs'] });
            queryClient.invalidateQueries({ queryKey: ['projectwbs-stats'] });
            toast.success(isEdit ? 'WBS가 수정되었습니다.' : 'WBS가 등록되었습니다.');
            onSuccess();
        },
        onError: (error: any) => {
            console.error('=== WBS 등록 실패 ===');
            console.error('전체 에러 객체:', error);
            console.error('HTTP 상태 코드:', error.response?.status);
            console.error('에러 응답 데이터:', error.response?.data);
            
            toast.error(error.response?.data?.detail ||error.response?.data?.message ||'처리 중 오류가 발생했습니다.');
        },
    });
    
    //수정 Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => WbsApi.updateWbs(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectwbs'] });
            queryClient.invalidateQueries({ queryKey: ['projectwbs-stats'] });
            toast.success('WBS가 수정되었습니다.');
            onSuccess();
        },
        onError: (error: any) => {
            console.error('WBS 수정 실패:', error);
            toast.error(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
        },
    });

    const isLoading = createMutation.isPending || updateMutation.isPending;

    const getInitialFormData = (): WbsUploadFormData => {
        if (!initialData) {
            return {
                wbs_code: '',
                wbs_name: '',
                parent_wbs: '',
                wbs_description: '',
                wbs_order: 0,
                project_id: 0,
            };
        }

        // 수정모드
            return {
            wbs_code: initialData.wbs_code || '',
            wbs_name: initialData.wbs_name || '',
            parent_wbs: initialData.parent_wbs || '',
            wbs_description: initialData.wbs_description || '',
            wbs_order: initialData.wbs_order || 0,
            project_id: initialData.project_id || 0,
            };
    };

    const [formData, setFormData] = useState<WbsUploadFormData>(getInitialFormData());

    const validateForm = (): boolean => {
       const newErrors: Record<string, string> = {};
    
        if (!formData.wbs_code.trim()) {
          newErrors.wbs_code = 'WBS 코드를 입력해주세요.';
        }
    
        if (!formData.wbs_name) {
          newErrors.wbs_name = 'WBS명을 입력해주세요.';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('등록 정보를 확인해주세요.');
            return;
        }

        const submitData = {
            wbs_name: formData.wbs_name,
            wbs_code: formData.wbs_code,
            parent_wbs: formData.parent_wbs,
            wbs_description: formData.wbs_description,
            wbs_order: formData.wbs_order,
            updated_by: formData.updated_by,
            project_id: projectId,
        };
        console.log('submitData:', JSON.stringify(submitData, null, 2));
        
        // 필수 필드 체크
        const requiredFields = ['wbs_name','wbs_code'];
        const missingFields = requiredFields.filter(field => !submitData[field]);
        if (missingFields.length > 0) {
            console.error('누락된 필수 필드:', missingFields);
            toast.error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
            return;
        }
        // 수정 모드면 업데이트, 아니면 생성
        if (isEdit && initialData?.id) {
            updateMutation.mutate({ id: initialData.id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
    };

    const handleChange = (field: keyof WbsUploadFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // 에러 제거
        if (errors[field]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
        }
    };

    return(
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <FormSection>
                    <div className="section-title">
                    <Package className="section-icon" size={20} />
                    프로젝트 정보
                    </div>
                    <FormGrid>
                        <FormRow>
                            <Input
                                label="WBS명"
                                value={formData.wbs_name}
                                onChange={(e) => handleChange('wbs_name', e.target.value)}
                                placeholder="WBS명을 입력하세요"
                                required
                            />
                            {errors.wbs_name && (
                            <ErrorMessage>
                                <AlertCircle size={12} />
                                {errors.wbs_name}
                            </ErrorMessage>
                            )}
                        </FormRow>

                        <Input
                            label="WBS 코드"
                            value={formData.wbs_code}
                            onChange={(e) => handleChange('wbs_code', e.target.value)}
                            placeholder="WBS 코드"
                            required
                        />

                        <Input
                            label="상위 WBS"
                            value={formData.parent_wbs}
                            onChange={(e) => handleChange('parent_wbs', e.target.value)}
                            placeholder="상위 WBS"
                            required
                        />

                        <Input
                            label="프로젝트 ID"
                            value={projectId}
                            disabled
                        />

                        <Input
                            label="WBS 순서"
                            value={formData.wbs_order}
                            onChange={(e) => handleChange('wbs_order', e.target.value)}
                            placeholder="WBS 순서"
                            required
                        />

                        <FormRow style={{ marginTop: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            프로젝트 설명
                            </label>
                            <TextArea
                            value={formData.wbs_description}
                            onChange={(e) => handleChange('wbs_description', e.target.value)}
                            placeholder="프로젝트 설명을 입력하세요"
                            />
                        </FormRow>
                    </FormGrid>
                </FormSection>
                <ButtonGroup>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        취소
                    </Button>
                    <Button 
                        type="submit" 
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isEdit ? '수정' : '등록'}
                    </Button>
                </ButtonGroup>
            </form>
        </FormContainer>
    )

};

export default WbsUploadForm;