import React, { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details, { DetailsContent, DetailsSummary } from '@tiptap/extension-details';

import Underline from '@tiptap/extension-underline';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import Button from '../common/Button';
import Card from '../common/Card';
import { reportApi, ReportPendingAttachment, ReportType } from '../../services/api';
import { ReportFile, ReportImage } from './reportAttachmentNodes';

type ReportFormMode = 'create' | 'edit';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import python from 'highlight.js/lib/languages/python';

const lowlight = createLowlight();
lowlight.register('python', python);

interface CreateReportFormProps {
  employeeId: number;
  periodStart: string;
  reportType: ReportType;
  mode: ReportFormMode;
  reportId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  initialContent?: JSONContent;
}

// 보고서 작성 폼의 최대 너비와 가운데 정렬을 지정하는 스타일
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

// 에디터를 카드 형태로 감싸고 하단 여백을 지정하는 스타일
const FormSection = styled(Card)`
  margin-bottom: 24px;
`;

// 에디터 서식 버튼을 여러 줄로 배치하는 도구 모음 스타일
const EditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-bottom: none;
  border-radius: ${props => `${props.theme.borderRadius.md} ${props.theme.borderRadius.md} 0 0`};
  background: ${props => props.theme.colors.background};
`;

// 선택된 서식 상태를 색상으로 구분하는 도구 버튼 스타일
const ToolbarButton = styled.button<{ $active?: boolean }>`
  min-width: 34px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.$active ? `${props.theme.colors.primary}15` : props.theme.colors.surface};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text};
  cursor: pointer;

  &:hover {
    background: ${props => `${props.theme.colors.primary}10`};
  }
