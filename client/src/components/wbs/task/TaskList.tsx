// 공통 Table 컴포넌트
import Table from "../../common/Table";

// 공통 Table에서 각 열의 구조를 정의할 때 사용하는 타입
import { TableColumn } from "../../../types";

// 서버에서 조회한 태스크 데이터 타입
import { TaskResponse } from "../../../types/task";

import styled from "styled-components";
import { Pencil, Archive, Play} from "lucide-react";

// TaskList가 부모 컴포넌트로부터 전달받는 값
interface TaskListProps {
  // 화면에 표시할 태스크 
  tasks: TaskResponse[];

  // API 데이터를 불러오는 중인지 여부
  loading?: boolean;

  // 수정 버튼을 눌렀을 때 선택한 태스크를 부모에게 전달
  onEdit: (task: TaskResponse) => void;

  // 상세페이지 열리도록 태스크 클릭
  onDetail: (task: TaskResponse) => void;

  onArchive?: (task: TaskResponse) => void;
  onRestore?: (task: TaskResponse) => void;

  archivedView?: boolean;
}


// 태스크 목록 컴포넌트
function TaskList({tasks, loading = false, onEdit, onDetail,  onArchive, onRestore, archivedView = false,}: TaskListProps) {

  // 목록 보기에서는 태스크를 등록 시점 기준 최신순으로 표시
  // 원본 tasks 배열은 변경하지 않고 복사본만 정렬
  const sortedTasks = [...tasks].sort((a, b) => {
    const createdAtDiff =
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime();

    // created_at이 다르면 더 최근에 등록된 태스크를 먼저 표시
    if (createdAtDiff !== 0) {return createdAtDiff;}

    // created_at이 같은 경우 ID가 큰 태스크를 먼저 표시
    // 같은 시각에 생성된 데이터의 순서를 안정적으로 유지하기 위한 보조 기준
    return b.id - a.id;
  });

  // 태스크 목록 테이블의 열(Column) 구성
  const columns: TableColumn<TaskResponse>[] = [
    {
      key: "status",
      label: "상태",
      width: "100px",

      // 서버의 상태값을 사용자에게 한글로 표시
      render: (value) => {
        const status = value as TaskResponse["status"];

        const statusLabel = {
          TODO: "대기",
          IN_PROGRESS: "진행 중",
          DONE: "완료",
        };

        return (
          <StatusBadge $status={status}>
            {statusLabel[status]}
          </StatusBadge>
        );
      },
    },

    {
      // TaskResponse의 task_name 값을 사용
      key: "task_name",
      // 테이블 상단에 표시할 제목
      label: "태스크명",
      // 열 너비
      width: "200px",
    },

    {
      key: "wbs_code",
      label: "WBS 코드",
      width: "100px",
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
      key: "actions",
      label: "관리",
      width: "180px",

      render: (_value, task) => (
        <ActionButtons>
          <ActionButton
            type="button"
            onClick={(event) => {event.stopPropagation(); onEdit(task);}}
          >
            <Pencil size={14} />
            수정
          </ActionButton>

          {archivedView ? (
            <ActionButton
              type="button"
              onClick={(event) => {event.stopPropagation(); onRestore?.(task);}}
            >
              <Play size={14} />
              진행
            </ActionButton>
          ) : (
            <ActionButton
              type="button"
              onClick={(event) => {event.stopPropagation(); onArchive?.(task);}}
            >
              <Archive size={14} />
              보류
            </ActionButton>
          )}
        </ActionButtons>
      ),
    },

  ];


  return (
    // 공통 Table의 기본 정렬은 유지하면서
    // 태스크 목록에서만 셀 내용을 세로 중앙에 배치
    <TaskTableWrapper>
      <Table
        // 태스크 목록 테이블 열 구성
        columns={columns}

        // created_at 기준 최신 등록순으로 정렬된 데이터
        data={sortedTasks}

        // API 조회 중에는 공통 Table 로딩 화면 표시
        loading={loading}

        // 조회 결과가 없을 때 표시할 문구
        emptyMessage="등록된 태스크가 없습니다."

        // 행 클릭 시 태스크 상세 Modal 열기
        onRowClick={onDetail}
      />
    </TaskTableWrapper>
  );
}


export default TaskList;

// 태스크 목록 전용 테이블 영역
// 공통 Table은 다른 화면에서도 사용하므로 태스크 목록에서만
// 텍스트와 관리 버튼의 세로 위치를 중앙으로 맞춤
const TaskTableWrapper = styled.div`
  tbody td {vertical-align: middle;}
`;

// 수정/보류 또는 수정/진행 버튼을 같은 높이로 정렬
const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 8px 14px;
  border: 1px solid #6d7cff;
  border-radius: 10px;
  background: #ffffff;

  color: #6d7cff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  transition: all 0.2s ease;

  &:hover {
    background: #f5f7ff;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const StatusBadge = styled.span<{$status: TaskResponse["status"];}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 64px;
  padding: 4px 10px;
  border-radius: 999px;

  font-size: 12px;
  font-weight: 600;

  ${({ $status }) => {
    if ($status === "DONE") {
      return `
        color: #15803d;
        background: #dcfce7;
      `;
    }

    if ($status === "IN_PROGRESS") {
      return `
        color: #2563eb;
        background: #dbeafe;
      `;
    }

    return `
      color: #4b5563;
      background: #f3f4f6;
    `;
  }}
`;