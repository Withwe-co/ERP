import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

// components
import Card from '../common/Card';

// 보고서 관리 페이지
import DailyReportPage from './DailyReportPage';
import WeeklyReportPage from './WeeklyReportPage';

// 컨테이너 스타일
const Container = styled.div`
  padding: 20px;
`;

// 페이지 제목 스타일
const PageTitle = styled.h1`
  margin: 0 0 20px;
  color: ${props => props.theme.colors?.text || '#333'};
  font-size: 2rem;
  font-weight: 600;
`;

// 탭 영역 스타일
const TabArea = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

// 탭 버튼 스타일
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

// 탭 내용 영역 스타일
const TabContent = styled.div`
  padding-top: 20px;
`;

const ReportManagementPage: React.FC = () => {
  // URL 파라미터에서 employeeId 
  const { employeeId } = useParams<{ employeeId: string }>();

  // 현재 활성화된 탭 상태를 관리. 초기값은 'weekly'
  const [activeTab, setActiveTab] = useState<'weekly'|'daily'>('weekly');

  // employeeId가 없으면 null을 반환하여 화면에 아무것도 렌더링 X
  if (!employeeId) {
    return null;
  }

  return (
    <Container>
      <PageTitle>업무 보고 관리</PageTitle>
      <Card>
        {/* 주간|일일 보고 탭 전환 */}
        <TabArea>
          <TabButton
              $active={activeTab === 'weekly'}
              onClick={() => setActiveTab('weekly')}
            >
              주간 보고
            </TabButton>

            <TabButton
              $active={activeTab === 'daily'}
              onClick={() => setActiveTab('daily')}
            >
              일일 보고
            </TabButton>
        </TabArea>

        {/* 선택된 탭에 따라 화면 전환 */}
        <TabContent>
          {activeTab === 'weekly'
            ? <WeeklyReportPage employeeId={employeeId} />
            : <DailyReportPage employeeId={employeeId} />}
        </TabContent>
      </Card>
    </Container>
  );
};

export default ReportManagementPage;
