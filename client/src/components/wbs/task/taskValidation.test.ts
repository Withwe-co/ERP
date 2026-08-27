import { describe, expect, it } from "vitest";

import { TaskCreateData } from "../../../types/task";

import {hasTaskChanges, validateTaskCreateData,} from "./taskValidation";


// 검증 테스트에서 공통으로 사용할 정상적인 태스크 데이터
const validTask: TaskCreateData = {
  project_id: 1,

  wbs_code: "1.1",

  task_name: "태스크 등록 화면 구현",
  assignee_name: "김진산",
  department: "개발팀",
  priority: "NORMAL",
  status: "TODO",
  planned_start_date: "2026-08-20",
  planned_end_date: "2026-08-21",
  description: "",
  note: "",
};


describe("validateTaskCreateData", () => {
    // 태스크명은 필수 입력값
    it("태스크명이 비어 있으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, task_name: "",};

        const result = validateTaskCreateData(invalidTask);

        expect(result).toBe("태스크명을 입력해주세요.");
    });


    // 공백만 입력한 태스크명도 빈 값으로 처리
    it("태스크명이 공백만 있으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, task_name: "   ",};

        const result = validateTaskCreateData(invalidTask);

        expect(result).toBe("태스크명을 입력해주세요.");
    });

    // 담당자명은 필수 입력값
    it("담당자명이 비어 있으면 오류 메시지를 반환한다", () => {
    const invalidTask = {...validTask, assignee_name: "",};
    const result = validateTaskCreateData(invalidTask);
    expect(result).toBe("담당자명을 입력해주세요.");
    });


    // 공백만 입력한 담당자명도 빈 값으로 처리
    it("담당자명이 공백만 있으면 오류 메시지를 반환한다", () => {
    const invalidTask = {...validTask, assignee_name: "   ",};
    const result = validateTaskCreateData(invalidTask);
    expect(result).toBe("담당자명을 입력해주세요.");
    });

    // 담당 부서는 필수 입력값
    it("담당 부서가 비어 있으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, department: "",};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("담당 부서를 입력해주세요.");
    });


    // 공백만 입력한 담당 부서도 빈 값으로 처리
    it("담당 부서가 공백만 있으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask,department: "   ",};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("담당 부서를 입력해주세요.");
    });

    // 시작 예정일은 필수 입력값
    it("시작 예정일이 비어 있으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, planned_start_date: "",};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("시작 예정일을 입력해주세요.");
    });


    // 완료 예정일은 필수 입력값
    it("완료 예정일이 비어 있으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, planned_end_date: "",};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("완료 예정일을 입력해주세요.");
    });


    // 완료 예정일은 시작 예정일보다 빠를 수 없음
    it("완료 예정일이 시작 예정일보다 빠르면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, planned_start_date: "2026-08-21", planned_end_date: "2026-08-20",};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("완료 예정일은 시작 예정일보다 빠를 수 없습니다.",);
    });

    // 시작 예정일과 완료 예정일이 같은 날짜인 경우 허용
    it("시작 예정일과 완료 예정일이 같으면 정상 처리한다", () => {
        const validSameDateTask = {...validTask, planned_start_date: "2026-08-20", planned_end_date: "2026-08-20",};
        const result = validateTaskCreateData(validSameDateTask);
        expect(result).toBeNull();
    });

});

describe("hasTaskChanges", () => {
  it("수정 전후 데이터가 같으면 false를 반환한다", () => {
    const originalTask = {
      ...validTask,
      id: 1,
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-24T10:00:00",
      updated_at: "2026-08-24T10:00:00",
    };

    const result = hasTaskChanges(originalTask, validTask,);

    expect(result).toBe(false);
  });

  it("하나라도 수정된 값이 있으면 true를 반환한다", () => {
    const originalTask = {
      ...validTask,
      id: 1,
      is_archived: false,
      archived_at: null,
      created_at: "2026-08-24T10:00:00",
      updated_at: "2026-08-24T10:00:00",
    };

    const changedTask = {...validTask, task_name: "수정된 태스크명",};

    const result = hasTaskChanges(originalTask,changedTask,);

    expect(result).toBe(true);
  });
});
