import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../styles/theme";
import { TaskResponse } from "../../types/task";

import TaskManagementPage, { restoreTaskStatusInList, updateTaskStatusInList } from "./TaskManagementPage";


describe("TaskManagementPage", () => { it("기본 칸반 화면에 조회된 태스크를 표시한다", () => {

    const tasks: TaskResponse[] = [
      {
        id: 1,
        project_id: 1,
        wbs_code: "1.3",
        task_name: "칸반 화면 연결",
        assignee_name: "담당자씨",
        department: "개발팀",
        priority: "HIGH",
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
    ];

    const queryClient = new QueryClient();

    // TaskManagementPage에서 사용하는 queryKey와 동일한 키에
    // 테스트용 태스크 데이터를 미리 저장
    queryClient.setQueryData(["tasks", 1, {}, "active"],tasks,);

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

    expect(html).toContain("칸반 화면 연결");
    expect(html).toContain("WBS 1.3");
    expect(html).toContain("담당자씨");
  });

  // Optimistic Update 시 해당 태스크의 status만 먼저 변경되는지 확인
  it("상태 변경 시 해당 태스크만 새로운 상태로 변경한다", () => {
    const tasks: TaskResponse[] = [
      {
        id: 1,
        project_id: 1,
        wbs_code: "1.1",
        task_name: "대기 태스크",
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

    const result = updateTaskStatusInList(tasks, 1, "IN_PROGRESS");

    expect(result[0].status).toBe("IN_PROGRESS");
  });

  // 태스크 관리 상단 영역에서 전체 태스크 → 보류 태스크 → 태스크 등록 순으로 버튼이 표시되는지 확인
  it("상단 관리 영역의 버튼을 지정한 순서로 표시한다", () => {
    const queryClient = new QueryClient();

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

    const allTaskIndex = html.indexOf("전체 태스크");
    const archivedTaskIndex = html.indexOf("보류 태스크");
    const createTaskIndex = html.indexOf("태스크 등록");

    expect(allTaskIndex).toBeGreaterThan(-1);
    expect(archivedTaskIndex).toBeGreaterThan(-1);
    expect(createTaskIndex).toBeGreaterThan(-1);

    expect(allTaskIndex).toBeLessThan(archivedTaskIndex);
    expect(archivedTaskIndex).toBeLessThan(createTaskIndex);
  });

  // 검색/필터, 보기 전환, 태스크 관리 버튼, 칸반/목록 콘텐츠가
  // 하나의 태스크 관리 영역 안에 함께 표시되는지 확인
  it("태스크 관리 기능과 콘텐츠를 하나의 관리 영역에 표시한다", () => {
    // TaskManagementPage 렌더링에 필요한 React Query 환경 생성
    const queryClient = new QueryClient();

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

    // 태스크 관리 페이지에서 사용하는 하나의 통합 영역이 존재해야 함
    expect(html).toContain('data-testid="task-workspace"');

    // 통합 영역에서 검색, 보기 전환, 태스크 관리 기능을 모두 제공
    expect(html).toContain("태스크명으로 검색");
    expect(html).toContain("칸반 보기");
    expect(html).toContain("목록 보기");
    expect(html).toContain("전체 태스크");
    expect(html).toContain("보류 태스크");
    expect(html).toContain("태스크 등록");

    // 기본 보기인 칸반 콘텐츠도 같은 페이지에서 표시
    expect(html).toContain("등록된 태스크가 없습니다.");
  });

  // 검색/필터 영역이 입력 행 → 선택 필터 행 → 보기/관리 버튼 행 순으로
  // 태스크 콘텐츠 위에 배치되는지 확인
  it("태스크 관리 상단 기능을 세 개의 행으로 구분해 표시한다", () => {
    // TaskManagementPage 렌더링에 필요한 React Query 환경 생성
    const queryClient = new QueryClient();

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

    // 각 행을 구분하기 위한 영역이 모두 존재해야 함
    const filterRowIndex = html.indexOf(
      'data-testid="task-filter-row"',
    );
    const filterActionRowIndex = html.indexOf(
      'data-testid="task-filter-action-row"',
    );
    const toolbarRowIndex = html.indexOf(
      'data-testid="task-toolbar-row"',
    );

    expect(filterRowIndex).toBeGreaterThan(-1);
    expect(filterActionRowIndex).toBeGreaterThan(-1);
    expect(toolbarRowIndex).toBeGreaterThan(-1);

    // 화면 위에서부터 검색/필터 → 선택 필터 → Toolbar 순으로 배치
    expect(filterRowIndex).toBeLessThan(filterActionRowIndex);
    expect(filterActionRowIndex).toBeLessThan(toolbarRowIndex);
  });

  // API 실패 시 Optimistic Update 이전 상태로 태스크를 복구
  it("상태 변경 실패 시 태스크를 이전 상태로 복구한다", () => {
    const tasks: TaskResponse[] = [
      {
        id: 1,
        project_id: 1,
        wbs_code: "1.1",
        task_name: "Rollback 태스크",
        assignee_name: "SYA",
        department: "개발팀",
        priority: "NORMAL",
        status: "IN_PROGRESS",
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

    const result = restoreTaskStatusInList(tasks, 1, "TODO");

    expect(result[0].status).toBe("TODO");
  });
});