// client/src/components/dashboard/DashboardPage.tsx
import React ,{useState} from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import {  
  ClipboardList, 
  CheckCircle, 
  Clock, 
  PackageCheck,
  Clock10Icon,
  AlertTriangle 
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { dashboardApi } from '../../services/api';
import Table from '../common/Table';
import { TableColumn } from '../../types';
import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip, Legend, BarChart} from 'recharts';

interface DashboardPurchaseRequest {
  id: number;
  itemName: string;
  quantity: number;
  requesterName: string;
  status: string;
  requestDate: string | null;
  totalBudget: number | null;
  currency: string;
}

const recentPurchaseColumns: TableColumn<DashboardPurchaseRequest>[] = [
  {
    key: 'itemName',
    label: '품목명',
    width: '180px',
    render: (value) => (
      <span style={{ fontWeight: 600 }}>
        {value || '품목명 없음'}
      </span>
    ),
  },
  {
    key: 'quantity',
    label: '수량',
    width: '70px',
    render: (value) => value ?? '-',
  },
  {
    key: 'requesterName',
    label: '요청자',
    width: '90px',
    render: (value) => value || '-',
  },
  {
    key: 'requestDate',
    label: '요청일',
    width: '110px',
    render: (value) =>
      value ? new Date(value).toLocaleDateString('ko-KR') : '-',
  },
  {
      key: 'totalBudget',
      label: '예상금액',
      width: '130px',
      render: (value, item) => {
        if (!value || value === 0) return '-';
        const currency = item.currency || '원';
        return `${currency} ${value.toLocaleString()}`;
      },
    },
];
const RecentRequestTableArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const Container = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(Card)<{ color: string }>`
  background: linear-gradient(135deg, ${props => props.color}15 0%, ${props => props.color}05 100%);
  border-left: 4px solid ${props => props.color};
  
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  .stat-icon {
    padding: 12px;
    border-radius: 50%;
    background: ${props => props.color}20;
    color: ${props => props.color};
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.color};
    margin-bottom: 5px;
  }
  
  .stat-label {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    margin-top: 8px;
    
    &.positive {
      color: ${props => props.theme.colors.success};
    }
    
    &.negative {
      color: ${props => props.theme.colors.error};
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const RecentActivity = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 520px;

  .activity-header {
    flex-shrink: 0;
    margin-bottom: 20px;
  }
`;
const TotalDashboardChart = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 520px;

  .activity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
    margin-bottom: 20px;
  }

  .chart-tabs {
    display: flex;
    gap: 6px;
  }

  .chart-tab {
    border: 0;
    border-radius: 6px;
    padding: 7px 10px;
    cursor: pointer;
    background: #f3f4f6;
    color: #6b7280;
  }

  .chart-tab.active {
    background: #3b82f6;
    color: white;
  }
`;

const CategoryDashboardChart = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 520px;

  .activity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
    margin-bottom: 20px;
  }

  .chart-tabs {
    display: flex;
    gap: 6px;
  }

  .chart-tab {
    border: 0;
    border-radius: 6px;
    padding: 7px 10px;
    cursor: pointer;
    background: #f3f4f6;
    color: #6b7280;
  }

  .chart-tab.active {
    background: #3b82f6;
    color: white;
  }
`;

const categoryColors: Record<CategoryChartTab, string> = {
  OFFICE_SUPPLIES: '#3B82F6',
  ELECTRONICS: '#8B5CF6',
  FURNITURE: '#10B981',
  SOFTWARE: '#F59E0B',
  MAINTENANCE: '#EF4444',
  SERVICES: '#06B6D4',
  OTHER: '#6B7280',
};

type TotalChartTab = 'monthly_total' | `other:${string}`;

interface TotalChartTabItem {
  key: TotalChartTab;
  label: string;
  itemName?: string;
}



