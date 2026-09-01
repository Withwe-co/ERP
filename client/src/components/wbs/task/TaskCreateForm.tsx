import { useState } from "react";
import styled from "styled-components";

import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";

import {TaskCreateData,TaskPriority,TaskStatus,TaskResponse,} from "../../../types/task";
import { toast } from "react-toastify";
import { hasTaskChanges, validateTaskCreateData } from "./taskValidation";
import { taskApi } from "../../../services/api";


// 태스크 등록/수정 시 사용할 담당부서 목록
// 화면에서는 아래 순서를 오름차순 기준으로 고정하여 표시
const TASK_DEPARTMENTS = [
  "H/W 개발팀",
  "S/W 개발팀",
  "사무관리팀",
  "영업팀",
  "인사팀",
  "총무부",
];

interface TaskCreateFormProps {
  // 현재 보고 있는 프로젝트의 ID
  projectId: number;

  // 현재 보고 있는 프로젝트의 이름
  projectName: string;

  // 등록 / 수정 모드
  mode?: "create" | "edit";

  // 수정할 기존 태스크 데이터
  initialData?: TaskResponse;

  //WBS 코드 
  wbsCodes: string[];

  // 프로젝트 기간
  projectStartDate: string;
  projectDueDate: string;

  // 등록 또는 수정 성공 시 실행
  onSuccess: () => void;

  // 취소 시 실행
  onCancel: () => void;
}


// 태스크 등록 Form
function TaskCreateForm({
    projectId, 
    projectName, 
    wbsCodes,   
    projectStartDate,
    projectDueDate, 
    mode = "create", 
    initialData, 
    onSuccess, 
    onCancel,
    }: TaskCreateFormProps) {
        // 태스크 등록 Form의 입력값을 하나의 객체로 관리
        const [formData, setFormData] = useState<TaskCreateData>(() => ({
            project_id: initialData?.project_id ?? projectId,
            wbs_code: initialData?.wbs_code ?? "",
            task_name: initialData?.task_name ?? "",
            assignee_name: initialData?.assignee_name ?? "",
            department: initialData?.department ?? "",
            priority: initialData?.priority ?? "NORMAL",
            status: initialData?.status ?? "TODO",
            planned_start_date: initialData?.planned_start_date ?? "",
            planned_end_date: initialData?.planned_end_date ?? "",
            description: initialData?.description ?? "",
            note: initialData?.note ?? "",
        }));

        // POST 요청이 진행 중인지 관리
        // 중복으로 등록 버튼을 누르는 것을 방지하기 위해 사용
        const [isSubmitting, setIsSubmitting] = useState(false);

        // date input 범위
        const projectStart = projectStartDate?.slice(0, 10);
        const projectDue = projectDueDate?.slice(0, 10);

        // 등록 버튼 클릭 시 실행
        const handleSubmit = async (event: React.FormEvent<HTMLFormElement>,) => {

            // Form 제출 시 브라우저 새로고침 방지
            event.preventDefault();
            // 사용자가 입력한 태스크 데이터를 검증
            const errorMessage = validateTaskCreateData(formData);
            // 검증에 실패하면 오류 메시지를 보여주고 등록 중단
            if (errorMessage) {toast.error(errorMessage); return;}
            // 수정 모드에서 실제 변경된 값이 없으면 API 요청하지 않음
            if (mode === "edit" && initialData && !hasTaskChanges(initialData, formData)) {
                toast.info("수정사항이 없습니다.");
                return;
            }

            try {
                // API 요청 시작
                setIsSubmitting(true);

                if (mode === "edit" && initialData) {
                    const response = await taskApi.updateTask(initialData.id, formData,);
                    toast.success(response.message);
                }
                else {
                    const response = await taskApi.createTask(formData);
                    toast.success(response.message);
                }

                onSuccess();

            } catch (error: any) {
                // FastAPI가 문자열 형태의 detail을 반환한 경우 사용
                const detail = error.response?.data?.detail;

                if (typeof detail === "string") {toast.error(detail); return;}

                // FastAPI 입력값 검증 실패
                if (error.response?.status === 422) {toast.error("입력값 형식을 확인해주세요."); return;}

                // 그 외 서버/네트워크 오류
                toast.error(
                    mode === "edit"
                        ? "태스크 수정 중 오류가 발생했습니다."
                        : "태스크 등록 중 오류가 발생했습니다.",
                );
            } finally {setIsSubmitting(false);}  // 성공/실패와 관계없이 API 요청 상태 종료
        };


    return (
        <>
            {/* 브라우저 기본 검증 대신 직접 만든 검증 로직 사용 */}
            <Form onSubmit={handleSubmit} noValidate>
            {/* 현재 프로젝트 정보와 WBS ID 입력 영역 */}
            <FormGrid>
                <Input
                label={'\u00A0\u00A0프로젝트\u00A0'}
                value={projectName}
                disabled
                />

                <Select
                    label={'\u00A0\u00A0WBS 코드\u00A0'}
                    value={formData.wbs_code}
                    required
                    placeholder="WBS 코드를 선택하세요"
                    options={wbsCodes.map((code) => ({value: code, label: code,}))}
                    onChange={(value) => setFormData({...formData, wbs_code: String(value),})}
                />
            </FormGrid>


            {/* 태스크 기본 정보 */}
            <FormGrid>
                <Input
                label={'\u00A0\u00A0태스크명\u00A0'}
                value={formData.task_name}
                required
                placeholder="태스크명을 입력하세요."
                onChange={(event) =>setFormData({...formData, task_name: event.target.value,})}
                />

                <Input
                label={'\u00A0\u00A0담당자\u00A0'}
                value={formData.assignee_name}
                required
                placeholder="담당자명을 입력하세요."
                onChange={(event) =>setFormData({...formData, assignee_name: event.target.value,})}
                />
            </FormGrid>


            {/* 담당 부서 */}
            <Select
            label={'\u00A0\u00A0담당 부서\u00A0'}
            value={formData.department}
            required
            placeholder="담당 부서를 선택하세요"
            options={TASK_DEPARTMENTS.map((department) => ({
                value: department,
                label: department,
            }))}
            onChange={(value) =>
                setFormData({...formData, department: String(value),})
            }
            />


            {/* 우선순위와 상태 */}
            <FormGrid>
                <Select
                label={'\u00A0\u00A0우선순위\u00A0'}
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

                <Select
                    label={'\u00A0\u00A0상태\u00A0'}
                    value={formData.status}
                    required
                    options={[
                    { value: "TODO", label: "대기" },
                    { value: "IN_PROGRESS", label: "진행 중" },
                    { value: "DONE", label: "완료" },
                    ]}
                    onChange={(value) => setFormData({...formData, status: value as TaskStatus,})}
                />

            </FormGrid>


            {/* 태스크 일정 */}
            <FormGrid>
                <Input
                    label={'\u00A0\u00A0시작 예정일\u00A0'}
                    type="date"
                    value={formData.planned_start_date}
                    min={projectStart || undefined}
                    max={formData.planned_end_date ||projectDue || undefined}
                    required
                    onChange={(event) =>setFormData({...formData, planned_start_date: event.target.value,})}
                />

                <Input
                    label={'\u00A0\u00A0완료 예정일\u00A0'}
                    type="date"
                    value={formData.planned_end_date}
                    min={formData.planned_start_date || projectStart || undefined}
                    max={projectDue || undefined}
                    required
                    onChange={(event) =>setFormData({...formData, planned_end_date: event.target.value,})}
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
                    {mode === "edit" ? "수정 저장" : "등록"}
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


const Label = styled.label`
  padding-left: 8px;
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
