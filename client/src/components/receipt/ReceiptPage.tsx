import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, RefreshCw, AlertCircle, Download, Plus, X, FileText, Image as ImageIcon, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import InventoryFilters from '../inventory/InventoryFilters';
import InventoryForm from '../inventory/InventoryForm';
import { inventoryApi, UnifiedInventoryItem } from '../../services/api';
import { SearchFilters, TableColumn } from '../../types';
import { groupReceiptItems, normalizeInventoryName } from '../../utils/inventoryGrouping';
import { INVENTORY_CATEGORY_OPTIONS } from '../../constants/inventoryOptions';

const Container = styled.div`padding: 20px;`;
const PageTitle = styled.h1`
  font-size: 2rem; font-weight: 600; margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
`;
const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary}; margin-bottom: 30px; font-size: 1rem;
`;
const FilterContainer = styled.div`
  display: flex; align-items: center; margin-bottom: 20px;
`;
const ActionButtons = styled.div`
  display: flex; gap: 10px; margin-left: auto;
`;
const ErrorContainer = styled.div`
  text-align: center; padding: 60px 20px;
  .error-icon { color: ${props => props.theme.colors.error}; margin-bottom: 16px; }
  .error-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 8px; }
  .error-message { color: ${props => props.theme.colors.textSecondary}; margin-bottom: 20px; }
`;
const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex; padding: 5px 10px; border-radius: 999px; font-size: 0.85rem; font-weight: 600;
  color: ${props => props.$active ? '#166534' : '#991b1b'};
  background: ${props => props.$active ? '#dcfce7' : '#fee2e2'};
`;
const ItemDescription = styled.div`
  .name { font-weight: 600; }
  .specification { margin-top: 3px; color: ${props => props.theme.colors.textSecondary}; font-size: 0.85rem; }
`;
const ModalBody = styled.div`
  display: flex; flex-direction: column; gap: 20px;
  .item-name { font-size: 1.05rem; font-weight: 600; }
  .description { color: ${props => props.theme.colors.textSecondary}; line-height: 1.6; }
  .actions { display: flex; justify-content: flex-end; gap: 10px; }
`;
const DrawerBackdrop = styled.div`
  position: fixed; inset: 0; z-index: 1100; background: rgba(15, 23, 42, 0.28);
`;
const DetailDrawer = styled.aside`
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 1101;
  width: min(720px, 92vw); background: ${props => props.theme.colors.surface};
  box-shadow: -12px 0 30px rgba(15, 23, 42, 0.18); overflow-y: auto;
`;
const DrawerHeader = styled.div`
  position: sticky; top: 0; z-index: 2; display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px; padding: 22px 24px;
  background: ${props => props.theme.colors.surface}; border-bottom: 1px solid ${props => props.theme.colors.border};
  h2 { margin: 0 0 5px; font-size: 1.35rem; }
  p { margin: 0; color: ${props => props.theme.colors.textSecondary}; }
`;
const CloseButton = styled.button`
  border: 0; background: transparent; color: ${props => props.theme.colors.textSecondary};
  cursor: pointer; padding: 5px; border-radius: 6px;
  &:hover { background: ${props => props.theme.colors.background}; }
`;
const DrawerContent = styled.div`padding: 22px 24px 40px;`;
const SummaryGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 24px;
  @media (max-width: 600px) { grid-template-columns: 1fr 1fr; }
`;
const SummaryItem = styled.div`
  padding: 13px; border-radius: 8px; background: ${props => props.theme.colors.background};
  .label { color: ${props => props.theme.colors.textSecondary}; font-size: .78rem; margin-bottom: 5px; }
  .value { font-weight: 650; word-break: break-word; }
`;
const DetailSectionTitle = styled.h3`
  display: flex; align-items: center; gap: 8px; margin: 24px 0 12px; font-size: 1rem;
`;
const CodeCard = styled.section`
  border: 1px solid ${props => props.theme.colors.border}; border-radius: 10px;
  padding: 16px; margin-bottom: 14px;
