import React, {useState,useMemo} from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus} from 'lucide-react'
import { useNavigate } from 'react-router-dom';

// Components
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LeavesUploadForm from './LeavesUploadForm';

// Services
import {LeavesApi} from '../../services/api';

//Fullcalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import queryClient from '@/hooks/queryClient';

interface Leave {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
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

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

// 액션 버튼들을 담는 컨테이너
const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-left: auto;
`;

const LeavesPage: React.FC = () => {

    const queryClient = useQueryClient();
    // 휴가 일정 조회
    const { data: leaveEvents = [], refetch } = useQuery({
        queryKey: ['leaves'],
        queryFn: () => LeavesApi.getLeaves(),
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always'
    });

    const handleDateClick = (info: { dateStr: string }) => {
        console.log('선택한 날짜:', info.dateStr);
        toast.info(`${info.dateStr} 날짜를 선택했습니다.`);
    };

    const handleEventClick = (info: { event: { id: string; title: string } }) => {
        console.log('선택한 휴가:', info.event.id, info.event.title);
        toast.info(`${info.event.title} 일정을 선택했습니다.`);
    };

    const handleRefresh = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['leaves'] });
        await refetch();
      } catch (error) {
        console.error('휴가 일정 새로고침 실패:', error);
        toast.error('휴가 일정을 새로고침하지 못했습니다.');
      }
    };

    const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false); // 등록 Form Open
    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        setEditingLeave(null);
        handleRefresh();
    };
    const handleFormCancel = () => {
        setIsFormModalOpen(false);
        setEditingLeave(null);
    };

    const handleEdit = (item: Leave) => {
        setEditingLeave(item);
        setIsFormModalOpen(true);
    };
    return (
        <>
        <Container>
          <PageTitle>휴가 관리</PageTitle>
          <PageSubtitle>휴가 일정을 등록하고 관리하세요.</PageSubtitle>
          <Card>
            <FilterContainer>
                <ActionButtons>
                    <Button
                    onClick={() => setIsFormModalOpen(true)}
                    title="휴가 추가"
                    >
                    <Plus size={16}/>
                    휴가 일정 등록
                    </Button>
                </ActionButtons>
            </FilterContainer>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={koLocale}
                    events={leaveEvents}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth',
                    }}
                    height="auto"
                />
          </Card>
      </Container>
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        title={editingLeave ? '휴가 일정 수정' : '새 휴가 일정 등록'}
        size="xl"
      >
        <LeavesUploadForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialData={editingLeave || undefined}
          isEdit={!!editingLeave}
        />
      </Modal>
      </>
    );

};
export default LeavesPage;