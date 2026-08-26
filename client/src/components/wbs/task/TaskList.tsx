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
    <Table
      // 위에서 정의한 테이블 열 구조
      columns={columns}

      // 부모에게 전달받은 태스크 데이터
      data={tasks}

      // API 조회 중이면 공통 Table의 로딩 화면 표시
      loading={loading}

      // 조회 결과가 없을 때 표시할 문구
      emptyMessage="등록된 태스크가 없습니다."

      // 태스크 행 누르면 상세 페이지로 넘어감
      onRowClick={onDetail}
    />
  );
}


export default TaskList;

const ActionButtons = styled.div`
  display: flex;
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