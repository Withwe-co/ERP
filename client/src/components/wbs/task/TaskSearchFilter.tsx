import { useState } from "react";
import styled from "styled-components";
import { Filter, Search, X } from "lucide-react";

import Button from "../../common/Button";

import {TaskFilter, TaskPriority, TaskStatus,} from "../../../types/task";

import {
  TASK_ACTION_BUTTON_WIDTH,
  TASK_CONTROL_FONT_SIZE,
  TASK_CONTROL_GAP,
  TASK_CONTROL_HEIGHT,
  TASK_CONTROL_ICON_SIZE,
  TASK_CONTROL_FIELD_WIDTH,
} from "./taskControlStyles";


// 부모 컴포넌트에 현재 검색/필터 조건을 전달하기 위한 Props
interface TaskSearchFilterProps {
  onFilter: (filters: TaskFilter) => void;
  wbsCodes: string[];
}


// 태스크 검색 및 필터 영역
function TaskSearchFilter({onFilter, wbsCodes = [],}: TaskSearchFilterProps) {

  // 현재 적용된 검색 및 필터 조건
  const [filters, setFilters] = useState<TaskFilter>({});


  // 검색어나 Select 값이 변경될 때 실행
  const handleFilterChange = (key: keyof TaskFilter, value: string,) => {
    const newFilters = { ...filters };

    // 값이 있으면 해당 필터를 추가 또는 변경
    if (value) {
      if (key === "status") {
        newFilters.status = value as TaskStatus;
      } else if (key === "priority") {
        newFilters.priority = value as TaskPriority;
      } else {
        newFilters[key] = value as never;
      }
    } else {delete newFilters[key]; }// 빈 값이면 해당 필터 제거

    // 현재 컴포넌트의 필터 상태 변경
    setFilters(newFilters);

    // 부모 컴포넌트에도 변경된 필터 전달
    onFilter(newFilters);
  };


  // 활성화된 필터 하나만 제거
  const removeFilter = (key: keyof TaskFilter) => {
    const newFilters = { ...filters };

    delete newFilters[key];

    setFilters(newFilters);
    onFilter(newFilters);
  };


  // 모든 검색 및 필터 조건 초기화
  const clearAllFilters = () => {setFilters({}); onFilter({});};


  // 하나라도 적용된 검색/필터가 있는지 확인
  const hasActiveFilters = Object.keys(filters).length > 0;


  // 활성 필터 태그에 사용자용 한글 이름 표시
  const getFilterDisplayName = (key: string, value: string,) => {
    const names: Record<string, string> = {
      search: "검색",
      wbs_code: "WBS",
      status: "상태",
      priority: "우선순위",
      assignee_name: "담당자",
      department: "부서",
    };

    // 상태값 한글 표시
    if (key === "status") {
      const labels: Record<string, string> = {
        TODO: "대기",
        IN_PROGRESS: "진행 중",
        DONE: "완료",
      };

      return `${names[key]}: ${labels[value] || value}`;
    }

    // 우선순위 한글 표시
    if (key === "priority") {
      const labels: Record<string, string> = {
        LOW: "낮음",
        NORMAL: "보통",
        HIGH: "높음",
        URGENT: "긴급",
      };

      return `${names[key]}: ${labels[value] || value}`;
    }

    return `${names[key] || key}: ${value}`;
  };


  return (
    <SearchCard>
      {/* 1행: 태스크 검색과 각 필터 입력 영역 */}
      <FilterRow data-testid="task-filter-row">
        {/* 태스크명 검색 */}
        <SearchGroup>
          <SearchIcon />

          <SearchInput
            type="text"
            placeholder="태스크명으로 검색"
            value={filters.search || ""}
            onChange={(event) =>
              handleFilterChange(
                "search",
                event.target.value,
              )
            }
          />
        </SearchGroup>

        {/* WBS 코드 필터 */}
        <FilterSelect
          value={filters.wbs_code || ""}
          onChange={(event) =>
            handleFilterChange(
              "wbs_code",
              event.target.value,
            )
          }
        >
          <option value="">전체 WBS</option>

          {wbsCodes.map((code) => (
            <option
              key={code}
              value={code}
            >
              {code}
            </option>
          ))}
        </FilterSelect>

        {/* 태스크 상태 필터 */}
        <FilterSelect
          value={filters.status || ""}
          onChange={(event) =>
            handleFilterChange(
              "status",
              event.target.value,
            )
          }
        >
          <option value="">전체 상태</option>
          <option value="TODO">대기</option>
          <option value="IN_PROGRESS">진행 중</option>
          <option value="DONE">완료</option>
        </FilterSelect>

        {/* 태스크 우선순위 필터 */}
        <FilterSelect
          value={filters.priority || ""}
          onChange={(event) =>
            handleFilterChange(
              "priority",
              event.target.value,
            )
          }
        >
          <option value="">전체 우선순위</option>
          <option value="LOW">낮음</option>
          <option value="NORMAL">보통</option>
          <option value="HIGH">높음</option>
          <option value="URGENT">긴급</option>
        </FilterSelect>

        {/* 담당자명 검색 */}
        <FilterInput
          type="text"
          placeholder="담당자"
          value={filters.assignee_name || ""}
          onChange={(event) =>
            handleFilterChange(
              "assignee_name",
              event.target.value,
            )
          }
        />

        {/* 담당부서 검색 */}
        <FilterInput
          type="text"
          placeholder="부서"
          value={filters.department || ""}
          onChange={(event) =>
            handleFilterChange(
              "department",
              event.target.value,
            )
          }
        />
      </FilterRow>

      {/* 2행: 필터 버튼과 현재 선택된 검색/필터 표시 영역 */}
      <FilterActionRow data-testid="task-filter-action-row">
        {/* 현재 적용된 모든 검색/필터 조건을 초기화 */}
        <FilterButton
          variant="outline"
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
        >
          <Filter size={TASK_CONTROL_ICON_SIZE} />

          {hasActiveFilters
            ? "필터 초기화"
            : "필터"}
        </FilterButton>

        {/* 현재 선택되어 있는 검색어와 필터를 태그 형태로 표시 */}
        {hasActiveFilters && (
          <ActiveFilters>
            {Object.entries(filters).map(
              ([key, value]) => (
                <FilterTag key={key}>
                  <span>
                    {getFilterDisplayName(
                      key,
                      String(value),
                    )}
                  </span>

                  {/* 개별 검색/필터 조건만 제거 */}
                  <X
                    size={12}
                    className="remove-filter"
                    onClick={() =>
                      removeFilter(
                        key as keyof TaskFilter,
                      )
                    }
                  />
                </FilterTag>
              ),
            )}
          </ActiveFilters>
        )}
      </FilterActionRow>
    </SearchCard>
  );
}