`;
const CodeCardHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px;
  .code { font-weight: 750; color: ${props => props.theme.colors.primary}; }
`;
const DetailGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px 18px;
  font-size: .9rem; margin-bottom: 14px;
  .field { min-width: 0; }
  .label { color: ${props => props.theme.colors.textSecondary}; margin-right: 6px; }
  .value { word-break: break-word; }
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`;
const ImageGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 9px;
  img { width: 100%; height: 92px; object-fit: cover; border-radius: 7px; border: 1px solid ${props => props.theme.colors.border}; }
`;
const InspectionImage = styled.div`
  min-width: 0;
  a { display: block; }
  .receipt-number {
    margin-top: 5px; color: ${props => props.theme.colors.textSecondary};
    font-size: .72rem; line-height: 1.35; word-break: break-all;
  }
`;
const EmptyMedia = styled.div`
  padding: 14px; border-radius: 7px; background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.textSecondary}; font-size: .86rem;
`;
const DocumentLink = styled.a`
  display: inline-flex; align-items: center; gap: 6px; color: ${props => props.theme.colors.primary};
  font-weight: 600; text-decoration: none; margin-top: 12px;
  &:hover { text-decoration: underline; }
`;
const HistoryItem = styled.div`
  padding: 10px 0; border-top: 1px solid ${props => props.theme.colors.border}; font-size: .86rem;
  &:first-child { border-top: 0; }
`;
const PaginationSummary = styled.div`
  margin-top: 16px; text-align: center; font-size: .88rem;
  color: ${props => props.theme.colors.textSecondary};
`;
const InlineEditGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 14px;
  padding: 14px; margin-bottom: 16px; border-radius: 8px; background: #f8fafc;
  label { display: flex; flex-direction: column; gap: 5px; font-size: .78rem; color: #64748b; }
  input, select, textarea {
    width: 100%; padding: 8px 9px; border: 1px solid #cbd5e1; border-radius: 6px;
    background: white; color: #334155; font: inherit;
  }
  textarea { min-height: 72px; resize: vertical; }
  .wide { grid-column: 1 / -1; }
  @media (max-width: 540px) { grid-template-columns: 1fr; .wide { grid-column: auto; } }
`;

const PAGE_SIZE = 20;

const formatKoreanDateTime = (value?: string | null) => {
  if (!value) return '-';

  // 서버가 UTC 시각을 시간대 표기 없이 반환하는 경우 UTC로 명시해
  // 브라우저가 이를 한국 현지 시각으로 잘못 해석하지 않도록 한다.
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
};

type ReceiptInventoryRow = UnifiedInventoryItem & {
  group_item_ids: number[];
  grouped_item_count: number;
  group_item_codes: string[];
};

const purchaseCategoryLabels: Record<string, string> = {
  OFFICE_SUPPLIES: '사무 용품',
  ELECTRONICS: '전자제품/IT 장비',
  FURNITURE: '가구',
  SOFTWARE: '소프트웨어',
  MAINTENANCE: '유지보수',
  SERVICES: '서비스',
  OTHER: '기타',
};

const ReceiptPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [editingItem, setEditingItem] = useState<ReceiptInventoryRow | null>(null);
  const [detailItem, setDetailItem] = useState<ReceiptInventoryRow | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailDrafts, setDetailDrafts] = useState<Record<string, any>>({});
  const [isDeactivationReasonOpen, setIsDeactivationReasonOpen] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [isReceiptFormOpen, setIsReceiptFormOpen] = useState(false);
  const [pendingReceiptFormData, setPendingReceiptFormData] = useState<any | null>(null);
  const [similarInventoryItems, setSimilarInventoryItems] = useState<any[]>([]);
  const [isCheckingSimilarItems, setIsCheckingSimilarItems] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['receipt-inventory-items', filters],
    queryFn: () => {
      const { stock_status: _stockStatus, ...apiFilters } = filters;
      return inventoryApi.getItems(1, 1000, { ...apiFilters, include_receipt_only: true }, {
        sort_by: 'item_code', sort_order: 'asc',
      });
    },
    keepPreviousData: true,
    retry: 2,
  });

  const statusMutation = useMutation({
    mutationFn: ({ ids, isActive, reason }: { ids: number[]; isActive: boolean; reason?: string | null }) =>
      Promise.all(ids.map(id => inventoryApi.updateItem(id, {
        is_active: isActive,
        deactivation_reason: isActive ? null : reason,
        updated_by: '수령관리 상태 변경',
      }))),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receipt-inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['unified-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['unified-inventory-stats'] });
      setDetailItem(previous => previous ? {
        ...previous,
        is_active: variables.isActive,
        deactivation_reason: variables.isActive ? undefined : variables.reason || undefined,
      } : previous);
      setIsDeactivationReasonOpen(false);
      setDeactivationReason('');
      toast.success(variables.isActive ? '사용 상태로 변경되었습니다.' : '사용중지 사유와 함께 상태가 변경되었습니다.');
      setEditingItem(null);
    },
    onError: () => toast.error('사용 상태를 변경하지 못했습니다.'),
  });

  const closeReceiptForm = () => {
    setIsReceiptFormOpen(false);
    setPendingReceiptFormData(null);
    setSimilarInventoryItems([]);
  };

  const createReceiptItemMutation = useMutation({
    mutationFn: (data: any) => inventoryApi.createItem({ ...data, is_receipt_only: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['receipt-inventory-items'] });
      await queryClient.invalidateQueries({ queryKey: ['unified-inventory'] });
      await queryClient.invalidateQueries({ queryKey: ['unified-inventory-stats'] });
      toast.success('수령 관리에 새 품목으로 등록되었습니다.');
      closeReceiptForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || error.response?.data?.message || '품목을 등록하지 못했습니다.');
    },
  });

  const mergeReceiptItemMutation = useMutation({
    mutationFn: ({ existingItem, data }: { existingItem: UnifiedInventoryItem; data: any }) =>
      inventoryApi.createItem({
        ...data,
        is_receipt_only: true,
        item_code: existingItem.item_code,
        reuse_item_code: true,
        notes: [
          data.notes,
          `수령관리 묶음 기준 품목: ${existingItem.item_code}`,
        ].filter(Boolean).join('\n'),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['receipt-inventory-items'] });
      await queryClient.invalidateQueries({ queryKey: ['unified-inventory'] });
      await queryClient.invalidateQueries({ queryKey: ['unified-inventory-stats'] });
      toast.success('선택한 동일 품목코드로 수령 관리에 등록되었습니다.');
      closeReceiptForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || '선택한 품목코드로 등록하지 못했습니다.');
    },
  });

  const handleReceiptFormSubmit = async (formData: any) => {
    try {
      setIsCheckingSimilarItems(true);
      const response = await inventoryApi.getItems(1, 1000, { include_receipt_only: true }, {
        sort_by: 'item_name',
        sort_order: 'asc',
      });
      const normalizedName = normalizeInventoryName(formData.item_name);
      const matchingItems = (response?.data?.items || []).filter((inventoryItem: UnifiedInventoryItem) =>
        Boolean(normalizedName)
        && normalizeInventoryName(inventoryItem.item_name) === normalizedName
      );
      const candidates = Array.from(matchingItems.reduce((byCode: Map<string, any>, inventoryItem: UnifiedInventoryItem) => {
        const code = (inventoryItem.item_code || '').trim().toLocaleUpperCase('en-US');
        const existing = byCode.get(code);
        if (!existing) byCode.set(code, { ...inventoryItem });
        else {
          existing.current_quantity = (Number(existing.current_quantity) || 0) + (Number(inventoryItem.current_quantity) || 0);
          existing.total_received = (Number(existing.total_received) || 0) + (Number(inventoryItem.total_received) || 0);
        }
        return byCode;
      }, new Map<string, any>()).values());

      if (candidates.length > 0) {
        setPendingReceiptFormData(formData);
        setSimilarInventoryItems(candidates);
        return;
      }
      createReceiptItemMutation.mutate(formData);
    } catch (_error) {
      toast.error('기존 품목을 확인하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsCheckingSimilarItems(false);
    }
  };

  const isItemActive = (item: UnifiedInventoryItem) => item.is_active !== false;
  const handleSearch = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const { stock_status: selectedStockStatus, ...apiFilters } = filters;
      const response = await inventoryApi.getItems(1, 1000, {
        ...apiFilters,
        include_receipt_only: true,
      }, {
        sort_by: 'item_code',
        sort_order: 'asc',
      });

      let exportItems: ReceiptInventoryRow[] = groupReceiptItems(response?.data?.items || []).map(group => {
        const latest = [...group].sort((left, right) =>
          (right.updated_at || '').localeCompare(left.updated_at || '')
        )[0];
        return {
          ...group[0],
          category: latest.category,
          unit_price: latest.unit_price,
          currency: latest.currency,
          updated_at: latest.updated_at,
          deactivation_reason: latest.deactivation_reason,
          group_item_ids: group.map(item => item.id),
          grouped_item_count: group.length,
          group_item_codes: Array.from(new Set(group.map(item => item.item_code))),
          current_quantity: group.reduce((sum, item) => sum + (Number(item.current_quantity) || 0), 0),
          total_received: group.reduce((sum, item) => sum + (Number(item.total_received) || 0), 0),
          reserved_quantity: group.reduce((sum, item) => sum + (Number(item.reserved_quantity) || 0), 0),
          available_quantity: group.reduce((sum, item) => sum + (Number(item.available_quantity) || 0), 0),
          is_active: group.every(item => item.is_active !== false),
        };
      });

      if (selectedStockStatus) {
        exportItems = exportItems.filter(item => {
          const quantity = Number(item.current_quantity) || 0;
          const minimumStock = Number(item.minimum_stock) || 0;
          const status = quantity <= 0
            ? 'out_of_stock'
            : quantity < minimumStock
              ? 'low_stock'
              : 'normal';
          return status === selectedStockStatus;
        });
      }

      if (exportItems.length === 0) {
        toast.info('선택한 조건에 해당하는 다운로드 대상이 없습니다.');
        return;
      }

      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = '수령 관리';
      workbook.created = new Date();
      const worksheet = workbook.addWorksheet('수령 관리 목록', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      worksheet.columns = [
        { header: '사용 상태', key: 'status', width: 12 },
        { header: '품목코드', key: 'itemCode', width: 24 },
        { header: '품목명', key: 'itemName', width: 28 },
        { header: '카테고리', key: 'category', width: 20 },
        { header: '기준 단가', key: 'unitPrice', width: 15 },
        { header: '통화', key: 'currency', width: 10 },
        { header: '현재 재고', key: 'quantity', width: 14 },
        { header: '단위', key: 'unit', width: 10 },
        { header: '사용중지 사유', key: 'deactivationReason', width: 36 },
      ];

      exportItems.forEach(item => {
        worksheet.addRow({
          status: isItemActive(item) ? '사용중' : '사용중지',
          itemCode: item.group_item_codes.join(', '),
          itemName: item.item_name,
          category: item.category ? (purchaseCategoryLabels[item.category] || item.category) : '',
          unitPrice: item.unit_price ?? null,
          currency: item.currency || 'KRW',
          quantity: Number(item.current_quantity) || 0,
          unit: item.unit || '개',
          deactivationReason: isItemActive(item) ? '' : (item.deactivation_reason || ''),
        });
      });

      const headerRow = worksheet.getRow(1);
      headerRow.height = 24;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      worksheet.autoFilter = { from: 'A1', to: 'I1' };
      worksheet.getColumn('unitPrice').numFmt = '#,##0.00';
      worksheet.getColumn('quantity').numFmt = '#,##0';
      worksheet.getColumn('unitPrice').alignment = { horizontal: 'right' };
      worksheet.getColumn('quantity').alignment = { horizontal: 'right' };
      worksheet.getColumn('deactivationReason').alignment = { vertical: 'top', wrapText: true };
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { ...row.alignment, vertical: 'middle' };
          row.height = 21;
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const selectedCategory = filters.category
        ? (purchaseCategoryLabels[filters.category] || filters.category)
        : '전체';
      const safeCategory = selectedCategory.replace(/[\\/:*?"<>|]/g, '_');
      link.href = url;
      link.download = `수령관리_${safeCategory}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${exportItems.length.toLocaleString('ko-KR')}개 품목을 Excel로 다운로드했습니다.`);
    } catch (error: any) {
      toast.error(error?.message || 'Excel 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatPrice = (value?: number, currency = 'KRW') => {
    if (value === undefined || value === null) return '-';
    return currency === 'KRW'
      ? `${value.toLocaleString('ko-KR')}원`
      : `${value.toLocaleString('ko-KR')} ${currency}`;
  };

  const columns: TableColumn<ReceiptInventoryRow>[] = [
    {
      key: 'is_active', label: '사용 상태', width: '110px',
      render: (_value, item) =>
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}>
        <StatusBadge $active={isItemActive(item)}>
          {isItemActive(item) ? '사용중' : '사용중지'}
        </StatusBadge>
        </div> 
    },

    {
      key: 'item_code', label: '품목코드', sortable: true, width: '250px',
      render: (_value, item) => 
      <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}>
        {item.group_item_codes.length > 1 ? `${item.group_item_codes[0]} 외 ${item.group_item_codes.length - 1}개` : item.group_item_codes[0]}
      </div>
    },

    {
      key: 'item_name', label: '품목명', sortable: true,
      render: (value, item) => 
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}>
        <ItemDescription>
          <div className="name">{value}</div>
        </ItemDescription>
        </div>
      
    },

    {
      key: 'category', label: '카테고리', width: '150px',
      render: value => 
      <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}>
        {value ? (purchaseCategoryLabels[value] || value) : '-'}
      </div>
    },

    {
      key: 'unit_price', label: '기준 단가', width: '130px', align: 'right',
      render: (value, item) => 
      <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}> 
        {formatPrice(value, item.currency)}
      </div>
    },

    {
      key: 'current_quantity', label: '현재 재고', width: '120px', align: 'right',
      render: (value, item) => 
      <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}> 
        {`${(value ?? 0).toLocaleString('ko-KR')} ${item.unit || '개'}`}
      </div>
    },

    {
      key: 'id', label: '수정', width: '100px', align: 'center',
      render: (_value, item) =>
      <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',}}>
        <Button variant="outline" size="sm" onClick={() => setDetailItem(item)}>
          <Edit size={15} /> 수정
        </Button>
      </div>
    },
  ];

  const groupedItems = useMemo<ReceiptInventoryRow[]>(() => {
    const sourceItems: UnifiedInventoryItem[] = data?.data?.items || [];
    const rows = groupReceiptItems(sourceItems).map(group => {
      const latest = [...group].sort((left, right) =>
        (right.updated_at || '').localeCompare(left.updated_at || '')
      )[0];
      return {
        ...group[0],
        category: latest.category,
        unit_price: latest.unit_price,
        currency: latest.currency,
        updated_at: latest.updated_at,
        group_item_ids: group.map(item => item.id),
        grouped_item_count: group.length,
        group_item_codes: Array.from(new Set(group.map(item => item.item_code))),
        current_quantity: group.reduce((sum, item) => sum + (Number(item.current_quantity) || 0), 0),
        total_received: group.reduce((sum, item) => sum + (Number(item.total_received) || 0), 0),
        reserved_quantity: group.reduce((sum, item) => sum + (Number(item.reserved_quantity) || 0), 0),
        available_quantity: group.reduce((sum, item) => sum + (Number(item.available_quantity) || 0), 0),
        is_active: group.every(item => item.is_active !== false),
      };
    });

    if (!filters.stock_status) return rows;
    return rows.filter(item => {
      const quantity = Number(item.current_quantity) || 0;
      const minimumStock = Number(item.minimum_stock) || 0;
      const stockStatus = quantity <= 0
        ? 'out_of_stock'
        : quantity < minimumStock
          ? 'low_stock'
          : 'normal';
      return stockStatus === filters.stock_status;
    });
  }, [data?.data?.items, filters.stock_status]);

  const totalPages = Math.ceil(groupedItems.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const items = groupedItems.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    const lastAvailablePage = Math.max(1, totalPages);
    if (currentPage > lastAvailablePage) setCurrentPage(lastAvailablePage);
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    setCurrentPage(nextPage);
  };
  const detailMembers = useMemo(() => {
    if (!detailItem) return [];
    const sourceItems: UnifiedInventoryItem[] = data?.data?.items || [];
    return sourceItems.filter(item => detailItem.group_item_ids.includes(item.id));
  }, [data?.data?.items, detailItem]);
  const detailCodeGroups = useMemo(() => {
    const groups = new Map<string, UnifiedInventoryItem[]>();
    detailMembers.forEach(member => {
      const code = member.item_code || '-';
      groups.set(code, [...(groups.get(code) || []), member]);
    });
    return Array.from(groups.entries()).map(([itemCode, members]) => ({ itemCode, members }));
  }, [detailMembers]);

  const startDetailEditing = () => {
    const drafts: Record<string, any> = {};
    detailCodeGroups.forEach(({ itemCode, members }) => {
      const latest = [...members].sort((left, right) =>
        (right.updated_at || right.created_at || '').localeCompare(left.updated_at || left.created_at || '')
      )[0];
      drafts[itemCode] = {
        item_name: latest.item_name || '',
        quantity: members.reduce((sum, member) => sum + (Number(member.current_quantity) || 0), 0),
        specifications: latest.specifications || '',
        category: latest.category || '',
        brand: latest.brand || '',
        unit: latest.unit || '개',
        unit_price: latest.unit_price ?? '',
        minimum_stock: latest.minimum_stock ?? 0,
        maximum_stock: latest.maximum_stock ?? '',
        warehouse: latest.warehouse || '',
        location: latest.location || '',
        supplier_name: latest.supplier_name || '',
        updatter_name: latest.updatter_name || '',
        description: latest.description || '',
        notes: latest.notes || '',
      };
    });
    setDetailDrafts(drafts);
    setIsDetailEditing(true);
  };

  const changeDetailDraft = (itemCode: string, field: string, value: any) => {
    setDetailDrafts(previous => ({
      ...previous,
      [itemCode]: { ...previous[itemCode], [field]: value },
    }));
  };

  const detailUpdateMutation = useMutation({
    mutationFn: async () => {
      for (const { itemCode, members } of detailCodeGroups) {
        const draft = detailDrafts[itemCode];
        if (!draft) continue;
        const minimumStock = Number(draft.minimum_stock) || 0;
        const maximumStock = draft.maximum_stock === '' ? undefined : Number(draft.maximum_stock);
        const desiredQuantity = Number(draft.quantity);
        const currentQuantity = members.reduce((sum, member) => sum + (Number(member.current_quantity) || 0), 0);
        if (minimumStock < 0 || (maximumStock !== undefined && maximumStock < minimumStock)) {
          throw new Error(`${itemCode}: 최대 재고는 최소 재고보다 크거나 같아야 합니다.`);
        }
        if (!Number.isInteger(desiredQuantity) || desiredQuantity < 0) {
          throw new Error(`${itemCode}: 수량은 0 이상의 정수여야 합니다.`);
        }
        const { quantity: _quantity, ...itemDraft } = draft;
        const updateData = {
          ...itemDraft,
          unit_price: draft.unit_price === '' ? undefined : Math.max(0, Number(draft.unit_price)),
          minimum_stock: minimumStock,
          maximum_stock: maximumStock,
          category: draft.category || undefined,
          specifications: draft.specifications || undefined,
          brand: draft.brand || undefined,
          warehouse: draft.warehouse || undefined,
          location: draft.location || undefined,
          supplier_name: draft.supplier_name || undefined,
          description: draft.description || undefined,
          notes: draft.notes || undefined,
          updated_by: '수령관리 수정',
        };
        await Promise.all(members.map(member => inventoryApi.updateItem(member.id, updateData)));

        const quantityChange = desiredQuantity - currentQuantity;
        const adjustmentData = {
          user_name: '수령관리 수정',
          department: '수령관리',
          purpose: '품목코드별 현재 재고 수정',
          notes: `${itemCode} 현재 재고를 ${currentQuantity}에서 ${desiredQuantity}(으)로 조정`,
        };

        if (quantityChange > 0) {
          const target = [...members].sort((left, right) =>
            (right.updated_at || right.created_at || '').localeCompare(left.updated_at || left.created_at || '')
          )[0];
          await inventoryApi.adjustQuantity(target.id, { ...adjustmentData, quantity_change: quantityChange });
        } else if (quantityChange < 0) {
          let remainingDecrease = Math.abs(quantityChange);
          const targets = [...members].sort((left, right) =>
            (right.updated_at || right.created_at || '').localeCompare(left.updated_at || left.created_at || '')
          );
          for (const target of targets) {
            if (remainingDecrease <= 0) break;
            const targetQuantity = Number(target.current_quantity) || 0;
            const decrease = Math.min(remainingDecrease, targetQuantity);
            if (decrease > 0) {
              await inventoryApi.adjustQuantity(target.id, { ...adjustmentData, quantity_change: -decrease });
              remainingDecrease -= decrease;
            }
          }
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['receipt-inventory-items'] });
      await queryClient.invalidateQueries({ queryKey: ['unified-inventory'] });
      setDetailItem(previous => previous ? {
        ...previous,
        current_quantity: Object.values(detailDrafts).reduce(
          (sum, draft) => sum + (Number(draft.quantity) || 0),
          0
        ),
      } : previous);
      setIsDetailEditing(false);
      toast.success('품목 정보가 수정되었습니다.');
    },
    onError: (error: any) => toast.error(error?.message || '품목 정보를 수정하지 못했습니다.'),
  });

  if (isLoading) return <LoadingSpinner text="품목 정보를 불러오는 중..." />;

  if (error) {
    return (
      <Container>
        <PageTitle>수령 관리</PageTitle>
        <Card>
          <ErrorContainer>
            <AlertCircle size={48} className="error-icon" />
            <div className="error-title">품목 정보를 불러오지 못했습니다</div>
            <div className="error-message">서버 연결 상태를 확인한 후 다시 시도해 주세요.</div>
            <Button onClick={() => refetch()}>다시 시도</Button>
          </ErrorContainer>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>수령 관리</PageTitle>
      <PageSubtitle>품목 관리에 등록된 품목 정보와 사용 상태를 확인하고 관리합니다.</PageSubtitle>
      <Card>
        <FilterContainer>
          <InventoryFilters onFilter={handleSearch} variant="receipt" />
          <ActionButtons>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw size={16} />
              새로고침
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              loading={isExporting}
              disabled={isExporting}
            >
              <Download size={16} /> Excel 다운로드
            </Button>
            <Button onClick={() => setIsReceiptFormOpen(true)}>
              <Plus size={16} /> 수령 등록
            </Button>
          </ActionButtons>
        </FilterContainer>
        <Table
          columns={columns}
          data={items}
          loading={isLoading}
          emptyMessage="등록된 품목이 없습니다."
        />
        {groupedItems.length > 0 && (
          <PaginationSummary>
            총 {groupedItems.length.toLocaleString('ko-KR')}건 중{' '}
            {(pageStart + 1).toLocaleString('ko-KR')}–{Math.min(pageStart + PAGE_SIZE, groupedItems.length).toLocaleString('ko-KR')}건 표시
            {' · '}페이지당 {PAGE_SIZE}건
          </PaginationSummary>
        )}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </Card>

      <Modal
        isOpen={isReceiptFormOpen}
        onClose={closeReceiptForm}
        title="수령 품목 등록"
        size="lg"
      >
        <InventoryForm
          onSubmit={handleReceiptFormSubmit}
          onCancel={closeReceiptForm}
          loading={createReceiptItemMutation.isLoading || isCheckingSimilarItems}
          showReceiptQuantity
        />
      </Modal>

      <Modal
        isOpen={Boolean(pendingReceiptFormData)}
        onClose={() => {
          setPendingReceiptFormData(null);
          setSimilarInventoryItems([]);
        }}
        title="동일 품목 확인"
        size="lg"
      >
        <div style={{ marginBottom: '18px', color: '#4b5563', lineHeight: 1.6 }}>
          같은 품목명으로 등록된 품목코드 목록입니다. 수령 관리에서 재고를 합산할 품목코드를 선택하세요.
          선택하면 해당 품목코드로 새 등록 기록이 추가됩니다.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {similarInventoryItems.map(item => (
            <div key={item.item_code} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
              padding: '16px', border: '2px solid #3b82f6', borderRadius: '8px', background: '#eff6ff'
            }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                  {item.item_name} <span style={{ color: '#2563eb', fontSize: '0.8rem' }}>(선택 가능)</span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  코드: {item.item_code} · 브랜드: {item.brand || '-'}<br />
                  카테고리: {item.category || '-'}<br />
                  규격/모델: {item.specifications || '-'} · 단위: {item.unit || '개'}<br />
                  현재 재고: {(Number(item.current_quantity) || 0).toLocaleString('ko-KR')}
                </div>
              </div>
              <Button
                onClick={() => pendingReceiptFormData && mergeReceiptItemMutation.mutate({
                  existingItem: item,
                  data: pendingReceiptFormData,
                })}
                loading={mergeReceiptItemMutation.isLoading}
                disabled={mergeReceiptItemMutation.isLoading || createReceiptItemMutation.isLoading}
              >
                이 품목코드로 등록
              </Button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setPendingReceiptFormData(null);
              setSimilarInventoryItems([]);
            }}
            disabled={mergeReceiptItemMutation.isLoading || createReceiptItemMutation.isLoading}
          >
            입력 화면으로 돌아가기
          </Button>
          <Button
            variant="outline"
            onClick={() => pendingReceiptFormData && createReceiptItemMutation.mutate(pendingReceiptFormData)}
            loading={createReceiptItemMutation.isLoading}
            disabled={mergeReceiptItemMutation.isLoading || createReceiptItemMutation.isLoading}
          >
            새 품목으로 등록
          </Button>
        </div>
      </Modal>

      {detailItem && (
        <>
          <DrawerBackdrop onClick={() => setDetailItem(null)} />
          <DetailDrawer role="dialog" aria-modal="true" aria-label="품목 상세">
            <DrawerHeader>
              <div>
                <h2>{detailItem.item_name}</h2>
              </div>
              <CloseButton onClick={() => {
                setDetailItem(null);
                setIsDetailEditing(false);
              }} aria-label="닫기"><X size={22} /></CloseButton>
            </DrawerHeader>
            <DrawerContent>
              <SummaryGrid>
                <SummaryItem><div className="label">품목코드 수</div><div className="value">{detailMembers.length}건</div></SummaryItem>
                <SummaryItem><div className="label">현재 재고</div><div className="value">{detailItem.current_quantity.toLocaleString('ko-KR')} {detailItem.unit}</div></SummaryItem>
                <SummaryItem><div className="label">총 수령</div><div className="value">{detailItem.total_received.toLocaleString('ko-KR')} {detailItem.unit}</div></SummaryItem>
                <SummaryItem><div className="label">카테고리</div><div className="value">{purchaseCategoryLabels[detailItem.category || ''] || detailItem.category || '-'}</div></SummaryItem>
                <SummaryItem><div className="label">기준 단가</div><div className="value">{formatPrice(detailItem.unit_price, detailItem.currency)}</div></SummaryItem>
                <SummaryItem><div className="label">사용 상태</div><div className="value">{isItemActive(detailItem) ? '사용중' : '사용중지'}</div></SummaryItem>
              </SummaryGrid>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
                <Button
                  variant={isItemActive(detailItem) ? 'danger' : 'success'}
                  size="sm"
                  loading={statusMutation.isLoading}
                  onClick={() => {
                    if (isItemActive(detailItem)) {
                      setDeactivationReason('');
                      setIsDeactivationReasonOpen(true);
                      return;
                    }
                    statusMutation.mutate({
                      ids: detailItem.group_item_ids,
                      isActive: true,
                    });
                  }}
                >
                  {isItemActive(detailItem) ? '사용중지' : '사용 재개'}
                </Button>
                {isDetailEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={detailUpdateMutation.isPending}
                      onClick={() => setIsDetailEditing(false)}
                    >취소</Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={detailUpdateMutation.isPending}
                      onClick={() => detailUpdateMutation.mutate()}
                    >저장</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={startDetailEditing}>
                    <Edit size={15} /> 수정
                  </Button>
                )}
              </div>

              {isDeactivationReasonOpen && isItemActive(detailItem) && (
                <div style={{
                  marginBottom: 20, padding: 16, border: '1px solid #fecaca', borderRadius: 8, background: '#fef2f2'
                }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#991b1b', fontWeight: 600 }}>
                    사용중지 사유 *
                    <textarea
                      value={deactivationReason}
                      onChange={event => setDeactivationReason(event.target.value)}
                      placeholder="사용중지 사유를 입력하세요"
                      rows={4}
                      autoFocus
                      style={{ resize: 'vertical', padding: 10, border: '1px solid #fca5a5', borderRadius: 6, font: 'inherit' }}
                    />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                    <Button variant="secondary" size="sm" onClick={() => {
                      setIsDeactivationReasonOpen(false);
                      setDeactivationReason('');
                    }} disabled={statusMutation.isLoading}>취소</Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={statusMutation.isLoading}
                      disabled={!deactivationReason.trim()}
                      onClick={() => statusMutation.mutate({
                        ids: detailItem.group_item_ids,
                        isActive: false,
                        reason: deactivationReason.trim(),
                      })}
                    >확인</Button>
                  </div>
                </div>
              )}

              {!isItemActive(detailItem) && detailItem.deactivation_reason && (
                <div style={{
                  marginBottom: 20, padding: '12px 14px', borderLeft: '4px solid #dc2626', borderRadius: 6, background: '#fef2f2', color: '#991b1b'
                }}>
                  <strong>사용중지 사유</strong>
                  <div style={{ marginTop: 5, whiteSpace: 'pre-wrap' }}>{detailItem.deactivation_reason}</div>
                </div>
              )}

              <DetailSectionTitle><Package size={18} /> 품목코드별 상세</DetailSectionTitle>
              {detailCodeGroups.map(({ itemCode, members }) => {
                const latestMember = [...members].sort((left, right) =>
                  (right.updated_at || right.created_at || '').localeCompare(left.updated_at || left.created_at || '')
                )[0];
                const currentQuantity = members.reduce((sum, member) => sum + (Number(member.current_quantity) || 0), 0);
                const reservedQuantity = members.reduce((sum, member) => sum + (Number(member.reserved_quantity) || 0), 0);
                const availableQuantity = members.reduce((sum, member) => sum + (Number(member.available_quantity) || 0), 0);
                const receiptEntries = members.flatMap(member => (member.receipt_history || []).map(receipt => ({
                  kind: '수령',
                  date: receipt.received_date,
                  quantity: Number(receipt.received_quantity) || 0,
                  actor: receipt.receiver_name,
                  department: receipt.department,
                  receiptNumber: receipt.receipt_number,
                  notes: receipt.notes,
                })));
                const quantityEntries = members.flatMap(member => (member.quantity_history || []).map(history => ({
                  kind: history.type === 'outbound' ? '출고' : '조정',
                  date: history.created_at,
                  quantity: Number(history.quantity_change) || 0,
                  actor: history.user_name,
                  department: history.department,
                  receiptNumber: '',
                  notes: history.notes || history.purpose,
                })));
                const activityEntries = [...receiptEntries, ...quantityEntries].sort((left, right) =>
                  (right.date || '').localeCompare(left.date || '')
                );
                const imageReceiptNumbers = new Map<string, Set<string>>();
                members.forEach(member => {
                  [member.main_image_url, ...(member.image_urls || [])].filter(Boolean).forEach(url => {
                    if (!imageReceiptNumbers.has(url!)) imageReceiptNumbers.set(url!, new Set());
                  });
                  (member.receipt_history || []).forEach(receipt => {
                    (receipt.image_urls || []).forEach(url => {
                      if (!imageReceiptNumbers.has(url)) imageReceiptNumbers.set(url, new Set());
                      if (receipt.receipt_number) imageReceiptNumbers.get(url)!.add(receipt.receipt_number);
                    });
                  });
                });
                const inspectionImages = Array.from(imageReceiptNumbers.entries()).map(([url, numbers]) => ({
                  url,
                  receiptNumbers: Array.from(numbers),
                }));
                const documents = members.filter(member => member.transaction_document_url);
                const receiptNumbers = Array.from(new Set(receiptEntries.map(entry => entry.receiptNumber).filter(Boolean)));
                return (
                  <CodeCard key={itemCode}>
                    <CodeCardHeader>
                      <span className="code">{itemCode}</span>
                      <StatusBadge $active={members.every(isItemActive)}>
                        {members.every(isItemActive) ? '사용중' : '사용중지'}
                      </StatusBadge>
                    </CodeCardHeader>
                    {isDetailEditing && detailDrafts[itemCode] && (
                      <InlineEditGrid>
                        <label>품목명
                          <input value={detailDrafts[itemCode].item_name} onChange={event => changeDetailDraft(itemCode, 'item_name', event.target.value)} />
                        </label>
                        <label>브랜드
                          <input value={detailDrafts[itemCode].brand} onChange={event => changeDetailDraft(itemCode, 'brand', event.target.value)} />
                        </label>
                        <label className="wide">규격/모델
                          <textarea value={detailDrafts[itemCode].specifications} onChange={event => changeDetailDraft(itemCode, 'specifications', event.target.value)} />
                        </label>
                        <label>카테고리
                          <select value={detailDrafts[itemCode].category} onChange={event => changeDetailDraft(itemCode, 'category', event.target.value)}>
                            <option value="">카테고리 선택</option>
                            {INVENTORY_CATEGORY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </label>
                        <label>수량
                          <input type="number" min="0" step="1" value={detailDrafts[itemCode].quantity} onChange={event => changeDetailDraft(itemCode, 'quantity', event.target.value)} />
                        </label>
                        <label>단위
                          <input value={detailDrafts[itemCode].unit} onChange={event => changeDetailDraft(itemCode, 'unit', event.target.value)} />
                        </label>
                        <label>단가
                          <input type="number" min="0" value={detailDrafts[itemCode].unit_price} onChange={event => changeDetailDraft(itemCode, 'unit_price', event.target.value)} />
                        </label>
                        <label>최소재고
                          <input type="number" min="0" value={detailDrafts[itemCode].minimum_stock} onChange={event => changeDetailDraft(itemCode, 'minimum_stock', event.target.value)} />
                        </label>
                        <label>최대재고
                          <input type="number" min={detailDrafts[itemCode].minimum_stock || 0} value={detailDrafts[itemCode].maximum_stock} onChange={event => changeDetailDraft(itemCode, 'maximum_stock', event.target.value)} />
                        </label>
                        <label>창고
                          <input value={detailDrafts[itemCode].warehouse} onChange={event => changeDetailDraft(itemCode, 'warehouse', event.target.value)} />
                        </label>
                        <label>보관 위치
                          <input value={detailDrafts[itemCode].location} onChange={event => changeDetailDraft(itemCode, 'location', event.target.value)} />
                        </label>
                        <label>공급업체
                          <input value={detailDrafts[itemCode].supplier_name} onChange={event => changeDetailDraft(itemCode, 'supplier_name', event.target.value)} />
                        </label>
                        <label>수정자
                          <input value={detailDrafts[itemCode].updatter_name} onChange={event => changeDetailDraft(itemCode, 'updatter_name', event.target.value)} />
                        </label>
                        <label className="wide">설명
                          <textarea value={detailDrafts[itemCode].description} onChange={event => changeDetailDraft(itemCode, 'description', event.target.value)} />
                        </label>
                        <label className="wide">비고
                          <textarea value={detailDrafts[itemCode].notes} onChange={event => changeDetailDraft(itemCode, 'notes', event.target.value)} />
                        </label>
                      </InlineEditGrid>
                    )}
                    <DetailGrid>
                      <div className="field"><span className="label">현재재고</span><span className="value">{currentQuantity.toLocaleString('ko-KR')} {latestMember.unit}</span></div>
                      <div className="field"><span className="label">가용재고</span><span className="value">{availableQuantity.toLocaleString('ko-KR')} {latestMember.unit}</span></div>
                      <div className="field"><span className="label">예약수량</span><span className="value">{reservedQuantity.toLocaleString('ko-KR')} {latestMember.unit}</span></div>
                      <div className="field"><span className="label">최소재고</span><span className="value">{latestMember.minimum_stock || 0} {latestMember.unit}</span></div>
                      <div className="field"><span className="label">최근 수령일</span><span className="value">{latestMember.last_received_date ? new Date(latestMember.last_received_date).toLocaleDateString('ko-KR') : '-'}</span></div>
                      <div className="field"><span className="label">등록 기록</span><span className="value">{members.length}건</span></div>
                    </DetailGrid>

                    <DetailSectionTitle>등록·수정 정보</DetailSectionTitle>
                    {members.map(member => (
                      <HistoryItem key={member.id}>
                        <strong>등록 #{member.id}</strong><br />
                        {'  '}[등록자] {member.created_by || '없음'}
                        {' · '}[등록일] {member.created_at ? new Date(member.created_at).toLocaleString('ko-KR') : '-'}<br />
                        [수정자] {member.updated_by || '없음'}
                        {' · '}[수정일] {member.updated_at ? new Date(member.updated_at).toLocaleString('ko-KR') : '-'}
                      </HistoryItem>
                    ))}

                    <DetailSectionTitle>수령·출고·조정 내역</DetailSectionTitle>
                    {activityEntries.length > 0 ? activityEntries.map((entry, index) => (
                      <HistoryItem key={`${entry.kind}-${entry.date}-${index}`}>
                        <strong>{entry.kind}</strong>
                        {' · '}{/*entry.quantity > 0 ? '+' : ''*/}{entry.quantity.toLocaleString('ko-KR')} {latestMember.unit}
                        {' · '}{formatKoreanDateTime(entry.date)}
                        {' · '}{entry.actor || '-'} {/*/ {entry.department || '-'} 수령 부서*/}
                        {entry.receiptNumber && <> · [수령번호] {entry.receiptNumber}</>}
                        {entry.notes && <div style={{ marginTop: 4, color: '#64748b' }}>{entry.notes}</div>}
                      </HistoryItem>
                    )) : <EmptyMedia>등록된 수령·출고·조정 내역이 없습니다.</EmptyMedia>}

                    <DetailSectionTitle><ImageIcon size={17} /> 검수 사진</DetailSectionTitle>
                    {inspectionImages.length > 0 ? (
                      <ImageGrid>
                        {inspectionImages.map((image, index) => (
                          <InspectionImage key={`${image.url}-${index}`}>
                            <a href={image.url} target="_blank" rel="noreferrer" title="원본 이미지 보기">
                              <img src={image.url} alt={`${itemCode} 검수 사진 ${index + 1}`} />
                            </a>
                            <div className="receipt-number">
                              수령번호: {image.receiptNumbers.length > 0 ? image.receiptNumbers.join(', ') : '미연결'}
                            </div>
                          </InspectionImage>
                        ))}
                      </ImageGrid>
                    ) : <EmptyMedia>등록된 검수 사진이 없습니다.</EmptyMedia>}

                    <DetailSectionTitle><FileText size={17} /> 거래명세서</DetailSectionTitle>
                    {documents.length > 0 ? documents.map(member => (
                      <HistoryItem key={`document-${member.id}`}>
                        <DocumentLink href={member.transaction_document_url!} target="_blank" rel="noreferrer">
                          <FileText size={17} /> 거래명세서 보기
                        </DocumentLink>
                        <div style={{ marginTop: 5, color: '#64748b' }}>
                          수령번호 {(member.receipt_history || []).map(receipt => receipt.receipt_number).filter(Boolean).join(', ') || '미연결'}<br />
                          등록일 {member.transaction_upload_date ? new Date(member.transaction_upload_date).toLocaleString('ko-KR') : member.created_at ? new Date(member.created_at).toLocaleString('ko-KR') : '-'}
                          {' · '}등록자 {member.transaction_uploaded_by || member.created_by || '-'}
                        </div>
                      </HistoryItem>
                    )) : <EmptyMedia>등록된 거래명세서가 없습니다.</EmptyMedia>}

                    <DetailSectionTitle>관련 수령번호</DetailSectionTitle>
                    <EmptyMedia>{receiptNumbers.length > 0 ? receiptNumbers.join(', ') : '관련 수령번호가 없습니다.'}</EmptyMedia>
                  </CodeCard>
                );
              })}
            </DrawerContent>
          </DetailDrawer>
        </>
      )}

      <Modal isOpen={Boolean(editingItem)} onClose={() => setEditingItem(null)} title="품목 사용 상태 수정" size="sm">
        {editingItem && (
          <ModalBody>
            <div>
              <div className="item-name">{editingItem.item_name}</div>
              <div className="description">현재 상태: {isItemActive(editingItem) ? '사용중' : '사용중지'}</div>
            </div>
            <div className="description">
              {isItemActive(editingItem)
                ? '사용중지하면 이 품목이 사용 중지 상태로 표시됩니다.'
                : '사용 재개하면 이 품목이 다시 사용중 상태로 표시됩니다.'}
            </div>
            <div className="actions">
              <Button variant="secondary" size="sm" onClick={() => setEditingItem(null)}>취소</Button>
              <Button
                variant={isItemActive(editingItem) ? 'danger' : 'success'}
                size="sm"
                loading={statusMutation.isLoading}
                onClick={() => statusMutation.mutate({
                  ids: editingItem.group_item_ids,
                  isActive: !isItemActive(editingItem),
                })}
              >
                {isItemActive(editingItem) ? '사용중지' : '사용 재개'}
              </Button>
            </div>
          </ModalBody>
        )}
      </Modal>
    </Container>
  );
};

export default ReceiptPage;
