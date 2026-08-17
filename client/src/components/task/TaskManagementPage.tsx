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


const Container = styled.div`
  padding: 20px;
`;


const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.text};
`;


const PageSubtitle = styled.p`
  margin-bottom: 30px;
  font-size: 1rem;
  color: ${props => props.theme.colors.textSecondary};
`;


const SearchCard = styled(Card)`
  margin-bottom: 20px;
`;


const ActionArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;


const ViewArea = styled.div`
  display: flex;
  gap: 8px;
`;


const ContentCard = styled(Card)`
  min-height: 400px;
`;

