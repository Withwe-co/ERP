import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Settings2 } from 'lucide-react';

// Components
import styled from 'styled-components';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';

// api
import { EmployeeApi, Report, ReportWithEmployee, reportApi } from '../../services/api';

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

// Date 객체를 보고서 API 날짜 형식인 YYYY-MM-DD 문자열로 변환하는 함수
const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 오늘 날짜와 이번 주 월요일 날짜를 보고서 조회 기준일로 계산하는 함수
const getReportPeriodStarts = () => {
    const today = new Date();
    const monday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - ((today.getDay() + 6) % 7),
    );

    return {
        dailyPeriodStart: formatDateKey(today),
        weeklyPeriodStart: formatDateKey(monday),
    };
};

// 직원과 제출된 보고서를 보고서 페이지에서 사용할 행 데이터로 변환하는 함수
export const createReportEmployeeRows = (
    employees: Employee[],
    reports: Report[],
    dailyPeriodStart: string,
    weeklyPeriodStart: string,
): ReportEmployeeRow[] => {
    const submittedReportKeys = new Set(reports.filter(report => report.submitted).map(report => `${report.employee_id}-${report.report_type}-${report.period_start.slice(0, 10)}`),);

    return employees.map(({ id, name }) => ({
        id,
        name,
        dailyReportStatus: submittedReportKeys.has(`${id}-DAILY-${dailyPeriodStart}`) ? '완료' : '미완료',
        weeklyReportStatus: submittedReportKeys.has(`${id}-WEEKLY-${weeklyPeriodStart}`) ? '완료' : '미완료',
    }));
};

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

// 관리자 버튼 스타일 정의
const ActionButtons = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
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

    const navigate = useNavigate();
    const { dailyPeriodStart, weeklyPeriodStart } = useMemo(getReportPeriodStarts, []);

    // 직원 데이터를 가져오기 위해 React Query의 useQuery 훅 사용
    const { data: employees = [], isLoading: isEmployeesLoading } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const response = await EmployeeApi.getEmployeeList();
                return response.data?.items ?? [];
        },
        staleTime: 0,
        refetchOnMount: 'always',
    });

    // 오늘 일일 보고서와 이번 주 주간 보고서의 제출 상태를 조회
    const { data: reports = [], isLoading: isReportsLoading } = useQuery<ReportWithEmployee[]>({
        queryKey: ['report-statuses', dailyPeriodStart, weeklyPeriodStart],
        queryFn: () => reportApi.getReportStatuses(dailyPeriodStart, weeklyPeriodStart),
        staleTime: 0,
        refetchOnMount: 'always',
    });

    // 직원과 보고서 데이터를 상태가 포함된 행 데이터로 변환
    const rows = useMemo(
        () => createReportEmployeeRows(employees, reports, dailyPeriodStart, weeklyPeriodStart),
        [employees, reports, dailyPeriodStart, weeklyPeriodStart],
    );

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
            <ActionButtons>
                <Button onClick={() => navigate('/reports/admin')} title="관리자 보고서 화면">
                    <Settings2 size={16} />
                    관리자
                </Button>
            </ActionButtons>
            <Table
                columns={columns}
                data={rows}
                loading={isEmployeesLoading || isReportsLoading}
                emptyMessage="등록된 직원이 없습니다."
                onRowClick={employee => navigate(`/reports/${employee.id}`)}
            />
        </Card>
    </Container>
    );
};

export default ReportEmployeesPage;
