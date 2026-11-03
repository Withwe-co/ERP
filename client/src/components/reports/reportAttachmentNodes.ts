import { mergeAttributes, Node } from '@tiptap/core';

// 보고서의 지정한 위치에 업로드 이미지 또는 임시 미리보기를 유지하는 노드
export const ReportImage = Node.create({
  name: 'reportImage',
  group: 'block',
  atom: true,
  draggable: true,
  // 저장할 이미지 주소와 임시 업로드 ID를 노드 속성으로 정의
  addAttributes() {
    return { src: { default: null }, name: { default: '' }, uploadId: { default: null } };
  },
  // 저장된 이미지 HTML을 보고서 노드로 다시 읽음
  parseHTML() {
    return [{ tag: 'img[data-report-image]' }];
  },
  // 편집 화면과 조회 화면에 이미지 요소를 렌더링
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, {
      'data-report-image': '',
      alt: HTMLAttributes.name,
    })];
  },
});

// 보고서의 지정한 위치에 다운로드 가능한 파일 이름을 유지하는 노드
export const ReportFile = Node.create({
  name: 'reportFile',
  group: 'block',
  atom: true,
  draggable: true,
  // 저장할 파일 주소, 이름, 임시 업로드 ID를 정의
  addAttributes() {
    return { href: { default: null }, name: { default: '' }, uploadId: { default: null } };
  },
  // 저장된 파일 링크 HTML을 보고서 노드로 다시 읽음
  parseHTML() {
    return [{
      tag: 'p[data-report-file]',
      getAttrs: element => ({
        href: (element as HTMLElement).querySelector('a')?.getAttribute('href'),
        name: (element as HTMLElement).querySelector('a')?.textContent ?? '',
      }),
    }];
  },
  // 파일을 해당 위치의 다운로드 링크로 렌더링
  renderHTML({ node }) {
    return ['p', { 'data-report-file': '' }, [
      'a',
      { href: node.attrs.href || undefined, download: node.attrs.name },
      node.attrs.name,
    ]];
  },
});
