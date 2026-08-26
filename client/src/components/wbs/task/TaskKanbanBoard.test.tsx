import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";

import TaskKanbanBoard from "./TaskKanbanBoard";


describe("TaskKanbanBoard", () => {

  it("태스크를 상태별 칸반 컬럼에 표시한다", () => {

    const tasks: TaskResponse[] = [
      {
        id: 1,
        project_id: 1,
        wbs_code: "1.1",
        task_name: "대기 태스크",
        assignee_name: "김진산",
        department: "개발팀",
        priority: "NORMAL",
        status: "TODO",
        planned_start_date: "2026-08-25",
        planned_end_date: "2026-08-26",
        description: "",
        note: "",
        is_archived: false,
        archived_at: null,
        created_at: "2026-08-25T10:00:00",
        updated_at: "2026-08-25T10:00:00",
      },
      {
        id: 2,
        project_id: 1,
        wbs_code: "1.2",
        task_name: "진행 태스크",
        assignee_name: "이담당",
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
      },
      {
        id: 4,
        project_id: 1,
        wbs_code: "1.4",
        task_name: "완료 태스크",
        assignee_name: "최담당",
        department: "개발팀",
        priority: "URGENT",
        status: "DONE",
        planned_start_date: "2026-08-24",
        planned_end_date: "2026-08-25",
        description: "",
        note: "",
        is_archived: false,
        archived_at: null,
        created_at: "2026-08-25T10:00:00",
        updated_at: "2026-08-25T10:00:00",
      },
    ];

    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskKanbanBoard
          tasks={tasks}
          onDetail={() => {}}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("대기");
    expect(html).toContain("진행 중");
    expect(html).toContain("완료");

    expect(html).toContain("대기 태스크");
    expect(html).toContain("진행 태스크");
    expect(html).toContain("완료 태스크");
  });

  it("각 칸반 컬럼에 태스크 개수를 표시한다", () => {

        const tasks: TaskResponse[] = [
            {
            id: 1,
            project_id: 1,
            wbs_code: "1.1",
            task_name: "대기 태스크 1",
            assignee_name: "김진산",
            department: "개발팀",
            priority: "NORMAL",
            status: "TODO",
            planned_start_date: "2026-08-25",
            planned_end_date: "2026-08-27",
            description: "",
            note: "",
            is_archived: false,
            archived_at: null,
            created_at: "2026-08-25T10:00:00",
            updated_at: "2026-08-25T10:00:00",
            },
            {
            id: 2,
            project_id: 1,
            wbs_code: "1.2",
            task_name: "대기 태스크 2",
            assignee_name: "김진산",
            department: "개발팀",
            priority: "HIGH",
            status: "TODO",
            planned_start_date: "2026-08-25",
            planned_end_date: "2026-08-28",
            description: "",
            note: "",
            is_archived: false,
            archived_at: null,
            created_at: "2026-08-25T10:00:00",
            updated_at: "2026-08-25T10:00:00",
            },
        ];

        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
            <TaskKanbanBoard
                tasks={tasks}
                onDetail={() => {}}
            />
            </ThemeProvider>,
        );

        expect(html).toContain("대기");
        expect(html).toContain(">2<");

        expect(html).toContain("진행 중");
        expect(html).toContain(">0<");

        expect(html).not.toContain("보류");
        expect(html).toContain("완료");
        });

        it("태스크가 없는 칸반 컬럼에 빈 상태 메시지를 표시한다", () => {

    const tasks: TaskResponse[] = [];

    const html = renderToStaticMarkup(
        <ThemeProvider theme={theme}>
        <TaskKanbanBoard
            tasks={tasks}
            onDetail={() => {}}
        />
        </ThemeProvider>,
    );

    expect(html).toContain("등록된 태스크가 없습니다.");
    });
});
