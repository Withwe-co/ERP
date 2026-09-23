import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

import Card from '../common/Card';
import Modal from '../common/Modal';

import CreateReportForm from './CreateReportForm';
import DailyReportDetail, {DailyReportDetailData,} from './DailyReportDetail';

import {
  holidayApi,
  KoreanHoliday,
  LeavesApi,
  reportApi,
} from '../../services/api';

interface DailyReportPageProps {
  employeeId: string;
}

interface LeaveEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    employeeId: number;
    leaveType: string;
    totalDays: number;
  };
}

type DayStatus =
  | 'HOLIDAY'
  | 'LEAVE'
  | 'COMPLETED'
  | 'NOT_WRITTEN';

interface DayStatusInfo {
  status: DayStatus;
  label: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageHeader = styled.div`
  h2 {
    margin: 0 0 6px;
    padding-left: 8px;
    color: ${props => props.theme.colors.text};
  }

  p {
    margin: 0;
    padding-left: 8px;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const CalendarCard = styled(Card)`
  padding: 16px;
  min-width: 0;
`;

const CalendarScroll = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
`;

const CalendarContainer = styled.div`
  width: 100%;
  min-width: 900px; /* 최소 너비를 설정하여 가로 스크롤이 생기도록 함 */

  .fc .fc-scrollgrid {overflow: hidden; border-radius: 12px;}

  .fc .fc-daygrid-day {background: #ffffff;}
  
  /* 오늘 */
  .fc .fc-daygrid-day.fc-day-today {background: #eff6ff;}
  /* 주말 */
  .fc .fc-daygrid-day.fc-weekend {background: #f8fafc;}
  /* 공휴일 - 주말보다 우선 */
  .fc .fc-daygrid-day.fc-holiday {background: #fef2f2;}

  .fc .fc-col-header-cell {background: #f8fafc;}
  .fc .fc-col-header-cell-cushion,

  .fc .fc-daygrid-day-number {color: #111827; text-decoration: none;}
  .fc .fc-day-sun .fc-col-header-cell-cushion {color: #dc2626; font-weight: 700;}
  .fc .fc-day-sat .fc-col-header-cell-cushion {color: #2563eb; font-weight: 700;  }

  .fc .fc-daygrid-day.fc-weekend.fc-day-sun .fc-daygrid-day-number,
  .fc .fc-daygrid-day.fc-holiday .fc-daygrid-day-number {color: #dc2626; font-weight: 700;}
  .fc .fc-daygrid-day.fc-weekend.fc-day-sat .fc-daygrid-day-number {color: #2563eb; font-weight: 700;}

  .fc .fc-toolbar {position: relative;}
  .fc .fc-toolbar-chunk:nth-child(2) {position: absolute; left: 50%; transform: translateX(-50%);}
  .fc .fc-toolbar-title {color: #111827; font-size: 1.4rem; font-weight: 700;}

  .fc .fc-prev-button,
  .fc .fc-next-button,
  .fc .fc-today-button {height: 40px;}

  .fc .fc-prev-button {position: relative;}
  .fc .fc-prev-button::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 0;
    width: 1px;
    height: 60%;
    background: #cbd5e1;
    pointer-events: none;
  }

  .fc .fc-daygrid-day-frame {min-height: 100px;}
`;

const DayCellContent = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 88px;

  flex-direction: column;
  gap: 8px;

  padding: 5px 7px;
  box-sizing: border-box;
`;

const DayNumber = styled.div`
  display: flex;
  justify-content: flex-end;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $status: DayStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: 7px;

  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;

  ${props =>
    props.$status === 'HOLIDAY'
      ? `
        width: 100%;
        max-width: 100%;

        white-space: normal;
        word-break: keep-all; // 글자 중간에서 막 쪼개지 않고, 단어 단위/괄호 앞과 같은 부분에서 줄바꿈
        overflow-wrap: break-word;
      `
      : `
        width: 76px;
        height: 28px;

        white-space: nowrap;
      `
  }

