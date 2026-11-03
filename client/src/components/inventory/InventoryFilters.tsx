// client/src/components/inventory/InventoryFilters.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Search, Filter, X } from 'lucide-react';
import Button from '../common/Button';
import { SearchFilters } from '../../types';
import { INVENTORY_CATEGORY_OPTIONS } from '../../constants/inventoryOptions';

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  // margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchGroup = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: ${props => props.theme.colors.textSecondary};
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  cursor: pointer;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const FilterButton = styled(Button)`
  white-space: nowrap;
`;

const ActiveFilters = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  // margin-top: 10px;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.85rem;
  
  .remove-filter {
    cursor: pointer;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
  }
`;

interface InventoryFiltersProps {
  onFilter: (filters: SearchFilters) => void;
  variant?: 'inventory' | 'receipt';
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({ onFilter, variant = 'inventory' }) => {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters };
    
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const getFilterDisplayName = (key: string, value: string) => {
    const names: Record<string, string> = {
      search: '검색',
      category: '카테고리',
      is_active: '상태',
      stock_status: '재고상태',
    };
    
    if (key === 'is_active') {
      return `${names[key]}: ${value === 'true' ? '사용중' : '사용 중지'}`;
    }

    /*if (key === 'stock_status') {
      const labels: Record<string, string> = {
        normal: '정상',
        low_stock: '부족',
        out_of_stock: '없음',
      };
      return `${names[key]}: ${labels[value] || value}`;
    }*/
    
    return `${names[key] || key}: ${value}`;
  };

  return (
    <>
      <FilterContainer>
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}>
          <SearchGroup> 
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="품목명, 품목코드로 검색..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
          </SearchGroup>
        </div>

        <FilterSelect
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">전체 카테고리</option>
          {variant === 'receipt' ? (
            INVENTORY_CATEGORY_OPTIONS.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))
          ) : (
            <>
              <option value="IT 관련 장비">IT 관련 장비</option>
              <option value="사무 용품">사무 용품</option>
              <option value="제조 장비">제조 장비</option>
              <option value="소모품">소모품</option>
              <option value="아이템">아이템</option>
              <option value="기타">기타</option>
            </>
          )}
        </FilterSelect>

        {/*{variant === 'receipt' && (
          <FilterSelect
            value={filters.stock_status || ''}
            onChange={(e) => handleFilterChange('stock_status', e.target.value)}
          >
            <option value="">전체 재고상태</option>
            <option value="normal">정상</option>
            <option value="low_stock">부족</option>
            <option value="out_of_stock">없음</option>
          </FilterSelect>
        )}*/}

        <FilterSelect
          value={filters.is_active || ''}
          onChange={(e) => handleFilterChange('is_active', e.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="true">사용중</option>
          <option value="false">사용중지</option>
        </FilterSelect>

        <FilterButton 
          variant="outline" 
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
        >
          <Filter size={16} />
          {hasActiveFilters ? '필터 초기화' : '필터'}
        </FilterButton>
      </FilterContainer>

      {/* 활성 필터 표시 */}
        {hasActiveFilters && (
          <ActiveFilters>
            {Object.entries(filters).map(([key, value]) => (
              <FilterTag key={key}>
                <span>{getFilterDisplayName(key, value as string)}</span>
                <X 
                  size={12} 
                  className="remove-filter"
                  onClick={() => removeFilter(key as keyof SearchFilters)}
                />
              </FilterTag>
            ))}
          </ActiveFilters>
        )}
    </>
  );
};

export default InventoryFilters;
