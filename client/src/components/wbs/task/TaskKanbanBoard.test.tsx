import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";

import TaskKanbanBoard, {
  getActiveDragTask,
  getDragSensorOptions,
  getDropStatus,
  getKanbanDropTarget,
  mergeKanbanTasks,
  moveTaskInKanban,
} from "./TaskKanbanBoard";


const baseTask: TaskResponse = {
  id: 1,
  project_id: 1,
  wbs_code: "1.1",
  task_name: "태스크",
  assignee_name: "가나다",
  department: "S/W 개발팀",
  priority: "NORMAL",
  status: "TODO",
  planned_start_date: "2026-08-31",
  planned_end_date: "2026-09-01",
  description: "",
  note: "",
  is_archived: false,
  archived_at: null,
  created_at: "2026-08-31T10:00:00",
  updated_at: "2026-08-31T10:00:00",
};


describe("TaskKanbanBoard", () => {

  // 태스크가 상태별 칸반 컬럼에 표시되는지 확인
  it("태스크를 상태별 칸반 컬럼에 표시한다", () => {
    const tasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "대기 태스크",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "진행 태스크",
        status: "IN_PROGRESS",
      },
      {
        ...baseTask,
        id: 3,
        wbs_code: "1.3",
        task_name: "완료 태스크",
        status: "DONE",
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

  // 각 상태별 태스크 개수가 표시되는지 확인
  it("각 칸반 컬럼에 태스크 개수를 표시한다", () => {
    const tasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "대기 태스크 1",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "대기 태스크 2",
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

  // 태스크가 없는 컬럼에 빈 상태 메시지가 표시되는지 확인
  it("태스크가 없는 칸반 컬럼에 빈 상태 메시지를 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskKanbanBoard
          tasks={[]}
          onDetail={() => {}}
        />
      </ThemeProvider>,
    );

    expect(html).toContain("등록된 태스크가 없습니다.");
  });

  // 칸반 컬럼 ID를 올바른 태스크 상태로 변환하는지 확인
  it("드롭한 칸반 컬럼의 상태를 반환한다", () => {
    expect(getDropStatus("TODO")).toBe("TODO");
    expect(getDropStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(getDropStatus("DONE")).toBe("DONE");
  });

  // 세 상태 컬럼이 모두 Drop 영역으로 표시되는지 확인
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

  // 클릭과 Drag를 구분하면서 4px 이동 시 Drag가 시작되는지 확인
  it("포인터가 4px 이상 이동했을 때 Drag를 시작하도록 설정한다", () => {
    expect(getDragSensorOptions()).toEqual({
      activationConstraint: {
        distance: 4,
      },
    });
  });

  // 다른 컬럼의 특정 카드 앞으로 이동할 수 있는지 확인
  it("다른 컬럼의 원하는 위치에 태스크를 삽입한다", () => {
    const tasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "대기 A",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "진행 B",
        status: "IN_PROGRESS",
      },
      {
        ...baseTask,
        id: 3,
        wbs_code: "1.3",
        task_name: "진행 C",
        status: "IN_PROGRESS",
      },
    ];

    const result = moveTaskInKanban(
      tasks,
      1,
      "IN_PROGRESS",
      2,
    );

    const inProgressTasks = result.filter(
      (task) => task.status === "IN_PROGRESS",
    );

    expect(
      inProgressTasks.map((task) => task.task_name),
    ).toEqual([
      "대기 A",
      "진행 B",
      "진행 C",
    ]);
  });

  // 다른 컬럼에 있는 두 카드 사이로 이동할 수 있는지 확인
  it("다른 컬럼의 두 태스크 사이에 카드를 삽입한다", () => {
    const tasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "진행 B",
        status: "IN_PROGRESS",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "완료 D",
        status: "DONE",
      },
      {
        ...baseTask,
        id: 3,
        wbs_code: "1.3",
        task_name: "완료 E",
        status: "DONE",
      },
    ];

    const result = moveTaskInKanban(
      tasks,
      1,
      "DONE",
      3,
    );

    const doneTasks = result.filter(
      (task) => task.status === "DONE",
    );

    expect(
      doneTasks.map((task) => task.task_name),
    ).toEqual([
      "완료 D",
      "진행 B",
      "완료 E",
    ]);
  });

  // 카드 위에 Drop했을 때 대상 카드의 상태와 ID를 반환하는지 확인
  it("드롭한 카드의 상태와 태스크 ID를 반환한다", () => {
    const tasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "대기 태스크",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "진행 태스크",
        status: "IN_PROGRESS",
      },
    ];

    const result = getKanbanDropTarget(
      tasks,
      2,
    );

    expect(result).toEqual({
      status: "IN_PROGRESS",
      targetTaskId: 2,
    });
  });

  // 빈 컬럼에 Drop했을 때 해당 상태만 반환하는지 확인
  it("칸반 컬럼에 직접 드롭하면 상태만 반환한다", () => {
    const result = getKanbanDropTarget(
      [],
      "DONE",
    );

    expect(result).toEqual({
      status: "DONE",
      targetTaskId: null,
    });
  });

  // Drag 중인 태스크를 Overlay에 표시할 수 있는지 확인
  it("드래그 중인 태스크를 Overlay용 데이터로 반환한다", () => {
    const tasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "대기 태스크",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "진행 태스크",
        priority: "HIGH",
        status: "IN_PROGRESS",
      },
    ];

    const result = getActiveDragTask(
      tasks,
      2,
    );

    expect(result?.id).toBe(2);
    expect(result?.task_name).toBe("진행 태스크");
  });

  // 존재하지 않는 태스크는 Overlay 데이터로 반환하지 않는지 확인
  it("존재하지 않는 드래그 태스크는 null을 반환한다", () => {
    expect(
      getActiveDragTask([], 999),
    ).toBeNull();
  });

  // 부모 데이터 갱신 시 현재 카드 순서는 유지되는지 확인
  it("부모 태스크가 갱신되어도 드롭한 카드 순서를 유지한다", () => {
    const currentTasks: TaskResponse[] = [
      {
        ...baseTask,
        task_name: "A",
        status: "IN_PROGRESS",
      },
      {
        ...baseTask,
        id: 3,
        wbs_code: "1.3",
        task_name: "C",
        status: "IN_PROGRESS",
      },
      {
        ...baseTask,
        id: 2,
        wbs_code: "1.2",
        task_name: "B",
        status: "IN_PROGRESS",
      },
      {
        ...baseTask,
        id: 4,
        wbs_code: "1.4",
        task_name: "D",
        status: "IN_PROGRESS",
      },
    ];

    const incomingTasks: TaskResponse[] = [
      currentTasks[0],
      currentTasks[2],
      {
        ...currentTasks[1],
        updated_at: "2026-08-31T15:30:00",
      },
      currentTasks[3],
    ];

    const result = mergeKanbanTasks(
      currentTasks,
      incomingTasks,
    );

    expect(
      result.map((task) => task.task_name),
    ).toEqual([
      "A",
      "C",
      "B",
      "D",
    ]);

    expect(result[1].updated_at).toBe(
      "2026-08-31T15:30:00",
    );
  });
});