// client/src/components/purchase/PurchaseRequestPage.tsx
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Download, 
  RefreshCw, 
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Filter,
  Package2, 
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

// Components
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Button from '../common/Button';
import PurchaseRequestForm from './PurchaseRequestForm';
import ExcelBulkUpload from './ExcelBulkUpload';
import PurchaseRequestFilters from './PurchaseRequestFilters';
import RequestDetailModal from './RequestDetailModal';
import { useNavigate } from 'react-router-dom';

// Services
import api, { purchaseApi, inventoryApi, UnifiedInventoryItem } from '../../services/api';
import { normalizeInventoryName } from '../../utils/inventoryGrouping';
import { ExcelExportService } from '@/services/excelExport';

// SearchFilters 타입 정의
interface SearchFilters {
  search?: string;
  status?: string;
  urgency?: string;
  department?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Types - API와 맞춤
interface PurchaseRequest {
  id: number;
  item_name: string;
  specifications?: string;
  quantity: number;
  unit?: string;
  estimated_unit_price?: number;
  total_budget?: number;
  currency?: string;
  category?: string;
  urgency: string;
  requester_name: string;
  requester_email?: string;
  department: string;
  status: string;
  created_at: string;
  justification: string;
  notes?: string;
  inventory_item_id?: number;
  inventory_item_code?: string;
  preferred_supplier?: string;
}

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

type RequestStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'in_review';
type UrgencyLevel = 'all' | 'low' | 'normal' | 'high' | 'urgent';

// 🎨 개선된 Styled Components (두 번째 코드에서 가져옴)
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
`;

const PageSubtitle = styled.p`
  color: #6b7280;
  margin-bottom: 0;
  font-size: 1rem;
  line-height: 1.5;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
`;

const StatCard = styled(Card)<{ $color?: string }>`
  text-align: center;
  background: ${props => props.$color ? `linear-gradient(135deg, ${props.$color}15 0%, ${props.$color}08 100%)` : 'white'};
  border-left: 4px solid ${props => props.$color || '#3b82f6'};
  padding: 24px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
    color: ${props => props.$color || '#3b82f6'};
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: ${props => props.$color || '#3b82f6'};
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 12px;
  }
  
  .stat-change {
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 500;
    display: inline-block;
    
    &.positive {
      background: #10b98120;
      color: #10b981;
    }
    
    &.negative {
      background: #ef444420;
      color: #ef4444;
    }
  }
`;

const ContentCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const FilterSection = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-self: flex-start;
  justify-content: flex-start;
  gap: 8px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 100%;
    justify-content: flex-end;
  }
  
  @media (max-width: 768px) {
    justify-content: stretch;
    
    > button {
      flex: 1;
      min-width: 0;
      
      span {
        display: none;
      }
      
      svg {
        margin: 0;
      }
    }
  }
`;

const TableContainer = styled.div`
  padding: 24px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$status) {
      case 'SUBMITTED':
        return `
          background: #FEF3C7;
          color: #92400E;
        `;
      case 'COMPLETED':
        return `
          background: #D1FAE5;
          color: #065F46;
        `;
      case 'CANCELLED':
        return `
          background: #FEE2E2;
          color: #991B1B;
        `;
      case 'IN_REVIEW':
        return `
          background: #DBEAFE;
          color: #1E40AF;
        `;
      default:
        return `
          background: #F3F4F6;
          color: #374151;
        `;
    }
  }}
`;

const UrgencyBadge = styled.span<{ $urgency: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$urgency) {
      case 'urgent':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      case 'high':
        return `
          background: #fed7aa;
          color: #9a3412;
        `;
      case 'normal':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'low':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 5px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  .error-icon {
    color: #ef4444;
    margin-bottom: 16px;
  }
  
  .error-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
  }
  
  .error-message {
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.6;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  
  .empty-icon {
    margin-bottom: 16px;
    color: #d1d5db;
  }
  
  .empty-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
  }
  
  .empty-message {
    margin-bottom: 24px;
    line-height: 1.6;
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  text-align: center;
  
  .confirm-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
  }
  
  .confirm-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #1f2937;
  }
  
  .confirm-message {
    color: #6b7280;
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .item-info {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        font-weight: 500;
        color: #6b7280;
        min-width: 80px;
      }
      
      .value {
        font-weight: 600;
        color: #1f2937;
        flex: 1;
      }
    }
  }
  
  .button-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
  }
