import {TaskCreateData, TaskStatus,} from "../../../types/task";

// 진척률이 변경되었을 때 태스크 상태를 자동으로 결정
export function getTaskStatusAfterProgressChange(
  progressRate: number,
  currentStatus: TaskStatus,
): TaskStatus {
  // 보류 상태에서는 진척률이 변경되어도 보류 상태 유지
  if (currentStatus === "ON_HOLD") {
    return "ON_HOLD";
  }

  // 진척률 0은 대기 상태
  if (progressRate === 0) {
    return "TODO";
  }

  // 진척률 100은 완료 상태
  if (progressRate === 100) {
    return "DONE";
  }

  // 진척률 1 ~ 99는 진행 중 상태
  return "IN_PROGRESS";
}

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

    // 진척률은 0 이상 100 이하의 값만 허용
    if (task.progress_rate < 0 ||task.progress_rate > 100) {
        return "진척률은 0 이상 100 이하로 입력해주세요.";
    }

    // 검증을 모두 통과하면 오류 없음
    return null;
}