import styled from "styled-components";
import Button from "../../common/Button";

// 태스크 보기 방식 전환 및 등록 버튼 영역
function TaskViewToolbar() {
  return (
    <ActionArea>
      <ViewArea>
        <Button size="sm">칸반 보기</Button>
        <Button variant="outline" size="sm">
          목록 보기
        </Button>
      </ViewArea>

      <Button>태스크 등록</Button>
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