import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import TaskViewToolbar from "./TaskViewToolbar";

describe("TaskViewToolbar", () => {
  it("보류 태스크, 전체 태스크, 태스크 등록 순서로 표시한다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskViewToolbar
          viewMode="kanban"
          taskScope="active"
          onViewModeChange={() => {}}
          onTaskScopeChange={() => {}}
          onCreateTask={() => {}}
        />
      </ThemeProvider>,
    );

    const archivedIndex = html.indexOf("보류 태스크");
    const activeIndex = html.indexOf("전체 태스크");
    const createIndex = html.indexOf("태스크 등록");

    expect(archivedIndex).toBeGreaterThan(-1);
    expect(activeIndex).toBeGreaterThan(-1);
    expect(createIndex).toBeGreaterThan(-1);

    expect(archivedIndex).toBeLessThan(activeIndex);
    expect(activeIndex).toBeLessThan(createIndex);
  });
});