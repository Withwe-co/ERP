import { describe, expect, it } from "vitest";

import { TaskCreateData } from "../../../types/task";

import {getTaskStatusAfterProgressChange, validateTaskCreateData,} from "./taskValidation";


// 검증 테스트에서 공통으로 사용할 정상적인 태스크 데이터
const validTask: TaskCreateData = {
  project_id: 1,

  // WBS 구조 확정 전까지 임시값 사용
  wbs_id: 1,

  task_name: "태스크 등록 화면 구현",
  assignee_name: "김진산",
  department: "개발팀",
  priority: "NORMAL",
  status: "TODO",
  planned_start_date: "2026-08-20",
  planned_end_date: "2026-08-21",
  progress_rate: 0,
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

    // 진척률은 0보다 작을 수 없음
    it("진척률이 0보다 작으면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, progress_rate: -1,};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("진척률은 0 이상 100 이하로 입력해주세요.",);
    });


    // 진척률은 100을 초과할 수 없음
    it("진척률이 100보다 크면 오류 메시지를 반환한다", () => {
        const invalidTask = {...validTask, progress_rate: 101,};
        const result = validateTaskCreateData(invalidTask);
        expect(result).toBe("진척률은 0 이상 100 이하로 입력해주세요.",);
    });


    // 진척률의 최솟값인 0은 허용
    it("진척률이 0이면 정상 처리한다", () => {
        const validZeroProgressTask = {...validTask,progress_rate: 0,};
        const result = validateTaskCreateData(validZeroProgressTask,);
        expect(result).toBeNull();
    });


    // 진척률의 최댓값인 100은 허용
    it("진척률이 100이면 정상 처리한다", () => {
        const validCompleteTask = {...validTask, progress_rate: 100,};
        const result = validateTaskCreateData(validCompleteTask,);
        expect(result).toBeNull();
    });




});

// 진척률 변경에 따른 상태 자동변경 테스트
describe("getTaskStatusAfterProgressChange", () => {
  // 진척률이 0이면 대기 상태
  it("진척률이 0이면 TODO를 반환한다", () => {
    const result = getTaskStatusAfterProgressChange(
      0,
      "TODO",
    );

    expect(result).toBe("TODO");
  });

  // 1 ~ 99는 진행 중 상태
  it("진척률이 1이면 IN_PROGRESS를 반환한다", () => {
    const result = getTaskStatusAfterProgressChange(
      1,
      "TODO",
    );

    expect(result).toBe("IN_PROGRESS");
  });

  it("진척률이 99이면 IN_PROGRESS를 반환한다", () => {
    const result = getTaskStatusAfterProgressChange(
      99,
      "IN_PROGRESS",
    );

    expect(result).toBe("IN_PROGRESS");
  });

  // 진척률 100은 완료 상태
  it("진척률이 100이면 DONE을 반환한다", () => {
    const result = getTaskStatusAfterProgressChange(
      100,
      "IN_PROGRESS",
    );

    expect(result).toBe("DONE");
  });

  // 보류 상태에서는 진척률이 변경되어도 보류 유지
  it("보류 상태에서는 진척률이 변경되어도 ON_HOLD를 유지한다", () => {
    const result = getTaskStatusAfterProgressChange(
      50,
      "ON_HOLD",
    );

    expect(result).toBe("ON_HOLD");
  });

  // 완료 수준으로 진척률이 변경되어도 보류 중이면 보류 유지
  it("보류 상태에서는 진척률이 100이어도 ON_HOLD를 유지한다", () => {
    const result = getTaskStatusAfterProgressChange(
      100,
      "ON_HOLD",
    );

    expect(result).toBe("ON_HOLD");
  });
});