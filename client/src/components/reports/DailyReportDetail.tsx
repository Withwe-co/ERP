import { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details, {
  DetailsContent,
  DetailsSummary,
} from '@tiptap/extension-details';
import styled from 'styled-components';

import Button from '../common/Button';
import { ReportFile, ReportImage } from './reportAttachmentNodes';

export interface DailyReportDetailData {
  id: number;
  period_start: string;
  content: JSONContent;
  submitted?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DailyReportDetailProps {
  report: DailyReportDetailData;
  onClose: () => void;
  onEdit: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoArea = styled.div`
  display: flex;
  gap: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InfoLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ContentArea = styled.div`
  min-height: 240px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.surface};

  .ProseMirror {
    min-height: 200px;
    outline: none;
    line-height: 1.7;
  }

  .ProseMirror h1 {font-size: 1.8rem;}
  .ProseMirror h2 {font-size: 1.5rem;}
  .ProseMirror h3 {font-size: 1.25rem;}
  .ProseMirror ul,
  .ProseMirror ol {padding-left: 24px;}

  .ProseMirror blockquote {
    margin: 1rem 0;
    padding-left: 12px;
    border-left: 3px solid ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textSecondary};
  }

  .ProseMirror [data-type='details'] {
    margin: 12px 0;
    padding: 8px 12px;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
  }

  .ProseMirror [data-type='detailsSummary'] {
    min-height: 24px;
    font-weight: 600;
  }
  .ProseMirror pre {
    margin: 12px 0;
    padding: 14px 16px;
    overflow-x: auto;
    border-radius: ${props => props.theme.borderRadius.md};
    background: #f3f4f6;
    color: #111827;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .ProseMirror pre code{
    padding: 0;
    background: none;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
  }
  .ProseMirror .hljs-comment,
  .ProseMirror .hljs-quote {color: #6b7280;}

  .ProseMirror .hljs-keyword,
  .ProseMirror .hljs-selector-tag {color: #7c3aed;}

  .ProseMirror .hljs-string,
  .ProseMirror .hljs-attribute {color: #059669;}

  .ProseMirror .hljs-number,
  .ProseMirror .hljs-literal {color: #dc2626;}

  .ProseMirror .hljs-title,
  .ProseMirror .hljs-function {color: #2563eb;}

  .ProseMirror .hljs-built_in,
  .ProseMirror .hljs-type {color: #d97706;}

  /* 업로드한 이미지와 파일 링크를 본문 안에 표시 */
  .ProseMirror img[data-report-image] { max-width: 100%; height: auto; }
  .ProseMirror [data-report-file] { margin: 12px 0; }
`;

const ButtonArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

const DailyReportDetail = ({report, onClose, onEdit}: DailyReportDetailProps) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Details,
        DetailsSummary,
        DetailsContent,
        ReportImage,
        ReportFile,
      ],
      content: report.content,
      editable: false,
    },
    [report.content],
  );

  return (
    <Container>
      <InfoArea>
        <InfoItem>
          <InfoLabel>보고일</InfoLabel>
          <InfoValue>{formatDate(report.period_start)}</InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoLabel>상태</InfoLabel>
          <StatusBadge>작성 완료</StatusBadge>
        </InfoItem>
      </InfoArea>

      <ContentArea>
        <EditorContent editor={editor} />
      </ContentArea>

      <ButtonArea>
        <Button variant="outline" onClick={onEdit}>
          수정
        </Button>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </ButtonArea>
    </Container>
  );
};

export default DailyReportDetail;
