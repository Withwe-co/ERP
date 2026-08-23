// React 컴포넌트를 실제 브라우저 없이 HTML 문자열로 변환하기 위해 사용
import { renderToStaticMarkup } from "react-dom/server";

// styled-components의 theme 값을 테스트 환경에서도 사용할 수 있도록 ThemeProvider 사용
import { ThemeProvider } from "styled-components";

// Vitest에서 테스트 작성에 필요한 함수
import { describe, expect, it } from "vitest";

// 프로젝트에서 사용하는 실제 theme
import { theme } from "../../../styles/theme";

// 서버에서 조회한 태스크 데이터 타입
import { TaskResponse } from "../../../types/task";

// 테스트 대상인 TaskList 컴포넌트
// 현재는 아직 파일을 만들지 않았기 때문에 첫 테스트에서는 실패하는 것이 정상
import TaskList from "./TaskList";


// TaskList 컴포넌트 테스트 모음
describe("TaskList", () => {

  // 서버에서 받은 태스크 데이터가 실제 목록에 표시되는지 확인
  it("태스크 목록 데이터를 테이블에 표시한다", () => {

    // 테스트에 사용할 가짜 태스크 데이터
    // 실제 GET /api/v1/tasks/ 응답과 같은 TaskResponse 구조를 사용
    const tasks: TaskResponse[] = [
      {
        id: 1,

        // 해당 태스크가 속한 프로젝트 ID
        project_id: 1,

        // 해당 태스크가 속한 WBS ID
        wbs_id: 3,

        // 태스크 기본 정보
        task_name: "태스크 목록 구현",
        assignee_name: "김진산",
        department: "개발팀",

        // 우선순위와 상태
        priority: "HIGH",
        status: "IN_PROGRESS",

        // 태스크 예정 일정
        planned_start_date: "2026-08-21",
        planned_end_date: "2026-08-22",

        // 진척률
        progress_rate: 50,

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


    // TaskList를 실제 브라우저에 띄우는 대신
    // HTML 문자열로 렌더링하여 결과를 검사
    const html = renderToStaticMarkup(

      // TaskList 내부에서 사용하는 공통 Table이
      // theme.colors, theme.spacing 등을 사용하므로
      // 테스트에서도 ThemeProvider로 감싸줌
      <ThemeProvider theme={theme}>

        {/* TaskList에 테스트용 태스크 배열 전달 */}
        <TaskList tasks={tasks} />

      </ThemeProvider>,
    );


    // 렌더링 결과에 태스크명이 표시되는지 확인
    expect(html).toContain("태스크 목록 구현");

    // 담당자가 표시되는지 확인
    expect(html).toContain("김진산");

    // 부서가 표시되는지 확인
    expect(html).toContain("개발팀");

    // 진척률이 사용자에게 50% 형태로 표시되는지 확인
    expect(html).toContain("50%");
  });
});