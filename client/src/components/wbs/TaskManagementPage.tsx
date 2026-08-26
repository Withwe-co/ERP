import { useState } from "react";
import Modal from "../common/Modal";
import styled from "styled-components";
import Card from "../common/Card";
import TaskSearchFilter from "./task/TaskSearchFilter";
import TaskViewToolbar, {TaskScope, TaskViewMode,} from "./task/TaskViewToolbar";
import TaskCreateForm from "./task/TaskCreateForm";
import { useQuery, useQueryClient, } from "@tanstack/react-query";
import { taskApi, WbsApi } from "../../services/api";
import TaskList from "./task/TaskList";
import TaskDetail from "./task/TaskDetail";
import { TaskFilter, TaskResponse, } from "../../types/task";
import TaskKanbanBoard from "./task/TaskKanbanBoard";
import { getSelectableWbsCodes } from "./task/wbsOptions";
import { getTaskContentView } from "./task/taskViewMode";
import { toast } from "react-toastify";

// 현재 선택된 프로젝트의 ID와 이름을 전달받기 위한 Props
interface TaskManagementPageProps {
  projectId: number;
  projectName: string;
  // 프로젝트 기간 Props
  projectStartDate: string;
  projectDueDate: string;
}

// 태스크 관리 페이지
function TaskManagementPage({projectId,projectName, projectStartDate, projectDueDate,}: TaskManagementPageProps) {
  
  const queryClient = useQueryClient();
  
  // 태스크 등록 Modal의 열림/닫힘 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 현재 수정 대상으로 선택된 태스크
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  // 현재 상세보기로 선택한 태스크
  const [detailTask, setDetailTask] = useState<TaskResponse | null>(null);

  // 현재 태스크 화면의 보기 방식
  // 처음 진입했을 때는 칸반 보기가 기본
  const [viewMode, setViewMode] = useState<TaskViewMode>("kanban");

  // 전체 태스크 / 보류 태스크 화면 구분
  const [taskScope, setTaskScope] = useState<TaskScope>("active");

  // 실제 표시 방식 계산
  const contentView = getTaskContentView(taskScope,viewMode,);

  // 현재 적용된 태스크 검색 및 필터 조건을 관리
  const [filters, setFilters] = useState<TaskFilter>({});

  // 검색 또는 필터 조건이 변경되면
  // TaskSearchFilter에서 전달받은 값을 부모의 filters 상태에 저장
  const handleSearch = (searchFilters: TaskFilter) => {setFilters(searchFilters);};

  // 현재 프로젝트의 WBS 목록 조회
  const {data: wbsList = [], } = useQuery({
      queryKey: ["projectwbs", projectId],
      queryFn: () => WbsApi.getWbsList(projectId),
      enabled: Boolean(projectId),
    });
    
  // 하위 WBS가 없는 최하위 WBS만 태스크 등록 대상으로 사용
  const selectableWbsCodes = getSelectableWbsCodes(wbsList);

  // 현재 프로젝트의 태스크 목록 조회
  const {data: tasks = [], isLoading, error, refetch,} = useQuery({
    // 프로젝트 또는 검색/필터 조건이 변경되면 서로 다른 조회 데이터로 인식하여 API 다시 호출
    queryKey: ["tasks", projectId, filters, taskScope,],

    // 현재 프로젝트 ID와 검색/필터 조건을 서버에 전달
    queryFn: () => taskApi.getTasks(projectId, filters, taskScope === "archived",),

    // 한 번 조회한 데이터는 5분 동안 최신 데이터로 간주
    staleTime: 5 * 60 * 1000,

    // 조회 실패 시 최대 2번 재시도
    retry: 2,
  });

  // 보류/진행 함수 추가
  const handleArchive = async (task: TaskResponse,) => {
    try {
      const response = await taskApi.archiveTask(task.id);
      toast.success(response.message);
      await queryClient.invalidateQueries({queryKey: ["tasks", projectId],});
    } 
    catch {toast.error("태스크 보류 중 오류가 발생했습니다.",);}
  };

  const handleRestore = async (task: TaskResponse,) => {
    try {
      const response = await taskApi.restoreTask(task.id);

      toast.success(response.message);

      await queryClient.invalidateQueries({queryKey: ["tasks", projectId],});
    } 
    catch {toast.error("태스크 진행 처리 중 오류가 발생했습니다.",);}
  };

  return (
    <>
      <Container>
        {/* 페이지 제목 및 설명 */}
        <PageTitle>태스크 관리</PageTitle>
        <PageSubtitle>
          {projectName} 프로젝트의 태스크를 조회하고 관리할 수 있습니다.
        </PageSubtitle>

        {/* 검색 및 필터 조건이 변경되면 부모의 filters 상태에 반영 */}
        <TaskSearchFilter
          onFilter={handleSearch}
          wbsCodes={selectableWbsCodes}
        />

        {/* 보기 방식 전환 및 태스크 등록 영역 -> 현재 보기 상태와 상태 변경 함수를 Toolbar에 전달 */}
        <TaskViewToolbar 
          viewMode={viewMode}
          taskScope={taskScope}
          onViewModeChange={setViewMode}
          onTaskScopeChange={setTaskScope}
          onCreateTask={() => setIsCreateModalOpen(true)}
        />

        {/* 현재 선택된 보기 방식에 따라 태스크 목록 또는 칸반 임시 화면을 표시 */}
        <ContentCard>
          {error ? (
            <ErrorMessage>
              태스크 목록을 불러오지 못했습니다.
            </ErrorMessage>
          ) : contentView === "list" ? (
            <TaskList
              tasks={tasks}
              loading={isLoading}
              archivedView={
                taskScope === "archived"
              }
              onEdit={(task) =>
                setSelectedTask(task)
              }
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDetail={(task) =>
                setDetailTask(task)
              }
            />
          ) : (
            <TaskKanbanBoard
              tasks={tasks}
              onDetail={(task) =>
                setDetailTask(task)
              }
            />
          )}
        </ContentCard>
      </Container>

      {/* 태스크 등록 화면을 표시하는 Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 태스크 등록"
        size="lg"
      >
        {/* 실제 태스크 등록 Form */}
        <TaskCreateForm
            projectId={projectId}
            projectName={projectName}
            wbsCodes={selectableWbsCodes}
            projectStartDate={projectStartDate}
            projectDueDate={projectDueDate}
            // 태스크 등록 성공 시 Modal은 닫고 태스크 목록을 다시 조회
            onSuccess={() => {setIsCreateModalOpen(false); refetch();}}
            // 사용자가 취소한 경우에는 Modal만 닫음
            onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>     


      {/* 태스크 수정 화면을 표시하는 Modal */}
      <Modal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        title="태스크 수정"
        size="lg"
      >
        {selectedTask && (
          <TaskCreateForm
            projectId={projectId}
            projectName={projectName}
            projectStartDate={projectStartDate}
            projectDueDate={projectDueDate}
            wbsCodes={selectableWbsCodes}
            mode="edit"
            initialData={selectedTask}
            onSuccess={() => {setSelectedTask(null); refetch();}}
            onCancel={() => setSelectedTask(null)}
          />
        )}
      </Modal>

      {/* 태스크 상세 Modal */}
      <Modal
        isOpen={detailTask !== null}
        onClose={() => setDetailTask(null)}
        title="태스크 상세"
        size="lg"
      >
        {detailTask && (
          <TaskDetail
            task={detailTask}
            onClose={() => setDetailTask(null)}
            onEdit={() => {
              setSelectedTask(detailTask);
              setDetailTask(null);
            }}
          />
        )}
      </Modal>

    </>
  );
}


export default TaskManagementPage;


// 태스크 관리 페이지 전체 영역
const Container = styled.div`
  padding: 20px;
`;


// 페이지 제목
const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
`;


// 페이지 제목 아래 설명 문구
const PageSubtitle = styled.p`
  margin-bottom: 30px;
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;


// 태스크 칸반 또는 목록이 표시될 콘텐츠 영역
const ContentCard = styled(Card)`
  min-height: 400px;
`;

// 태스크 목록 조회 실패 시 표시할 메시지
const ErrorMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.theme.colors.error};
`;
