import React, {useState,useMemo} from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus} from 'lucide-react'
import { useNavigate } from 'react-router-dom';

// Components
import Table from '../common/Table';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import EmployeesUploadForm from './EmployeesUploadForm';

// Services
import api, { EmployeeApi } from '../../services/api';

// Type
import { TableColumn } from '../../types';
import queryClient from '@/hooks/queryClient';

interface EmployeeList {
    id: number;
    name: string;
    position: string;
    total_leave: number;
    used_leave: number;
}
const Container = styled.div`
  padding: 20px;
`;

// 페이지 제목
const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors?.text||'#333'};
`;

// 페이지 부제목
const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 30px;
  font-size: 1rem;
`;

// 액션 버튼들을 담는 컨테이너
const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-left: auto;
`;


const EmployeesPage: React.FC = () => {

  // 팀원 리스트 조회
  const{data: employees = [], isLoading, error, refetch}=useQuery<EmployeeList[]>({
      queryKey:['employees'],
      queryFn: async (): Promise<EmployeeList[]> => {
        const response = await EmployeeApi.getEmployeeList();
        return response.data?.items ?? [];
      },
      staleTime: 0,
      refetchOnMount: 'always',
      retry: 2,
  });

  //const employees = employeesData?.data?.items || [];
  
  // 테이블 컬럼 정의
  const handleRefresh = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        await refetch();
      } catch (error) {
        console.error('팀원 목록 새로고침 실패:', error);
        toast.error('팀원 목록을 새로고침하지 못했습니다.');
      }
  };

  const [editingEmployee, setEditingEmployee] = useState<EmployeeList | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // 등록 Form Open
  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingEmployee(null);
    handleRefresh();
  };
  
  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingEmployee(null);
  };

  const columns: TableColumn<EmployeeList>[] = useMemo(() => [
    {
      key: 'name',
      label: '이름',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
          <div>{value}</div>
        </div>
      )
    },
    {
      key: 'position',
      label: '직책',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
          <div>{value}</div>
        </div>
      )
    },
    {
      key: 'total_leave',
      label: '잔여 연차',
      sortable: true,
      width: '80px',
      render: (value) => (
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
          <div>{value}</div>
        </div>
      )
    },
    {
      key: 'used_leave',
      label: '사용 연차',
      sortable: true,
      width: '80px',
      render: (value) => (
        <div style={{minHeight: '40px',display: 'flex',alignItems: 'center',justifyContent: 'center',}}>
          <div>{value}</div>
        </div>
      )
    },
  ], []);

    return (
      <>
      <Container>
          <PageTitle>팀원 관리</PageTitle>
          <PageSubtitle>팀원을 등록하고 관리하세요.</PageSubtitle>
          <Card>
              <ActionButtons>
                  <Button
                  onClick={() => setIsFormModalOpen(true)} 
                  title="팀원 추가"
                  >
                  <Plus size={16}/>
                  팀원 등록
                  </Button>
              </ActionButtons>
              <Table
                columns={columns}
                data={employees}
                emptyMessage='등록된 팀원이 없습니다.'
              />
          </Card>
      </Container>
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        title={editingEmployee ? '팀원 수정' : '새 팀원 등록'}
        size="xl"
      >
        <EmployeesUploadForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialData={editingEmployee || undefined}
          isEdit={!!editingEmployee}
        />
      </Modal>
      </>
    );

};
export default EmployeesPage;