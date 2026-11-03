// client/src/components/common/Input.tsx
import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const StyledInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  
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
  
  &::placeholder {
    color: #9ca3af;
  }
`;

interface InputProps {
  label?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className,
  min,
  max,
  step,
  onKeyDown
}) => {
  return (
    <InputContainer className={className}>
      {label && (
        <Label>
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </Label>
      )}
      <StyledInput
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        onKeyDown={onKeyDown}
      />
    </InputContainer>
  );
};

export default Input;