`;

// 메인 컴포넌트
const PurchaseRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<PurchaseRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState<PurchaseRequest | null>(null);
  const [pendingCompletionRequest, setPendingCompletionRequest] = useState<PurchaseRequest | null>(null);
  const [similarInventoryItems, setSimilarInventoryItems] = useState<UnifiedInventoryItem[]>([]);
  const [isCheckingSimilarItems, setIsCheckingSimilarItems] = useState(false);
  const [selectedRequests,setSelectedRequests] = useState<PurchaseRequest[]>([]);

  // 구매 요청 목록 조회
  const { 
    data: requestsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['purchase-requests', currentPage, filters],
    queryFn: () => purchaseApi.getRequests({ page: currentPage, limit: 20, ...filters }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // 통계 데이터 조회
  const { data: statsData } = useQuery({
    queryKey: ['purchase-requests-stats'],
    queryFn: () => purchaseApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  // 🔥 안정적인 구매완료 처리 (첫 번째 코드의 로직 사용)
  const completePurchaseMutation = useMutation({
    mutationFn: async ({ requestId, requestData, existingItem }: {
      requestId: number; 
      requestData: PurchaseRequest;
      existingItem?: UnifiedInventoryItem;
    }) => {
      console.log('🚀 구매완료 + 품목 등록 시작:', { requestId, requestData });
      
      try {
        // 1️⃣ 먼저 구매 요청 상태를 COMPLETED로 변경
        console.log('📝 1단계: 구매 요청 상태 업데이트');
        const updateResult = await purchaseApi.updateRequest(requestId, {
          status: 'COMPLETED',
          completed_date: new Date().toISOString(),
          completed_by: requestData.requester_name
        });
        console.log('✅ 구매 요청 상태 업데이트 성공:', updateResult);

        const inventoryData = {
          item_code: `ITM-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${requestId.toString().padStart(4, '0')}`,
          item_name: requestData.item_name || '품목명 없음',
          specifications: requestData.specifications || undefined,
          category: requestData.category || 'OTHER',
          description: requestData.specifications || `구매요청 #${requestId}에서 자동 생성`,
          current_stock: 0,
          minimum_stock: Math.max(1, Math.ceil((Number(requestData.quantity) || 0) * 0.2)),
          maximum_stock: (Number(requestData.quantity) || 0) * 2,
          unit: requestData.unit || '개',
          unit_price: Number(requestData.estimated_unit_price) || 0,
          currency: requestData.currency || 'KRW',
          supplier_name: requestData.preferred_supplier || '',
          location: '창고',
          warehouse: '메인창고',
          purchase_request_id: requestId,
          notes: `구매요청 #${requestId}에서 자동 생성됨`,
          is_active: true,
          created_by: requestData.requester_name,
          department: requestData.department
        };

        if (existingItem) {
          const newInventoryItem = await inventoryApi.createItem({
            ...inventoryData,
            item_code: existingItem.item_code,
            reuse_item_code: true,
            notes: `${inventoryData.notes}\n수령관리 묶음 기준 품목: ${existingItem.item_code}`,
          });
          return {
            success: true,
            purchase_update: updateResult,
            inventory_created: newInventoryItem,
            inventory_merged: true,
            inventory_item_id: newInventoryItem.id,
            inventory_item_code: newInventoryItem.item_code,
            message: '구매완료 및 새 품목 등록 성공 (수령관리에서 동일 품목 누적)'
          };
        }

        // 2️⃣ 품목관리에 새 품목 등록
        console.log('📦 2단계: 품목관리에 등록');
        
        console.log('📤 품목 등록 데이터:', inventoryData);
        
        // 품목관리 API 호출 (inventoryApi 사용)
        const inventoryResult = await inventoryApi.createItem(inventoryData);
        console.log('✅ 품목 등록 성공:', inventoryResult);

        return {
          success: true,
          purchase_update: updateResult,
          inventory_created: inventoryResult,
          inventory_item_id: inventoryResult.id,
          inventory_item_code: inventoryResult.item_code,
          message: '구매완료 및 품목 등록 성공'
        };

      } catch (error) {
        console.error('❌ 처리 중 오류:', error);
        
        // 부분 실패 처리: 구매 요청은 성공했지만 품목 등록 실패
        if (error.message?.includes('inventory') || error.response?.status) {
          console.warn('⚠️ 품목 등록 실패, 구매 요청만 완료됨');
          return {
            success: true,
            partial_success: true,
            purchase_update: true,
            inventory_created: false,
            message: '구매 요청은 완료되었지만 품목 등록에 실패했습니다.',
            error: error.message
          };
        }
        
        throw error;
      }
    },
    
    // 🔥 재시도 설정 추가
    retry: (failureCount, error: any) => {
      // 최대 2번까지만 재시도
      if (failureCount >= 2) return false;
      
      // 트랜잭션 오류나 500 에러인 경우에만 재시도
      const shouldRetry = error.response?.status === 500 || 
                         error.response?.data?.detail?.includes('transaction is aborted');
      
      if (shouldRetry) {
        console.log(`🔄 재시도 ${failureCount + 1}/2`);
        return true;
      }
      
      return false;
    },
    
    // 재시도 간격 (점진적 증가)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),

    onSuccess: async (result, variables) => {
      console.log('🎉 구매완료 처리 결과:', result);
      setPendingCompletionRequest(null);
      setSimilarInventoryItems([]);
      
      try {
        // 캐시 업데이트
        queryClient.setQueryData(['purchase-requests', currentPage, filters], (oldData: any) => {
          if (!oldData?.data?.items) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: oldData.data.items.map((item: any) => {
                if (item.id === variables.requestId) {
                  return {
                    ...item,
                    status: 'COMPLETED',
                    completed_date: new Date().toISOString(),
                    completed_by: result.inventory_created,
                    inventory_item_id: result.inventory_item_id,
                    inventory_item_code: result.inventory_item_code
                  };
                }
                return item;
              })
            }
          };
        });
        
        // 성공 메시지 표시
        if (result.inventory_created !== false) {
          // 완전 성공
          toast.success(
            result.inventory_merged
              ? `구매완료! 새 품목(${result.inventory_item_code})으로 등록되며 수령관리에서는 동일 품목으로 누적됩니다.`
              : `🎉 구매완료! 품목코드: ${result.inventory_item_code}로 등록되었습니다.`,
            { autoClose: 5000, position: 'top-center' }
          );
          
          // 품목관리 페이지로 이동
          setTimeout(() => {
            navigate(`/inventory?highlight=${result.inventory_item_id}`);
          }, 2000);
          
        } else {
          // 부분 성공
          toast.warning(
            '구매 요청은 완료되었지만 품목 등록에 실패했습니다. 수동으로 등록해주세요.',
            { autoClose: 7000 }
          );
        }
        
        // 🔥 쿼리 새로고침을 순차적으로 실행 (동시성 문제 방지)
        await queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await queryClient.invalidateQueries({ queryKey: ['purchase-requests-stats'] });
        await new Promise(resolve => setTimeout(resolve, 200));
        await queryClient.invalidateQueries({ queryKey: ['unified-inventory'] });
        await queryClient.invalidateQueries({ queryKey: ['receipt-inventory-items'] });
        
        await queryClient.invalidateQueries({ queryKey: ['inventory'] });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
        
        setConfirmingItem(null);
        
      } catch (error) {
        console.error('성공 후 처리 중 오류:', error);
        toast.warning('구매는 완료되었으나 화면 새로고침 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        setConfirmingItem(null);
      }
    },
    
    onError: (error: any) => {
      console.error('❌ 구매완료 처리 실패:', error);
      
      // 에러 메시지 추출 및 개선
      let errorMessage = '구매완료 처리 중 오류가 발생했습니다.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        // 트랜잭션 오류 메시지 개선
        if (error.response.data.detail.includes('transaction is aborted')) {
          errorMessage = '⚠️ 데이터베이스 처리 중 문제가 발생했습니다.\n\n잠시 후 다시 시도하거나, 지속적으로 문제가 발생하면 관리자에게 문의해주세요.';
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        autoClose: 7000,
        position: 'top-center'
      });
      
      setConfirmingItem(null);
    },
  });

  // 삭제 Mutation
