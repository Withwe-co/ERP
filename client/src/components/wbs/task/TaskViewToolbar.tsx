import styled from "styled-components";
import Button from "../../common/Button";

// 태스크 보기 도구 영역에서 사용할 이벤트 Props
interface TaskViewToolbarProps {
  // 태스크 등록 버튼을 클릭했을 때 실행할 함수
  onCreateTask: () => void;
}

// 태스크 보기 방식 전환 및 등록 버튼 영역
function TaskViewToolbar({onCreateTask,}: TaskViewToolbarProps) {
  return (
    <ActionArea>
      <ViewArea>
        <Button size="sm">칸반 보기</Button>
        <Button variant="outline" size="sm">
          목록 보기
        </Button>
      </ViewArea>

      {/* 태스크 등록 Modal을 열기 위한 버튼 */}
      <Button onClick={onCreateTask}>
        태스크 등록
      </Button>
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