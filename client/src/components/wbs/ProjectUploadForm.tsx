import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useMutation,useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Package,AlertCircle} from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import { projectApi } from '../../services/api';

interface ProjectUploadFormData {
    project_code: string;
    project_name: string;
    manager_name: string;
    department: string;
    start_date: string;
    due_date: string;
    status: string;
    project_description: string;
    updated_at: string;
    updated_by: string;
}

interface Project {
    id: number;
    project_code: string;
    project_name: string;
    manager_name: string;
    department: string;
    start_date: string;
    due_date: string;
    status: string;
    project_description: string;
}

interface ProjectUploadFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Project;
    isEdit?: boolean;
}

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormRow = styled.div`
  grid-column: 1 / -1;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ProjectUploadForm: React.FC<ProjectUploadFormProps> =({
    onSuccess,
    onCancel,
    initialData,
    isEdit = false
})=>{
    const statusOption =[
        {value: 'COMPLETED', label: '완료'},
        {value: 'IN_PROGRESS', label: '진행중'},       
        {value: 'ON_HOLD', label: '보류'},
        {value: 'CANCELLED', label: '취소됨'},
        {value: 'PLANNED', label: '진행 예정'}
    ];

    const departmentOptions = [
    { value: 'H/W 개발팀', label: 'H/W 개발팀' },
    { value: 'S/W 개발팀', label: 'S/W 개발팀' },
    { value: '총무부', label: '총무부' },
    { value: '사무관리팀', label: '사무관리팀' },
    { value: '영업팀', label: '영업팀' },
    { value: '인사팀', label: '인사팀' },
    ];

    const [isLoadingProjectCode, setIsLoadingProjectCode] = useState(!initialData);
    useEffect(() => {
        if (initialData) return;
    
        let cancelled = false;
        setIsLoadingProjectCode(true);
        projectApi.getNextProjectCode()
          .then(projectCode => {
            if (!cancelled) {
              setFormData(previous => ({ ...previous, project_code: projectCode }));
            }
          })
          .catch(error => console.error('다음 프로젝트 코드 조회 실패:', error))
          .finally(() => {
            if (!cancelled) setIsLoadingProjectCode(false);
          });
    
        return () => { cancelled = true; };
      }, [initialData]);
    
    const queryClient = useQueryClient();
    const [errors,setErrors] = useState<Record<string,string>>({});
    const getInitialFormData = (): ProjectUploadFormData => {
        if (!initialData) {
            return {
                project_code: '',
                project_name: '',
                manager_name: '',
                department: 'S/W 개발팀',
                start_date: '',
                due_date: '',
                status: 'IN_PROGRESS',
                project_description: '', 
            };
        }

        // 수정모드
            return {
            project_code: initialData.project_code || '',
            project_name: initialData.project_name || '',
            manager_name: initialData.manager_name || '',
            department: initialData.department || '',
            start_date: initialData.start_date.split('T')[0] || '',
            due_date: initialData.due_date.split('T')[0] || '',
            status: initialData.status || 'IN_PROGRESS',
            project_description: initialData.project_description || '',
            };
        };
    
    const [formData, setFormData] = useState<ProjectUploadFormData>(getInitialFormData());

    const createMutation = useMutation({
        mutationFn: projectApi.createProject,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['wbs'] });
          queryClient.invalidateQueries({ queryKey: ['wbs-stats'] });
          toast.success(isEdit ? '프로젝트가 수정되었습니다.' : '프로젝트가 등록되었습니다.');
          onSuccess();
        },
        onError: (error: any) => {
          console.error('=== 프로젝트 등록 실패 ===');
          console.error('전체 에러 객체:', error);
          console.error('HTTP 상태 코드:', error.response?.status);
          console.error('에러 응답 데이터:', error.response?.data);
          
          toast.error(error.response?.data?.detail || '처리 중 오류가 발생했습니다.');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => projectApi.updateProject(id, data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['wbs'] });
          queryClient.invalidateQueries({ queryKey: ['wbs-stats'] });
          toast.success('프로젝트가 수정되었습니다.');
          onSuccess();
        },
        onError: (error: any) => {
          console.error('프로젝트 수정 실패:', error);
          toast.error(error.response?.data?.detail || '수정 중 오류가 발생했습니다.');
        },
    });

    const isLoading = createMutation.isPending || updateMutation.isPending;

    // 등록 조건 Error 문구
     const validateForm = (): boolean => {
       const newErrors: Record<string, string> = {};
    
        if (!formData.project_name.trim()) {
          newErrors.project_name = '프로젝트명을 입력해주세요.';
        }
    
        if (!formData.status) {
          newErrors.status = '프로젝트 상태를 선택해주세요.';
        }
    
        if (!formData.manager_name.trim()) {
          newErrors.manager_name = '프로젝트 담당자를 입력해주세요.';
        }
    
        if (!formData.department) {
          newErrors.department = '부서를 선택해주세요.';
        }
            
        if (!formData.start_date) {
          newErrors.start_date = '프로젝트 시작일을 선택해주세요.';
        }

        if (!formData.due_date) {
          newErrors.due_date = '프로젝트 종료일을 선택해주세요.';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // handleSubmit 함수
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
          toast.error('등록 정보를 확인해주세요.');
          return;
        }
    
        // 제출 조건 설정
        //const quantity = Number(formData.quantity) || 1;
        //const estimatedPrice = Number(formData.estimatedPrice) || 0;
    
        const submitData = {
            project_name: formData.project_name,
            project_code: formData.project_code,
            status: formData.status,
            manager_name: formData.manager_name,
            department: formData.department,
            start_date: formData.start_date? `${formData.start_date}T00:00:00` : null,
            due_date: formData.due_date? `${formData.due_date}T23:59:59` : null,
            project_description: formData.project_description,
            updated_by: formData.updated_by,
        };
        console.log('submitData:', JSON.stringify(submitData, null, 2));
      
        // 필수 필드 체크
        const requiredFields = ['project_name', 'status', 'manager_name', 'department', 'start_date', 'due_date'];
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

     
    const handleChange = (field: keyof ProjectUploadFormData, value: any) => {
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
                                label="프로젝트명"
                                value={formData.project_name}
                                onChange={(e) => handleChange('project_name', e.target.value)}
                                placeholder="프로젝트명을 입력하세요"
                                required
                            />
                            {errors.project_name && (
                            <ErrorMessage>
                                <AlertCircle size={12} />
                                {errors.project_name}
                            </ErrorMessage>
                            )}
                        </FormRow>

                        <Input
                            label="프로젝트 코드"
                            value={isLoadingProjectCode?'프로젝트 코드 생성 중 ...' : (formData.project_code||'')}
                            disabled
                            placeholder="규칙에 따라 자동 생성됩니다."
                        />

                        <Select
                            label="프로젝트 상태"
                            value={formData.status}
                            options={statusOption}
                            onChange={(value) => handleChange('status', value)}
                            placeholder="프로젝트 상태를 선택하세요"
                            required
                        />

                        <Input
                            label="프로젝트 담당자"
                            value={formData.manager_name}
                            onChange={(e) => handleChange('manager_name', e.target.value)}
                            placeholder="담당자"
                            required
                        />

                        <Select
                            label="담당 부서"
                            value={formData.department}
                            options={departmentOptions}
                            onChange={(value) => handleChange('department', value)}
                            placeholder="담당 부서"
                            required
                        />

                        <Input
                            label="프로젝트 시작일"
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            max={formData.due_date||undefined}
                            required
                        />

                        <Input
                            label="프로젝트 종료일"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => handleChange('due_date', e.target.value)}
                            min={formData.start_date||undefined}
                            required
                        />

                        {isEdit &&(
                            <FormRow style={{display:'grid',gridTemplateColumns: '1fr 1fr',gap: '16px'}}>
                                <Input
                                    label="최종 수정일"
                                    value={initialData?.updated_at ? new Date(initialData.updated_at).toLocaleDateString('ko-KR', {timeZone: 'Asia/Seoul'}) : '' }
                                    disabled
                                />

                                <Input
                                    label="수정자"
                                    value={formData.updated_by || ''}
                                    onChange={(e) => handleChange('updated_by', e.target.value)}
                                    placeholder="수정자명을 입력하세요"
                                />
                            </FormRow>
                        )}

                        <FormRow style={{ marginTop: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            프로젝트 설명
                            </label>
                            <TextArea
                            value={formData.project_description}
                            onChange={(e) => handleChange('project_description', e.target.value)}
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

export default ProjectUploadForm;