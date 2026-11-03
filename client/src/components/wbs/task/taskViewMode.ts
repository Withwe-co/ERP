import {TaskScope, TaskViewMode,} from "./TaskViewToolbar";

export function getTaskContentView(taskScope: TaskScope,viewMode: TaskViewMode,): TaskViewMode {
  if (taskScope === "archived") {return "list";}

  return viewMode;
}