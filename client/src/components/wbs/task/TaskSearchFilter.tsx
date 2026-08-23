import { useState } from "react";
import styled from "styled-components";
import { Filter, Search, X } from "lucide-react";

import Button from "../../common/Button";

import {TaskFilter, TaskPriority, TaskStatus,} from "../../../types/task";


// 부모 컴포넌트에 현재 검색/필터 조건을 전달하기 위한 Props
interface TaskSearchFilterProps {onFilter: (filters: TaskFilter) => void;}


// 태스크 검색 및 필터 영역
function TaskSearchFilter({onFilter,}: TaskSearchFilterProps) {

  // 현재 적용된 검색 및 필터 조건
  const [filters, setFilters] = useState<TaskFilter>({});


  // 검색어나 Select 값이 변경될 때 실행
  const handleFilterChange = (
    key: keyof TaskFilter,
    value: string,
  ) => {
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
        ON_HOLD: "보류",
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
      <FilterContainer>

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


        {/* 상태 필터 */}
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
          <option value="ON_HOLD">보류</option>
          <option value="DONE">완료</option>
        </FilterSelect>


        {/* 우선순위 필터 */}
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


        {/* 담당자 검색 */}
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


        {/* 부서 검색 */}
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


        {/* 전체 검색/필터 초기화 */}
        <FilterButton
          variant="outline"
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
        >
          <Filter size={16} />

          {hasActiveFilters
            ? "필터 초기화"
            : "필터"}
        </FilterButton>
      </FilterContainer>


      {/* 현재 적용된 검색/필터를 태그 형태로 표시 */}
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

                {/* 개별 필터 제거 */}
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
    </SearchCard>
  );
}


export default TaskSearchFilter;


// 검색 및 필터 전체 카드 영역
const SearchCard = styled.div`
  margin-bottom: 20px;
`;


// 검색창과 각 필터를 한 줄에 배치하는 영역
const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;


// 검색창과 검색 아이콘을 묶는 영역
const SearchGroup = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;


// 태스크명 검색 입력창
const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  background: ${props => props.theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
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


// 상태 및 우선순위 필터 Select
const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  cursor: pointer;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;


// 담당자 및 부서 검색 입력창
const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;


// 전체 필터 초기화 버튼
const FilterButton = styled(Button)`
  white-space: nowrap;
`;


// 현재 적용된 필터 태그를 표시하는 영역
const ActiveFilters = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
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