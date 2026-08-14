// client/src/types/index.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  success?: boolean;
  message?: string;
}

export interface SearchFilters {
  search?: string;
  status?: string;
  category?: string;
  department?: string;
  supplier?: string;
  urgency?: string;
  dateFrom?: string;
  dateTo?: string;
  is_active?: boolean;
  stock_status?: 'normal' | 'low_stock' | 'out_of_stock' | 'overstocked';
  min_budget?: number;
  max_budget?: number;
  requester_name?: string;
  project?: string;
  budget_code?: string;
}

// 구매 요청 관련 타입들
export interface PurchaseRequest {
  id: number;
  requestNumber?: string;
  itemName: string;
  specifications?: string;
  quantity: number;
  estimatedPrice?: number;
  totalBudget?: number;
  preferredSupplier?: string;
  category: ItemCategory;
  urgency: UrgencyLevel;
  status: RequestStatus;
  justification: string;
  department: string;
  project?: string;
  budgetCode?: string;
  expectedDeliveryDate?: string;
  purchaseMethod?: PurchaseMethod;
  requesterName: string;
  requesterEmail?: string;
  requestDate: string;
  approvedDate?: string;
  approverName?: string;
  approverComments?: string;
  attachments?: PurchaseAttachment[];
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseRequestFormData {
  itemName: string;
  specifications: string;
  quantity: number;
  estimatedPrice: number;
  preferredSupplier: string;
  category: ItemCategory;
  urgency: UrgencyLevel;
  justification: string;
  department: string;
  project?: string;
  budgetCode?: string;
  expectedDeliveryDate?: string;
  purchaseMethod: PurchaseMethod;
  attachments?: File[];
}

export interface PurchaseAttachment {
  id: number;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  downloadUrl: string;
}

export interface PurchaseRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  in_review?: number;
  thisMonth: number;
  thisWeek?: number;
  totalBudget?: number;
  pendingBudget?: number;
  averageProcessingTime?: number; // 일 단위
  topCategories?: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  topDepartments?: Array<{
    department: string;
    count: number;
    budget: number;
  }>;
}

export interface ApprovalRequest {
  requestId: number;
  action: 'approve' | 'reject';
  comments?: string;
  approver_name?: string;
  approver_email?: string;
  approval_date?: string;
}

// 열거형 타입들
export type RequestStatus = 
  | 'SUBMITTED'    // 요청됨
  | 'COMPLETED'    // 구매완료
  | 'CANCELLED';   // 취소됨

export type UrgencyLevel = 
  | 'low'             // 낮음
  | 'normal'          // 보통
  | 'high'            // 높음
  | 'urgent';         // 긴급

export type ItemCategory = 
  | 'IT 관련 장비'                // IT 하드웨어 (PC/노트북/서버)
  | '사무 용품'                   // 사무용 가구 (책상/의자/캐비닛)
  | '제조 장비'                   // 제조 장비
  | '소모품'                     // 소모품 (일반)
  | '아이템'                     // 홍보/마케팅 용품
  | '기타';                      // 기타

export type PurchaseMethod = 
  | 'direct'          // 직접구매
  | 'quotation'       // 견적요청
  | 'contract'        // 계약
  | 'framework'       // 단가계약
  | 'marketplace'     // 마켓플레이스
  | 'auction'         // 경매
  | 'tender';         // 입찰

// 라벨 매핑
export const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: '요청됨',
  COMPLETED: '구매완료', 
  CANCELLED: '취소됨',
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  urgent: '긴급',
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  'IT 관련 장비': "IT 관련 장비",
  '사무 용품': "사무 용품",
  '제조 장비': "제조 장비",
  '소모품': "소모품",
  '아이템': "아이템",
  '기타': "기타"
};

export const METHOD_LABELS: Record<PurchaseMethod, string> = {
  direct: '직접구매',
  quotation: '견적요청',
  contract: '계약',
  framework: '단가계약',
  marketplace: '마켓플레이스',
  auction: '경매',
  tender: '입찰',
};

