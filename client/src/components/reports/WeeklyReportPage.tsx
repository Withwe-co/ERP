import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details, { DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import Underline from '@tiptap/extension-underline';
import styled from 'styled-components';

// Components
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

// API
import { holidayApi, KoreanHoliday, reportApi, WeeklyReport } from '../../services/api';

// Form
import CreateReportForm from './CreateReportForm';
import { ReportFile, ReportImage } from './reportAttachmentNodes';

interface WeeklyReportPageProps {
  employeeId: string;
}

interface WeekDay {
  date: Date;
  dateKey: string;
  dayLabel: string;
}

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

// 요일 이름을 표시하는 스타일
const DayLabel = styled.div`
  margin-bottom: 6px;
  font-size: 0.85rem;
  font-weight: 600;
`;

// 날짜 숫자를 강조해서 표시하는 스타일
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

// 저장된 보고서 영역의 제목 스타일
const ReportTitle = styled.h3`
  margin: 0 0 16px;
  color: ${props => props.theme.colors.text};
  font-size: 1.05rem;
`;

// 보고서가 없거나 조회 중인 상태의 안내 문구 스타일
const EmptyReport = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
`;

// 저장된 Tiptap 문서를 읽기 전용으로 표시하는 영역 스타일
const ReportContentArea = styled.div`
  color: ${props => props.theme.colors.text};

  .ProseMirror {
    outline: none;
    line-height: 1.7;
  }

  .ProseMirror h1 { font-size: 1.8rem; }
  .ProseMirror h2 { font-size: 1.5rem; }
  .ProseMirror h3 { font-size: 1.25rem; }
  .ProseMirror ul, .ProseMirror ol { padding-left: 24px; }
  .ProseMirror blockquote {
    margin: 1rem 0;
    padding-left: 12px;
    border-left: 3px solid ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textSecondary};
  }
  .ProseMirror [data-type="details"] {
    margin: 12px 0;
    padding: 8px 12px;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
  }

  /* 업로드한 이미지와 파일 링크를 본문 안에 표시 */
  .ProseMirror img[data-report-image] { max-width: 100%; height: auto; }
  .ProseMirror [data-report-file] { margin: 12px 0; }
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

interface ReportContentProps {
  content: JSONContent;
}

// 조회된 Tiptap JSON을 수정할 수 없는 문서 형태로 렌더링
const ReportContent: React.FC<ReportContentProps> = ({ content }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Details, DetailsSummary, DetailsContent, ReportImage, ReportFile],
    content,
    editable: false,
  }, [content]);

  if (!editor) {
    return null;
  }

  return (
    <ReportContentArea>
      <EditorContent editor={editor} />
    </ReportContentArea>
  );
};

// 이번 주 달력과 직원의 주간 보고서를 조회하고 관리하는 페이지
const WeeklyReportPage: React.FC<WeeklyReportPageProps> = ({ employeeId }) => {
  const queryClient = useQueryClient();

  // 모달 표시 여부와 등록/수정 모드를 각각 관리
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // 이번 주 월~금 날짜와 연도 목록을 한 번 계산
  const weekDays = useMemo(getCurrentWeekDays, []);
  const periodStart = weekDays[0].dateKey;
  const holidayYears = useMemo(() => Array.from(new Set(weekDays.map(({ date }) => date.getFullYear()))), [weekDays],);

  // 직원 ID와 이번 주 시작일로 주간 보고서 API를 호출
  const getWeeklyReport = () => reportApi.getReport(Number(employeeId), periodStart, 'WEEKLY');

  // 이번 주에 포함된 연도의 공휴일 목록 조회
  const { data: holidays = [] } = useQuery<KoreanHoliday[]>({
    queryKey: ['weekly-report-holidays', holidayYears],
    queryFn: async () => (await Promise.all(holidayYears.map(year => holidayApi.getByYear(year)))).flat(),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  // 직원과 이번 주 시작일을 기준으로 저장된 주간 보고서를 조회
  const {
    data: weeklyReport,
    isLoading: isReportLoading,
    isError: isReportError,
  } = useQuery<WeeklyReport | null>({
    queryKey: ['report', 'WEEKLY', Number(employeeId), periodStart],
    queryFn: getWeeklyReport,
    retry: false,
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

  // 등록된 주간 보고서를 삭제하고 조회 상태를 갱신한다.
  const handleDeleteReport = async () => {
    if (!weeklyReport) {return;}

    const confirmed = window.confirm('주간 보고서를 삭제하시겠습니까?\n삭제된 보고서는 복구할 수 없습니다.',);

    if (!confirmed) {return;}

    try {
      await reportApi.deleteReport(weeklyReport.id, 'WEEKLY');
      queryClient.setQueryData<WeeklyReport | null>(['report', 'WEEKLY', Number(employeeId), periodStart], null,);
    } 
    catch (error) {console.error('주간 보고서 삭제 실패:', error);}
  };

  // 달력 상단에 표시할 이번 주 날짜 범위
  const weekTitle = `${weekDays[0].date.getMonth() + 1}월 ${weekDays[0].date.getDate()}일 ~ ${weekDays[4].date.getMonth() + 1}월 ${weekDays[4].date.getDate()}일`;

  return (
    <Container>
      <PageHeader>
        <TitleArea>
          <h2>주간 보고</h2>
        </TitleArea>
        <HeaderButtons>
          <Button
            variant="danger"
            onClick={handleDeleteReport}
            disabled={!weeklyReport}
            title={!weeklyReport ? '삭제할 보고서가 없습니다.' : undefined}
          >
            보고서 삭제
          </Button>
          <Button
            variant="outline"
            onClick={() => openForm('edit')}
            disabled={!weeklyReport}
            title={!weeklyReport ? '수정할 보고서가 없습니다.' : undefined}
          >
            보고서 수정
          </Button>
          <Button
            onClick={() => openForm('create')}
            disabled={isReportLoading || Boolean(weeklyReport)}
            title={weeklyReport ? '이번 주 보고서가 이미 등록되었습니다.' : undefined}
          >
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
        {isReportLoading && <EmptyReport>보고서를 불러오는 중입니다.</EmptyReport>}
        {!isReportLoading && weeklyReport && <ReportContent content={weeklyReport.content as JSONContent} />}
        {!isReportLoading && !weeklyReport && !isReportError && <EmptyReport>저장된 주간 보고서가 없습니다.</EmptyReport>}
        {!isReportLoading && isReportError && <EmptyReport>저장된 주간 보고서가 없거나 조회할 수 없습니다.</EmptyReport>}
      </ReportCard>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={formMode === 'create' ? '주간 보고서 등록' : '주간 보고서 수정'}
        size="xl"
      >
        <CreateReportForm
          key={`${formMode}-${formMode === 'edit' ? weeklyReport?.id : 'new'}`}
          employeeId={Number(employeeId)}
          periodStart={periodStart}
          reportType="WEEKLY"
          mode={formMode}
          reportId={weeklyReport?.id}
          onSuccess={closeForm}
          onCancel={closeForm}
          initialContent={formMode === 'edit' ? weeklyReport?.content as JSONContent : undefined}
        />
      </Modal>
    </Container>
  );
};

export default WeeklyReportPage;