`;

// Tiptap 편집 영역과 내부 문서 요소를 꾸미는 스타일
const EditorArea = styled.div`
  min-height: 280px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.surface};

  .ProseMirror {
    min-height: 280px;
    padding: 16px;
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
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    padding: 8px 12px;
  }
  .ProseMirror [data-type="detailsSummary"] {
    min-height: 24px;
    font-weight: 600;
  }
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: ${props => props.theme.colors.textSecondary};
    float: left;
    height: 0;
    pointer-events: none;
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
  .ProseMirror pre code {
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

  /* 드롭한 이미지가 에디터 너비를 넘지 않도록 표시 */
  .ProseMirror img[data-report-image] {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 12px 0;
  }

  /* 드롭한 일반 파일을 본문 안의 첨부 링크로 표시 */
  .ProseMirror [data-report-file] {
    margin: 12px 0;
    padding: 10px 12px;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
  }
`;

// 이미지와 파일을 에디터에 놓는 방법을 안내하는 스타일
const DropHint = styled.p`
  margin: 8px 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
`;

// 취소와 저장 버튼을 오른쪽에 배치하는 스타일
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

// 보고서 등록과 수정을 처리하는 공통 에디터 폼
const CreateReportForm: React.FC<CreateReportFormProps> = ({
  employeeId,
  periodStart,
  reportType,
  mode,
  reportId,
  onSuccess,
  onCancel,
  initialContent,
}) => {
  const queryClient = useQueryClient();
  const reportLabel = reportType === 'WEEKLY' ? '주간' : '일일';
  const pendingFiles = useRef(new Map<string, File>());
  const previewUrls = useRef<string[]>([]);

  // 폼이 닫히면 임시 이미지 미리보기 주소를 해제
  useEffect(() => () => {
    previewUrls.current.forEach(url => URL.revokeObjectURL(url));
  }, []);

  // 전달된 보고서 내용을 초기값으로 사용하는 Tiptap 에디터
  const editor = useEditor({
    extensions: [
      StarterKit.configure({codeBlock: false,}),
      CodeBlockLowlight.configure({lowlight, defaultLanguage: 'python',}),
      Details,
      DetailsSummary,
      DetailsContent,
      ReportImage,
      ReportFile,
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        'data-placeholder': '보고서 내용을 작성하세요.',
      },
      // 외부 파일을 놓은 좌표에 이미지 또는 파일 노드를 삽입
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files.length) return false;
        const dropPosition = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (!dropPosition) return false;

        // 서버 제한에 맞지 않는 파일은 본문에 넣기 전에 안내
        const droppedFiles = Array.from(event.dataTransfer.files);
        const allowedExtensions = /\.(pdf|docx?|xlsx?|csv|txt|zip|pptx?|hwp|hwpx|png|jpe?g|gif|webp)$/i;
        if (droppedFiles.some(file => file.size === 0 || file.size > 10 * 1024 * 1024 ||
          (file.type.startsWith('image/')
            ? !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)
            : !allowedExtensions.test(file.name)))) {
          event.preventDefault();
          toast.error('10MB 이하의 이미지 또는 지원되는 문서 파일만 첨부할 수 있습니다.');
          return true;
        }
        if (droppedFiles.length > 10) {
          event.preventDefault();
          toast.error('한 번에 최대 10개의 파일을 첨부할 수 있습니다.');
          return true;
        }

        const nodes = droppedFiles.map(file => {
          const uploadId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;
          pendingFiles.current.set(uploadId, file);

          if (file.type.startsWith('image/')) {
            const src = URL.createObjectURL(file);
            previewUrls.current.push(src);
            return { type: 'reportImage', attrs: { src, name: file.name, uploadId } };
          }
          return { type: 'reportFile', attrs: { href: null, name: file.name, uploadId } };
        });

        event.preventDefault();
        view.focus();
        editor?.chain().insertContentAt(dropPosition.pos, nodes).run();
        return true;
      },
    },
  });

  // 도구 버튼의 활성 상태를 현재 에디터 선택 영역과 동기화
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;

      return {
        isBold: currentEditor.isActive('bold'),
        isItalic: currentEditor.isActive('italic'),
        isUnderline: currentEditor.isActive('underline'),
        isHeading1: currentEditor.isActive('heading', { level: 1 }),
        isHeading2: currentEditor.isActive('heading', { level: 2 }),
        isHeading3: currentEditor.isActive('heading', { level: 3 }),
        isBulletList: currentEditor.isActive('bulletList'),
        isOrderedList: currentEditor.isActive('orderedList'),
        isBlockquote: currentEditor.isActive('blockquote'),
        isCodeBlock: currentEditor.isActive('codeBlock'),
      };
    },
  });

  // 저장 후 조회 데이터를 갱신하고 폼을 닫는 공통 성공 처리
  const handleMutationSuccess = (successMessage: string) => {
    queryClient.invalidateQueries({
      queryKey: ['report', reportType, employeeId, periodStart],
    });
    // 일일 보고 저장 후 달력의 작성 상태를 다시 조회
    if (reportType === 'DAILY') {
      queryClient.invalidateQueries({ queryKey: ['daily-report-calendar', String(employeeId)] });
    }
    toast.success(successMessage);
    onSuccess();
  };

  // 보고서를 새로 등록하는 Mutation
  const createMutation = useMutation({
    mutationFn: ({ content, attachments }: { content: JSONContent; attachments: ReportPendingAttachment[] }) => reportApi.createReport({
      employee_id: employeeId,
      period_start: periodStart,
      content,
      submitted: true,
      report_type: reportType,
    }, attachments),
    onSuccess: () => handleMutationSuccess(`${reportLabel} 보고서가 등록되었습니다.`),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || '보고서 등록 중 오류가 발생했습니다.');
    },
  });

  // 기존 보고서 내용을 수정하는 Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content, attachments }: { id: number; content: JSONContent; attachments: ReportPendingAttachment[] }) => (
      reportApi.updateReport(id, { content }, reportType, attachments)
    ),
    onSuccess: () => handleMutationSuccess(`${reportLabel} 보고서가 수정되었습니다.`),
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || '보고서 수정 중 오류가 발생했습니다.');
    },
  });

  // 폼 모드에 따라 등록 또는 수정 Mutation을 실행
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editor) {
      return;
    }

    const content = editor.getJSON();

    // 최종 본문에 남아 있는 임시 노드의 파일만 저장 요청에 포함
    const attachments: ReportPendingAttachment[] = [];
    const stack: JSONContent[] = [content];
    while (stack.length) {
      const node = stack.pop()!;
      const uploadId = node.attrs?.uploadId;
      if (uploadId) {
        const file = pendingFiles.current.get(uploadId);
        if (!file) {
          toast.error('첨부 파일을 찾을 수 없습니다. 다시 넣어 주세요.');
          return;
        }
        attachments.push({ id: uploadId, file });
      }
      stack.push(...(node.content ?? []));
    }
    if (attachments.length > 10) {
      toast.error('새 첨부 파일은 최대 10개까지 저장할 수 있습니다.');
      return;
    }

    if (mode === 'edit') {
      if (reportId === undefined) {
        toast.error('수정할 보고서를 찾을 수 없습니다.');
        return;
      }

      updateMutation.mutate({ id: reportId, content, attachments });
      return;
    }

    createMutation.mutate({ content, attachments });
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  if (!editor) {
    return null;
  }

  return (
    <FormContainer>
      <FormSection>
        <form onSubmit={handleSubmit}>
          <EditorToolbar aria-label="보고서 서식 도구">
            <ToolbarButton type="button" $active={editorState?.isBold} aria-pressed={editorState?.isBold} onClick={() => editor.chain().focus().toggleBold().run()} title="굵게"><strong>B</strong></ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isItalic} aria-pressed={editorState?.isItalic} onClick={() => editor.chain().focus().toggleItalic().run()} title="기울임"><em>I</em></ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isUnderline} aria-pressed={editorState?.isUnderline} onClick={() => editor.chain().focus().toggleUnderline().run()} title="밑줄"><u>U</u></ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isHeading1} aria-pressed={editorState?.isHeading1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="제목 1">H1</ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isHeading2} aria-pressed={editorState?.isHeading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="제목 2">H2</ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isHeading3} aria-pressed={editorState?.isHeading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="제목 3">H3</ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isBulletList} aria-pressed={editorState?.isBulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} title="글머리표 목록">• 목록</ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isOrderedList} aria-pressed={editorState?.isOrderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="번호 목록">1. 목록</ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isBlockquote} aria-pressed={editorState?.isBlockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="인용문">인용</ToolbarButton>
            <ToolbarButton type="button" $active={editorState?.isCodeBlock}  aria-pressed={editorState?.isCodeBlock}  onClick={() =>  editor.chain().focus().toggleCodeBlock().run()} title="코드 블록">  코드</ToolbarButton>
            <ToolbarButton type="button" onClick={() => editor.chain().focus().undo().run()} title="실행 취소">↶</ToolbarButton>
            <ToolbarButton type="button" onClick={() => editor.chain().focus().redo().run()} title="다시 실행">↷</ToolbarButton>
          </EditorToolbar>
          <EditorArea>
            <EditorContent editor={editor} />
          </EditorArea>
          <DropHint>이미지 또는 파일을 본문의 원하는 위치에 끌어다 놓으세요. 파일은 각각 10MB 이하, 최대 10개까지 첨부할 수 있습니다.</DropHint>
          <ButtonGroup>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>닫기</Button>
            <Button type="submit" loading={isSubmitting}>{mode === 'create' ? '등록' : '수정'}</Button>
          </ButtonGroup>
        </form>
      </FormSection>
    </FormContainer>
  );
};

export default CreateReportForm;
