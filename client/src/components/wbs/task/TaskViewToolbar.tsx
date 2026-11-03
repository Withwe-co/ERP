import styled from "styled-components";
import Button from "../../common/Button";
import { LayoutGrid, List, Plus } from "lucide-react";

import {
  TASK_ACTION_BUTTON_WIDTH,
  TASK_CONTROL_FONT_SIZE,
  TASK_CONTROL_GAP,
  TASK_CONTROL_HEIGHT,
  TASK_CONTROL_ICON_SIZE,
} from "./taskControlStyles";

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
    <ActionArea data-testid="task-toolbar-row">
      {/* 왼쪽: 칸반 보기와 목록 보기 전환 */}
      <ViewArea>
        {/* 칸반 보기 버튼 -> 현재 ViewMode가 칸반이면 기본 버튼 스타일, 선택 X시 outline 스타일 */}
        <ControlButton
            variant={
              viewMode === "kanban"
                ? undefined
                : "outline"
            }
            onClick={() => onViewModeChange("kanban")}
          >
            <LayoutGrid
              size={TASK_CONTROL_ICON_SIZE}
            />
            칸반 보기
          </ControlButton>
        {/*목록 보기 버튼 -> 위와 동일하게 작동*/}
        <ControlButton
          variant={
            viewMode === "list"
              ? undefined
              : "outline"
          }
          onClick={() =>
            onViewModeChange("list")
          }
        >
          <List
            size={TASK_CONTROL_ICON_SIZE}
          />
          목록 보기
        </ControlButton>
      </ViewArea>

      {/* 전체/보류 태스크 전환과 태스크 등록 버튼을 오른쪽에 배치 */}
      <TaskActionArea>
        {/* 현재 진행 중인 전체 태스크를 조회 */}
        <ControlButton
          variant={
            taskScope === "active"
              ? undefined
              : "outline"
          }
          onClick={() =>
            onTaskScopeChange("active")
          }
        >
          전체 태스크
        </ControlButton>

        {/* 보류 처리된 태스크만 조회 */}
        <ControlButton
            variant={
              taskScope === "archived"
                ? undefined
                : "outline"
            }
            onClick={() =>
              onTaskScopeChange("archived")
            }
          >
            보류 태스크
          </ControlButton>

        {/* 새로운 태스크 등록 Modal을 열기 */}
        <CreateTaskButton
          onClick={onCreateTask}
        >
          <Plus
            size={TASK_CONTROL_ICON_SIZE}
          />
          태스크 등록
        </CreateTaskButton>
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
  margin-bottom: ${TASK_CONTROL_GAP};
`;

// 칸반 보기와 목록 보기 버튼을 묶는 영역
const ViewArea = styled.div`
  display: flex;
  gap: ${TASK_CONTROL_GAP};
`;

const TaskActionArea = styled.div`
  display: flex;
  gap: ${TASK_CONTROL_GAP};
  align-items: center;
`;

const ControlButton = styled(Button)`
  width: ${TASK_ACTION_BUTTON_WIDTH};
  height: ${TASK_CONTROL_HEIGHT};
  min-height: ${TASK_CONTROL_HEIGHT};

  padding: 0 12px;

  font-size: ${TASK_CONTROL_FONT_SIZE};
`;

const CreateTaskButton = styled(Button)`
  height: ${TASK_CONTROL_HEIGHT};
  min-height: ${TASK_CONTROL_HEIGHT};

  padding: 0 16px;

  font-size: ${TASK_CONTROL_FONT_SIZE};
`;