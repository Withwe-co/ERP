import styled from "styled-components";

import Button from "../../common/Button";
import { TaskResponse } from "../../../types/task";


interface TaskDetailProps {
  task: TaskResponse;
  onEdit: () => void;
  onClose: () => void;
}


function TaskDetail({task,onEdit,onClose,}: TaskDetailProps) {
  const priorityLabel = {
    LOW: "낮음",
    NORMAL: "보통",
    HIGH: "높음",
    URGENT: "긴급",
  };

  const statusLabel = {
    TODO: "대기",
    IN_PROGRESS: "진행 중",
    DONE: "완료",
  };


  return (
    <Container>
      {/* 태스크 기본 정보 */}
      <DetailGrid>
        <DetailItem>
          <Label>태스크명</Label>
          <Value>{task.task_name}</Value>
        </DetailItem>

        <DetailItem>
          <Label>WBS 코드</Label>
          <Value>{task.wbs_code}</Value>
        </DetailItem>

        <DetailItem>
          <Label>담당자</Label>
          <Value>{task.assignee_name}</Value>
        </DetailItem>

        <DetailItem>
          <Label>부서</Label>
          <Value>{task.department}</Value>
        </DetailItem>

        <DetailItem>
          <Label>우선순위</Label>
          <Value>{priorityLabel[task.priority]}</Value>
        </DetailItem>

        <DetailItem>
          <Label>상태</Label>
          <Value>{statusLabel[task.status]}</Value>
        </DetailItem>

        <DetailItem>
          <Label>시작 예정일</Label>
          <Value>{task.planned_start_date}</Value>
        </DetailItem>

        <DetailItem>
          <Label>완료 예정일</Label>
          <Value>{task.planned_end_date}</Value>
        </DetailItem>
      </DetailGrid>


      {/* 태스크 설명 */}
      <FullDetailItem>
        <Label>설명</Label>
        <Description>
          {task.description || "-"}
        </Description>
      </FullDetailItem>


      {/* 비고 */}
      <FullDetailItem>
        <Label>비고</Label>
        <Description>
          {task.note || "-"}
        </Description>
      </FullDetailItem>


      {/* 하단 버튼 */}
      <ButtonArea>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          닫기
        </Button>

        <Button
          type="button"
          onClick={onEdit}
        >
          수정
        </Button>
      </ButtonArea>
    </Container>
  );
}


export default TaskDetail;


const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;


const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;


const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;


const FullDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;


const Label = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
`;


const Value = styled.div`
  min-height: 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.text};
`;


const Description = styled.div`
  min-height: 80px;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  white-space: pre-wrap;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;


const ButtonArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
`;