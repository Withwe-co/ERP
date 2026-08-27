import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";

import TaskKanbanBoard, {getDragSensorOptions, getDropStatus, getTaskStatusChange, handleTaskDragEnd,} from "./TaskKanbanBoard";


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

    it("드롭한 칸반 컬럼의 상태를 반환한다", () => {
      expect(getDropStatus("TODO")).toBe("TODO");
      expect(getDropStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
      expect(getDropStatus("DONE")).toBe("DONE");
    });

    it("같은 상태 컬럼에 드롭하면 상태 변경 정보를 반환하지 않는다", () => {
      const result = getTaskStatusChange(1, "TODO", "TODO");
      expect(result).toBeNull();
    });

    it("태스크를 다른 상태 컬럼에 드롭하면 변경할 태스크 ID와 상태를 반환한다", () => {
      const result = getTaskStatusChange(1, "IN_PROGRESS", "TODO");
      expect(result).toEqual({taskId: 1, status: "IN_PROGRESS",});
    });  

  it("칸반 상태가 아닌 영역에 드롭하면 상태 변경 정보를 반환하지 않는다", () => {
    const result = getTaskStatusChange(1, "INVALID");
    expect(result).toBeNull();
  });

  it("칸반에 TODO, IN_PROGRESS, DONE 드롭 영역을 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskKanbanBoard
          tasks={[]}
          onDetail={() => {}}
        />
      </ThemeProvider>,
    );

    expect(html).toContain('data-column-id="TODO"');
    expect(html).toContain('data-column-id="IN_PROGRESS"');
    expect(html).toContain('data-column-id="DONE"');
  });

  // Drag 종료 시 다른 컬럼으로 이동한 태스크의 상태 변경 정보를 전달
  it("드래그가 끝나면 변경할 태스크 ID와 상태를 전달한다", () => {
    const tasks: TaskResponse[] = [
      {
        id: 1,
        project_id: 1,
        wbs_code: "1.1",
        task_name: "드래그 태스크",
        assignee_name: "SYA",
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
      },
    ];

    let changedTaskId: number | null = null;
    let changedStatus: TaskResponse["status"] | null = null;

    handleTaskDragEnd(1, "IN_PROGRESS", tasks, (taskId, status) => {changedTaskId = taskId; changedStatus = status;});

    expect(changedTaskId).toBe(1);
    expect(changedStatus).toBe("IN_PROGRESS");
  });

  // 단순 클릭과 Drag를 구분하기 위해 일정 거리 이상 이동해야 Drag를 시작
  it("포인터가 8px 이상 이동했을 때 Drag를 시작하도록 설정한다", () => {
    expect(getDragSensorOptions()).toEqual({activationConstraint: {distance: 8,},});
  });

});
