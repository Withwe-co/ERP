// 태스크 데이터 구조 정의

// TaskStatus: 태스크 상태로 허용할 값 정의
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ON_HOLD";

// TaskPriority: 우선순위로 허용할 값 정의
export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// Task: 태스크 하나가 어떤 데이터를 가지고 있는지 정의
export interface Task {
  id: number;
  project_id: number;
  wbs_id: number;
  task_name: string;
  assignee_name: string;
  department: string;
  priority: TaskPriority;
  status: TaskStatus;
  planned_start_date: string;
  planned_end_date: string;
  progress_rate: number;
  description?: string;
  note?: string;
}

// TaskCreateData: 등록용 타입 정의 (Task에서 id만 제외한 등록용 데이터 구조)
export type TaskCreateData = Omit<Task, "id">;

// TaskUpdateData: 수정용 타입 정의 (TaskCreateData(=등록용 데이터)의 모든 항목을 선택사항으로 변경)
export type TaskUpdateData = Partial<TaskCreateData>;

// TaskFilter: 태스크 검색 및 필터 조건 정의
export interface TaskFilter {
  search?: string;
  wbs_id?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_name?: string;
  department?: string;
}

// TaskResponse: 서버에서 태스크 등록/조회 후 반환되는 데이터 구조
// Task 기본 정보에 보관 여부와 생성/수정 시간을 추가
export interface TaskResponse extends Task {
  is_archived: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}