export default TaskSearchFilter;


// 검색 및 필터 전체 카드 영역
const SearchCard = styled.div`
  margin-bottom: ${TASK_CONTROL_GAP};
`;

// 1행: 태스크 검색창과 각 필터를 한 줄에 배치
const FilterRow = styled.div`
  display: flex;
  gap: ${TASK_CONTROL_GAP};
  align-items: center;
  flex-wrap: wrap;
`;

// 2행: 필터 초기화 버튼과 현재 선택된 검색/필터를 표시
const FilterActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${TASK_CONTROL_GAP};
  flex-wrap: wrap;
  margin-top: ${TASK_CONTROL_GAP};
`;

// 검색창과 검색 아이콘을 묶는 영역
const SearchGroup = styled.div`
  position: relative;
  flex: 0 0 ${TASK_CONTROL_FIELD_WIDTH};
  width: ${TASK_CONTROL_FIELD_WIDTH};
  max-width: ${TASK_CONTROL_FIELD_WIDTH};
`;

// 태스크명 검색 입력창
const SearchInput = styled.input`
  width: 100%;
  height: ${TASK_CONTROL_HEIGHT};
  box-sizing: border-box;

  padding: 0 12px 0 40px;

  border: 1px solid
    ${props => props.theme.colors.border};
  border-radius:
    ${props => props.theme.borderRadius.md};

  font-size: ${TASK_CONTROL_FONT_SIZE};
  background: ${props => props.theme.colors.surface};

  &:focus {
    outline: none;
    border-color:
      ${props => props.theme.colors.primary};
    box-shadow:
      0 0 0 3px
      ${props => props.theme.colors.primary}20;
  }
`;

// 검색창 왼쪽의 검색 아이콘
const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: ${props => props.theme.colors.textSecondary};
`;

// WBS, 상태, 우선순위 필터 Select
const FilterSelect = styled.select`
  width: ${TASK_CONTROL_FIELD_WIDTH};
  height: ${TASK_CONTROL_HEIGHT};
  box-sizing: border-box;

  padding: 0 36px 0 12px;

  border: 1px solid
    ${props => props.theme.colors.border};
  border-radius:
    ${props => props.theme.borderRadius.md};

  appearance: none;

  background-color:
    ${props => props.theme.colors.surface};

  background-image: url(
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"
  );

  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;

  font-size: ${TASK_CONTROL_FONT_SIZE};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color:
      ${props => props.theme.colors.primary};
  }
`;

// 담당자 및 담당부서 검색 입력창
const FilterInput = styled.input`
  width: ${TASK_CONTROL_FIELD_WIDTH};
  height: ${TASK_CONTROL_HEIGHT};
  box-sizing: border-box;

  padding: 0 12px;

  border: 1px solid
    ${props => props.theme.colors.border};
  border-radius:
    ${props => props.theme.borderRadius.md};

  font-size: ${TASK_CONTROL_FONT_SIZE};
  background: ${props => props.theme.colors.surface};

  &:focus {
    outline: none;
    border-color:
      ${props => props.theme.colors.primary};
  }
`;

// 전체 필터 초기화 버튼
const FilterButton = styled(Button)`
  width: ${TASK_ACTION_BUTTON_WIDTH};
  height: ${TASK_CONTROL_HEIGHT};
  min-height: ${TASK_CONTROL_HEIGHT};

  padding: 0 12px;

  font-size: ${TASK_CONTROL_FONT_SIZE};
  white-space: nowrap;
`;

// 현재 적용된 필터 태그를 표시하는 영역
const ActiveFilters = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

// 현재 적용된 검색/필터 하나를 표시하는 태그
const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.85rem;

  .remove-filter {
    cursor: pointer;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
`;
