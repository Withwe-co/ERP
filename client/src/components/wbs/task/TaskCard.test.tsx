import { renderToStaticMarkup } from "react-dom/server";
import { ServerStyleSheet, ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import { TaskResponse } from "../../../types/task";

import TaskCard, {TaskCardOverlay,} from "./TaskCard";


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
        assignee_name: "가나다",
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

  // 태스크 카드가 Drag뿐 아니라 다른 카드와 순서를 변경할 수 있는
  // Sortable 요소로 등록되는지 확인
  it("태스크 카드를 정렬 가능한 요소로 표시한다", () => {
    const task: TaskResponse = {
      id: 1,
      project_id: 1,
      wbs_code: "1.3",
      task_name: "드래그 태스크",
      assignee_name: "가나다",
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

    // dnd-kit의 sortable 속성이 카드에 연결되어 Drag와 카드 간 순서 변경이 가능한 요소로 등록되는지 확인
    expect(html).toContain('aria-roledescription="sortable"');
    expect(html).toContain('data-task-id="1"');
  });

  // dnd-kit이 계산한 Drag 좌표를 카드가 즉시 따라가도록,
  // 카드의 transform 속성에 별도 transition 지연이 없는지 확인
  it("드래그 이동에 transform transition 지연을 사용하지 않는다", () => {
    const task: TaskResponse = {
      id: 1,
      project_id: 1,
      wbs_code: "1.1",
      task_name: "빠른 드래그 태스크",
      assignee_name: "가나다",
      department: "개발팀",
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

    // styled-components가 생성한 실제 CSS를 확인하기 위해
    // 서버 렌더링용 StyleSheet를 사용
    const sheet = new ServerStyleSheet();

    renderToStaticMarkup(
      sheet.collectStyles(
        <ThemeProvider theme={theme}>
          <TaskCard
            task={task}
            onDetail={() => {}}
          />
        </ThemeProvider>,
      ),
    );

    const styles = sheet.getStyleTags();

    sheet.seal();

    // Drag 좌표에 사용되는 transform은 애니메이션 지연 없이 즉시 적용되어야 함
    expect(styles).not.toContain("transform 0.2s ease");
  });

  // Drag 중 마우스를 따라다니는 Overlay 카드는 기존 카드와 같은 정보를 표시하되,
  // 별도의 Sortable 요소로 다시 등록되지 않는지 확인
  it("드래그 Overlay용 카드를 별도의 Sortable 등록 없이 표시한다", () => {
    const task: TaskResponse = {
      id: 1,
      project_id: 1,
      wbs_code: "1.3",
      task_name: "Overlay 태스크",
      assignee_name: "김진산",
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

    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskCardOverlay task={task} />
      </ThemeProvider>,
    );

    // 실제 Drag 중 보이는 카드에도 기존 카드 정보가 그대로 표시되어야 함
    expect(html).toContain("Overlay 태스크");
    expect(html).toContain("WBS 1.3");
    expect(html).toContain("김진산");

    // Overlay는 별도의 Sortable 요소가 아니므로
    // dnd-kit의 sortable 접근성 속성을 가지면 안 됨
    expect(html).not.toContain('aria-roledescription="sortable"',);
  });

});
