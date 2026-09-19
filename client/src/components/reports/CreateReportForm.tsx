import React from 'react';
import { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Details, { DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import Underline from '@tiptap/extension-underline';
import styled from 'styled-components';

import Button from '../common/Button';
import Card from '../common/Card';

interface CreateReportFormProps {
  onSubmit: (content: JSONContent) => void;
  onCancel: () => void;
  initialContent?: JSONContent;
  submitLabel?: string;
}

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FormSection = styled(Card)`
  margin-bottom: 24px;
`;

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
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const CreateReportForm: React.FC<CreateReportFormProps> = ({
  onSubmit,
  onCancel,
  initialContent,
  submitLabel = '등록',
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Details, DetailsSummary, DetailsContent],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        'data-placeholder': '보고서 내용을 작성하세요.',
      },
    },
  });

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
        isDetails: currentEditor.isActive('details'),
      };
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editor) {
      onSubmit(editor.getJSON());
    }
  };

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
            <ToolbarButton type="button" $active={editorState?.isDetails} aria-pressed={editorState?.isDetails} onClick={() => {
              const chain = editor.chain().focus();
              editor.isActive('details') ? chain.unsetDetails().run() : chain.setDetails().run();
            }} title="토글 블록">토글</ToolbarButton>
            <ToolbarButton type="button" onClick={() => editor.chain().focus().undo().run()} title="실행 취소">↶</ToolbarButton>
            <ToolbarButton type="button" onClick={() => editor.chain().focus().redo().run()} title="다시 실행">↷</ToolbarButton>
          </EditorToolbar>
          <EditorArea>
            <EditorContent editor={editor} />
          </EditorArea>
          <ButtonGroup>
            <Button type="button" variant="outline" onClick={onCancel}>닫기</Button>
            <Button type="submit">{submitLabel}</Button>
          </ButtonGroup>
        </form>
      </FormSection>
    </FormContainer>
  );
};

export default CreateReportForm;
