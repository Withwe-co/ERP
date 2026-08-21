import { useState } from "react";
import styled from "styled-components";

import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";

import {TaskCreateData,TaskPriority,TaskStatus,} from "../../../types/task";

import { toast } from "react-toastify";
import { getTaskStatusAfterProgressChange,validateTaskCreateData } from "./taskValidation";

import { taskApi } from "../../../services/api";


// 태스크 등록 Form에서 전달받을 값
interface TaskCreateFormProps {
  // 현재 보고 있는 프로젝트의 ID
  projectId: number;

  // 현재 보고 있는 프로젝트의 이름
  projectName: string;

  // 태스크 등록에 성공했을 때 실행할 함수
  onSuccess: () => void;

  // 등록 Form에서 취소 버튼을 눌렀을 때 실행할 함수
  onCancel: () => void;
}


// 태스크 등록 Form
function TaskCreateForm({projectId, projectName, onSuccess, onCancel,}: TaskCreateFormProps) {
    // 태스크 등록 Form의 입력값을 하나의 객체로 관리
    const [formData, setFormData] = useState<TaskCreateData>({
        // 프로젝트 ID는 현재 프로젝트 상세 화면의 ID를 자동으로 사용
        project_id: projectId,

        // WBS 연동 전까지는 사용자가 숫자 ID를 직접 입력
        wbs_id: 0,

        task_name: "",
        assignee_name: "",
        department: "",

        // 기본 우선순위
        priority: "NORMAL",

        // 신규 태스크의 기본 상태
        status: "TODO",

        planned_start_date: "",
        planned_end_date: "",

        // 신규 태스크의 기본 진척률
        progress_rate: 0,

        description: "",
        note: "",
    });

    // 진척률 입력창은 신규 태스크의 기본값인 0을 화면에 표시
    const [progressInput, setProgressInput] = useState("0");

    // POST 요청이 진행 중인지 관리
    // 중복으로 등록 버튼을 누르는 것을 방지하기 위해 사용
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 등록 버튼 클릭 시 실행
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>,) => {

    // Form 제출 시 브라우저 새로고침 방지
    event.preventDefault();

    // 사용자가 입력한 태스크 데이터를 검증
    const errorMessage = validateTaskCreateData(formData);

    // 검증에 실패하면 오류 메시지를 보여주고 등록 중단
    if (errorMessage) {toast.error(errorMessage); return;}

    try {
        // API 요청 시작
        setIsSubmitting(true);

        // 검증을 통과한 데이터를 FastAPI에 전달
        await taskApi.createTask(formData);

        // 서버에서 정상적으로 등록된 경우 성공 메시지 표시
        toast.success("태스크가 등록되었습니다.");

        // 등록 성공 후 부모 컴포넌트에 성공 사실 전달
        onSuccess();
    } catch (error: any) {
        // FastAPI가 문자열 형태의 detail을 반환한 경우 사용
        const detail = error.response?.data?.detail;

        if (typeof detail === "string") {
        toast.error(detail);
        return;
        }

        // FastAPI 입력값 검증 실패
        if (error.response?.status === 422) {
        toast.error("입력값 형식을 확인해주세요.");
        return;
        }

        // 그 외 서버/네트워크 오류
        toast.error("태스크 등록 중 오류가 발생했습니다.");
    } finally {
        // 성공/실패와 관계없이 API 요청 상태 종료
        setIsSubmitting(false);
    }
    };


  return (
    <>
        {/* 브라우저 기본 검증 대신 직접 만든 검증 로직 사용 */}
        <Form onSubmit={handleSubmit} noValidate>
        {/* 현재 프로젝트 정보와 WBS ID 입력 영역 */}
        <FormGrid>
            <Input
            label="프로젝트"
            value={projectName}
            disabled
            />

            <Input
            label="WBS ID"
            type="number"
            value={formData.wbs_id || ""}
            min={1}
            required
            onChange={(event) =>setFormData({...formData, wbs_id: Number(event.target.value),})}
            />
        </FormGrid>


        {/* 태스크 기본 정보 */}
        <FormGrid>
            <Input
            label="태스크명"
            value={formData.task_name}
            required
            placeholder="태스크명을 입력하세요."
            onChange={(event) =>setFormData({...formData, task_name: event.target.value,})}
            />

            <Input
            label="담당자"
            value={formData.assignee_name}
            required
            placeholder="담당자명을 입력하세요."
            onChange={(event) =>setFormData({...formData, assignee_name: event.target.value,})}
            />
        </FormGrid>


        {/* 담당 부서 */}
        <Input
            label="담당 부서"
            value={formData.department}
            required
            placeholder="담당 부서를 입력하세요."
            onChange={(event) =>setFormData({...formData, department: event.target.value,})}
        />


        {/* 우선순위와 상태 */}
        <FormGrid>
            <Select
            label="우선순위"
            value={formData.priority}
            required
            options={[
                { value: "LOW", label: "낮음" },
                { value: "NORMAL", label: "보통" },
                { value: "HIGH", label: "높음" },
                { value: "URGENT", label: "긴급" },
            ]}
            onChange={(value) =>setFormData({...formData, priority: value as TaskPriority,})}
            />

        </FormGrid>


        {/* 태스크 일정 */}
        <FormGrid>
            <Input
            label="시작 예정일"
            type="date"
            value={formData.planned_start_date}
            required
            onChange={(event) =>setFormData({...formData, planned_start_date: event.target.value,})}
            />

            <Input
            label="완료 예정일"
            type="date"
            value={formData.planned_end_date}
            required
            onChange={(event) =>setFormData({...formData, planned_end_date: event.target.value,})}
            />
        </FormGrid>


        {/* 진척률과 상태를 한 행에 표시 */}
        <FormGrid>
        <Input
            label="진척률 (%)"
            type="number"
            value={progressInput}
            min={0}
            required
            placeholder="0 ~ 100"
            onChange={(event) => {
            // 사용자가 입력한 값을 가져옴
            const inputValue = event.target.value;

            // 초기값 0 뒤에 숫자를 입력했을 때
            // 05, 0080처럼 앞에 불필요한 0이 붙는 것을 제거
            const normalizedValue =
                inputValue.replace(/^0+(?=\d)/, "");

            // 입력창에 정리된 값을 표시
            setProgressInput(normalizedValue);

            // 입력값이 비어 있는 순간에는 기본 진척률 0으로 처리
            const progressRate =
                normalizedValue === ""
                ? 0
                : Number(normalizedValue);

            // 0 ~ 100 범위에서는 진척률에 맞게 상태 자동 변경
            if (
                progressRate >= 0 &&
                progressRate <= 100
            ) {
                setFormData({
                ...formData,
                progress_rate: progressRate,

                // 보류 상태라면 보류 유지,
                // 아니면 진척률에 따라 상태 자동 결정
                status: getTaskStatusAfterProgressChange(
                    progressRate,
                    formData.status,
                ),
                });

                return;
            }

            // 0 ~ 100 범위를 벗어난 값도 일단 저장
            // 등록 시 validateTaskCreateData에서 오류 처리
            setFormData({
                ...formData,
                progress_rate: progressRate,
            });
            }}
        />

        {/* 상태는 진척률과 서로 연동됨 */}
        <Select
            label="상태"
            value={formData.status}
            required
            options={[
            {
                value: "TODO",
                label: "대기",

                // 진척률이 0이 아니면 대기 선택 불가
                disabled: formData.progress_rate !== 0,
            },
            {
                value: "IN_PROGRESS",
                label: "진행 중",

                // 진행 중은 진척률 1 ~ 99에서만 선택 가능
                disabled:
                formData.progress_rate < 1 ||
                formData.progress_rate > 99,
            },
            {
                value: "ON_HOLD",
                label: "보류",
            },
            {
                value: "DONE",
                label: "완료",

                // 진척률을 직접 입력한 1 ~ 99 상태에서는 완료 선택 불가
                // 진척률 0인 신규 상태에서는 완료 직접 선택 가능
                disabled:
                    formData.progress_rate >= 1 &&
                    formData.progress_rate <= 99,
            },
            ]}
            onChange={(value) => {
            const selectedStatus = value as TaskStatus;

            // 대기를 직접 선택하면 진척률도 0으로 변경
            if (selectedStatus === "TODO") {
                setProgressInput("0");

                setFormData({
                ...formData,
                progress_rate: 0,
                status: "TODO",
                });

                return;
            }

            // 완료를 직접 선택하면 진척률도 100으로 변경
            if (selectedStatus === "DONE") {
                setProgressInput("100");

                setFormData({
                ...formData,
                progress_rate: 100,
                status: "DONE",
                });

                return;
            }

            // 보류는 현재 진척률을 그대로 유지
            if (selectedStatus === "ON_HOLD") {
                setFormData({
                ...formData,
                status: "ON_HOLD",
                });

                return;
            }

            // 진행 중은 진척률이 1 ~ 99인 경우에만 선택 가능
            if (
                selectedStatus === "IN_PROGRESS" &&
                formData.progress_rate >= 1 &&
                formData.progress_rate <= 99
            ) {
                setFormData({
                ...formData,
                status: "IN_PROGRESS",
                });
            }
            }}
        />
        </FormGrid>


        {/* 태스크 설명 */}
        <TextAreaGroup>
            <Label>설명</Label>

            <TextArea
            value={formData.description || ""}
            placeholder="태스크에 대한 설명을 입력하세요."
            onChange={(event) =>setFormData({...formData, description: event.target.value,})}
            />
        </TextAreaGroup>


        {/* 비고 */}
        <TextAreaGroup>
            <Label>비고</Label>

            <TextArea
            value={formData.note || ""}
            placeholder="추가로 기록할 내용을 입력하세요."
            onChange={(event) =>setFormData({...formData, note: event.target.value,})}
            />
        </TextAreaGroup>


        {/* Form 하단 버튼 영역 */}
        <ButtonArea>
            {/* 취소 버튼은 Modal을 닫음 */}
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
            >
            취소
            </Button>

            {/* API 요청 중에는 버튼을 비활성화하여 중복 등록 방지 */}
            <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
            >
            등록
            </Button>
        </ButtonArea>
        </Form>
    </>
  );
}


export default TaskCreateForm;


// 태스크 등록 Form 전체 영역
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;


// 두 개의 입력 항목을 한 줄에 표시하는 영역
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  /*화면이 좁아지면 한 줄에 하나씩 표시*/
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;


// 설명 및 비고 입력 영역
const TextAreaGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;


// TextArea 위에 표시하는 제목
const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;


// 설명 및 비고 입력용 TextArea
const TextArea = styled.textarea`
  min-height: 100px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;


// 취소 / 등록 버튼을 오른쪽에 배치하는 영역
const ButtonArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
`;
