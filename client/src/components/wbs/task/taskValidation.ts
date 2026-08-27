import {TaskCreateData,TaskResponse,} from "../../../types/task";

// 태스크 등록 데이터를 검증하고,
// 문제가 있으면 사용자에게 표시할 오류 메시지를 반환
export function validateTaskCreateData(task: TaskCreateData,): string | null {
    // 태스크명은 필수이며 공백만 입력하는 것도 허용하지 않음
    if (!task.task_name.trim()) {return "태스크명을 입력해주세요.";}

    // 담당자명은 필수 입력값
    // trim()을 사용하여 공백만 입력한 경우도 빈 값으로 처리
    if (!task.assignee_name.trim()) {return "담당자명을 입력해주세요.";}

    // 담당 부서는 필수 입력값
    // trim()을 사용하여 공백만 입력한 경우도 빈 값으로 처리
    if (!task.department.trim()) {return "담당 부서를 입력해주세요.";}

    // 시작 예정일은 필수 입력값
    if (!task.planned_start_date) {return "시작 예정일을 입력해주세요.";}

    // 완료 예정일은 필수 입력값
    if (!task.planned_end_date) {return "완료 예정일을 입력해주세요.";}

    // 완료 예정일은 시작 예정일보다 빠를 수 없음
    if (task.planned_start_date > task.planned_end_date) {return "완료 예정일은 시작 예정일보다 빠를 수 없습니다.";}

    // 검증을 모두 통과하면 오류 없음
    return null;
}

// 수정 전 태스크와 현재 입력값을 비교하여
// 실제 변경된 값이 있는지 확인
export function hasTaskChanges(originalTask: TaskResponse, currentTask: TaskCreateData,): boolean {
  const fields: (keyof TaskCreateData)[] = [
    "project_id",
    "wbs_code",
    "task_name",
    "assignee_name",
    "department",
    "priority",
    "status",
    "planned_start_date",
    "planned_end_date",
    "description",
    "note",
  ];

  return fields.some((field) => {
    const originalValue = originalTask[field] ?? "";
    const currentValue = currentTask[field] ?? "";
    
    return originalValue !== currentValue;
  });
}