type CategoryChartTab = 'OFFICE_SUPPLIES' | 'ELECTRONICS' | 'FURNITURE' | 'SOFTWARE'| 'MAINTENANCE' | 'SERVICES' | 'OTHER';

const CategoryChartTabs: { key: CategoryChartTab; label: string }[] = [
  { key: 'OFFICE_SUPPLIES', label: '사무용품' },
  { key: 'ELECTRONICS', label: 'IT 장비' },
  { key: 'FURNITURE', label: '가구' },
  { key: 'SOFTWARE', label: '소프트웨어' },
  { key: 'MAINTENANCE', label: '유지보수' },
  { key: 'SERVICES', label: '서비스' },
  { key: 'OTHER', label: '기타' },
];
const DashboardPage: React.FC = () => {
  //const [TotalactiveChart, setTotalActiveChart] = useState<TotalChartTab>('monthly_total');
  const [CategoryactiveChart, setCategoryActiveChart] = useState<CategoryChartTab[]>(['OFFICE_SUPPLIES']);
  const [TotalactiveChart, setTotalActiveChart] = useState<TotalChartTab>('monthly_total');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 5 * 60 * 1000, // 5분마다 새로고침
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5분
  });

const statusLabel: Record<string, string> = {
  SUBMITTED: '요청됨',
  COMPLETED: '구매 완료',
  CANCELLED: '취소됨',
};

  console.log('Dashboard data:', { stats, isLoading, error }); // 디버깅용

  if (isLoading) {
    return <LoadingSpinner text="대시보드 데이터를 불러오는 중..." />;
  }

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertTriangle size={48} style={{ color: '#EF4444', marginBottom: '16px' }} />
            <h3>데이터를 불러올 수 없습니다</h3>
            <p style={{ marginBottom: '20px' }}>대시보드 데이터를 불러오는 중 오류가 발생했습니다.</p>
            <Button onClick={() => window.location.reload()}>
              새로고침
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const toggleCategory = (category: CategoryChartTab) => {
  setCategoryActiveChart((previous) => previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category]);
};

  // 백엔드에서 받은 데이터 또는 기본값 사용
  const dashboardStats = stats?.data || {};

  interface MonthlyAmount {
  month: string;
  amount: number;
  category?: string;
  }

  const fillMissingMonths = (rows: MonthlyAmount[]) => {
  const amountByMonth = new Map(
    rows.map((row) => [row.month, Number(row.amount)])
  );
  
  const currentMonth = new Date().getMonth() + 1;

  return Array.from({ length: currentMonth }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');

    return {
      month,
      amount: amountByMonth.get(month) ?? 0,
    };
  });
  };

  const thisMonthOtherItems =
  dashboardStats?.this_month_other_items ?? [];

  const otherItemMonthlyAmounts =
    dashboardStats?.other_item_monthly_amounts ?? [];
    
  const TotalChartTabs: TotalChartTabItem[] = [
    { key: 'monthly_total', label: '전체' },

    ...thisMonthOtherItems.map((itemName) => ({
      key: `${itemName}` as TotalChartTab,
      label: itemName,
      itemName,
    })),
  ]; 

  const activeTab = TotalChartTabs.find(tab => tab.key === TotalactiveChart);

  const selectedItemName = activeTab?.itemName || null;

  const TotalChartData = fillMissingMonths(dashboardStats?.monthlyPurchaseAmounts || []);

  const chartData= selectedItemName ? otherItemMonthlyAmounts.find(item => item.item_name === selectedItemName)?.monthly_amounts ?? [] : TotalChartData;
  
  const CategoryChartData = Array.from({ length: new Date().getMonth() + 1 },(_, index) => {

    const month = String(index + 1).padStart(2, '0');
    const row: Record<string, string | number> = { month };

    CategoryactiveChart.forEach((category) => {
      const item = (dashboardStats?.monthlyCategoryPurchaseAmounts || []).find((data: { month: string; category: string }) =>data.month === month && data.category === category);

      row[category] = Number(item?.amount ?? 0);
    });

    return row;
  }
  );

  return (
    <Container>
      <PageTitle>대시보드</PageTitle>
      <PageSubtitle>시스템 현황을 한눈에 확인하세요.</PageSubtitle>

      <StatsGrid>
        <StatCard color="#3B82F6">
          <a href="/purchase-requests" className="stat-header">
            <div>
              <div className="stat-value">{dashboardStats?.submittedPurchaseRequests || 0}</div>
              <div className="stat-label">구매 요청</div>
            </div>
            <div className="stat-icon">
              <ClipboardList size={24} />
            </div>
          </a>
        </StatCard>

        <StatCard color="#10B981">
          <a href="/inventory" className="stat-header">
            <div>
              <div className="stat-value">{dashboardStats?.completedPurchaseRequests || 0}</div>
              <div className="stat-label">구매 완료</div>
            </div>
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
          </a>
        </StatCard>

        <StatCard color="#F59E0B">
          <a href="/inventory" className="stat-header">
            <div>
              <div className="stat-value">{dashboardStats?.unreceiptUnifiedInventory || 0}</div>
              <div className="stat-label">수령 대기</div>
            </div>
            <div className="stat-icon">
              <Clock size={24} />
            </div>
          </a>
        </StatCard>

        <StatCard color="#8B5CF6">
          <a href="/inventory" className="stat-header">
            <div>
              <div className="stat-value">{dashboardStats?.receiptUnifiedInventory || 0}</div>
              <div className="stat-label">수령 완료</div>
            </div>
            <div className="stat-icon">
              <PackageCheck size={24} />
            </div>
          </a>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <RecentActivity>
          <div className="activity-header">
            <h3>구매 요청 목록</h3>
          </div>
          <RecentRequestTableArea>
            <Table
            columns={recentPurchaseColumns}
            data={dashboardStats?.recentPurchaseRequests || []}
            emptyMessage='구매 요청이 없습니다.'  
            />
          </RecentRequestTableArea>
        </RecentActivity>

        <TotalDashboardChart>
          <div className="activity-header">
            <h3>
              {'월별 전체 구매금액'}
            </h3>
            <div className="chart-tabs">
              {TotalChartTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`chart-tab ${TotalactiveChart === tab.key ? 'active' : ''}`}
                  onClick={() => setTotalActiveChart(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{flex:1,minHeight:0}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(month) => `${month}월`} tickMargin={15} />
                <YAxis tickFormatter={(amount) => `₩${(amount / 10000).toLocaleString()}만`} />
                <Tooltip formatter={(amount:number) => `₩${amount.toLocaleString('ko-KR')}` } labelFormatter={(month) => `${month}월`} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="구매금액" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TotalDashboardChart>
      </ContentGrid><br></br>
      <CategoryDashboardChart>
          <div className="activity-header">
            <h3>
              {`카테고리 구매금액`}
            </h3>
            <div className="chart-tabs">
              {CategoryChartTabs.map((tab) => (
                <label key={tab.key} className='chart-tab'>
                  <input
                    type="checkbox"
                    checked={CategoryactiveChart.includes(tab.key)}
                    onChange={() => toggleCategory(tab.key)}
                  />
                {tab.label}
                </label>
              ))}
            </div>
          </div>
          
          <div style={{flex:1,minHeight:0}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={CategoryChartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(month) => `${month}월`} tickMargin={15} />
                <YAxis tickFormatter={(amount) => `₩${(amount / 10000).toLocaleString()}만`} />
                <Tooltip formatter={(amount:number) => `₩${amount.toLocaleString('ko-KR')}` } labelFormatter={(month) => `${month}월`} />
                <Legend />
                {CategoryactiveChart.map((category) => (
                  <Line key={category} type="monotone" dataKey={category} name={CategoryChartTabs.find((tab) => tab.key === category)?.label} stroke={categoryColors[category]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CategoryDashboardChart>
    </Container>
  );
};

export default DashboardPage;