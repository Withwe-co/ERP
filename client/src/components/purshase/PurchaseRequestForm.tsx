// client/src/components/purchase/PurchaseRequestForm.tsx - 수정된 버전
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import { purchaseApi } from '../../services/api';
import { INVENTORY_CATEGORY_OPTIONS } from '../../constants/inventoryOptions';

interface PurchaseRequestFormData {
  itemName: string;
  specifications: string;
  quantity: number;
  estimatedPrice: number;
  preferredSupplier: string;
  category: string;
  urgency: string;
  justification: string;
  department: string;
  project?: string;
  requester_name?: string;
  budgetCode?: string;
  expectedDeliveryDate?: string;
  purchaseMethod: string;
  attachments?: File[];
}

interface PurchaseRequest {
  id: number;
  item_name: string;
  specifications?: string;
  quantity: number;
  estimated_unit_price?: number;
  preferred_supplier?: string;
  category: string;
  urgency: string;
  justification: string;
  department: string;
  project?: string;
  requester_name?: string;
  budget_code?: string;
  expected_delivery_date?: string;
  purchase_method?: string;
  // 기타 필드들...
}

interface PurchaseRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: PurchaseRequest;
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

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  isEdit = false
}) => {
  // 카테고리 옵션 (백엔드 enum과 일치)
  const categoryOptions = [...INVENTORY_CATEGORY_OPTIONS];

  // 긴급도 옵션 (백엔드 enum과 일치)
  const urgencyOptions = [
    { value: 'LOW', label: '낮음' },
    { value: 'NORMAL', label: '보통' },
    { value: 'HIGH', label: '높음' },
    { value: 'URGENT', label: '긴급' },
    { value: 'EMERGENCY', label: '응급' }
  ];

  // 구매 방법 옵션 (백엔드 enum과 일치)
    const purchaseMethodOptions = [
    { value: 'DIRECT', label: '직접구매' },
    { value: 'QUOTATION', label: '견적요청' },
    { value: 'CONTRACT', label: '계약' },
    { value: 'FRAMEWORK', label: '단가계약' },
    { value: 'MARKETPLACE', label: '마켓플레이스' }
  ];


  const departmentOptions = [
    { value: 'H/W 개발팀', label: 'H/W 개발팀' },
    { value: 'S/W 개발팀', label: 'S/W 개발팀' },
    { value: '총무부', label: '총무부' },
    { value: '사무관리팀', label: '사무관리팀' },
    { value: '영업팀', label: '영업팀' },
    { value: '인사팀', label: '인사팀' },
  ];

  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔥 수정: 초기 데이터 처리 개선
  const getInitialFormData = (): PurchaseRequestFormData => {
    if (!initialData) {
      return {
        itemName: '',
        specifications: '',
        quantity: 1,
        estimatedPrice: 0,
        preferredSupplier: '',
        category: '',
        urgency: 'NORMAL',
        justification: '',
        department: 'S/W 개발팀',
        project: '',
        requester_name: '',
        budgetCode: '',
        expectedDeliveryDate: '',
        purchaseMethod: 'DIRECT',
      };
    }

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    return {
      itemName: initialData.item_name || '',
      specifications: initialData.specifications || '',
      quantity: initialData.quantity || 1,
      estimatedPrice: initialData.estimated_unit_price || 0,
      preferredSupplier: initialData.preferred_supplier || '',
      category: initialData.category || '',
      urgency: initialData.urgency || 'NORMAL',
      justification: initialData.justification || '',
      department: initialData.department || '',
      project: initialData.project || '',
      request_name: initialData.project || '',
      budgetCode: initialData.budget_code || '',
      expectedDeliveryDate: initialData.expected_delivery_date 
        ? new Date(initialData.expected_delivery_date).toISOString().split('T')[0] 
        : '',
      purchaseMethod: initialData.purchase_method || 'DIRECT',
    };
  };

  const [formData, setFormData] = useState<PurchaseRequestFormData>(getInitialFormData());

  // 🔥 수정: initialData가 변경될 때마다 폼 데이터 업데이트
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [initialData]);

  // 생성 Mutation
  const createMutation = useMutation({
    mutationFn: purchaseApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests-stats'] });
      toast.success(isEdit ? '구매 요청이 수정되었습니다.' : '구매 요청이 등록되었습니다.');
      onSuccess();
    },
    onError: (error: any) => {
      console.error('=== 구매 요청 처리 실패 ===');
      console.error('전체 에러 객체:', error);
      console.error('HTTP 상태 코드:', error.response?.status);
      console.error('에러 응답 데이터:', error.response?.data);
      
      toast.error(error.response?.data?.message || '처리 중 오류가 발생했습니다.');
    },
  });

  // 🔥 수정: 수정 Mutation 추가
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => purchaseApi.updateRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests-stats'] });
      toast.success('구매 요청이 수정되었습니다.');
      onSuccess();
    },
    onError: (error: any) => {
      console.error('구매 요청 수정 실패:', error);
      toast.error(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = '품목명을 입력해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = '수량은 1 이상이어야 합니다.';
    }

    if (formData.estimatedPrice < 0) {
      newErrors.estimatedPrice = '예상금액은 0 이상이어야 합니다.';
    }

    if (!formData.department) {
      newErrors.department = '부서를 선택해주세요.';
    }

    if (!formData.justification.trim()) {
      newErrors.justification = '구매 사유를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 수정: handleSubmit 함수 개선
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }

    // 백엔드 API에 맞는 데이터 형식으로 변환
    // const submitData = {
    //   item_name: formData.itemName,
    //   specifications: formData.specifications,
    //   quantity: Number(formData.quantity),
    //   unit: '개',
    //   estimated_unit_price: Number(formData.estimatedPrice),
    //   total_budget: Number(formData.quantity) * Number(formData.estimatedPrice),
    //   currency: 'KRW',
    //   category: formData.category,
    //   urgency: formData.urgency,
    //   purchase_method: formData.purchaseMethod,
    //   requester_name: '현재사용자',
    //   department: formData.department,
    //   expected_delivery_date: formData.expectedDeliveryDate ? new Date(`${formData.expectedDeliveryDate}T00:00:00`).toISOString() : undefined,
    //   justification: formData.justification,
    //   preferred_supplier: formData.preferredSupplier,
    //   project: formData.project,
    //   budget_code: formData.budgetCode,
    //   status: 'SUBMITTED', // 기본 상태는 '요청됨'
    // };
    // 🔥 total_budget 계산 로직 추가
    const quantity = Number(formData.quantity) || 1;
    const estimatedPrice = Number(formData.estimatedPrice) || 0;
    const totalBudget = quantity * estimatedPrice;

    const submitData = {
      item_name: formData.itemName,
      specifications: formData.specifications || null,
      quantity: Number(formData.quantity),
      unit: '개',
      estimated_unit_price: estimatedPrice,
      total_budget: totalBudget, // 🔥 계산된 값 사용
      currency: 'KRW',
      category: formData.category,
      urgency: formData.urgency,
      purchase_method: formData.purchaseMethod || 'DIRECT',
      requester_name: formData.requester_name,
      requester_email: "current_user@company.com",
      department: formData.department,
      position: null,
      budgetCode: formData.budgetCode || '',
      justification: formData.justification,
      expected_delivery_date: formData.expectedDeliveryDate || null,
    };
    console.log('submitData:', JSON.stringify(submitData, null, 2));
  
    // 필수 필드 체크
    const requiredFields = ['item_name', 'quantity', 'requester_name', 'department', 'justification'];
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

  const handleChange = (field: keyof PurchaseRequestFormData, value: any) => {
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

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <FormSection>
          <div className="section-title">
            <Package className="section-icon" size={20} />
            기본 정보
          </div>
          
          <FormGrid>
            <FormRow>
              <Input
                label="품목명"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                placeholder="구매할 품목명을 입력하세요"
                required
              />
              {errors.itemName && (
                <ErrorMessage>
                  <AlertCircle size={12} />
                  {errors.itemName}
                </ErrorMessage>
              )}
            </FormRow>
            
            <Select
              label="카테고리"
              value={formData.category}
              options={categoryOptions}
              onChange={(value) => handleChange('category', value)}
              placeholder="카테고리를 선택하세요"
              required
            />
            
            <Input
              label="수량"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', Number(e.target.value))}
              placeholder="구매 수량"
              required
            />
            
            <Select
              label="긴급도"
              value={formData.urgency}
              options={urgencyOptions}
              onChange={(value) => handleChange('urgency', value)}
            />
          </FormGrid>
          
          <FormRow style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              사양 및 요구사항
            </label>
            <TextArea
              value={formData.specifications}
              onChange={(e) => handleChange('specifications', e.target.value)}
              placeholder="제품 사양, 모델명, 특별 요구사항 등을 상세히 입력하세요..."
            />
          </FormRow>
        </FormSection>

        {/* 예산 및 공급업체 */}
        <FormSection>
          <div className="section-title">
            <DollarSign className="section-icon" size={20} />
            예산 및 공급업체
          </div>
          
          <FormGrid>
            <Input
              label="예상 단가 (원)"
              type="number"
              value={formData.estimatedPrice}
              onChange={(e) => handleChange('estimatedPrice', Number(e.target.value))}
              placeholder="예상 단가를 입력하세요"
            />
            
            <Input
              label="구매처"
              value={formData.preferredSupplier}
              onChange={(e) => handleChange('preferredSupplier', e.target.value)}
              placeholder="구매처를 입력하세요"
            />
            
            <Select
              label="구매 방법"
              value={formData.purchaseMethod}
              options={purchaseMethodOptions}
              onChange={(value) => handleChange('purchaseMethod', value)}
            />
            
            {/* <Input
              label="링크"
              value={formData.budgetCode}
              onChange={(e) => handleChange('budgetCode', e.target.value)}
              placeholder="링크 (선택사항)"
            /> */}
          </FormGrid>
        </FormSection>

        {/* 부서 및 프로젝트 */}
        <FormSection>
          <div className="section-title">
            <Calendar className="section-icon" size={20} />
            부서 및 프로젝트 정보
          </div>
          
          <FormGrid>
            <Select
              label="부서"
              value={formData.department}
              options={departmentOptions}
              onChange={(value) => handleChange('department', value)}
              placeholder="소속 부서를 선택하세요"
              required
            />
            
            <Input
              label="프로젝트명"
              value={formData.project}
              onChange={(e) => handleChange('project', e.target.value)}
              placeholder="관련 프로젝트명 (선택사항)"
            />
            <Input
              label="요청자"
              value={formData.requester_name}
              onChange={(e) => handleChange('requester_name', e.target.value)}
              required
            />
            
            <Input
              label="희망 납기일"
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => handleChange('expectedDeliveryDate', e.target.value)}
            />
          </FormGrid>
          
          <FormRow style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              구매 사유 및 링크 <span style={{ color: 'red' }}>*</span>
            </label>
            <TextArea
              value={formData.justification}
              onChange={(e) => handleChange('justification', e.target.value)}
              placeholder="구매가 필요한 사유를 상세히 입력해주세요..."
              hasError={!!errors.justification}
              required
            />
            {errors.justification && (
              <ErrorMessage>
                <AlertCircle size={12} />
                {errors.justification}
              </ErrorMessage>
            )}
          </FormRow>
        </FormSection>

        {/* 버튼 그룹 */}
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
  );
};

export default PurchaseRequestForm;
