import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Components
import styled from 'styled-components';
import Card from '../common/Card';
import Table from '../common/Table';

// api
import { EmployeeApi } from '../../services/api';

// types
import { TableColumn } from '../../types';

// 직원 정보를 가져오기 위한 타입 정의
interface Employee {
    id: number;
    name: string;
    position: string;
    total_leave: number;
    used_leave: number;
}

// 보고 상태를 나타내는 타입 정의
type ReportStatus = '완료' | '미완료';

// 보고서 페이지에서 사용할 직원 행 데이터 타입 정의
export interface ReportEmployeeRow {
    id: number;
    name: string;
    dailyReportStatus: ReportStatus;
    weeklyReportStatus: ReportStatus;
}

// 직원 데이터를 보고서 페이지에서 사용할 행 데이터로 변환하는 함수
export const createReportEmployeeRows = (employees: Employee[]): ReportEmployeeRow[] =>
    employees.map(({ id, name }) => ({id,name,dailyReportStatus: '완료',weeklyReportStatus: '완료'})
);

// 페이지 컨테이너 스타일 정의
const Container = styled.div`
    padding: 20px;
`;

// 페이지 제목과 부제목 스타일 정의
const PageTitle = styled.h1`
    margin: 0 0 8px;
    color: ${props => props.theme.colors?.text || '#333'};
    font-size: 2rem;
    font-weight: 600;
`;

// 페이지 부제목 스타일 정의
const PageSubtitle = styled.p`
    margin: 0 0 30px;
    color: ${props => props.theme.colors.textSecondary};
`;

// 상태 배지 스타일 정의
const StatusBadge = styled.span<{ $status: ReportStatus }>`
    display: inline-flex;
    min-width: 56px;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.5px;
    white-space: nowrap;

    ${props => props.$status === '완료' ? `background: #D1FAE5; color: #065F46;`: `background: #FEE2E2;color: #991B1B;`}
`;

// 테이블 셀 내용 스타일 정의
const CellContent = styled.div`
    display: flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
`;

const ReportEmployeesPage: React.FC = () => {

    // 직원 데이터를 가져오기 위해 React Query의 useQuery 훅 사용
    const navigate = useNavigate();
    const { data: employees = [], isLoading } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const response = await EmployeeApi.getEmployeeList();
                return response.data?.items ?? [];
        },
        staleTime: 0,
        refetchOnMount: 'always',
    });

    // 직원 데이터를 보고서 페이지에서 사용할 행 데이터로 변환
    const rows = useMemo(() => createReportEmployeeRows(employees), [employees]);

    // 테이블 컬럼 정의
    const columns: TableColumn<ReportEmployeeRow>[] = useMemo(() => [
    {
        key: 'name',
        label: '이름',
        align: 'center',
        render: value => <CellContent>{value}</CellContent>,
    },
    {
        key: 'dailyReportStatus',
        label: '일일 보고서',
        align: 'center',
        render: value => (
            <CellContent>
                <StatusBadge $status={value as ReportStatus}>{value}</StatusBadge>
            </CellContent>
        ),
    },
    {
        key: 'weeklyReportStatus',
        label: '주간 보고서',
        align: 'center',
        render: value => (
            <CellContent>
                <StatusBadge $status={value as ReportStatus}>{value}</StatusBadge>
            </CellContent>
        ),
    },
    ], []);

    return (
    <Container>
        <PageTitle>업무 보고</PageTitle>
        <PageSubtitle>직원을 선택하여 보고 상세 내용을 확인하세요.</PageSubtitle>
        <Card>
            <Table
                columns={columns}
                data={rows}
                loading={isLoading}
                emptyMessage="등록된 직원이 없습니다."
                onRowClick={employee => navigate(`/reports/${employee.id}`)}
            />
        </Card>
    </Container>
    );
};

export default ReportEmployeesPage;
