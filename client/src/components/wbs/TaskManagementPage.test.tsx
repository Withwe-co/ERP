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