// React 컴포넌트를 실제 브라우저 없이 HTML 문자열로 변환하기 위해 사용
import { renderToStaticMarkup } from "react-dom/server";

// styled-components의 theme 값을 테스트 환경에서도 사용할 수 있도록 ThemeProvider 사용
import { ServerStyleSheet, ThemeProvider } from "styled-components";

// Vitest에서 테스트 작성에 필요한 함수
import { describe, expect, it } from "vitest";

// 프로젝트에서 사용하는 실제 theme
import { theme } from "../../../styles/theme";

// 서버에서 조회한 태스크 데이터 타입
import { TaskResponse } from "../../../types/task";

// 테스트 대상인 TaskList 컴포넌트
// 현재는 아직 파일을 만들지 않았기 때문에 첫 테스트에서는 실패하는 것이 정상
import TaskList from "./TaskList";

import styled from "styled-components";
import { Pencil, Archive } from "lucide-react";


// TaskList 컴포넌트 테스트 모음
describe("TaskList", () => {

  // 테스트에 사용할 가짜 태스크 데이터
  // 실제 GET /api/v1/tasks/ 응답과 같은 TaskResponse 구조를 사용
  const tasks: TaskResponse[] = [
    {
      id: 1,

      // 해당 태스크가 속한 프로젝트 ID
      project_id: 1,

      // 해당 태스크가 속한 WBS CODE
      wbs_code: "1.3",

      // 태스크 기본 정보
      task_name: "태스크 목록 구현",
      assignee_name: "담당자씨",
      department: "개발팀",

      // 우선순위와 상태
      priority: "HIGH",
      status: "IN_PROGRESS",

      // 태스크 예정 일정
      planned_start_date: "2026-08-21",
      planned_end_date: "2026-08-22",

      // 선택 입력값
      description: "TaskList 구현",
      note: "",

      // 서버 응답에 포함되는 보관 정보
      is_archived: false,
      archived_at: null,

      // 서버에서 관리하는 생성/수정 시간
      created_at: "2026-08-21T10:00:00",
      updated_at: "2026-08-21T10:00:00",
    },
  ];

  // 서버에서 받은 태스크 데이터가 실제 목록에 표시되는지 확인
  it("태스크 목록 데이터를 테이블에 표시한다", () => {

    // TaskList를 실제 브라우저에 띄우는 대신
    // HTML 문자열로 렌더링하여 결과를 검사
    const html = renderToStaticMarkup(

      // TaskList 내부에서 사용하는 공통 Table이
      // theme.colors, theme.spacing 등을 사용하므로
      // 테스트에서도 ThemeProvider로 감싸줌
      <ThemeProvider theme={theme}>

        {/* TaskList에 테스트용 태스크 배열 전달 */}
        <TaskList tasks={tasks} onEdit={() => {}} onDetail={() => {}} />

      </ThemeProvider>,
    );


    // 렌더링 결과에 태스크명이 표시되는지 확인
    expect(html).toContain("태스크 목록 구현");

    // 담당자가 표시되는지 확인
    expect(html).toContain("담당자씨");

    // 부서가 표시되는지 확인
    expect(html).toContain("개발팀");

    // 태스크 수정 기능으로 이동할 수 있는 수정 버튼이 표시되는지 확인
    expect(html).toContain("수정");
  });

  it("상태를 첫 번째 열에 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskList
          tasks={tasks}
        />
      </ThemeProvider>,
    );

    const statusIndex = html.indexOf("상태");
    const taskNameIndex = html.indexOf("태스크명");

    expect(statusIndex).toBeGreaterThan(-1);
    expect(taskNameIndex).toBeGreaterThan(-1);
    expect(statusIndex).toBeLessThan(taskNameIndex);
  });

  it("태스크 상태를 한글로 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskList tasks={tasks} />
      </ThemeProvider>,
    );

    expect(html).toContain("진행 중");
  });

  it("전체 태스크 목록에서는 보류 버튼을 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskList
          tasks={tasks}
          onEdit={() => {}}
          onDetail={() => {}}
          onArchive={() => {}}
          onRestore={() => {}}
          archivedView={false}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("보류");
    expect(html).not.toContain(">진행<");
  });

  it("보류 태스크 목록에서는 진행 버튼을 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskList
          tasks={tasks}
          onEdit={() => {}}
          onDetail={() => {}}
          onArchive={() => {}}
          onRestore={() => {}}
          archivedView={true}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("진행");
    expect(html).not.toContain(">보류<");
  });

  // 태스크 목록에서 가장 최근에 등록된 태스크가 가장 위에 표시되고,
  // updated_at이 변경되어도 created_at 기준의 위치는 유지되는지 확인
  it("태스크를 created_at 기준 최신 등록순으로 표시한다", () => {
    // 오래된 태스크의 수정 시간은 더 최근으로 설정하여
    // updated_at이 정렬 기준으로 사용되지 않는지도 함께 확인
    const unorderedTasks: TaskResponse[] = [
      {
        ...tasks[0],
        id: 1,
        task_name: "먼저 등록된 태스크",
        created_at: "2026-08-20T10:00:00",
        updated_at: "2026-08-31T10:00:00",
      },
      {
        ...tasks[0],
        id: 2,
        task_name: "최근 등록된 태스크",
        created_at: "2026-08-30T10:00:00",
        updated_at: "2026-08-30T10:00:00",
      },
    ];

    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskList
          tasks={unorderedTasks}
          onEdit={() => {}}
          onDetail={() => {}}
        />
      </ThemeProvider>,
    );

    // created_at이 더 최근인 태스크가 HTML에서도 먼저 렌더링되어야 함
    const recentTaskIndex = html.indexOf("최근 등록된 태스크");
    const oldTaskIndex = html.indexOf("먼저 등록된 태스크");

    expect(recentTaskIndex).toBeGreaterThan(-1);
    expect(oldTaskIndex).toBeGreaterThan(-1);
    expect(recentTaskIndex).toBeLessThan(oldTaskIndex);
  });

  // 태스크 목록의 각 행에서 텍스트와 수정/보류 버튼이
  // 위쪽에 붙지 않고 세로 중앙에 나란히 표시되는지 확인
  it("태스크 목록의 셀 내용을 세로 중앙에 정렬한다", () => {
    // styled-components가 생성하는 CSS까지 확인하기 위해
    // 테스트용 ServerStyleSheet를 생성
    const sheet = new ServerStyleSheet();

    renderToStaticMarkup(
      sheet.collectStyles(
        <ThemeProvider theme={theme}>
          <TaskList
            tasks={tasks}
            onEdit={() => {}}
            onDetail={() => {}}
          />
        </ThemeProvider>,
      ),
    );

    // TaskList에서 생성한 styled-components CSS 추출
    const styles = sheet.getStyleTags();

    sheet.seal();

    // 목록의 td가 vertical-align: middle을 사용해야 함
    expect(styles).toContain("vertical-align:middle");
  });
});
