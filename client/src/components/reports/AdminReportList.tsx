import { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details, { DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import Underline from '@tiptap/extension-underline';
import styled from 'styled-components';

import Card from '../common/Card';
import { ReportWithEmployee } from '../../services/api';
import { ReportFile, ReportImage } from './reportAttachmentNodes';

interface AdminReportListProps {
  reports: ReportWithEmployee[];
  periodLabel: string;
  isLoading: boolean;
  isError: boolean;
}

// 직원별 보고서 카드를 세로로 배치하는 스타일
const ReportGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// 조회 기준 날짜와 보고서 건수를 표시하는 스타일
const ListTitle = styled.h2`
  margin: 0 0 20px;
  color: ${props => props.theme.colors.text};
  font-size: 1.15rem;
`;

// 직원 번호와 제출 상태를 양쪽에 표시하는 스타일
const ReportHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

// 직원 번호를 강조하는 스타일
const EmployeeName = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
`;

// 제출 여부를 색상으로 구분하는 스타일
const StatusBadge = styled.span<{ $submitted: boolean }>`
  padding: 4px 10px;
  border-radius: 16px;
  background: ${props => props.$submitted ? '#D1FAE5' : '#FEE2E2'};
  color: ${props => props.$submitted ? '#065F46' : '#991B1B'};
  font-size: 0.8rem;
  white-space: nowrap;
`;

// 보고 날짜를 본문 위에 표시하는 스타일
const ReportDate = styled.p`
  margin: 0 0 12px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
`;

// Tiptap 보고서를 읽기 전용으로 표시하는 스타일
const ReportBody = styled.div`
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
  }
  .ProseMirror [data-type="details"] {
    padding: 8px 12px;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
  }

  /* 업로드한 이미지와 파일 링크를 관리자 보고서에 표시 */
  .ProseMirror img[data-report-image] { max-width: 100%; height: auto; }
  .ProseMirror [data-report-file] { margin: 12px 0; }
`;

// 조회 중·오류·빈 목록을 안내하는 스타일
const Message = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textSecondary};
`;

// 보고서 내용을 편집할 수 없는 Tiptap 문서로 렌더링
const ReadOnlyReport: React.FC<{ content: JSONContent }> = ({ content }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Details, DetailsSummary, DetailsContent, ReportImage, ReportFile],
    content,
    editable: false,
  }, [content]);

  if (!editor) return null;

  return (
    <ReportBody>
      <EditorContent editor={editor} />
    </ReportBody>
  );
};

// 관리자 화면에서 조회된 직원별 보고서와 로딩 상태를 표시
const AdminReportList: React.FC<AdminReportListProps> = ({ reports, periodLabel, isLoading, isError }) => (
  <div>
    <ListTitle>{periodLabel} 보고서 ({reports.length}건)</ListTitle>
    {isLoading && <Message>보고서를 불러오는 중입니다.</Message>}
    {!isLoading && isError && <Message>보고서를 불러오지 못했습니다.</Message>}
    {!isLoading && !isError && reports.length === 0 && <Message>작성된 보고서가 없습니다.</Message>}
    {!isLoading && !isError && reports.length > 0 && (
      <ReportGrid>
        {reports.map(report => (
          <Card key={report.id}>
            <ReportHeader>
              <EmployeeName>{report.employee_name}</EmployeeName>
              <StatusBadge $submitted={report.submitted}>
                {report.submitted ? '완료' : '미완료'}
              </StatusBadge>
            </ReportHeader>
            <ReportDate>작성일: {report.period_start.slice(0, 10)}</ReportDate>
            <ReadOnlyReport content={report.content as JSONContent} />
          </Card>
        ))}
      </ReportGrid>
    )}
  </div>
);

export default AdminReportList;
