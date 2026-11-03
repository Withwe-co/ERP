import styled from 'styled-components';
import AttendanceImport from './AttendanceImport';

const Container = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  margin: 0 0 8px;
  color: ${props => props.theme.colors.text};
  font-size: 2rem;
  font-weight: 600;
`;

const PageSubtitle = styled.p`
  margin: 0 0 30px;
  color: ${props => props.theme.colors.textSecondary};
`;

const AttendanceUploadPage = () => (
  <Container>
    <PageTitle>출퇴근 기록 업로드</PageTitle>
    <PageSubtitle>캡스에서 내보낸 XLS 또는 TXT 파일을 업로드하세요.</PageSubtitle>
    <AttendanceImport />
  </Container>
);

export default AttendanceUploadPage;
