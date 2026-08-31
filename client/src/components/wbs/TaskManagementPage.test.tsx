import { renderToStaticMarkup } from "react-dom/server";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../styles/theme";
import { TaskResponse } from "../../types/task";

import TaskManagementPage from "./TaskManagementPage";


describe("TaskManagementPage", () => {

  // 기본 칸반 화면에 조회된 태스크 정보가 표시되는지 확인
  it("기본 칸반 화면에 조회된 태스크를 표시한다", () => {
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
        kanban_order: 0,
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

    // TaskManagementPage에서 사용하는 queryKey에 테스트 데이터 저장
    queryClient.setQueryData(
      ["tasks", 1, {}, "active"],
      tasks,
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

    expect(html).toContain("칸반 화면 연결");
    expect(html).toContain("WBS 1.3");
    expect(html).toContain("담당자씨");
  });

  // 전체 태스크 → 보류 태스크 → 태스크 등록 순서로 표시되는지 확인
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

  // 검색, 보기 전환, 관리 버튼과 콘텐츠가 하나의 영역에 있는지 확인
  it("태스크 관리 기능과 콘텐츠를 하나의 관리 영역에 표시한다", () => {
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

    expect(html).toContain(
      'data-testid="task-workspace"',
    );

    expect(html).toContain("태스크명으로 검색");
    expect(html).toContain("칸반 보기");
    expect(html).toContain("목록 보기");
    expect(html).toContain("전체 태스크");
    expect(html).toContain("보류 태스크");
    expect(html).toContain("태스크 등록");

    expect(html).toContain(
      "등록된 태스크가 없습니다.",
    );
  });

  // 검색/필터 → 선택 필터 → Toolbar 순서로 배치되는지 확인
  it("태스크 관리 상단 기능을 세 개의 행으로 구분해 표시한다", () => {
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

    expect(filterRowIndex).toBeLessThan(
      filterActionRowIndex,
    );

    expect(filterActionRowIndex).toBeLessThan(
      toolbarRowIndex,
    );
  });
});