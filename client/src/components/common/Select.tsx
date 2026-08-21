// client/src/components/common/Select.tsx
import React from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
  
  /* 선택할 수 없는 옵션을 회색으로 표시 */
  option:disabled {
    color: #9ca3af;
    background: #f3f4f6;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value?: string | number;
  options: SelectOption[];
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "선택하세요",
  disabled = false,
  required = false,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <SelectContainer className={className}>
      {label && (
        <Label>
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </Label>
      )}
      <StyledSelect
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </StyledSelect>
    </SelectContainer>
  );
};

export default Select;