import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";

import TaskCard from "./TaskCard";


describe("TaskCard", () => { it("태스크의 주요 정보를 카드에 표시한다", () => {

    const task: TaskResponse = {
      id: 1,
      project_id: 1,
      wbs_code: "1.3",
      task_name: "칸반 카드 구현",
      assignee_name: "김이박",
      department: "개발팀",
      priority: "HIGH",
      status: "IN_PROGRESS",
      planned_start_date: "2026-08-25",
      planned_end_date: "2026-08-27",
      description: "TaskCard 구현",
      note: "",
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-25T10:00:00",
      updated_at: "2026-08-25T10:00:00",
    };

    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskCard
          task={task}
          onDetail={() => {}}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("칸반 카드 구현");
    expect(html).toContain("1.3");
    expect(html).toContain("김이박");
    expect(html).toContain("높음");
    expect(html).toContain("2026-08-27");
  });

  it("우선순위를 한글로 표시한다", () => {

    const task: TaskResponse = {
        id: 1,
        project_id: 1,
        wbs_code: "1.3",
        task_name: "칸반 카드 디자인",
        assignee_name: "김진산",
        department: "개발팀",
        priority: "HIGH",
        status: "IN_PROGRESS",
        planned_start_date: "2026-08-25",
        planned_end_date: "2026-08-27",
        description: "",
        note: "",
        is_archived: false,
        archived_at: null,
        created_at: "2026-08-25T10:00:00",
        updated_at: "2026-08-25T10:00:00",
    };

    const html = renderToStaticMarkup(
        <ThemeProvider theme={theme}>
        <TaskCard
            task={task}
            onDetail={() => {}}
        />
        </ThemeProvider>,
    );

    expect(html).toContain("높음");

    // 완료 예정일의 항목명이 표시되는지 확인
    expect(html).toContain("완료예정일");
    });

    it("태스크 카드를 드래그 가능한 요소로 표시한다", () => {
    const task: TaskResponse = {
      id: 1,
      project_id: 1,
      wbs_code: "1.3",
      task_name: "드래그 태스크",
      assignee_name: "김진산",
      department: "개발팀",
      priority: "NORMAL",
      status: "TODO",
      planned_start_date: "2026-08-27",
      planned_end_date: "2026-08-28",
      description: "",
      note: "",
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-27T10:00:00",
      updated_at: "2026-08-27T10:00:00",
    };

    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskCard task={task} onDetail={() => {}} />
      </ThemeProvider>,
    );

    // dnd-kit의 draggable 속성이 카드에 연결되는지 확인
    expect(html).toContain('aria-roledescription="draggable"');
    expect(html).toContain('data-task-id="1"');
  });
});