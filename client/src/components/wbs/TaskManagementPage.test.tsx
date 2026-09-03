import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../styles/theme";
import {
  TaskCreateData,
  TaskResponse,
} from "../../types/task";

import TaskManagementPage from "./TaskManagementPage";
import {
  shouldSaveKanbanOrder,
} from "./task/TaskKanbanBoard";
import {
  validateTaskCreateData,
} from "./task/taskValidation";
import {
  getTaskContentView,
} from "./task/taskViewMode";
import {
  getSelectableWbsCodes,
} from "./task/wbsOptions";


const validTaskData: TaskCreateData = {
  project_id: 1,
  wbs_code: "1.1",
  task_name: "태스크 통합 테스트",
  assignee_name: "김진산",
  department: "S/W 개발팀",
  priority: "NORMAL",
  status: "TODO",
  planned_start_date: "2026-08-20",
  planned_end_date: "2026-08-21",
  description: "",
  note: "",
};


describe("TaskManagementPage 통합 테스트", () => {
  // 태스크 관리 페이지의 주요 기능과 조회 결과가 연결되는지 확인
  it("조회된 태스크와 주요 관리 기능을 표시한다", () => {
    const task: TaskResponse = {
      ...validTaskData,
      id: 1,
      kanban_order: 0,
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-25T10:00:00",
      updated_at: "2026-08-25T10:00:00",
    };

    const queryClient = new QueryClient();

    queryClient.setQueryData(
      ["tasks", 1, {}, "active"],
      [task],
    );

    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <TaskManagementPage
            projectId={1}
            projectName="테스트 프로젝트"
            projectStartDate="2026-08-01"
            projectDueDate="2026-09-30"
          />
        </ThemeProvider>
      </QueryClientProvider>,
    );

    expect(html).toContain("태스크 통합 테스트");
    expect(html).toContain("WBS 1.1");
    expect(html).toContain("김진산");

    expect(html).toContain("칸반 보기");
    expect(html).toContain("목록 보기");
    expect(html).toContain("전체 태스크");
    expect(html).toContain("보류 태스크");
    expect(html).toContain("태스크 등록");
  });

  // 태스크 등록에 필요한 필수값과 프로젝트 기간 검증 확인
  it("태스크 등록 데이터의 필수값과 날짜를 검증한다", () => {
    expect(
      validateTaskCreateData({
        ...validTaskData,
        wbs_code: "",
      }),
    ).toBe("WBS 코드를 선택해주세요.");

    expect(
      validateTaskCreateData({
        ...validTaskData,
        planned_end_date: "2026-08-19",
      }),
    ).toBe(
      "완료 예정일은 시작 예정일보다 빠를 수 없습니다.",
    );

    expect(
      validateTaskCreateData(
        {
          ...validTaskData,
          planned_start_date: "2026-07-31",
        },
        "2026-08-01",
        "2026-09-30",
      ),
    ).toBe(
      "프로젝트 기간(2026-08-01 ~ 2026-09-30)을 " +
      "벗어난 날짜는 선택할 수 없습니다.",
    );

    expect(
      validateTaskCreateData(
        validTaskData,
        "2026-08-01",
        "2026-09-30",
      ),
    ).toBeNull();
  });

  // 전체 태스크는 선택한 보기 방식을 사용하고
  // 보류 태스크는 목록 보기로 고정되는지 확인
  it("전체 및 보류 태스크의 보기 방식을 올바르게 결정한다", () => {
    expect(
      getTaskContentView("active", "kanban"),
    ).toBe("kanban");

    expect(
      getTaskContentView("active", "list"),
    ).toBe("list");

    expect(
      getTaskContentView("archived", "kanban"),
    ).toBe("list");
  });

  // 부모 WBS를 제외하고 실제 태스크를 연결할 최하위 WBS만 반환
  it("태스크 등록에 사용할 최하위 WBS를 계층 순서로 반환한다", () => {
    const result = getSelectableWbsCodes([
      { wbs_code: "3.2" },
      { wbs_code: "1" },
      { wbs_code: "2" },
      { wbs_code: "1.2" },
      { wbs_code: "3" },
      { wbs_code: "3.1" },
      { wbs_code: "1.1" },
    ]);

    expect(result).toEqual([
      "1.1",
      "1.2",
      "2",
      "3.1",
      "3.2",
    ]);
  });

  // 상태 간 DnD 후 같은 인덱스에 놓여도 상태 변경 내용을 저장
  it("상태 간 이동 후 같은 인덱스에 Drop해도 칸반 상태를 저장한다", () => {
    expect(
      shouldSaveKanbanOrder(0, 0),
    ).toBe(true);

    expect(
      shouldSaveKanbanOrder(-1, 0),
    ).toBe(false);
  });
});