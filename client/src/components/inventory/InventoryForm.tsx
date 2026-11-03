// client/src/components/inventory/InventoryForm.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { inventoryApi } from '../../services/api';
import { INVENTORY_CATEGORY_OPTIONS } from '../../constants/inventoryOptions';

const FormContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const Title = styled.h3`
  margin-bottom: 20px;
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
`;

const SectionTitle = styled.h4`
  margin: 20px 0 16px 0;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
`;
const ValidationError = styled.div`
  margin-top: 10px; padding: 10px 12px; border-radius: 6px;
  color: #b91c1c; background: #fef2f2; font-size: 0.9rem;
`;

interface UnifiedInventoryItem {
  id?: number;
  item_code?: string;
  initial_received_quantity?: number;
  item_name: string;
  category?: string;
  brand?: string;
  specifications?: string;
  unit: string;
  unit_price?: number;
  currency: string;
  location?: string;
  warehouse?: string;
  storage_section?: string;
  supplier_name?: string;
  supplier_contact?: string;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  is_consumable: boolean;
  requires_approval: boolean;
  description?: string;
  notes?: string;
  tags: string[];
}

interface InventoryFormProps {
  item?: UnifiedInventoryItem;
  onSubmit: (item: UnifiedInventoryItem) => void;
  onCancel: () => void;
  loading?: boolean;
  showReceiptQuantity?: boolean;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ 
  item, 
  onSubmit, 
  onCancel,
  loading = false,
  showReceiptQuantity = false,
}) => {
  const [formData, setFormData] = useState<UnifiedInventoryItem>({
    item_code: item?.item_code || '',
    initial_received_quantity: showReceiptQuantity ? Math.max(1, item?.initial_received_quantity ?? 1) : undefined,
    item_name: item?.item_name || '',
    category: item?.category || '',
    brand: item?.brand || '',
    specifications: item?.specifications || '',
    unit: item?.unit || '개',
    unit_price: item?.unit_price !== undefined ? Math.max(0, item.unit_price) : undefined,
    currency: item?.currency || 'KRW',
    location: item?.location || '',
    warehouse: item?.warehouse || '',
    storage_section: item?.storage_section || '',
    supplier_name: item?.supplier_name || '',
    supplier_contact: item?.supplier_contact || '',
    minimum_stock: Math.max(0, item?.minimum_stock ?? 0),
    maximum_stock: item?.maximum_stock !== undefined ? Math.max(0, item.maximum_stock) : undefined,
    reorder_point: item?.reorder_point !== undefined ? Math.max(0, item.reorder_point) : undefined,
    is_consumable: item?.is_consumable || false,
    requires_approval: item?.requires_approval || false,
    description: item?.description || '',
    notes: item?.notes || '',
    tags: item?.tags || [],
  });

  const [tagsInput, setTagsInput] = useState(formData.tags.join(', '));
  const [isLoadingItemCode, setIsLoadingItemCode] = useState(!item);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (item) return;

    let cancelled = false;
    setIsLoadingItemCode(true);
    inventoryApi.getNextItemCode()
      .then(itemCode => {
        if (!cancelled) {
          setFormData(previous => ({ ...previous, item_code: itemCode }));
        }
      })
      .catch(error => console.error('다음 품목코드 조회 실패:', error))
      .finally(() => {
        if (!cancelled) setIsLoadingItemCode(false);
      });

    return () => { cancelled = true; };
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.maximum_stock !== undefined && formData.maximum_stock < formData.minimum_stock) {
      setValidationError('최대 재고는 최소 재고보다 크거나 같아야 합니다.');
      return;
    }
    if (showReceiptQuantity && (!Number.isInteger(formData.initial_received_quantity) || (formData.initial_received_quantity || 0) < 1)) {
      setValidationError('수령 수량은 1 이상의 정수여야 합니다.');
      return;
    }
    setValidationError('');
    
    // 태그 처리
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const submitData = {
      ...formData,
      tags,
      // 빈 문자열을 undefined로 변환
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      specifications: formData.specifications || undefined,
      location: formData.location || undefined,
      warehouse: formData.warehouse || undefined,
      storage_section: formData.storage_section || undefined,
      supplier_name: formData.supplier_name || undefined,
      supplier_contact: formData.supplier_contact || undefined,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(submitData);
  };

  const handleChange = (field: keyof UnifiedInventoryItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNonNegativeNumber = (
    field: 'unit_price' | 'minimum_stock' | 'maximum_stock' | 'reorder_point' | 'initial_received_quantity',
    rawValue: string,
    integer = true,
    required = false,
  ) => {
    if (rawValue === '') {
      handleChange(field, required ? 0 : undefined);
      return;
    }
    const parsed = integer ? parseInt(rawValue, 10) : parseFloat(rawValue);
    handleChange(field, Number.isFinite(parsed) ? Math.max(0, parsed) : (required ? 0 : undefined));
    setValidationError('');
  };

  const preventNegativeInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === '-') event.preventDefault();
  };

  const isMaximumStockInvalid = formData.maximum_stock !== undefined
    && formData.maximum_stock < formData.minimum_stock;
  const maximumStockError = isMaximumStockInvalid
    ? '최대 재고는 최소 재고보다 크거나 같아야 합니다.'
    : '';

  const categoryOptions = [...INVENTORY_CATEGORY_OPTIONS];

  const unitOptions = [
    { value: '개', label: '개' },
    { value: '박스', label: '박스' },
    { value: 'kg', label: 'kg' },
    { value: 'L', label: 'L' },
    { value: '세트', label: '세트' },
    { value: 'm', label: 'm' },
    { value: '권', label: '권' },
    { value: '대', label: '대' },
  ];

  const currencyOptions = [
    { value: 'KRW', label: '원 (KRW)' },
    { value: 'USD', label: '달러 (USD)' },
    { value: 'EUR', label: '유로 (EUR)' },
    { value: 'JPY', label: '엔 (JPY)' },
  ];

  return (
    <FormContainer>
      <Title>{item ? '품목 수정' : '품목 추가'}</Title>
      
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <SectionTitle>기본 정보</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Input
              label="품목 코드 *"
              type="text"
              value={isLoadingItemCode ? '자동 생성 중...' : (formData.item_code || '')}
              placeholder="기존 규칙에 따라 자동 생성됩니다"
              required
              disabled
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="품목명 *"
              type="text"
              value={formData.item_name}
              onChange={(e) => handleChange('item_name', e.target.value)}
              placeholder="품목명을 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="카테고리"
              value={formData.category || ''}
              options={categoryOptions}
              onChange={(value) => handleChange('category', value)}
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="브랜드"
              type="text"
              value={formData.brand || ''}
              onChange={(e) => handleChange('brand', e.target.value)}
              placeholder="브랜드를 입력하세요"
            />
          </FormGroup>
        </FormGrid>

        <FormGroup>
          <Input
            label="사양/스펙"
            type="textarea"
            value={formData.specifications || ''}
            onChange={(e) => handleChange('specifications', e.target.value)}
            placeholder="제품 사양이나 스펙을 입력하세요"
            rows={3}
          />
        </FormGroup>

        {/* 수량 및 가격 정보 */}
        <SectionTitle>수량 및 가격 정보</SectionTitle>
        <FormGrid>
          {showReceiptQuantity && (
            <FormGroup>
              <Input
                label="수령 수량 *"
                type="number"
                value={formData.initial_received_quantity ?? 1}
                onChange={(e) => handleNonNegativeNumber('initial_received_quantity', e.target.value, true, true)}
                placeholder="수령한 수량을 입력하세요"
                required
                min="1"
                step="1"
                onKeyDown={preventNegativeInput}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Select
              label="단위 *"
              value={formData.unit}
              options={unitOptions}
              onChange={(value) => handleChange('unit', value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="단가"
              type="number"
              value={formData.unit_price ?? ''}
              onChange={(e) => handleNonNegativeNumber('unit_price', e.target.value, false)}
              placeholder="단가를 입력하세요"
              min="0"
              step="0.01"
              onKeyDown={preventNegativeInput}
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="통화"
              value={formData.currency}
              options={currencyOptions}
              onChange={(value) => handleChange('currency', value)}
            />
          </FormGroup>
        </FormGrid>

        {/* 재고 관리 설정 */}
        <SectionTitle>재고 관리 설정</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Input
              label="최소 재고 *"
              type="number"
              value={formData.minimum_stock}
              onChange={(e) => handleNonNegativeNumber('minimum_stock', e.target.value, true, true)}
              placeholder="최소 재고 수량"
              required
              min="0"
              onKeyDown={preventNegativeInput}
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="최대 재고"
              type="number"
              value={formData.maximum_stock ?? ''}
              onChange={(e) => handleNonNegativeNumber('maximum_stock', e.target.value)}
              placeholder="최대 재고 수량"
              min={formData.minimum_stock}
              onKeyDown={preventNegativeInput}
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="재주문 포인트"
              type="number"
              value={formData.reorder_point ?? ''}
              onChange={(e) => handleNonNegativeNumber('reorder_point', e.target.value)}
              placeholder="재주문 시점"
              min="0"
              onKeyDown={preventNegativeInput}
            />
          </FormGroup>
        </FormGrid>

        {/* 위치 정보 */}
        <SectionTitle>위치 정보</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Input
              label="창고"
              type="text"
              value={formData.warehouse || ''}
              onChange={(e) => handleChange('warehouse', e.target.value)}
              placeholder="창고명을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="보관 위치"
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="보관 위치를 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="보관 구역"
              type="text"
              value={formData.storage_section || ''}
              onChange={(e) => handleChange('storage_section', e.target.value)}
              placeholder="보관 구역을 입력하세요"
            />
          </FormGroup>
        </FormGrid>

        {/* 공급업체 정보 */}
        <SectionTitle>공급업체 정보</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Input
              label="공급업체명"
              type="text"
              value={formData.supplier_name || ''}
              onChange={(e) => handleChange('supplier_name', e.target.value)}
              placeholder="공급업체명을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="공급업체 연락처"
              type="text"
              value={formData.supplier_contact || ''}
              onChange={(e) => handleChange('supplier_contact', e.target.value)}
              placeholder="연락처를 입력하세요"
            />
          </FormGroup>
        </FormGrid>

        {/* 설정 옵션 */}
        <SectionTitle>설정 옵션</SectionTitle>
        <FormGrid>
          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_consumable}
                onChange={(e) => handleChange('is_consumable', e.target.checked)}
              />
              소모품 (사용 시 차감)
            </label>
          </FormGroup>

          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.requires_approval}
                onChange={(e) => handleChange('requires_approval', e.target.checked)}
              />
              사용 시 승인 필요
            </label>
          </FormGroup>
        </FormGrid>

        {/* 추가 정보 */}
        <SectionTitle>추가 정보</SectionTitle>
        <FormGroup>
          <Input
            label="태그"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 전자제품, 필수품, 고가)"
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="설명"
            type="textarea"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="품목에 대한 설명을 입력하세요"
            rows={3}
          />
        </FormGroup>

        <FormGroup>
          <Input
            label="비고"
            type="textarea"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="추가 메모사항을 입력하세요"
            rows={2}
          />
        </FormGroup>

        {(maximumStockError || validationError) && (
          <ValidationError role="alert">{maximumStockError || validationError}</ValidationError>
        )}

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
            loading={loading || isLoadingItemCode}
            disabled={loading || isLoadingItemCode || !formData.item_code || isMaximumStockInvalid}
          >
            {item ? '수정' : '추가'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default InventoryForm;
