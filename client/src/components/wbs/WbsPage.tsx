import React, {useState,useMemo} from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus,RefreshCw,Archive} from 'lucide-react'
import Table from '../common/Table';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { TableColumn } from '../../types';
import WbsFilters from '../wbs/WbsFilters';
import { useNavigate } from 'react-router-dom';
import ProjectUploadForm from './ProjectUploadForm';
import { projectApi, type Project } from '@/services/api';

interface ProjectList{
  id: number;
  project_code: string;
  manager_name: string;
  department: string;
  project_name: string;
  start_date: string;
  due_date: string;
  status: string;
  project_description?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
}

interface Project{
  project_code: number;
  manager_name: string;
  department: string;
  project_name: string;
  start_date: string;
  due_date: string;
  status: string;
}

interface SearchFilters {
  search?: string;
  status?: string;
  department?: string;
}

const dummyProjects: ProjectList[] = [
  {
    project_code: 1004,
    manager_name: '정지은',
    department: '마케팅팀',
    project_name: '글로벌 마케팅 캠페인 자동화',
    start_date: '2026-05-01T09:00:00',
    due_date: '2026-10-31T18:00:00',
    status: 'IN_PROGRESS'
  }
];

const Container = styled.div`
  padding: 20px;
`;

const ContentCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors?.text||'#333'};
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`;

const FilterSection = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$status) {
      case 'ON_HOLD':
        return `
          background: #FEF3C7;
          color: #92400E;
        `;
      case 'COMPLETED':
        return `
          background: #D1FAE5;
          color: #065F46;
        `;
      case 'CANCELLED':
        return `
          background: #FEE2E2;
          color: #991B1B;
        `;
      case 'IN_PROGRESS':
        return `
          background: #DBEAFE;
          color: #1E40AF;
        `;
      case 'PLANNED':
        return `
          background: #DBEAFE;
          color: #115E59;
        `;  
      default:
        return `
          background: #F3F4F6;
          color: #374151;
        `;
    }
  }}
`;

const WbsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [items] = useState<ProjectList[]>(dummyProjects);
  const navigate = useNavigate(); // 페이지 이동을 위한 훅 선언
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // 등록 Form Open
  const [editingRequest, setEditingRequest] = useState<ProjectList | null>(null);
  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['wbs'] });
      await refetch();
    } catch (error) {
      console.error('프로젝트 목록 새로고침 실패:', error);
      toast.error('프로젝트 목록을 새로고침하지 못했습니다.');
    }
  };
  
  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
    handleRefresh();
  };
  
  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const handleSearch = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    setCurrentPage(1);
  };

  // 프로젝트 목록 조회
  const{data: projectsData, isLoading, error, refetch}=useQuery({
    queryKey:['wbs',currentPage,filters],
    queryFn: () => projectApi.getRequests({page: currentPage,limit: 20,... filters}),
    keepPreviousData: true,
    staleTime: 5*60*1000,
    retry:2,
  });

  const projects = projectsData?.data?.items || [];

  const columns: TableColumn<ProjectList>[] = useMemo(() => [
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '80px',
      render: (value) => {
        const statusMap: Record<string, string> ={
          'COMPLETED': '완료',
          'IN_PROGRESS': '진행중',
          'ON_HOLD': '보류',
          'CANCELLED': '취소됨',
          'PLANNED': '진행예정'
        };
        return <StatusBadge $status={value}>{statusMap[value]||value}</StatusBadge>;
      },
    },
    {
      key: 'project_code',
      label: '프로젝트 코드',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span style={{ fontFamily: 'monospace',fontSize:'0.9rem',fontWeight: '500'}}>
          {value}
        </span>
      )
    },
    {
      key: 'manager_name',
      label:'담당자',
      width:'100px',
      render: (value,item) =>(
        <div>
          <div style={{fontWeight:'500'}}>{value}</div>
          <div style={{ fontSize: '12px',color: '#6b7280'}}>{item.department}</div>      </div>
      ),
    },
    {
      key: 'project_name',
      label: '프로젝트명',
      sortable: true,
      width: '400px',
      render: (value) => (
        <div>
          <div style={{ fontWeight: 'bold',marginBottom: '4px'}}>{value || '프로젝트명 없음'}</div>
        </div>
      )
    },
    {
      key: 'start_date',
      label: '시작일',
      sortable: true,
      width: '110px',
      render: (value) => value ? new Date(value).toLocaleDateString('ko-KR') : '-'
    },
    {
      key: 'due_date',
      label: '종료일',
      sortable: true,
      width: '110px',
      render: (value) => value ? new Date(value).toLocaleDateString('ko-KR') : '-'
    },
    {
      key: 'progress_rate',
      label: '진행률',
      width: '80px'
    },
    {
      key: 'total_task',
      label: '전체 테스크',
      width: '80px'
    },
    {
      key: 'delayed_task',
      label: '지연 테스크',
      width: '80px'
    },
    {
      key: 'action',
      label: '관리',
      width: '200px'
    }
  ], []);

  return(
    <>
    <Container>
      <PageTitle>프로젝트 관리</PageTitle>
      <PageSubtitle>프로젝트를 등록하고 관리하세요.</PageSubtitle>
      <Card>
        <FilterContainer>
          <WbsFilters onFilter={handleSearch} />
          <ActionButtons>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              title="새로고침"
            >
              <RefreshCw size={16} />
              새로고침
            </Button>
            <Button
              onClick={() => setIsFormModalOpen(true)}       
              title="프로젝트 추가"
            >
              <Plus size={16}/>
              프로젝트 등록
            </Button>
          </ActionButtons>
        </FilterContainer>
        <Table
          columns={columns}
          data={projects}
          loading={isLoading}
          onRowClick={(item) => navigate('/wbs/project-page',{state: {project:item}})}
          emptyMessage='등록된 프로젝트가 없습니다.'
        />
      </Card>
    </Container>
    <Modal
      isOpen={isFormModalOpen}
      onClose={handleFormCancel}
      title={editingRequest ? '구매 요청 수정' : '새 구매 요청 등록'}
      size="xl"
    >
      <ProjectUploadForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        initialData={editingRequest || undefined}
        isEdit={!!editingRequest}
      />
    </Modal>
    </>
    );
};
export default WbsPage;