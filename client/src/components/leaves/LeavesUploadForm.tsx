import React, {useState} from 'react';
import styled from 'styled-components';
import {useMutation, useQuery,useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Package,AlertCircle} from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import { EmployeeApi, LeavesApi} from '../../services/api';

interface LeavesUploadFormData {
    employee_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
}

interface Leaves {
    id: number;
    employee_id: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
}

interface LeavesUploadFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Leaves;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const LeavesUploadForm: React.FC<LeavesUploadFormProps> =({
    onSuccess,
    onCancel,
    initialData,
    isEdit = false
})=>{
    const [errors,setErrors] = useState<Record<string,string>>({});
    
    const leavetypeOption =[
        {value: '연차', label: '연차'},
        {value: '오전 반차', label: '오전 반차'},
        {value: '오후 반차', label: '오후 반차'},
        {value: '병가', label: '병가'}
    ];

    const {data: employeesData,isLoading: isEmployeesLoading,isError: isEmployeesError,} = useQuery({
        queryKey: ['employees'],
        queryFn: EmployeeApi.getEmployeeList,
    });
    const employeeOptions = (employeesData?.data?.items ?? []).map((employee: { id: number; name: string; position: string }) => ({
        value: employee.id,
        label: `${employee.name} (${employee.position})`,
    }));

    const getInitialFormData = (): LeavesUploadFormData => {
        if (!initialData) {
            return {
                employee_id: 0,
                leave_type: '',
                start_date: new Date().toISOString().slice(0, 10),
                end_date: new Date().toISOString().slice(0, 10),
                total_days: 0
            };
        }

            // 수정모드
            return {
            employee_id: initialData.employee_id || 0,
            leave_type: initialData.leave_type || '',
            start_date: initialData.start_date || new Date().toISOString().slice(0, 10),
            end_date: initialData.end_date || new Date().toISOString().slice(0, 10),
            total_days: initialData.total_days || 0
            };
    };

    const queryClient = useQueryClient();
    const createMutation = useMutation({
            mutationFn: LeavesApi.createLeave,
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['leaves'] });
              toast.success(isEdit ? '휴가 정보가 수정되었습니다.' : '휴가가 등록되었습니다.');
              onSuccess();
            },
            onError: (error: any) => {
              console.error('=== 휴가 등록 실패 ===');
              console.error('전체 에러 객체:', error);
              console.error('HTTP 상태 코드:', error.response?.status);
              console.error('에러 응답 데이터:', error.response?.data);
              
              toast.error(error.response?.data?.detail || '처리 중 오류가 발생했습니다.');
            },
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => LeavesApi.updateLeave(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('휴가 정보가 수정되었습니다.');
            onSuccess();
        },
        onError: (error: any) => {
            console.error('휴가 정보 수정 실패:', error);
            toast.error(error.response?.data?.detail || '수정 중 오류가 발생했습니다.');
        },
    });

    const isLoading = createMutation.isPending || updateMutation.isPending;
    const [formData, setFormData] = useState<LeavesUploadFormData>(getInitialFormData());
    const validateForm = (): boolean => {
       const newErrors: Record<string, string> = {};
    
        if (formData.employee_id <= 0) {
            newErrors.employee_id = '직원을 선택해주세요.';
        }

        if (!formData.leave_type) {
          newErrors.leave_type = '휴가 유형을 선택해주세요.';
        }

        if (!formData.start_date) {
          newErrors.start_date = '휴가 시작일을 선택해주세요.';
        }

        if (!formData.end_date) {
          newErrors.end_date = '휴가 종료일을 선택해주세요.';
        }

        if (formData.total_days <= 0) {
            newErrors.total_days = '휴가 일수는 0보다 커야 합니다.';
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
            employee_id: formData.employee_id,
            leave_type: formData.leave_type,
            start_date: formData.start_date,
            end_date: formData.end_date,
            total_days: formData.total_days,
        };
        console.log('submitData:', JSON.stringify(submitData, null, 2));
        
        // 수정 모드면 업데이트, 아니면 생성
        if (isEdit && initialData?.id) {
            updateMutation.mutate({ id: initialData.id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
    };
    
         
    const handleChange = (field: keyof LeavesUploadFormData, value: any) => {
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
                    휴가 등록
                    </div>

                    <FormGrid>
                        <Select
                            label="팀원"
                            value={formData.employee_id || ''}
                            options={employeeOptions}
                            onChange={(value) => handleChange('employee_id', Number(value))}
                            placeholder={
                                isEmployeesLoading
                                ? '팀원 목록을 불러오는 중입니다...'
                                : '팀원을 선택하세요'
                            }
                            disabled={isEmployeesLoading || isEmployeesError}
                            required
                        />
                        {isEmployeesError && (
                            <div style={{ color: '#dc2626', fontSize: '12px' }}>
                                팀원 목록을 불러오지 못했습니다.
                            </div>
                        )}

                        <Select
                            label={'\u00A0\u00A0휴가 형태\u00A0'}
                            value={formData.leave_type}
                            options={leavetypeOption}
                            onChange={(value) => handleChange('leave_type', value)}
                            placeholder="휴가 형태를 선택하세요"
                            required
                        />

                        <Input
                            label={'\u00A0\u00A0휴가 시작일\u00A0'}
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            required
                        />

                        <Input
                            label={'\u00A0\u00A0휴가 종료일\u00A0'}
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            min={formData.start_date||undefined}
                            required
                        />

                        <Input
                            label={'\u00A0\u00A0신청 일수\u00A0'}
                            value={formData.total_days}
                            onChange={(e) => handleChange('total_days', Number(e.target.value))}
                            placeholder="신청 일수"
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

export default LeavesUploadForm;