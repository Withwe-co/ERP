import styled from "styled-components";

import { TaskResponse } from "../../../types/task";
import TaskCard from "./TaskCard";


// TaskKanbanBoard 컴포넌트가 부모 컴포넌트로부터 전달받는 값 정의
interface TaskKanbanBoardProps {tasks: TaskResponse[]; onDetail: (task: TaskResponse) => void;}


// 칸반에 표시할 상태별 컬럼 정보
// 실제 DB/API에서 사용하는 status 값과
// 화면에서 사용자에게 보여줄 한글 이름을 연결해둠
const KANBAN_COLUMNS: {status: TaskResponse["status"]; label: string;}[] = [
    // TODO 상태의 태스크는 "대기" 컬럼에 표시
    { status: "TODO", label: "대기" },

    // IN_PROGRESS 상태의 태스크는 "진행 중" 컬럼에 표시
    { status: "IN_PROGRESS", label: "진행 중" },

    // ON_HOLD 상태의 태스크는 "보류" 컬럼에 표시
    { status: "ON_HOLD", label: "보류" },

    // DONE 상태의 태스크는 "완료" 컬럼에 표시
    { status: "DONE", label: "완료" },
];


// 태스크 칸반 보드
function TaskKanbanBoard({tasks,onDetail,}: TaskKanbanBoardProps) {

  return (

    // 네 개의 상태 컬럼을 감싸는 칸반 전체 영역
    <KanbanBoard>

      {/* 
        KANBAN_COLUMNS 배열을 순회하면서
        TODO / IN_PROGRESS / ON_HOLD / DONE
        총 4개의 칸반 컬럼을 생성
      */}
      {KANBAN_COLUMNS.map((column) => {const columnTasks = tasks.filter((task) => task.status === column.status,);

        return (
          <KanbanColumn key={column.status}>

            {/* 컬럼 제목과 태스크 개수가 표시되는 상단 영역 */}
            <ColumnHeader>

              {/* 사용자에게 보여주는 상태 이름 */}
              <ColumnTitle>
                    <StatusDot $status={column.status} />

                    {column.label}

                </ColumnTitle>

              {/* 현재 컬럼에 들어있는 태스크 개수 표시*/}
              <TaskCount>
                {columnTasks.length}
              </TaskCount>

            </ColumnHeader>


            {/* 현재 상태에 해당하는 태스크 카드들이 들어가는 영역 */}
            <CardList>

              {/* 현재 컬럼에 태스크가 하나도 없는 경우와 태스크가 존재하는 경우를 구분해서 렌더링*/}
              {columnTasks.length === 0 ? (
                // 해당 상태에 태스크가 없으면 빈 상태 메시지 표시
                <EmptyMessage>
                  등록된 태스크가 없습니다.
                </EmptyMessage>

              ) : (

                /*태스크가 존재하면 현재 컬럼의 모든 태스크를 순회하면서 각각 TaskCard 컴포넌트로 표시*/
                columnTasks.map((task) => (

                  <TaskCard

                    // 각 태스크는 고유한 id를 가지므로
                    // React 반복 렌더링 key로 사용
                    key={task.id}

                    // TaskCard에서 표시할 태스크 정보 전달
                    task={task}

                    /*
                      사용자가 TaskCard를 클릭하면TaskCard 내부에서 onDetail(task)가 실행됨

                      이 함수는 최종적으로 TaskManagementPage의 setDetailTask(task)를 호출하여 기존 TaskDetail Modal을 열게 됨
                    */
                    onDetail={onDetail}
                  />

                ))
              )}

            </CardList>

          </KanbanColumn>
        );
      })}

    </KanbanBoard>
  );
}


export default TaskKanbanBoard;


// --------------------------------------------------
// Styled Components
// --------------------------------------------------


// 칸반 전체 영역
const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(280px, 1fr));
  gap: 16px;
  overflow-x: auto;
`;


// 상태 하나를 나타내는 칸반 컬럼
const KanbanColumn = styled.div`
  min-width: 280px;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
`;


// 컬럼 상단 제목 영역
const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;


// 칸반 상태 제목
const ColumnTitle = styled.h3`
  margin: 0;
  // 상태 표시 원과 제목을 한 줄로 배치
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;


// 컬럼에 포함된 태스크 개수 표시
const TaskCount = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 14px;
  background: #e5e7eb;
  font-size: 0.8rem;
  font-weight: 600;
`;


// 하나의 컬럼 안에 TaskCard들이 들어가는 영역
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;


// 현재 컬럼에 태스크가 하나도 없을 때 표시하는 메시지
const EmptyMessage = styled.div`
  padding: 40px 10px;
  text-align: center;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
`;

// 칸반 컬럼의 상태를 시각적으로 구분하는 작은 원
const StatusDot = styled.span<{$status: TaskResponse["status"];}>`
  width: 8px;
  height: 8px;
  // 원이 줄어들지 않도록 고정
  flex-shrink: 0;
  border-radius: 50%;

  /*
    태스크 상태별 포인트 색상

    TODO → 아직 작업 전이므로 중립적인 회색
    IN_PROGRESS → 현재 작업 중이므로 파란색
    ON_HOLD → 잠시 멈춘 상태이므로 주황색
    DONE → 완료 상태이므로 초록색
  */

  background: ${({ $status }) => {
    switch ($status) {

      case "TODO":
        return "#94a3b8";

      case "IN_PROGRESS":
        return "#3b82f6";

      case "ON_HOLD":
        return "#f59e0b";

      case "DONE":
        return "#22c55e";

      default:
        return "#94a3b8";
    }
  }};
`;