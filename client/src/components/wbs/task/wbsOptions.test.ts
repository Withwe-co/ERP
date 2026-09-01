import { describe, expect, it } from "vitest";

import { getSelectableWbsCodes } from "./wbsOptions";

describe("getSelectableWbsCodes", () => {
  it("하위 WBS가 있는 부모는 제외하고 최하위 WBS만 반환한다", () => {
    const wbsList = [
      { wbs_code: "1" },
      { wbs_code: "1.1" },
      { wbs_code: "1.2" },
      { wbs_code: "1.3" },
      { wbs_code: "2" },
      { wbs_code: "3" },
      { wbs_code: "3.1" },
      { wbs_code: "3.2" },
    ];

    const result = getSelectableWbsCodes(wbsList);

    expect(result).toEqual([
      "1.1",
      "1.2",
      "1.3",
      "2",
      "3.1",
      "3.2",
    ]);
  });


  
  // API에서 WBS가 뒤섞인 순서로 전달되어도 부모 WBS를 제외하고 계층 구조의 자연 순서로 반환하는지 확인
  it("최하위 WBS를 계층 구조 순서대로 반환한다", () => {
    // 실제 API 응답 순서와 관계없이 동작하는지 확인하기 위해 순서를 섞음
    const wbsList = [
      { wbs_code: "3.2", wbs_order: 2 },
      { wbs_code: "2", wbs_order: 1 },
      { wbs_code: "1.2", wbs_order: 9 },
      { wbs_code: "4", wbs_order: 4 },
      { wbs_code: "3", wbs_order: 3 },
      { wbs_code: "1", wbs_order: 8 },
      { wbs_code: "3.1", wbs_order: 7 },
      { wbs_code: "1.1", wbs_order: 6 },
    ];

    const result = getSelectableWbsCodes(wbsList);

    // 1과 3은 하위 WBS가 있으므로 제외
    // 나머지는 WBS 코드의 계층 순서대로 표시
    expect(result).toEqual([
      "1.1",
      "1.2",
      "2",
      "3.1",
      "3.2",
      "4",
    ]);
  });

});
