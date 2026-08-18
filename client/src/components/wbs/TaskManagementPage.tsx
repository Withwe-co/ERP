import styled from "styled-components";
import Button from "../common/Button";
import Card from "../common/Card";


// 태스크 관리 페이지
function TaskManagementPage() {
  return (
    <Container>
      <PageTitle>태스크 관리</PageTitle>
      <PageSubtitle>
        프로젝트의 태스크를 조회하고 관리할 수 있습니다.
      </PageSubtitle>


      <SearchCard>
        검색 및 필터 영역
      </SearchCard>


      <ActionArea>
        <ViewArea>
          <Button size="sm">칸반 보기</Button>
          <Button variant="outline" size="sm">
            목록 보기
          </Button>
        </ViewArea>


        <Button>태스크 등록</Button>
      </ActionArea>


      <ContentCard>
        태스크 콘텐츠 영역
      </ContentCard>
    </Container>
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

// 검색 및 필터를 배치할 카드 영역
const SearchCard = styled(Card)`
  margin-bottom: 20px;
`;

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

// 태스크 칸반 또는 목록이 표시될 콘텐츠 영역
const ContentCard = styled(Card)`
  min-height: 400px;
`;

