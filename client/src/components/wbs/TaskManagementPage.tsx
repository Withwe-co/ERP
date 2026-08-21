import { useState } from "react";
import Modal from "../common/Modal";
import styled from "styled-components";
import Card from "../common/Card";
import TaskSearchFilter from "./task/TaskSearchFilter";
import TaskViewToolbar from "./task/TaskViewToolbar";
import TaskCreateForm from "./task/TaskCreateForm";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "../../services/api";
import TaskList from "./task/TaskList";

// 현재 선택된 프로젝트의 ID와 이름을 전달받기 위한 Props
interface TaskManagementPageProps {
  projectId: number;
  projectName: string;
}

// 태스크 관리 페이지
function TaskManagementPage({projectId,projectName,}: TaskManagementPageProps) {
  // 태스크 등록 Modal의 열림/닫힘 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // 현재 프로젝트의 태스크 목록 조회
  const {data: tasks = [], isLoading, error, refetch,} = useQuery({
    // projectId가 달라지면 다른 프로젝트의 태스크 목록으로 구분
    queryKey: ["tasks", projectId],

    // 현재 프로젝트 ID를 사용해 태스크 목록 API 호출
    queryFn: () => taskApi.getTasks(projectId),

    // 한 번 조회한 데이터는 5분 동안 최신 데이터로 간주
    staleTime: 5 * 60 * 1000,

    // 조회 실패 시 최대 2번 재시도
    retry: 2,
  });

  return (
    <>
      <Container>
        {/* 페이지 제목 및 설명 */}
        <PageTitle>태스크 관리</PageTitle>
        <PageSubtitle>
          {projectName} 프로젝트의 태스크를 조회하고 관리할 수 있습니다.
        </PageSubtitle>

        {/* 태스크 검색 및 필터 영역 */}
        <TaskSearchFilter />

        {/* 보기 방식 전환 및 태스크 등록 영역 */}
        <TaskViewToolbar onCreateTask={() => setIsCreateModalOpen(true)}/>

        {/* 현재 프로젝트의 태스크 목록 */}
        <ContentCard>
          {error ? (
            <ErrorMessage>
              태스크 목록을 불러오지 못했습니다.
            </ErrorMessage>
          ) : (
            <TaskList
              tasks={tasks}
              loading={isLoading}
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
            // 태스크 등록 성공 시 Modal은 닫고 태스크 목록을 다시 조회
            onSuccess={() => {setIsCreateModalOpen(false); refetch();}}
            // 사용자가 취소한 경우에는 Modal만 닫음
            onCancel={() => setIsCreateModalOpen(false)}
        />
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