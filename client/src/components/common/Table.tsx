// client/src/components/common/Table.tsx
import React from 'react';
import styled from 'styled-components';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableColumn } from '../../types';

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedItems?: any[];
  onSelectItems?: (items: any[]) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
}

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const TableHeaderCell = styled.th<{ sortable?: boolean; width?: string; align?: string }>`
  padding: ${props => props.theme.spacing.md};
  text-align: ${props => props.align || 'left'};
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${props => props.theme.colors.background};
  
  ${props => props.width && `width: ${props.width};`}
  
  ${props => props.sortable && `
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: ${props.theme.colors.border};
    }
  `}
`;

const SortButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const SortIcon = styled.div<{ active?: boolean; direction?: string }>`
  display: flex;
  flex-direction: column;
  opacity: ${props => props.active ? 1 : 0.3};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ selected?: boolean }>`
  transition: background-color 0.15s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
  
  ${props => props.selected && `
    background: ${props.theme.colors.primary}10;
  `}
`;

const TableCell = styled.td<{ align?: string }>`
  padding: ${props => props.theme.spacing.md};
  text-align: ${props => props.align || 'left'};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  vertical-align: top;
  
  &:first-child {
    border-left: none;
  }
  
  &:last-child {
    border-right: none;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: ${props => props.theme.spacing.md};
    opacity: 0.3;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
  
  .loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid ${props => props.theme.colors.border};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  selectable = false,
  selectedItems = [],
  onSelectItems,
  onSort,
  sortField,
  sortDirection,
  onRowClick
}: TableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectItems) {
      onSelectItems(checked ? data : []);
    }
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    if (onSelectItems) {
      if (checked) {
        onSelectItems([...selectedItems, item]);
      } else {
        onSelectItems(selectedItems.filter(selected => selected !== item));
      }
    }
  };

  const handleSort = (field: string) => {
    if (!onSort) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    
    onSort(field, direction);
  };

  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <TableContainer>
      <StyledTable>
        <TableHeader>
          <tr>
            {selectable && (
              <TableHeaderCell width="40px">
                <Checkbox
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeaderCell>
            )}
            {columns.map((column) => (
              <TableHeaderCell
                key={String(column.key)}
                width={column.width}
                align={column.align}
                sortable={column.sortable}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                {column.sortable ? (
                  <SortButton>
                    {column.label}
                    <SortIcon 
                      active={sortField === column.key}
                      direction={sortDirection}
                    >
                      <ChevronUp />
                      <ChevronDown />
                    </SortIcon>
                  </SortButton>
                ) : (
                  column.label
                )}
              </TableHeaderCell>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <tr>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)}>
                <LoadingState>
                  <div className="loading-spinner" />
                  <div>로딩 중...</div>
                </LoadingState>
              </TableCell>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)}>
                <EmptyState>
                  <div className="empty-icon">📋</div>
                  <div>{emptyMessage}</div>
                </EmptyState>
              </TableCell>
            </tr>
          ) : (
            data.map((item, index) => {
              const isSelected = selectedItems.includes(item);
              
              return (
                <TableRow
                  key={index}
                  selected={isSelected}
                  onClick={() => onRowClick?.(item)}
                  style={{ cursor: onRowClick ? 'pointer' : undefined }}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = item[column.key];
                    const displayValue = column.render 
                      ? column.render(value, item, index) 
                      : value;
                    
                    return (
                      <TableCell key={String(column.key)} align={column.align}>
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
}

export default Table;



