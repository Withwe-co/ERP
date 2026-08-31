import { useEffect, useState } from "react";
import styled from "styled-components";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  pointerWithin,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TaskResponse } from "../../../types/task";
import TaskCard, { TaskCardOverlay } from "./TaskCard";


interface TaskKanbanBoardProps {
  tasks: TaskResponse[];
  onDetail: (task: TaskResponse) => void;
  onOrderChange?: (tasks: TaskResponse[]) => void;
}


const KANBAN_COLUMNS: {
  status: TaskResponse["status"];
  label: string;
}[] = [
  { status: "TODO", label: "대기" },
  { status: "IN_PROGRESS", label: "진행 중" },
  { status: "DONE", label: "완료" },
];

const COLUMN_END_PREFIX = "column-end:";


// 칸반 컬럼 ID를 태스크 상태로 변환
export const getDropStatus = (
  columnId: string,
): TaskResponse["status"] | null => {
  if (
    columnId === "TODO" ||
    columnId === "IN_PROGRESS" ||
    columnId === "DONE"
  ) {
    return columnId;
  }

  return null;
};


// Drop 대상의 상태와 기준 카드 ID 반환
export const getKanbanDropTarget = (
  tasks: TaskResponse[],
  overId: string | number,
): {
  status: TaskResponse["status"];
  targetTaskId: number | null;
} | null => {
  const rawId = String(overId);

  const columnId = rawId.startsWith(COLUMN_END_PREFIX)
    ? rawId.slice(COLUMN_END_PREFIX.length)
    : rawId;

  const columnStatus = getDropStatus(columnId);

  if (columnStatus) {
    return {
      status: columnStatus,
      targetTaskId: null,
    };
  }

  const targetTask = tasks.find(
    (task) => task.id === Number(overId),
  );

  if (!targetTask) return null;

  return {
    status: targetTask.status,
    targetTaskId: targetTask.id,
  };
};


// DragOverlay에 표시할 태스크 조회
export const getActiveDragTask = (
  tasks: TaskResponse[],
  taskId: number,
): TaskResponse | null => {
  return tasks.find((task) => task.id === taskId) ?? null;
};


// 클릭과 Drag를 구분하기 위한 최소 이동 거리
export const getDragSensorOptions = () => ({
  activationConstraint: {
    distance: 4,
  },
});


// 태스크를 다른 컬럼의 지정된 위치로 이동
export const moveTaskInKanban = (
  tasks: TaskResponse[],
  taskId: number,
  targetStatus: TaskResponse["status"],
  targetTaskId: number | null,
): TaskResponse[] => {
  const movingTask = tasks.find(
    (task) => task.id === taskId,
  );

  if (!movingTask) return tasks;

  const remainingTasks = tasks.filter(
    (task) => task.id !== taskId,
  );

  const movedTask = {
    ...movingTask,
    status: targetStatus,
  };

  if (targetTaskId === null) {
    return [
      ...remainingTasks,
      movedTask,
    ];
  }

  const targetIndex = remainingTasks.findIndex(
    (task) =>
      task.id === targetTaskId &&
      task.status === targetStatus,
  );

  if (targetIndex === -1) {
    return [
      ...remainingTasks,
      movedTask,
    ];
  }

  const result = [...remainingTasks];

  result.splice(
    targetIndex,
    0,
    movedTask,
  );

  return result;
};


// 부모 데이터 갱신 시 현재 칸반 순서를 유지하면서 최신 데이터 반영
export const mergeKanbanTasks = (
  currentTasks: TaskResponse[],
  incomingTasks: TaskResponse[],
): TaskResponse[] => {
  const incomingTaskMap = new Map(
    incomingTasks.map((task) => [task.id, task]),
  );

  const currentTaskIds = new Set(
    currentTasks.map((task) => task.id),
  );

  const mergedTasks = currentTasks
    .filter((task) => incomingTaskMap.has(task.id))
    .map((task) => incomingTaskMap.get(task.id)!);

  const newTasks = incomingTasks.filter(
    (task) => !currentTaskIds.has(task.id),
  );

  return [
    ...mergedTasks,
    ...newTasks,
  ];
};