// 재고 관리 관련 타입들
export interface InventoryItem {
  id: number;
  // item_code: string;
  item_name: string;
  category?: string;
  brand?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit_price?: number;
  currency: string;
  supplier_name?: string;
  supplier_contact?: string;
  location?: string;
  warehouse?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface InventoryStats {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_value: number;
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recent_activities: Array<{
    id: number;
    type: 'stock_in' | 'stock_out' | 'stock_update';
    item_name: string;
    quantity: number;
    date: string;
    user: string;
  }>;
}

// 수령 관리 관련 타입들
export interface Receipt {
  id: number;
  receiptNumber: string;
  purchaseRequestId?: number;
  itemName: string;
  expectedQuantity: number;
  receivedQuantity: number;
  receiverName: string;
  receiverEmail?: string;
  department: string;
  receivedDate: string;
  location?: string;
  condition?: 'excellent' | 'good' | 'damaged' | 'defective';
  notes?: string;
  attachments?: ReceiptAttachment[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReceiptAttachment {
  id: number;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  downloadUrl: string;
}

// 업로드 관련 타입들
export interface UploadResult {
  success: boolean;
  created_count: number;
  updated_count?: number;
  failed_count?: number;
  request_numbers?: string[];
  // item_codes?: string[];
  errors?: Array<{
    row: number;
    field: string;
    message: string;
    value?: any;
  }>;
  warnings?: Array<{
    row: number;
    field: string;
    message: string;
    value?: any;
  }>;
  message?: string;
  processing_time?: number; // 초 단위
}

export interface UploadTemplate {
  name: string;
  description: string;
  columns: Array<{
    name: string;
    required: boolean;
    type: 'string' | 'number' | 'date' | 'boolean';
    format?: string;
    example?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      options?: string[];
    };
  }>;
  sample_data: Record<string, any>[];
  max_rows: number;
  supported_formats: string[];
}

// 테이블 컴포넌트 관련 타입들
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 모달 관련 타입들
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  className?: string;
}

// 폼 관련 타입들
export interface FormFieldProps {
  label?: string;
  name: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// 알림 관련 타입들
export interface NotificationItem {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

// 대시보드 관련 타입들
export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  newItemsThisMonth: number;
  recentPurchases: number;
  pendingRequests: number;
  recentActivities: Array<{
    id: number;
    description: string;
    createdAt: string;
    type: string;
    icon?: string;
    color?: string;
  }>;
}

// 사용자 관련 타입들
export interface User {
  id: number;
  email: string;
  name: string;
  department?: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  permissions?: string[];
}

// 공급업체 관련 타입들
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  categories: string[];
  rating?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// 예산 관리 관련 타입들
export interface Budget {
  id: number;
  code: string;
  name: string;
  department: string;
  totalAmount: number;
  usedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'suspended';
  approver?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BudgetUsage {
  id: number;
  budgetId: number;
  purchaseRequestId: number;
  amount: number;
  description: string;
  usageDate: string;
  approvedBy?: string;
}

// 로그 관련 타입들
export interface SystemLog {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  module: string;
  userId?: number;
  userName?: string;
  action?: string;
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  resource: string;
  resourceId?: number;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// 통계 관련 타입들
export interface StatisticsData {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  data: Array<{
    date: string;
    value: number;
    label?: string;
    metadata?: Record<string, any>;
  }>;
  summary: {
    total: number;
    average: number;
    growth?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

// 설정 관련 타입들
export interface SystemSettings {
  id: number;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
  updatedBy?: number;
  updatedAt?: string;
}

export interface UserPreferences {
  userId: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  timezone: string;
  dateFormat: string;
  currency: string;
  itemsPerPage: number;
  notifications: {
    email: boolean;
    browser: boolean;
    lowStock: boolean;
    pendingApprovals: boolean;
    systemUpdates: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

// API 응답 관련 타입들
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  timestamp: string;
  path?: string;
  method?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface BatchOperationResult<T> {
  success: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{
    id?: number;
    status: 'success' | 'error' | 'skipped';
    data?: T;
    error?: string;
  }>;
  errors: ValidationError[];
  processingTime: number;
}

// 파일 관련 타입들
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
  preview?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number;
  timeRemaining?: number;
}

// 검색 관련 타입들
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: SearchFilters;
  facets?: Record<string, Array<{
    value: string;
    count: number;
    selected: boolean;
  }>>;
  suggestions?: string[];
  processingTime: number;
}

export interface AdvancedSearchQuery {
  query?: string;
  filters: SearchFilters;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  facets?: string[];
  highlight?: boolean;
  fuzzy?: boolean;
}

// 권한 관련 타입들
export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  category: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 워크플로우 관련 타입들
export interface WorkflowStep {
  id: number;
  name: string;
  description?: string;
  type: 'approval' | 'review' | 'notification' | 'action';
  assigneeType: 'user' | 'role' | 'department';
  assignee: string;
  conditions?: Record<string, any>;
  autoApprove?: boolean;
  timeLimit?: number; // 시간 (시간 단위)
  escalation?: {
    enabled: boolean;
    timeLimit: number;
    assignee: string;
  };
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  category: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkflowInstance {
  id: number;
  workflowId: number;
  resourceType: string;
  resourceId: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  currentStep: number;
  startedAt: string;
  completedAt?: string;
  steps: Array<{
    stepId: number;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped';
    assignee: string;
    startedAt?: string;
    completedAt?: string;
    comments?: string;
    attachments?: string[];
  }>;
}

// 내보내기/가져오기 관련 타입들
export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf' | 'json';
  fields?: string[];
  filters?: SearchFilters;
  includeHeaders: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  template?: string;
}

export interface ImportOptions {
  format: 'xlsx' | 'csv' | 'json';
  hasHeaders: boolean;
  delimiter?: string;
  encoding?: string;
  mapping?: Record<string, string>;
  validation?: {
    strict: boolean;
    skipErrors: boolean;
    maxErrors: number;
  };
}

// 알림 템플릿 관련 타입들
export interface NotificationTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'system';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 캐시 관련 타입들
export interface CacheInfo {
  key: string;
  value: any;
  expiry: number;
  size: number;
  hits: number;
  misses: number;
  lastAccessed: string;
}

// 헬스체크 관련 타입들
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
    metadata?: Record<string, any>;
  }>;
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      load: number[];
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// 기본 내보내기
// export default {
//   // 주요 타입들을 그룹별로 내보내기
//   Purchase: {
//     PurchaseRequest,
//     PurchaseRequestFormData,
//     PurchaseRequestStats,
//     ApprovalRequest,
//     PurchaseAttachment,
//   },
//   Inventory: {
//     InventoryItem,
//     InventoryStats,
//   },
//   Upload: {
//     UploadResult,
//     UploadTemplate,
//     UploadProgress,
//   },
//   Common: {
//     ApiResponse,
//     PaginatedResponse,
//     SearchFilters,
//     TableColumn,
//     ModalProps,
//     SelectOption,
//   },
// };
