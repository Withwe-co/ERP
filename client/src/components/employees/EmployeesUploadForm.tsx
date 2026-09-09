import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useMutation,useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Package,AlertCircle} from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import { EmployeeApi} from '../../services/api';

interface EmployeesUploadFormData {
    name: string;
    position: string;
    total_leave: number;
    used_leave: number;
}

interface Employee {
    id: number;
    name: string;
    position: string;
    total_leave: number;
    used_leave: number;
}

interface EmployeesUploadFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Employee;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const EmployeesUploadForm: React.FC<EmployeesUploadFormProps> =({
    onSuccess,
    onCancel,
    initialData,
    isEdit = false
})=>{
    const [errors,setErrors] = useState<Record<string,string>>({});
    
    const positionOption =[
        {value: 'Chief', label: '수석 연구원'},
        {value: 'Principal', label: '책임 연구원'},
        {value: 'Senior', label: '선임 연구원'},
        {value: 'Junior', label: '연구원'},       
        {value: 'Intern', label: '인턴'}
    ];

    const getInitialFormData = (): EmployeesUploadFormData => {
        if (!initialData) {
            return {
                name: '',
                position: '',
                total_leave: 0,
                used_leave: 0
            };
        }

        // 수정모드
            return {
            name: initialData.name || '',
            position: initialData.position || '',
            total_leave: initialData.total_leave || 0,
            used_leave: initialData.used_leave || 0
            };
    };

    const queryClient = useQueryClient();
    const createMutation = useMutation({
            mutationFn: EmployeeApi.createEmployee,
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['employees'] });
              toast.success(isEdit ? '팀원 정보가 수정되었습니다.' : '팀원 정보가 등록되었습니다.');
              onSuccess();
            },
            onError: (error: any) => {
              console.error('=== 팀원 등록 실패 ===');
              console.error('전체 에러 객체:', error);
              console.error('HTTP 상태 코드:', error.response?.status);
              console.error('에러 응답 데이터:', error.response?.data);
              
              toast.error(error.response?.data?.detail || '처리 중 오류가 발생했습니다.');
            },
        });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => EmployeeApi.updateEmployee(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('팀원 정보가 수정되었습니다.');
            onSuccess();
        },
        onError: (error: any) => {
            console.error('팀원 정보 수정 실패:', error);
            toast.error(error.response?.data?.detail || '수정 중 오류가 발생했습니다.');
        },
    });

    const isLoading = createMutation.isPending || updateMutation.isPending;
    const [formData, setFormData] = useState<EmployeesUploadFormData>(getInitialFormData());
    const validateForm = (): boolean => {
       const newErrors: Record<string, string> = {};
    
        if (!formData.name.trim()) {
          newErrors.name = '이름을 입력해주세요.';
        }

        if (!formData.position) {
          newErrors.position = '직책을 선택해주세요.';
        }
    
        if (!formData.total_leave.toString().trim()) {
          newErrors.total_leave = '총 휴가일수를 입력해주세요.';
        }

        if (!formData.used_leave.toString().trim()) {
          newErrors.used_leave = '사용 휴가일수를 입력해주세요.';
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
            name: formData.name,
            position: formData.position,
            total_leave: formData.total_leave,
            used_leave: formData.used_leave,
        };
        console.log('submitData:', JSON.stringify(submitData, null, 2));
        
        // 필수 필드 체크
        const requiredFields = ['name', 'position', 'total_leave', 'used_leave'];
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
    
         
    const handleChange = (field: keyof EmployeesUploadFormData, value: any) => {
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

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <FormSection>
                    <div className="section-title">
                    <Package className="section-icon" size={20} />
                    프로젝트 정보
                    </div>

                    <FormGrid>
                        <Input
                            label={'\u00A0\u00A0이름\u00A0'}
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="이름을 입력하세요"
                            required
                        />
                        {errors.project_name && (
                        <ErrorMessage>
                            <AlertCircle size={12} />
                            {errors.project_name}
                        </ErrorMessage>
                        )}

                        <Select
                            label={'\u00A0\u00A0직책\u00A0'}
                            value={formData.position}
                            options={positionOption}
                            onChange={(value) => handleChange('position', value)}
                            placeholder="직위를 선택하세요"
                            required
                        />

                        <Input
                            label={'\u00A0\u00A0총 연가\u00A0'}
                            value={formData.total_leave}
                            onChange={(e) => handleChange('total_leave', Number(e.target.value))}
                            placeholder="총 연가 수"
                            type="number"
                            required
                        />

                        <Input
                            label={'\u00A0\u00A0사용 연가\u00A0'}
                            value={formData.used_leave}
                            onChange={(e) => handleChange('used_leave', Number(e.target.value))}
                            placeholder="사용 연가 수"
                            type="number"
                            required
                        />
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

export default EmployeesUploadForm;