// 공통 Table 컴포넌트
import Table from "../../common/Table";

// 공통 Table에서 각 열의 구조를 정의할 때 사용하는 타입
import { TableColumn } from "../../../types";

// 서버에서 조회한 태스크 데이터 타입
import { TaskResponse } from "../../../types/task";


// TaskList가 부모 컴포넌트로부터 전달받는 값
interface TaskListProps {
  // 화면에 표시할 태스크 목록
  tasks: TaskResponse[];

  // API 데이터를 불러오는 중인지 여부
  loading?: boolean;
}


// 태스크 목록 컴포넌트
function TaskList({
  tasks,
  loading = false,
}: TaskListProps) {

  // 태스크 목록 테이블의 열(Column) 구성
  const columns: TableColumn<TaskResponse>[] = [
    {
      // TaskResponse의 task_name 값을 사용
      key: "task_name",

      // 테이블 상단에 표시할 제목
      label: "태스크명",

      // 열 너비
      width: "200px",
    },

    {
      key: "wbs_id",
      label: "WBS",
      width: "80px",

      // WBS ID를 그대로 숫자로 표시
      render: (value) => value,
    },

    {
      key: "assignee_name",
      label: "담당자",
      width: "100px",
    },

    {
      key: "department",
      label: "부서",
      width: "120px",
    },

    {
      key: "priority",
      label: "우선순위",
      width: "100px",

      // 서버의 영문 우선순위를 사용자에게 한글로 표시
      render: (value) => {
        const priorityLabel = {
          LOW: "낮음",
          NORMAL: "보통",
          HIGH: "높음",
          URGENT: "긴급",
        };

        return priorityLabel[
          value as keyof typeof priorityLabel
        ];
      },
    },

    {
      key: "status",
      label: "상태",
      width: "100px",

      // 서버의 상태값을 사용자에게 한글로 표시
      render: (value) => {
        const statusLabel = {
          TODO: "대기",
          IN_PROGRESS: "진행 중",
          ON_HOLD: "보류",
          DONE: "완료",
        };

        return statusLabel[
          value as keyof typeof statusLabel
        ];
      },
    },

    {
      key: "planned_start_date",
      label: "시작 예정일",
      width: "120px",
    },

    {
      key: "planned_end_date",
      label: "완료 예정일",
      width: "120px",
    },

    {
      key: "progress_rate",
      label: "진척률",
      width: "90px",
      align: "center",

      // 숫자 50을 사용자 화면에서는 50%로 표시
      render: (value) => `${value}%`,
    },
  ];


  return (
    <Table
      // 위에서 정의한 테이블 열 구조
      columns={columns}

      // 부모에게 전달받은 태스크 데이터
      data={tasks}

      // API 조회 중이면 공통 Table의 로딩 화면 표시
      loading={loading}

      // 조회 결과가 없을 때 표시할 문구
      emptyMessage="등록된 태스크가 없습니다."
    />
  );
}


export default TaskList;