import { describe, expect, it } from "vitest";

import { getTaskContentView } from "./taskViewMode";

describe("getTaskContentView", () => {
  it("전체 태스크에서는 현재 보기 방식을 유지한다", () => {
    expect(getTaskContentView("active", "kanban"),).toBe("kanban");

    expect(
      getTaskContentView("active", "list"),
    ).toBe("list");
  });

  it("보류 태스크에서는 항상 목록 보기로 표시한다", () => {
    expect(getTaskContentView("archived", "kanban"),).toBe("list");

    expect(getTaskContentView("archived", "list"),).toBe("list");
  });
});