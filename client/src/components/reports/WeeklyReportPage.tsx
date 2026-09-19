import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { JSONContent } from '@tiptap/core';
import styled from 'styled-components';

// Components
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

// API
import { holidayApi, KoreanHoliday } from '../../services/api';

// Form
import CreateReportForm from './CreateReportForm';

interface WeeklyReportPageProps {
  employeeId: string;
}

interface WeekDay {
  date: Date;
  dateKey: string;
  dayLabel: string;
}

// 수정 Form의 초기값을 확인하기 위한 임시 Tiptap 문서
const SAMPLE_WEEKLY_REPORT_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '이번 주 업무 보고' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '수정할 주간 보고서의 임시 내용입니다.' }],
    },
  ],
};

// 페이지 전체 영역을 세로로 배치하는 스타일
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// 제목과 보고서 등록 버튼을 양쪽 끝에 배치하는 스타일
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

// 수정 버튼과 등록 버튼을 나란히 배치하는 스타일
const HeaderButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

// 페이지 제목과 직원 안내 문구 스타일
const TitleArea = styled.div`
  h2 {
    margin: 0 0 6px;
    color: ${props => props.theme.colors.text};
  }

  p {
    margin: 0;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// 주간 달력의 바깥 Card 스타일
const CalendarCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

// 이번 주 날짜 범위를 표시하는 제목 스타일
const CalendarTitle = styled.h3`
  margin: 0;
  padding: 18px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: 1.05rem;
`;

// 월요일부터 금요일까지 5개의 날짜 칸을 배치하는 스타일
const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// 일반 날짜와 공휴일의 색상을 구분하는 날짜 칸 스타일
const DayCell = styled.div<{ $holiday: boolean }>`
  min-height: 128px;
  padding: 16px;
  border-right: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.$holiday ? '#fef2f2' : props.theme.colors.surface};
  color: ${props => props.$holiday ? '#dc2626' : props.theme.colors.text};

  &:last-child {
    border-right: none;
  }

  @media (max-width: 640px) {
    min-height: 72px;
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.colors.border};

    &:last-child {
      border-bottom: none;
    }
  }
`;

const DayLabel = styled.div`
  margin-bottom: 6px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const DateLabel = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
`;

// 공휴일 이름을 날짜 아래에 표시하는 스타일
const HolidayName = styled.div`
  margin-top: 10px;
  font-size: 0.85rem;
  font-weight: 600;
`;

// 저장된 보고서가 표시될 하단 영역 스타일
const ReportCard = styled(Card)`
  min-height: 160px;
`;

const ReportTitle = styled.h3`
  margin: 0 0 16px;
  color: ${props => props.theme.colors.text};
  font-size: 1.05rem;
`;

const EmptyReport = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
`;

// Date 객체를 공휴일 API와 동일한 YYYY-MM-DD 문자열로 변환
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 현재 날짜를 기준으로 이번 주 월요일부터 금요일까지 생성
const getCurrentWeekDays = (): WeekDay[] => {
  const today = new Date();
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  );
  const dayLabels = ['월', '화', '수', '목', '금'];

  return dayLabels.map((dayLabel, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    return { date, dateKey: formatDateKey(date), dayLabel };
  });
};

const WeeklyReportPage: React.FC<WeeklyReportPageProps> = ({ employeeId }) => {
  // 모달 표시 여부와 등록/수정 모드를 각각 관리
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // 이번 주 월~금 날짜와 연도 목록을 한 번 계산
  const weekDays = useMemo(getCurrentWeekDays, []);
  const holidayYears = useMemo(
    () => Array.from(new Set(weekDays.map(({ date }) => date.getFullYear()))),
    [weekDays],
  );

  // 이번 주에 포함된 연도의 공휴일 목록 조회
  const { data: holidays = [] } = useQuery<KoreanHoliday[]>({
    queryKey: ['weekly-report-holidays', holidayYears],
    queryFn: async () => (
      await Promise.all(holidayYears.map(year => holidayApi.getByYear(year)))
    ).flat(),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  // 날짜별 공휴일 이름을 빠르게 찾기 위한 Map
  const holidaysByDate = useMemo( () => new Map(holidays.map(holiday => [holiday.date.slice(0, 10), holiday.name])),[holidays]);

  // 등록/수정 Form을 선택한 모드로 열기
  const openForm = (mode: 'create' | 'edit') => {
    setFormMode(mode);
    setIsFormOpen(true);
  };

  // 등록/수정 Form 닫기
  const closeForm = () => {
    setIsFormOpen(false);
  };

  // UI 확인용 제출 처리: 입력 내용은 저장하지 않고 성공 로그만 출력
  const handleSubmit = (_content: JSONContent) => {
    console.log(formMode === 'create' ? '주간 보고서 입력 성공' : '주간 보고서 수정 성공');
    closeForm();
  };

  // 달력 상단에 표시할 이번 주 날짜 범위
  const weekTitle = `${weekDays[0].date.getMonth() + 1}월 ${weekDays[0].date.getDate()}일 ~ ${weekDays[4].date.getMonth() + 1}월 ${weekDays[4].date.getDate()}일`;

  return (
    <Container>
      <PageHeader>
        <TitleArea>
          <h2>주간 보고</h2>
          <p>직원 ID {employeeId}의 주간 보고 화면입니다.</p>
        </TitleArea>
        <HeaderButtons>
          <Button variant="outline" onClick={() => openForm('edit')}>
            보고서 수정
          </Button>
          <Button onClick={() => openForm('create')}>
            보고서 등록
          </Button>
        </HeaderButtons>
      </PageHeader>

      <CalendarCard>
        <CalendarTitle>{weekTitle}</CalendarTitle>
        <WeekGrid>
          {weekDays.map(({ date, dateKey, dayLabel }) => {
            const holidayName = holidaysByDate.get(dateKey);

            return (
              <DayCell key={dateKey} $holiday={Boolean(holidayName)}>
                <DayLabel>{dayLabel}요일</DayLabel>
                <DateLabel>{date.getDate()}일</DateLabel>
                {holidayName && <HolidayName>{holidayName}</HolidayName>}
              </DayCell>
            );
          })}
        </WeekGrid>
      </CalendarCard>

      <ReportCard>
        <ReportTitle>작성된 주간 보고서</ReportTitle>
        <EmptyReport>저장된 주간 보고서가 없습니다.</EmptyReport>
      </ReportCard>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={formMode === 'create' ? '주간 보고서 등록' : '주간 보고서 수정'}
        size="xl"
      >
        <CreateReportForm
          onSubmit={handleSubmit}
          onCancel={closeForm}
          initialContent={formMode === 'edit' ? SAMPLE_WEEKLY_REPORT_CONTENT : undefined}
          submitLabel={formMode === 'create' ? '등록' : '수정'}
        />
      </Modal>
    </Container>
  );
};

export default WeeklyReportPage;
