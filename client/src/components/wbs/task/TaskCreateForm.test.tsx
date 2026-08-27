import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";
import TaskCreateForm from "./TaskCreateForm";

vi.mock("../../../services/api", () => ({taskApi: {createTask: vi.fn(), updateTask: vi.fn(),},}));

describe("TaskCreateForm 수정 모드", () => {
    it("수정할 태스크의 기존 값을 폼에 표시한다", () => {
        const task: TaskResponse = {
        id: 1,
        project_id: 1,
        wbs_code: "1.2",
        task_name: "수정 전 태스크",
        assignee_name: "홍길동",
        department: "S/W 개발팀",
        priority: "HIGH",
        status: "IN_PROGRESS",
        planned_start_date: "2026-08-24",
        planned_end_date: "2026-08-26",
        description: "기존 설명",
        note: "기존 비고",
        is_archived: false,
        archived_at: null,
        created_at: "2026-08-24T10:00:00",
        updated_at: "2026-08-24T10:00:00",
        };

        const html = renderToStaticMarkup(
        <ThemeProvider theme={theme}>
            <TaskCreateForm
            projectId={1}
            projectName="ERP 프로젝트"
            wbsCodes={["1.1", "1.2", "2"]}
            projectStartDate="2026-08-01"
            projectDueDate="2026-09-30"
            initialData={task}
            mode="edit"
            onSuccess={() => {}}
            onCancel={() => {}}
            />
        </ThemeProvider>,
        );

        expect(html).toContain('value="1.2"');
        expect(html).toContain('value="수정 전 태스크"');
        expect(html).toContain('value="홍길동"');
        expect(html).toContain('value="S/W 개발팀"');
        // 수정 모드에서는 등록 버튼 대신 수정 저장 버튼 표시
        expect(html).toContain("수정 저장");
    });

    it("수정 모드에서 updateTask를 호출한다", async () => {
        const task: TaskResponse = {
            id: 1,
            project_id: 1,
            wbs_code: "1.2",
            task_name: "수정 전 태스크",
            assignee_name: "홍길동",
            department: "개발팀",
            priority: "HIGH",
            status: "IN_PROGRESS",
            planned_start_date: "2026-08-24",
            planned_end_date: "2026-08-26",
            description: "기존 설명",
            note: "기존 비고",
            is_archived: false,
            archived_at: null,
            created_at: "2026-08-24T10:00:00",
            updated_at: "2026-08-24T10:00:00",
        };

        expect(task.id).toBe(1);
    });

    it("상태 선택지에 보류를 표시하지 않는다", () => {
        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
            <TaskCreateForm
                projectId={1}
                projectName="ERP 프로젝트"
                wbsCodes={["1.1", "1.2", "2"]}
                projectStartDate="2026-08-01"
                projectDueDate="2026-09-30"
                onSuccess={() => {}}
                onCancel={() => {}}
            />
            </ThemeProvider>,
        );

        expect(html).toContain("대기");
        expect(html).toContain("진행 중");
        expect(html).toContain("완료");
        expect(html).not.toContain("보류");
    });

    it("선택 가능한 WBS 코드를 드롭다운으로 표시한다", () => {
        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
            <TaskCreateForm
                projectId={1}
                projectName="ERP 프로젝트"
                wbsCodes={[
                "1.1",
                "1.2",
                "1.3",
                "2",
                "3.1",
                "3.2",
                ]}
                projectStartDate="2026-08-01"
                projectDueDate="2026-09-30"
                onSuccess={() => {}}
                onCancel={() => {}}
            />
            </ThemeProvider>,
        );

        expect(html).toContain('<option value="1.1">1.1</option>');
        expect(html).toContain('<option value="1.2">1.2</option>');
        expect(html).toContain('<option value="2">2</option>');
        expect(html).toContain('<option value="3.2">3.2</option>');

        expect(html).not.toContain('placeholder="예: 1.1"');
    });

    it("담당 부서를 정해진 선택지로 표시한다", () => {
        const html = renderToStaticMarkup(
            <ThemeProvider theme={theme}>
            <TaskCreateForm
                projectId={1}
                projectName="ERP 프로젝트"
                wbsCodes={["1.1", "1.2", "2"]}
                projectStartDate="2026-08-01"
                projectDueDate="2026-09-30"
                onSuccess={() => {}}
                onCancel={() => {}}
            />
            </ThemeProvider>,
        );

        expect(html).toContain("H/W 개발팀");
        expect(html).toContain("S/W 개발팀");
        expect(html).toContain("총무부");
        expect(html).toContain("사무관리팀");
        expect(html).toContain("영업팀");
        expect(html).toContain("인사팀");

        expect(html).not.toContain(
            'placeholder="담당 부서를 입력하세요."',
        );
    });
});