const deleteMutation = useMutation({
  mutationFn: async (requestId: number) => {
    console.log(`🔥 삭제 API 호출 시작: ID=${requestId}`);
    
    try {
      // 🔥 purchaseApi.deleteRequest 사용
      const response = await purchaseApi.deleteRequest(requestId);
      console.log('✅ 삭제 API 성공:', response);
      return response;
    } catch (error: any) {
      console.error('❌ 삭제 API 실패:', error);
      console.error('❌ 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  onSuccess: (data, requestId) => {
    console.log('🎉 삭제 성공 처리:', data);
    
    // 성공 메시지
    const itemName = data.deleted_item || '구매 요청';
    const method = data.method === 'soft_delete' ? '취소' : '삭제';
    
    toast.success(`${itemName}이(가) 성공적으로 ${method}되었습니다.`, {
      autoClose: 3000
    });
    
    // 🔥 캐시에서 해당 항목 제거 (즉시 UI 업데이트)
    queryClient.setQueryData(['purchase-requests', currentPage, filters], (oldData: any) => {
      if (!oldData?.data?.items) return oldData;
      
      const newItems = oldData.data.items.filter((item: any) => item.id !== requestId);
      
      console.log(`📋 캐시 업데이트: ${oldData.data.items.length} → ${newItems.length}`);
      
      return {
        ...oldData,
        data: {
          ...oldData.data,
          items: newItems,
          total: Math.max(0, oldData.data.total - 1)
        }
      };
    });
    
    // 🔥 통계 캐시도 업데이트
    queryClient.setQueryData(['purchase-requests-stats'], (oldStats: any) => {
      if (!oldStats?.data) return oldStats;
      
      return {
        ...oldStats,
        data: {
          ...oldStats.data,
          total: Math.max(0, oldStats.data.total - 1)
        }
      };
    });
    
    // 🔥 1초 후 새로고침 (확실한 동기화)
    setTimeout(() => {
      console.log('🔄 캐시 새로고침 실행');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-requests-stats'] });
    }, 1000);
  },
  
  onError: (error: any, requestId) => {
    console.error('❌ 삭제 실패 처리:', error);
    
    // 구체적인 에러 메시지
    let errorMessage = '삭제 중 오류가 발생했습니다.';
    
    if (error.response?.status === 404) {
      errorMessage = '삭제할 구매 요청을 찾을 수 없습니다.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || '삭제할 수 없는 상태입니다.';
    } else if (error.response?.status === 500) {
      errorMessage = '서버 오류로 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    toast.error(errorMessage, {
      autoClose: 5000
    });
  },
});


  // Export Mutation
  const exportMutation = useMutation({
    mutationFn: () => purchaseApi.exportRequests(filters),
    onSuccess: () => {
      toast.success('Excel 파일이 다운로드되었습니다.');
    },
    onError: (error) => {
      console.error('Export error:', error);
      toast.error('Excel 다운로드에 실패했습니다.');
    },
  });

  // 테이블 컬럼 정의
  const columns: TableColumn<PurchaseRequest>[] = useMemo(() => [
    {
      key: 'id',
      label: '번호',
      sortable: true,
      width: '80px',
      render: (value) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: '500' }}>
          #{value}
        </span>
      ),
    },
    {
      key: 'item_name',
      label: '품목명',
      sortable: true,
      width: '200px',
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{value || '품목명 없음'}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: '수량',
      width: '80px',
      render: (value, item) => (
        <div style={{ 
          textAlign: 'center', 
          fontWeight: '500',
          whiteSpace: 'nowrap'  // 줄바꿈 방지
        }}>
          {value?.toLocaleString() || '0'} {item.unit || '개'}
        </div>
      ),
    },
    {
      key: 'requester_name',
      label: '요청자',
      width: '120px',
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: '500' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.department}</div>
        </div>
      ),
    },
    {
      key: 'urgency',
      label: '긴급도',
      width: '100px',
      render: (value) => {
        const urgencyMap: Record<string, string> = {
          'low': '낮음',
          'normal': '보통',
          'high': '높음', 
          'urgent': '긴급',
          'emergency': '응급'
        };
        return <UrgencyBadge $urgency={value}>{urgencyMap[value] || value}</UrgencyBadge>;
      },
    },
    {
      key: 'status',
      label: '상태',
      width: '120px',
      render: (value) => {
        const statusMap: Record<string, string> = {
          'SUBMITTED': '구매요청',
          'COMPLETED': '구매완료', 
          'CANCELLED': '구매반려'
        };
        return <StatusBadge $status={value}>{statusMap[value] || value}</StatusBadge>;
      },
    },
    {
      key: 'created_at',
      label: '요청일',
      sortable: true,
      width: '120px',
      render: (value) => value ? new Date(value).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'total_budget',
      label: '예상금액',
      width: '160px',
      render: (value, item) => {
        if (!value || value === 0) return '-';
        const currency = item.currency || '원';
        return `${currency} ${value.toLocaleString()}`;
      },
    },
    {
      key: 'actions',
      label: '관리',
      width: '160px',
      render: (_, item) => {
        const isCompleted = item.status === 'COMPLETED';
        const hasInventoryItem = item.inventory_item_id || item.inventory_item_code;
        
        return (
          <ActionButtonGroup>
            {/* 🔥 완료 상태와 품목 등록 여부에 따른 버튼 표시 */}
            {item.status === 'CANCELLED' ? (
              // ❌ 취소됨 (버튼 비활성화)
              <Button
                size="sm"
                variant="outline"
                title="반려된 구매 요청입니다."
                disabled
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#dc2626',
                  border: '1px solid rgba(220, 38, 38, 0.45)',
                }}
              >
                <X size={14} />
                구매반려
              </Button>
            ) : isCompleted ? (
              hasInventoryItem ? (
                // ✅ 완전 완료 (품목까지 등록됨)
                <Button
                  size="sm"
                  variant="outline"
                  title={`구매완료 & 품목등록 완료 ${item.inventory_item_code ? `(${item.inventory_item_code})` : ''}`}
                  onClick={() => {
                    if (item.inventory_item_id) {
                      navigate(`/inventory?highlight=${item.inventory_item_id}`);
                    }
                  }}
                  style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #16a34a'
                  }}
                  disabled={!item.inventory_item_id}
                >
                  <Package2 size={14} />
                  완료됨
                </Button>
              ) : (
                // ⚠️ 부분 완료 (구매만 완료, 품목 등록 안됨)
                <Button
                  size="sm"
                  variant="outline"
                  title="구매완료됨 (품목 등록 실패)"
                  disabled
                >
                  <Check size={14} />
                  구매완료
                </Button>
              )
            ) : (
              // 🟢 미완료 - 구매완료 버튼
              <Button
                size="sm"
                variant="success"
                onClick={() => handlePurchaseComplete(item)}
                title="구매완료 + 품목등록"
              >
                <CheckCircle2 size={14} />
                구매완료
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleView(item)}
              title="상세보기"
            >
              <Eye size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(item)}
              title="수정"
            >
              <Edit size={14} />
            </Button>
            
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDelete(item.id)}
              title="삭제"
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              <Trash2 size={14} />
            </Button>
          </ActionButtonGroup>
        );
      },
    }],
 []);

  // 이벤트 핸들러
  const handleView = (request: PurchaseRequest) => {
    console.log('상세보기 데이터:', request);
    setViewingRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (request: PurchaseRequest) => {
    setEditingRequest(request);
    setIsFormModalOpen(true);
  };

const handleDelete = async (requestId: number) => {
  try {
    console.log(`🗑️ 구매 요청 삭제 시작: ID=${requestId}`);
    
    // 사용자 확인
    const confirmMessage = `정말로 이 구매 요청을 삭제하시겠습니까?\n\nID: ${requestId}\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`;
    
    if (!window.confirm(confirmMessage)) {
      console.log('🚫 사용자가 삭제를 취소함');
      return;
    }
    
    // 삭제 실행
    console.log(`🗑️ 삭제 API 호출: ID=${requestId}`);
    await deleteMutation.mutateAsync(requestId);
    
  } catch (error: any) {
    console.error('❌ 삭제 처리 중 오류:', error);
    
    // 에러 메시지 처리
    let errorMessage = '삭제 중 오류가 발생했습니다.';
    
    if (error.response?.status === 404) {
      errorMessage = '삭제할 구매 요청을 찾을 수 없습니다.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || '삭제할 수 없는 상태입니다.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    }
    
    toast.error(errorMessage, {
      autoClose: 5000
    });
  }
};
const handleBulkDelete = async () => {
  if (selectedRequests.length === 0) return;

  const confirmed = window.confirm(
    `선택한 구매 요청 ${selectedRequests.length}건을 삭제하시겠습니까?\n\n` +
    '이 작업은 되돌릴 수 없습니다.'
  );

  if (!confirmed) return;

  try {
    await Promise.all(
      selectedRequests.map((request) =>
        deleteMutation.mutateAsync(request.id)
      )
    );

    setSelectedRequests([]);
  } catch (error) {
    console.error('일괄 삭제 실패:', error);
    toast.error('일부 구매 요청을 삭제하지 못했습니다.');
  }
  };

  const handleExport = () => {
    const selectedIds = selectedRequests.map(request => request.id);

    purchaseApi.exportRequests({
      ...filters,
      ids: selectedIds,
    });
    if(selectedRequests.length > 0)
      toast.success(`${selectedRequests.length}건을 Excel로 다운로드했습니다.`);
    else
      toast.success(`모든 구매 요청을 Excel로 다운로드했습니다.`);
  };

const handleBulkApprove = async () => {
  const requestIds = selectedRequests.map((request) => request.id);

  if(!window.confirm(`${requestIds.length}건을 일괄 승인하시겠습니까?`))
    return;

  try{
    const result = await purchaseApi.bulkUpdateStatus({request_ids: requestIds,status: 'COMPLETED'});

    toast.success(result.message || `${result.updated_count}건이 일괄 승인되었습니다.`);
    setSelectedRequests([]);
    refetch();
  } catch (error:any) {
    console.error('일괄 승인 실패:', error.response?.data || error);
    toast.error(error.response?.data?.detail ||'일부 구매 요청을 승인하지 못했습니다.',{style:{whiteSpace: 'pre-line'}});
  }
};

const handleBulkReject = async () => {
  const requestIds = selectedRequests.map((request) => request.id);

  if(!window.confirm(`${requestIds.length}건을 일괄 거부하시겠습니까?`))
    return;

  try{
    const result = await purchaseApi.bulkUpdateStatus({request_ids: requestIds,status: 'CANCELLED'});

    toast.success(result.message || `${result.updated_count}건이 일괄 반려되었습니다.`);
    setSelectedRequests([]);
    refetch();
  } catch (error:any) {
    console.error('일괄 반려 실패:', error.response?.data || error);
    toast.error(error.response?.data?.detail ||'일부 구매 요청을 반려하지 못했습니다.',{style:{whiteSpace: 'pre-line'}});
  }
};

// 구매완료,구매반려 상태를 다시 구매요청 상태로 변경
const handleBulkReset = async () => {
  const requestIds = selectedRequests.map((request) => request.id);

  if(!window.confirm(`${requestIds.length}건을 일괄 재상신하시겠습니까?`))
    return;

  try{
    const result = await purchaseApi.bulkStatusReset({request_ids: requestIds, status: 'SUBMITTED'});

    toast.success(result.message || `${result.updated_count}건이 일괄 재상신되었습니다.`);
    setSelectedRequests([]);
    refetch();
  } catch (error:any) {
    console.error('일괄 재상신 실패:', error.response?.data || error);
    toast.error(error.response?.data?.detail ||'일부 구매 요청을 재상신하지 못했습니다.',{style:{whiteSpace: 'pre-line'}});
  }
};

  // 🔥 개선된 새로고침 함수
  const handleRefresh = async () => {
    try {
      // 순차적으로 새로고침 (동시성 문제 방지)
      await queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await queryClient.invalidateQueries({ queryKey: ['purchase-requests-stats'] });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await refetch();
    } catch (error) {
      console.error('새로고침 중 오류:', error);
      toast.error('새로고침 중 오류가 발생했습니다.');
    }
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
    handleRefresh();
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const handleExcelSuccess = () => {
    setIsExcelModalOpen(false);
    handleRefresh();
  };

  const handlePurchaseComplete = (request: PurchaseRequest) => {
    console.log('🔄 구매완료 처리 요청:', request);
    setConfirmingItem(request);
  };

  // 🔥 개선된 구매완료 확인 함수
  const confirmPurchaseComplete = async () => {
    if (!confirmingItem) return;
    
    console.log('🆕 구매완료 + 품목등록 처리 시작');
    
    try {
      // 중복 클릭 방지
      if (completePurchaseMutation.isPending) {
        console.log('⚠️ 이미 처리 중입니다.');
        return;
      }
      
      setIsCheckingSimilarItems(true);
      const response = await inventoryApi.getItems(1, 1000, {}, {
        sort_by: 'item_name',
        sort_order: 'asc',
      });
      const inventoryItems: UnifiedInventoryItem[] = response?.data?.items || [];
      const matchingItems = inventoryItems.filter(item =>
        Boolean(normalizeInventoryName(confirmingItem.item_name))
        && normalizeInventoryName(item.item_name) === normalizeInventoryName(confirmingItem.item_name)
      );
      const candidates = Array.from(matchingItems.reduce((byCode, item) => {
        const code = (item.item_code || '').trim().toLocaleUpperCase('en-US');
        const existing = byCode.get(code);
        if (!existing) byCode.set(code, { ...item });
        else {
          existing.current_quantity = (Number(existing.current_quantity) || 0) + (Number(item.current_quantity) || 0);
          existing.total_received = (Number(existing.total_received) || 0) + (Number(item.total_received) || 0);
        }
        return byCode;
      }, new Map<string, UnifiedInventoryItem>()).values());

      if (candidates.length > 0) {
        setPendingCompletionRequest(confirmingItem);
        setSimilarInventoryItems(candidates);
        setConfirmingItem(null);
        return;
      }

      await completePurchaseMutation.mutateAsync({
        requestId: confirmingItem.id,
        requestData: confirmingItem,
      });
      
    } catch (error) {
      // 이미 onError에서 처리됨
      console.log('구매완료 처리가 실패했습니다.');
      toast.error('기존 품목 확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsCheckingSimilarItems(false);
    }
  };

  const cancelPurchaseComplete = () => {
    setConfirmingItem(null);
  };

  // 데이터 추출
  const requests = requestsData?.data?.items || [];
  const totalPages = requestsData?.data?.pages || 0;
  const totalItems = requestsData?.data?.total || 0;
  const stats = statsData?.data || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    this_month: 0,
  };

  // 🔥 통계 계산 (실제 API 데이터와 현재 데이터 모두 사용)
  const totalRequests = stats?.total || requests.length || 0;
  const completedRequests = stats?.approved || requests.filter(req => req.status === 'COMPLETED').length || 0;
  const pendingRequests = stats?.pending || requests.filter(req => req.status === 'SUBMITTED' || req.status === 'PENDING').length || 0;
  const rejectedRequests = stats?.rejected || requests.filter(req => req.status === 'CANCELLED' || req.status === 'REJECTED').length || 0;

  if (isLoading && !requestsData) {
    return <LoadingSpinner text="구매 요청 데이터를 불러오는 중..." />;
  }

  if (error) {
    console.error('Purchase requests error:', error);
    return (
      <Container>
        <PageHeader>
          <PageTitle>구매 요청 관리</PageTitle>
        </PageHeader>
        <Card>
          <ErrorContainer>
            <AlertCircle size={48} className="error-icon" />
            <div className="error-title">데이터를 불러올 수 없습니다</div>
            <div className="error-message">
              백엔드 서버가 실행되지 않았거나 구매 요청 API가 구현되지 않았습니다.
              <br />
              서버 상태를 확인해주세요.
            </div>
            <Button onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw size={16} />
              다시 시도
            </Button>
          </ErrorContainer>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>구매 요청 관리</PageTitle>
        <PageSubtitle>
          구매 요청을 등록하고 승인 프로세스를 관리할 수 있습니다.
          {totalItems > 0 && ` 총 ${totalItems.toLocaleString()}건의 요청이 있습니다.`}
        </PageSubtitle>
      </PageHeader>

      {/* 🎨 개선된 통계 카드 (두 번째 코드 스타일) */}
      <StatsContainer>
        <StatCard $color="#3b82f6">
          <div className="stat-header">
            <FileText size={24} />
            <span>전체 요청</span>
          </div>
          <div className="stat-value">{totalRequests.toLocaleString()}</div>
          <div className="stat-label">총 구매 요청</div>
          {stats.this_month > 0 && (
            <div className="stat-change positive">
              이번 달 +{stats.this_month}
            </div>
          )}
        </StatCard>

        <StatCard $color="#f59e0b">
          <div className="stat-header">
            <Clock size={24} />
            <span>승인 대기</span>
          </div>
          <div className="stat-value">{pendingRequests.toLocaleString()}</div>
          <div className="stat-label">처리 대기중</div>
        </StatCard>

        <StatCard $color="#10b981">
          <div className="stat-header">
            <Check size={24} />
            <span>승인 완료</span>
          </div>
          <div className="stat-value">{completedRequests.toLocaleString()}</div>
          <div className="stat-label">승인된 요청</div>
        </StatCard>

        <StatCard $color="#ef4444">
          <div className="stat-header">
            <X size={24} />
            <span>거절됨</span>
          </div>
          <div className="stat-value">{rejectedRequests.toLocaleString()}</div>
          <div className="stat-label">거절된 요청</div>
        </StatCard>
      </StatsContainer>

      <ContentCard>
        <FilterSection>
          <FilterContainer>
            <PurchaseRequestFilters onFilter={handleFilterChange} />

            <ActionButtons>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  style={{ opacity: 1}}
                >
                선택 {selectedRequests.length}건
                </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={selectedRequests.length === 0}
                onClick={handleBulkDelete}
              >
                선택 삭제
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={requests.length === 0}
                onClick={() => setSelectedRequests(previous => [...previous, ...requests.filter(req => !previous.some(selected => selected.id === req.id))])}
              >
                전체 선택
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedRequests.length === 0}
                 onClick={() => setSelectedRequests([])}
              >
                선택 해제
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedRequests.length === 0}
                onClick={handleBulkApprove}
              >
                승인
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={selectedRequests.length === 0}
                onClick={handleBulkReject}
              >
                반려
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={requests.length === 0}
                onClick={handleBulkReset}
              >
                재상신
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                size="sm"
                title="새로고침"
              >
                <RefreshCw size={16} />
                <span>새로고침</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleExport}
                //disabled={selectedRequests.length === 0}
                //disabled={exportMutation.isPending}
                //loading={exportMutation.isPending}
                size="sm"
                title="Excel 다운로드"
              >
                <Download size={16} />
                <span>Excel 다운로드</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExcelModalOpen(true)}
                size="sm"
                title="Excel 일괄 업로드"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  borderColor: '#10b981'
                }}
              >
                <Upload size={16} />
                <span>Excel 업로드</span>
              </Button>
              <Button 
                onClick={() => setIsFormModalOpen(true)}
                size="sm"
                title="구매 요청 추가"
              >
                <Plus size={16} />
                <span>구매 요청</span>
              </Button>
            </ActionButtons>
          </FilterContainer>
        </FilterSection>

        {/* 테이블 컨테이너 */}
        <TableContainer>
          {requests.length === 0 && !isLoading ? (
            <EmptyState>
              <FileText size={48} className="empty-icon" />
              <div className="empty-title">등록된 구매 요청이 없습니다</div>
              <div className="empty-message">
                새로운 구매 요청을 등록하여 시작해보세요.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button onClick={() => setIsFormModalOpen(true)}>
                  <Plus size={16} />
                  개별 등록
                </Button>
                <Button variant="outline" onClick={() => setIsExcelModalOpen(true)}>
                  <Upload size={16} />
                  Excel 업로드
                </Button>
              </div>
            </EmptyState>
          ) : (
            <>
              <Table
                columns={columns}
                data={requests}
                loading={isLoading}
                emptyMessage="검색 조건에 맞는 구매 요청이 없습니다."
                selectable
                selectedItems={selectedRequests}
                onSelectItems={setSelectedRequests}
              />

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </TableContainer>
      </ContentCard>

      {/* 구매 요청 등록/수정 모달 */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        title={editingRequest ? '구매 요청 수정' : '새 구매 요청 등록'}
        size="xl"
      >
        <PurchaseRequestForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialData={editingRequest || undefined}
          isEdit={!!editingRequest}
        />
      </Modal>

      {/* Excel 일괄 업로드 모달 */}
      <ExcelBulkUpload
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelSuccess}
      />

      {/* 상세보기 모달 */}
      {viewingRequest && (
        <RequestDetailModal
          request={viewingRequest}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewingRequest(null);
          }}
          onEdit={() => {
            setEditingRequest(viewingRequest);
            setIsFormModalOpen(true);
            setIsDetailModalOpen(false);
            setViewingRequest(null);
          }}
        />
      )}

      {/* 🔥 구매완료 확인 다이얼로그 (첫 번째 코드 스타일) */}
      <Modal
        isOpen={Boolean(pendingCompletionRequest)}
        onClose={() => {
          setPendingCompletionRequest(null);
          setSimilarInventoryItems([]);
        }}
        title="동일 품목 확인"
        size="lg"
      >
        <div style={{ marginBottom: '18px', color: '#4b5563', lineHeight: 1.6 }}>
          같은 품목명으로 등록된 모든 품목코드입니다. 수령관리에서 재고를 누적할 품목코드를 선택하세요.
          선택하면 품목관리에도 해당 품목코드로 새 등록 기록이 추가됩니다.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {similarInventoryItems.map(item => {
            const exactMatch = true;
            return (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
                padding: '16px', border: exactMatch ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '8px', background: exactMatch ? '#eff6ff' : '#fff'
              }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                    {item.item_name}{' '}
                    {exactMatch && <span style={{ color: '#2563eb', fontSize: '0.8rem' }}>(동일 품목)</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    코드: {item.item_code} · 브랜드: {item.brand || '-'}<br />
                    규격/모델: {item.specifications || '-'} · 단위: {item.unit}<br />
                    현재 재고: {(item.current_quantity || 0).toLocaleString()} / 구매 수량:{' '}
                    {(pendingCompletionRequest?.quantity || 0).toLocaleString()}
                  </div>
                </div>
                <Button
                  onClick={() => pendingCompletionRequest && completePurchaseMutation.mutate({
                    requestId: pendingCompletionRequest.id,
                    requestData: pendingCompletionRequest,
                    existingItem: item,
                  })}
                  loading={completePurchaseMutation.isPending}
                  disabled={completePurchaseMutation.isPending}
                >
                  이 품목코드로 등록
                </Button>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
          <Button variant="secondary" onClick={() => {
            setPendingCompletionRequest(null);
            setSimilarInventoryItems([]);
          }} disabled={completePurchaseMutation.isPending}>
            취소
          </Button>
          <Button variant="outline" onClick={() => pendingCompletionRequest && completePurchaseMutation.mutate({
            requestId: pendingCompletionRequest.id,
            requestData: pendingCompletionRequest,
          })} loading={completePurchaseMutation.isPending} disabled={completePurchaseMutation.isPending}>
            별도 새 품목으로 등록
          </Button>
        </div>
      </Modal>

      {confirmingItem && (
        <ConfirmDialog onClick={cancelPurchaseComplete}>
          <ConfirmContent onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <Package2 size={32} />
            </div>
            
            <div className="confirm-title">구매완료 + 품목등록</div>
            
            <div className="confirm-message">
              아래 구매 요청을 완료하고 품목관리에 등록하시겠습니까?
            </div>
            
            <div className="confirm-message" style={{ color: '#10b981', fontWeight: 'bold' }}>
              ✨ 1) 구매 요청 상태를 '완료'로 변경<br/>
              ✨ 2) 품목관리에 자동 등록 후 해당 페이지로 이동
            </div>
            
            <div className="item-info">
              <div className="info-row">
                <span className="label">품목명:</span>
                <span className="value">{confirmingItem.item_name}</span>
              </div>
              <div className="info-row">
                <span className="label">수량:</span>
                <span className="value" style={{ display: 'inline', whiteSpace: 'nowrap' }}>
                  {confirmingItem.quantity}&nbsp;{confirmingItem.unit || '개'}
                </span>
              </div>
              <div className="info-row">
                <span className="label">요청자:</span>
                <span className="value">{confirmingItem.requester_name}</span>
              </div>
              <div className="info-row">
                <span className="label">부서:</span>
                <span className="value">{confirmingItem.department}</span>
              </div>
              {confirmingItem.total_budget && (
                <div className="info-row">
                  <span className="label">예산:</span>
                  <span className="value">{confirmingItem.total_budget.toLocaleString()}원</span>
                </div>
              )}
              <div className="info-row">
                <span className="label">생성될 품목코드:</span>
                <span className="value" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                  ITM-{new Date().toISOString().split('T')[0].replace(/-/g, '')}-{confirmingItem.id.toString().padStart(4, '0')}
                </span>
              </div>
            </div>
            
            <div className="button-group">
              <Button 
                variant="outline" 
                onClick={cancelPurchaseComplete}
                size="lg"
              >
                취소
              </Button>
              <Button 
                onClick={confirmPurchaseComplete}
                size="lg"
                loading={completePurchaseMutation.isPending || isCheckingSimilarItems}
                disabled={completePurchaseMutation.isPending || isCheckingSimilarItems}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none'
                }}
              >
                <Package2 size={18} />
                구매완료 + 품목등록
              </Button>
            </div>
          </ConfirmContent>
        </ConfirmDialog>
      )}
    </Container>
  );
};

export default PurchaseRequestPage;
