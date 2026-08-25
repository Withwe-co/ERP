import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";
import TaskDetail from "./TaskDetail";


describe("TaskDetail", () => {
  it("선택한 태스크의 상세 정보를 표시한다", () => {
    const task: TaskResponse = {
      id: 15,
      project_id: 2,
      wbs_code: "2.1",
      task_name: "태스크명 수정 테스트",
      description: "상세 설명 테스트",
      assignee_name: "홍길동",
      department: "개발팀",
      priority: "NORMAL",
      status: "TODO",
      planned_start_date: "2026-08-26",
      planned_end_date: "2026-08-27",
      note: "비고 테스트",
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-24T06:07:04",
      updated_at: "2026-08-25T00:39:04",
    };

    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskDetail
          task={task}
          onEdit={() => {}}
          onClose={() => {}}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("태스크명 수정 테스트");
    expect(html).toContain("2.1");
    expect(html).toContain("홍길동");
    expect(html).toContain("개발팀");
    expect(html).toContain("보통");
    expect(html).toContain("대기");
    expect(html).toContain("2026-08-26");
    expect(html).toContain("2026-08-27");
    expect(html).toContain("상세 설명 테스트");
    expect(html).toContain("비고 테스트");
    expect(html).toContain("수정");
    expect(html).toContain("닫기");
  });
});