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
});