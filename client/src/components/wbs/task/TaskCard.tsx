import styled from "styled-components";

import { TaskResponse } from "../../../types/task";


interface TaskCardProps {
  task: TaskResponse;

  // 카드를 클릭하면 부모에게 선택한 태스크를 전달
  // 최종적으로 TaskManagementPage의 상세 Modal을 열게 됨
  onDetail: (task: TaskResponse) => void;
}


// 우선순위별 사용자 표시 이름
const PRIORITY_LABELS: Record<TaskResponse["priority"], string> = {
  LOW: "낮음",
  NORMAL: "보통",
  HIGH: "높음",
  URGENT: "긴급",
};


// YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
// new Date("2026-08-25")처럼 바로 생성할 경우
// 시간대 처리에 영향을 받을 수 있으므로 연/월/일을 직접 분리
const parseDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
};


// 완료 예정일을 기준으로 현재 마감 상태 계산
const getDeadlineStatus = (task: TaskResponse) => {

  // 이미 완료된 태스크는 예정일이 지났더라도 지연 경고를 표시하지 않음
  if (task.status === "DONE") { return null;}

  const today = new Date();

  // 시간 차이 때문에 날짜 계산이 달라지는 것을 방지하기 위해 현재 시간은 00:00:00으로 맞춤
  today.setHours(0, 0, 0, 0);

  const endDate = parseDate(task.planned_end_date);

  // 완료 예정일과 오늘 날짜의 차이를 일(day) 단위로 계산
  const diffDays = Math.ceil( (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),);


  // 완료 예정일을 이미 지난 경우
  if (diffDays < 0) {
    return { type: "overdue" as const, label: `${Math.abs(diffDays)}일 지연`,};
  }

  // 오늘이 완료 예정일인 경우
  if (diffDays === 0) {
    return {type: "today" as const, label: "오늘 마감",};
  }

  // 완료 예정일까지 3일 이하 남은 경우
  if (diffDays <= 3) {
    return {type: "soon" as const, label: `마감 임박 D-${diffDays}`,};
  }

  // 4일 이상 남아 있으면 별도 마감 경고 없음
  return null;
};


// 칸반에 표시되는 태스크 카드
function TaskCard({task, onDetail, }: TaskCardProps) {

  // 현재 태스크의 완료 예정일을 기준으로
  // 마감 임박 / 오늘 마감 / 지연 여부 계산
  const deadlineStatus = getDeadlineStatus(task);

  return (
    <CardContainer
      type="button"
      onClick={() => onDetail(task)}
    >

      {/* 카드에서 가장 중요한 태스크명 */}
      <TaskName>
        {task.task_name}
      </TaskName>


      {/* 태스크가 연결된 WBS 코드 */}
      <WbsCode>
        WBS {task.wbs_code}
      </WbsCode>


      {/* 담당자와 우선순위를 같은 줄에 배치 */}
      <InfoRow>

        <Assignee>
          <InfoLabel>담당자</InfoLabel>
          {task.assignee_name}
        </Assignee>

        {/*
          실제 데이터는 HIGH, NORMAL 등의 값을 그대로 유지하고
          사용자 화면에서만 높음, 보통 등으로 변환
        */}
        <PriorityBadge $priority={task.priority}>
          {PRIORITY_LABELS[task.priority]}
        </PriorityBadge>

      </InfoRow>


      {/* 카드 상단 정보와 일정 정보를 구분하는 선 */}
      <Divider />


      {/* 완료 예정일 및 마감 상태 */}
      <Footer>

        <EndDate>
          <InfoLabel>완료예정일</InfoLabel>
          {task.planned_end_date}
        </EndDate>

        {deadlineStatus && (
          <DeadlineBadge $type={deadlineStatus.type}>
            {deadlineStatus.label}
          </DeadlineBadge>
        )}

      </Footer>

    </CardContainer>
  );
}


export default TaskCard;



// Styled Components //

// 태스크 카드 전체 영역
const CardContainer = styled.button`
  width: 100%;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #cbd5e1;

    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08);

    transform: translateY(-2px);
  }
`;


// 태스크명
const TaskName = styled.div`
  font-size: 1rem;
  font-weight: 600;

  line-height: 1.4;

  color: ${props => props.theme.colors.text};

  margin-bottom: 5px;
`;


// 태스크가 연결된 WBS 코드
const WbsCode = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  margin-bottom: 16px;
  border-radius: 6px;
  background: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
`;


// 담당자 + 우선순위가 들어가는 한 줄
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;


// 담당자 정보
const Assignee = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.text};
`;


// "담당자", "완료예정" 같은 보조 라벨
const InfoLabel = styled.span`
  margin-right: 4px;
  font-size: 0.78rem;
  color: ${props => props.theme.colors.textSecondary};
`;


// 우선순위 Badge
const PriorityBadge = styled.span<{$priority: TaskResponse["priority"];}>`
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;

  /*
    우선순위에 따라 Badge 배경색 변경

    LOW     → 회색
    NORMAL  → 파랑
    HIGH    → 주황
    URGENT  → 빨강
  */
  background: ${({ $priority }) => {

    switch ($priority) {
      case "LOW":
        return "#f3f4f6";

      case "NORMAL":
        return "#dbeafe";

      case "HIGH":
        return "#ffedd5";

      case "URGENT":
        return "#fee2e2";

      default:
        return "#f3f4f6";
    }
  }};


  // 배경색과 함께 글자색도 우선순위별로 변경
  color: ${({ $priority }) => {

    switch ($priority) {
      case "LOW":
        return "#4b5563";

      case "NORMAL":
        return "#1d4ed8";

      case "HIGH":
        return "#c2410c";

      case "URGENT":
        return "#b91c1c";

      default:
        return "#4b5563";
    }
  }};
`;


// 카드 상단 정보와 하단 일정 정보를 구분
const Divider = styled.div`
  height: 1px;
  margin: 14px 0;
  background: #f1f5f9;
`;


// 카드 하단 일정 영역
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;


// 태스크 완료 예정일
const EndDate = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
`;


// 마감 상태 Badge
const DeadlineBadge = styled.span<{$type: "soon" | "today" | "overdue";}>`
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;


  /*
    마감 상태에 따른 배경색
    soon → 아직 기한은 지나지 않았지만 마감 임박

    today → 오늘이 완료 예정일

    overdue → 완료 예정일이 이미 지남
  */
background: ${({ $type }) => {

  switch ($type) {

    case "soon":
      return "#fef3c7";

    case "today":
      return "#ffedd5";

    case "overdue":
      return "#fee2e2";

    default:
      return "#f3f4f6";
  }
}};


  // 상태에 맞춰 텍스트 색상도 변경
  color: ${({ $type }) => {

    switch ($type) {
      case "soon":
        return "#92400e";

      case "today":
        return "#c2410c";

      case "overdue":
        return "#b91c1c";

      default:
        return "#4b5563";
    }
  }};
`;