// 컬럼 마지막 또는 빈 컬럼에 Drop할 수 있는 영역
function ColumnEndDropZone({
  status,
}: {
  status: TaskResponse["status"];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${COLUMN_END_PREFIX}${status}`,
  });

  return (
    <ColumnEndDropArea
      ref={setNodeRef}
      data-column-end-id={status}
      $isOver={isOver}
    />
  );
}


function TaskKanbanBoard({
  tasks,
  onDetail,
  onOrderChange,
}: TaskKanbanBoardProps) {
  const [activeTask, setActiveTask] =
    useState<TaskResponse | null>(null);

  const [kanbanTasks, setKanbanTasks] =
    useState<TaskResponse[]>(tasks);

  useEffect(() => {
    setKanbanTasks((currentTasks) =>
      mergeKanbanTasks(currentTasks, tasks),
    );
  }, [tasks]);

  const sensors = useSensors(
    useSensor(
      PointerSensor,
      getDragSensorOptions(),
    ),
  );

  const handleDragStart = (
    event: DragStartEvent,
  ) => {
    setActiveTask(
      getActiveDragTask(
        kanbanTasks,
        Number(event.active.id),
      ),
    );
  };

  // 다른 컬럼으로 넘어갈 때 상태와 위치를 화면에 먼저 반영
  const handleDragOver = (
    event: DragOverEvent,
  ) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = Number(active.id);

    setKanbanTasks((currentTasks) => {
      const movingTask = currentTasks.find(
        (task) => task.id === activeId,
      );

      const dropTarget = getKanbanDropTarget(
        currentTasks,
        over.id,
      );

      if (!movingTask || !dropTarget) {
        return currentTasks;
      }

      if (movingTask.status === dropTarget.status) {
        return currentTasks;
      }

      return moveTaskInKanban(
        currentTasks,
        activeId,
        dropTarget.status,
        dropTarget.targetTaskId,
      );
    });
  };

  // Drop 시 Sortable에서 보이던 카드 순서를 최종 확정
  const handleDragEnd = (
    event: DragEndEvent,
  ) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    setKanbanTasks((currentTasks) => {
      const draggedTask = currentTasks.find(
        (task) => task.id === activeId,
      );

      const targetTask = currentTasks.find(
        (task) => task.id === overId,
      );

      if (!draggedTask || !targetTask) {
        onOrderChange?.(currentTasks);
        return currentTasks;
      }

      const columnTasks = currentTasks.filter(
        (task) => task.status === draggedTask.status,
      );

      const oldIndex = columnTasks.findIndex(
        (task) => task.id === activeId,
      );

      const newIndex = columnTasks.findIndex(
        (task) => task.id === overId,
      );

      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return currentTasks;
      }

      const reorderedColumn = arrayMove(
        columnTasks,
        oldIndex,
        newIndex,
      );

      let index = 0;

      const nextTasks = currentTasks.map((task) => {
        if (task.status !== draggedTask.status) {return task;}

        return reorderedColumn[index++];
      });

      onOrderChange?.(nextTasks);

      return nextTasks;
    });
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setKanbanTasks(tasks);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <KanbanBoard>
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = kanbanTasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <KanbanColumn
              key={column.status}
              data-column-id={column.status}
            >
              <ColumnHeader>
                <ColumnTitle>
                  <StatusDot $status={column.status} />
                  {column.label}
                </ColumnTitle>

                <TaskCount>
                  {columnTasks.length}
                </TaskCount>
              </ColumnHeader>

              <SortableContext
                items={columnTasks.map(
                  (task) => task.id,
                )}
                strategy={verticalListSortingStrategy}
              >
                <CardList>
                  {columnTasks.length === 0 ? (
                    <EmptyMessage>
                      등록된 태스크가 없습니다.
                    </EmptyMessage>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDetail={onDetail}
                      />
                    ))
                  )}
                </CardList>
              </SortableContext>

              <ColumnEndDropZone
                status={column.status}
              />
            </KanbanColumn>
          );
        })}
      </KanbanBoard>

      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <TaskCardOverlay task={activeTask} />
        )}
      </DragOverlay>
    </DndContext>
  );
}


export default TaskKanbanBoard;


const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 16px;
  overflow-x: auto;
`;

const KanbanColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 280px;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ColumnTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

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

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ColumnEndDropArea = styled.div<{
  $isOver: boolean;
}>`
  flex: 1;
  min-height: 56px;
  margin-top: 12px;
  border-radius: 8px;
  background: ${({ $isOver }) =>
    $isOver
      ? "rgba(59, 130, 246, 0.08)"
      : "transparent"};
`;

const EmptyMessage = styled.div`
  padding: 40px 10px;
  text-align: center;
  font-size: 0.85rem;
  color: ${(props) =>
    props.theme.colors.textSecondary};
`;

const StatusDot = styled.span<{
  $status: TaskResponse["status"];
}>`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;

  background: ${({ $status }) => {
    switch ($status) {
      case "IN_PROGRESS":
        return "#3b82f6";

      case "DONE":
        return "#22c55e";

      default:
        return "#94a3b8";
    }
  }};
`;