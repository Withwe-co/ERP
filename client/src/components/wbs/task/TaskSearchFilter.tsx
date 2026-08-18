import styled from "styled-components";
import Card from "../../common/Card";

// 태스크 검색 및 필터 영역
function TaskSearchFilter() {
  return (
    <SearchCard>
      검색 및 필터 영역
    </SearchCard>
  );
}

export default TaskSearchFilter;

// 검색 및 필터를 표시할 카드 영역
const SearchCard = styled(Card)`
  margin-bottom: 20px;
`;