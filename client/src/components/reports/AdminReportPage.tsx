import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Button from '../common/Button';
import Card from '../common/Card';
import { holidayApi, KoreanHoliday, LeavesApi, ReportWithEmployee, reportApi } from '../../services/api';
import AdminReportList from './AdminReportList';

// 기존 휴가 API가 반환하는 캘린더 일정의 표시 필드
interface LeaveEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

// 보고서 API에 전달할 로컬 날짜를 YYYY-MM-DD 형식으로 변환
const formatReportDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 오늘과 이번 주 월요일을 관리자 보고서 조회 기준일로 계산
const getAdminReportDates = () => {
  const today = new Date();
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  );

  return {
    dailyPeriodStart: formatReportDate(today),
    weeklyPeriodStart: formatReportDate(monday),
  };
};

// 관리자 화면의 바깥 여백을 지정하는 스타일
const Container = styled.div`
  padding: 20px;
`;

// 뒤로 가기 버튼과 보고서 탭 사이의 여백을 지정하는 스타일
const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// 주간 보고서와 같은 월~금 달력 및 공휴일·휴가 표시 스타일
const CalendarCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  margin-bottom: 24px;

  .calendar-title {
    margin: 0;
    padding: 18px 20px;
    border-bottom: 1px solid ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
    font-size: 1.05rem;
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .day-cell {
    min-height: 128px;
    padding: 16px;
    border-right: 1px solid ${props => props.theme.colors.border};
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }

  .day-cell.holiday {
    background: #fef2f2;
    color: #dc2626;
  }

  .day-cell:last-child {
    border-right: none;
  }

  .day-label {
    margin-bottom: 6px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .date-label {
    font-size: 1.35rem;
    font-weight: 700;
  }

  .holiday-name, .leave-list {
    margin-top: 10px;
    font-size: 0.85rem;
  }

  .holiday-name {
    font-weight: 600;
  }

  .leave-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: ${props => props.theme.colors.text};
  }

  @media (max-width: 640px) {
    .week-grid {
      grid-template-columns: 1fr;
    }

    .day-cell {
      min-height: 72px;
      border-right: none;
      border-bottom: 1px solid ${props => props.theme.colors.border};
    }

    .day-cell:last-child {
      border-bottom: none;
    }
  }
`;

// 일일·주간 탭 버튼을 나란히 배치하는 스타일
const TabArea = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

// 선택된 보고서 유형을 색상과 밑줄로 구분하는 스타일
const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#2563eb' : 'transparent'};
  background: transparent;
  color: ${props => props.$active ? '#2563eb' : '#6b7280'};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
`;

// 선택된 보고서 목록을 탭 아래에 표시하는 스타일
const TabContent = styled.div`
  padding-top: 20px;
`;

// 관리자용 일일·주간 보고서 목록을 탭으로 전환하는 페이지
const AdminReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const { dailyPeriodStart, weeklyPeriodStart } = useMemo(getAdminReportDates, []);

  // 기존 주간 보고서와 같은 월요일부터 금요일까지의 날짜를 생성
  const weekDays = useMemo(() => {
    const monday = new Date(`${weeklyPeriodStart}T00:00:00`);
    return ['월', '화', '수', '목', '금'].map((dayLabel, index) => {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
      return { date, dateKey: formatReportDate(date), dayLabel };
    });
  }, [weeklyPeriodStart]);

  // 연말과 연초에 걸친 주에도 두 연도의 공휴일을 모두 조회
  const holidayYears = useMemo(() => Array.from(new Set(weekDays.map(({ date }) => date.getFullYear()))),[weekDays]);
  const { data: holidays = [] } = useQuery<KoreanHoliday[]>({
    queryKey: ['weekly-report-holidays', holidayYears],
    queryFn: async () => (await Promise.all(holidayYears.map(year => holidayApi.getByYear(year)))).flat(),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  // 휴가 관리 화면과 같은 API와 캐시에서 모든 팀원의 휴가를 조회
  const { data: leaves = [] } = useQuery<LeaveEvent[]>({
    queryKey: ['leaves'],
    queryFn: () => LeavesApi.getLeaves(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // 날짜별 공휴일과 해당 날짜에 겹치는 휴가를 표시용으로 묶음
  const holidaysByDate = useMemo(() => new Map(holidays.map(holiday => [holiday.date.slice(0, 10), holiday.name])),[holidays]);
  const leavesByDate = useMemo(() => new Map(weekDays.map(({ dateKey }) => [dateKey,leaves.filter(leave => leave.start.slice(0, 10) <= dateKey && dateKey < leave.end.slice(0, 10))])), [weekDays, leaves]);

  // 캘린더 제목에 이번 주 평일의 시작일과 종료일을 표시
  const weekTitle = `${weekDays[0].date.getMonth() + 1}월 ${weekDays[0].date.getDate()}일 ~ ${weekDays[4].date.getMonth() + 1}월 ${weekDays[4].date.getDate()}일`;

  // 일일·주간 보고서를 공용 API로 한 번 조회한다.
  const { data: reports = [], isLoading, isError } = useQuery<ReportWithEmployee[]>({
    queryKey: ['report-statuses', dailyPeriodStart, weeklyPeriodStart],
    queryFn: () => reportApi.getReportStatuses(dailyPeriodStart, weeklyPeriodStart),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // 선택한 탭의 보고서 유형과 기준일에 맞는 목록만 표시
  const visibleReports = useMemo(() => {
    const reportType = activeTab === 'daily' ? 'DAILY' : 'WEEKLY';
    const periodStart = activeTab === 'daily' ? dailyPeriodStart : weeklyPeriodStart;
    return reports.filter(report =>report.report_type === reportType && report.period_start.slice(0, 10) === periodStart);
  }, [activeTab, reports, dailyPeriodStart, weeklyPeriodStart]);

  const periodLabel = `${activeTab === 'daily' ? dailyPeriodStart : weeklyPeriodStart} ${activeTab === 'daily' ? '일일' : '주간'}`;

  return (
    <Container>
      <CardWrapper>
        <div>
          <Button variant="outline" onClick={() => navigate('/reports')}>
            뒤로 가기
          </Button>
        </div>
        <Card>
          <CalendarCard>
            <h3 className="calendar-title">{weekTitle}</h3>
            <div className="week-grid">
              {weekDays.map(({ date, dateKey, dayLabel }) => {
                const holidayName = holidaysByDate.get(dateKey);
                const dayLeaves = leavesByDate.get(dateKey) ?? [];

                return (
                  <div key={dateKey} className={`day-cell${holidayName ? ' holiday' : ''}`}>
                    <div className="day-label">{dayLabel}요일</div>
                    <div className="date-label">{date.getDate()}일</div>
                    {holidayName && <div className="holiday-name">{holidayName}</div>}
                    {dayLeaves.length > 0 && (
                      <div className="leave-list">
                        {dayLeaves.map(leave => <div key={leave.id}>{leave.title}</div>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CalendarCard>
          <TabArea role="tablist" aria-label="관리자 보고서 유형">
            <TabButton
              type="button"
              role="tab"
              $active={activeTab === 'daily'}
              aria-selected={activeTab === 'daily'}
              onClick={() => setActiveTab('daily')}
            >
              일일 보고
            </TabButton>
            <TabButton
              type="button"
              role="tab"
              $active={activeTab === 'weekly'}
              aria-selected={activeTab === 'weekly'}
              onClick={() => setActiveTab('weekly')}
            >
              주간 보고
            </TabButton>
          </TabArea>
          <TabContent role="tabpanel">
            <AdminReportList
              reports={visibleReports}
              periodLabel={periodLabel}
              isLoading={isLoading}
              isError={isError}
            />
          </TabContent>
        </Card>
      </CardWrapper>
    </Container>
  );
};

export default AdminReportPage;
