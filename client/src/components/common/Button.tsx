// client/src/components/common/Button.tsx
import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

interface StyledButtonProps {
  $variant: string;
  $size: string;
  $disabled: boolean;
  $loading: boolean;
}

const ButtonContainer = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  
  /* 크기별 스타일 */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return `
          padding: 6px 12px;
          font-size: 0.875rem;
          min-height: 32px;
        `;
      case 'lg':
        return `
          padding: 12px 24px;
          font-size: 1.125rem;
          min-height: 48px;
        `;
      default:
        return `
          padding: 8px 16px;
          font-size: 1rem;
          min-height: 40px;
        `;
    }
  }}
  
  /* 변형별 스타일 */
  ${props => {
    const { colors } = props.theme;
    switch (props.$variant) {
      case 'secondary':
        return `
          background: ${colors.gray};
          color: white;
          &:hover:not(:disabled) {
            background: ${colors.gray}dd;
            transform: translateY(-1px);
          }
        `;
      case 'success':
        return `
          background: ${colors.success};
          color: white;
          &:hover:not(:disabled) {
            background: ${colors.success}dd;
            transform: translateY(-1px);
          }
        `;
      case 'warning':
        return `
          background: ${colors.warning};
          color: white;
          &:hover:not(:disabled) {
            background: ${colors.warning}dd;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: ${colors.error};
          color: white;
          &:hover:not(:disabled) {
            background: ${colors.error}dd;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${colors.primary};
          border: 1px solid ${colors.primary};
          &:hover:not(:disabled) {
            background: ${colors.primary}10;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          color: white;
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: ${props.theme.shadows.md};
          }
        `;
    }
  }}
  
  /* 비활성화 상태 */
  ${props => props.$disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `}
  
  /* 로딩 상태 */
  ${props => props.$loading && `
    cursor: wait;
    &:hover {
      transform: none;
    }
  `}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
  title,
  style,
}) => {
  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $disabled={disabled || loading}
      $loading={loading}
      onClick={onClick}
      type={type}
      className={className}
      disabled={disabled || loading}
      title={title}
      style={style}
    >
      {loading && <LoadingSpinner />}
      {children}
    </ButtonContainer>
  );
};

export default Button;