  ${props => {
    switch (props.$status) {
      case 'COMPLETED':
        return `
          background: #dcfce7;
          color: #166534;
        `;

      case 'NOT_WRITTEN':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;

      case 'LEAVE':
        return `
          background: #dbeafe;
          color: #1d4ed8;
        `;

      case 'HOLIDAY':
        return `
          background: #fef2f2;
          color: #dc2626;
        `;

      default:
        return '';
    }
  }}
`;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const DailyReportPage = ({employeeId,}: DailyReportPageProps) => {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string | null>(null,);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [visibleYears, setVisibleYears] = useState<number[]>([new Date().getFullYear(),]);

  const [calendarRange, setCalendarRange] = useState({start: '', end: '',});

  const [selectedReport, setSelectedReport] = useState<DailyReportDetailData | null>(null);

  const { data: dailyReportStatuses = [] } = useQuery({
    queryKey: ['daily-report-calendar', employeeId, calendarRange.start, calendarRange.end,],
    queryFn: () => reportApi.getDailyCalendarStatus(Number(employeeId), calendarRange.start, calendarRange.end,),
    enabled: Boolean(calendarRange.start && calendarRange.end),
  });

  const completedReportDates = useMemo(() =>
      new Set(
        dailyReportStatuses
          .filter(report => report.submitted)
          .map(report => report.period_start),
      ),
    [dailyReportStatuses],
  );

  // 공휴일 조회
  const { data: holidays = [] } = useQuery<KoreanHoliday[]>({
    queryKey: ['daily-report-holidays', visibleYears],         
    queryFn: async () => {
      const results = await Promise.all(visibleYears.map(year => holidayApi.getByYear(year)),);
      return results.flat();
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  // 전체 휴가 조회
  const { data: leaveEvents = [] } = useQuery<LeaveEvent[]>({
    queryKey: ['daily-report-leaves'],
    queryFn: () => LeavesApi.getLeaves(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // 날짜 → 공휴일명
  const holidaysByDate = useMemo(
    () => new Map(holidays.map(holiday => [holiday.date.slice(0, 10), holiday.name,]),),
    [holidays],
  );

  // 현재 보고 대상 직원의 휴가만 추출
  const employeeLeaveEvents = useMemo(
    () => leaveEvents.filter(leave => leave.extendedProps.employeeId === Number(employeeId),),
    [leaveEvents, employeeId],
  );

  // 휴가 시작일부터 종료일까지 날짜 Set 생성
  // API의 end 값은 FullCalendar 규칙상 실제 종료일 + 1일
  const leaveDateSet = useMemo(() => {
    const dates = new Set<string>();

    employeeLeaveEvents.forEach(leave => {
      const current = new Date(`${leave.start}T00:00:00`);
      const end = new Date(`${leave.end}T00:00:00`);
      while (current < end) {dates.add(formatDateKey(current)); current.setDate(current.getDate() + 1);}
    });

    return dates;
  }, [employeeLeaveEvents]);

  const getDayStatus = (dateKey: string): DayStatusInfo => {
    const holidayName = holidaysByDate.get(dateKey);

    if (holidayName) {return {status: 'HOLIDAY', label: holidayName,};}
    if (leaveDateSet.has(dateKey)) {return {status: 'LEAVE', label: '휴가',};}
    if (completedReportDates.has(dateKey)) {return {status: 'COMPLETED', label: '작성 완료',};}

    return {status: 'NOT_WRITTEN', label: '미작성',};
  };

  const handleDateClick = async (dateStr: string) => {
    const dayStatus = getDayStatus(dateStr);

    // 공휴일 및 휴가는 클릭 불가
    if (dayStatus.status === 'HOLIDAY' || dayStatus.status === 'LEAVE') {
      return;
    }

    const date = new Date(`${dateStr}T00:00:00`);
    const day = date.getDay();

    // 주말 클릭 불가
    if (day === 0 || day === 6) {return;}

    setSelectedDate(dateStr);

    if (dayStatus.status === 'COMPLETED') {
      try {
        const report = await reportApi.getReport(Number(employeeId), dateStr, 'DAILY',);

        setSelectedReport(report);
        setIsDetailModalOpen(true);
      } catch (error) {console.error('일일 보고 상세 조회 실패:', error);}

      return;
    }

    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setSelectedDate(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReport(null);
    setSelectedDate(null);
  };

  // 선택한 일일 보고서를 삭제하고 달력의 작성 상태를 갱신한다.
  const handleDeleteReport = async () => {
    if (!selectedReport) {return;}

    const confirmed = window.confirm('일일 보고서를 삭제하시겠습니까?\n삭제된 보고서는 복구할 수 없습니다.',);

    if (!confirmed) {return;}

    try {
      await reportApi.deleteReport(selectedReport.id, 'DAILY');
      await queryClient.invalidateQueries({queryKey: ['daily-report-calendar', employeeId],});
      closeDetailModal();
    } 
    catch (error) {console.error('일일 보고서 삭제 실패:', error);}
  };

  const handleEditReport = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedReport(null);
    setSelectedDate(null);
  };

  return (
    <Container>
      <PageHeader>
        <h2>일일 보고</h2>
        <p>날짜를 선택하여 일일 업무 보고를 확인하거나 작성하세요.</p>
      </PageHeader>

      <CalendarCard>
        <CalendarScroll>
          <CalendarContainer>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={koLocale}
              height="auto"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              datesSet={info => {
                const years = [
                  info.start.getFullYear(),
                  info.end.getFullYear(),
                ];

                setVisibleYears([...new Set(years)]);

                const endDate = new Date(info.end);
                endDate.setDate(endDate.getDate() - 1);

                setCalendarRange({
                  start: formatDateKey(info.start),
                  end: formatDateKey(endDate),
                });
              }}
              dateClick={info => handleDateClick(info.dateStr)}

              dayCellClassNames={info => {
                const dateKey = formatDateKey(info.date);
                const day = info.date.getDay();

                if (holidaysByDate.has(dateKey)) {
                  return ['fc-holiday'];
                }

                if (day === 0 || day === 6) {
                  return ['fc-weekend'];
                }

                return [];
              }}

              dayCellContent={info => {
                const dateKey = formatDateKey(info.date);
                const holidayName = holidaysByDate.get(dateKey);
                const day = info.date.getDay();
                const isWeekend = day === 0 || day === 6;

                // 공휴일은 주말 여부와 관계없이 공휴일명 표시
                if (holidayName) {
                  return (
                    <DayCellContent>
                      <DayNumber>{info.date.getDate()}</DayNumber>

                      <StatusBadge $status="HOLIDAY">
                        {holidayName}
                      </StatusBadge>
                    </DayCellContent>
                  );
                }

                // 일반 주말은 날짜만 표시
                if (isWeekend) {
                  return (
                    <DayCellContent>
                      <DayNumber>{info.date.getDate()}</DayNumber>
                    </DayCellContent>
                  );
                }

                const dayStatus = getDayStatus(dateKey);

                return (
                  <DayCellContent>
                    <DayNumber>{info.date.getDate()}</DayNumber>

                    <StatusBadge $status={dayStatus.status}>
                      {dayStatus.label}
                    </StatusBadge>
                  </DayCellContent>
                );
              }}
            />
          </CalendarContainer>
        </CalendarScroll>
      </CalendarCard>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={
          selectedDate
            ? `${selectedDate} 일일 업무 보고 작성`
            : '일일 업무 보고 작성'
        }
        size="xl"
      >
        {selectedDate && (
          <CreateReportForm
            employeeId={Number(employeeId)}
            periodStart={selectedDate}
            reportType="DAILY"
            mode="create"
            onSuccess={closeCreateModal}
            onCancel={closeCreateModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title="일일 업무 보고 상세"
        size="xl"
      >
        {selectedReport && (
          <DailyReportDetail
            report={selectedReport}
            onClose={closeDetailModal}
            onEdit={handleEditReport}
            onDelete={handleDeleteReport}
          />
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title={
          selectedDate
            ? `${selectedDate} 일일 업무 보고 수정`
            : '일일 업무 보고 수정'
        }
        size="xl"
      >
        {selectedReport && (
          <CreateReportForm
            employeeId={Number(employeeId)}
            periodStart={selectedReport.period_start.slice(0, 10)}
            reportType="DAILY"
            mode="edit"
            reportId={selectedReport.id}
            initialContent={selectedReport.content}
            onSuccess={closeEditModal}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </Container>
  );
};

export default DailyReportPage;
