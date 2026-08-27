import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "../../../styles/theme";
import TaskSearchFilter from "./TaskSearchFilter";

describe("TaskSearchFilter", () => { it("상태 필터에 보류를 표시하지 않는다", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <TaskSearchFilter onFilter={() => {}} wbsCodes={["1.1", "1.2", "2"]}/>
      </ThemeProvider>,
    );

    expect(html).toContain("대기");
    expect(html).toContain("진행 중");
    expect(html).toContain("완료");
    expect(html).not.toContain("보류");
  });
});