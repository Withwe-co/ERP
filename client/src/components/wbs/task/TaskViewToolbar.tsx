import styled from "styled-components";
import Button from "../../common/Button";

// 태스크 화면의 보기 방식
export type TaskViewMode = "kanban" | "list";

export type TaskScope = "active" | "archived";

// 태스크 보기 도구 영역에서 사용할 Props
interface TaskViewToolbarProps {
  // 현재 선택된 보기 방식
  viewMode: TaskViewMode;

  taskScope: TaskScope;

  // 칸반/목록 보기 버튼을 클릭했을 때 실행할 함수
  onViewModeChange: (viewMode: TaskViewMode) => void;

  onTaskScopeChange: (taskScope: TaskScope) => void;

  // 태스크 등록 버튼을 클릭했을 때 실행할 함수
  onCreateTask: () => void;
}

// 태스크 보기 방식 전환 및 등록 버튼 영역
// 부모 컴포넌트에서 현재 보기 방식과 보기 변경 함수, 태스크 등록 함수를 전달받음
function TaskViewToolbar({viewMode, taskScope, onViewModeChange,onTaskScopeChange,  onCreateTask,}: TaskViewToolbarProps) {
  return (
    <ActionArea>
      <ViewArea>
        {/* 칸반 보기 버튼 -> 현재 ViewMode가 칸반이면 기본 버튼 스타일, 선택 X시 outline 스타일 */}
        <Button
          variant={viewMode === "kanban" ? undefined : "outline"}
          size="sm"
          onClick={() => onViewModeChange("kanban")}
        >
          칸반 보기
        </Button>
        {/*목록 보기 버튼 -> 위와 동일하게 작동*/}
        <Button
          variant={viewMode === "list" ? undefined : "outline"}
          size="sm"
          onClick={() => onViewModeChange("list")}
        >
          목록 보기
        </Button>
      </ViewArea>

      {/* 전체/보류 태스크 전환과 태스크 등록 버튼을 오른쪽에 배치 */}
      <TaskActionArea>
        {/* 현재 진행 중인 전체 태스크를 조회 */}
        <Button
          variant={
            taskScope === "active"
              ? undefined
              : "outline"
          }
          size="sm"
          onClick={() => onTaskScopeChange("active")}
        >
          전체 태스크
        </Button>

        {/* 보류 처리된 태스크만 조회 */}
        <Button
          variant={
            taskScope === "archived"
              ? undefined
              : "outline"
          }
          size="sm"
          onClick={() => onTaskScopeChange("archived")}
        >
          보류 태스크
        </Button>

        {/* 새로운 태스크 등록 Modal을 열기 */}
        <Button onClick={onCreateTask}>
          태스크 등록
        </Button>
      </TaskActionArea>
    </ActionArea>
  );
}

export default TaskViewToolbar;

// 보기 전환 버튼과 등록 버튼을 양쪽에 배치하는 영역
const ActionArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

// 칸반 보기와 목록 보기 버튼을 묶는 영역
const ViewArea = styled.div`
  display: flex;
  gap: 8px;
`;

const TaskActionArea = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
