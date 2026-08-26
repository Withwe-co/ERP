import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Edit, Plus, RefreshCw } from 'lucide-react';

// Components
import Card from '../common/Card';
import TaskManagementPage from './TaskManagementPage';
import WbsManagementPage from './WbsManagementPage';

// Type
import { TableColumn } from '../../types';

// Api
import {taskApi} from '../../services/api'

const Container = styled.div`
  padding: 20px;
`;

// WBS와 전체 태스크 탭 영역
const TabArea = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

// 프로젝트 상세 탭 버튼
const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: none;
  border-bottom: 2px solid
    ${props => props.$active ? '#2563eb' : 'transparent'};
  background: transparent;
  color: ${props => props.$active ? '#2563eb' : '#6b7280'};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
`;

// 선택된 탭의 콘텐츠 영역
const TabContent = styled.div`
  padding-top: 20px;
`;


// 카드 사이에 여백
const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// 프로젝트 정보 표기 스타일
const ProjectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

// 프로젝트명 표기 스타일
const ProjectTitle = styled.h1`
  margin: 0 0 6px;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
`;

// 프로젝트 코드 표기 스타일
const ProjectCode = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

// 프로젝트 정보 Grid
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 16px;
`;

// 프로젝트 설명 Grid
const DescGrid = styled.div`
  grid-column: 1 / -1;
  width: 100%;
`;

const InfoItem = styled.div`
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background-color: #f9fafb;
`;

// 프로젝트 설명 Item
const DescItem = styled.div`
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background-color: #f9fafb;
  min-height: 180px;
  overflow-y: auto;
`;

// 담당자 항목 스타일
const ManagerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoLabel = styled.p`
  margin: 0 0 6px;
  color: #6b7280;
  font-size: 13px;
`;

const InfoValue = styled.p`
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
`;

// 부서 표기 스타일
const DepartmentText = styled.span`
  color: #6b7280;
  font-size: 12px;
`;

// 상태 표기 스타일
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

// 상태 정보 Mapping
const statusMap: Record<string, string> ={
  'COMPLETED': '완료',
  'IN_PROGRESS': '진행중',
  'ON_HOLD': '보류',
  'CANCELLED': '취소됨',
  'PLANNED': '진행예정'
};
const ProjectPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const project = location.state?.project;

    const { data: taskList = [] } = useQuery({
            queryKey: ['tasks', project.id],
            queryFn: () => taskApi.getTasks(project.id),
            enabled: Boolean(project.id),
    });

    const { totalTaskCount, delayedTaskCount, completeTaskCount } = useMemo(() => {
      const today = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Seoul',
      });

      // 지연된 테스크 개수
      const delayedCount = taskList.filter((task) => {
        const plannedEndDate = task.planned_end_date?.slice(0, 10);

        return (
          Boolean(plannedEndDate) &&
          plannedEndDate < today &&
          task.status !== 'DONE'
        );
      }).length;

      // 완료된 테스크 개수
      const completeCount = taskList.filter((task) => task.status === 'DONE').length;

      return {
        totalTaskCount: taskList.length,
        delayedTaskCount: delayedCount,
        completeTaskCount : completeCount,
      };
    }, [taskList]);
    // 현재 선택된 프로젝트 상세 탭
    const [activeTab, setActiveTab] = useState<'wbs' | 'tasks'>('wbs');
    return(
        <Container>
          <CardWrapper>
            <Card>
              <ProjectHeader>
                <div>
                  <ProjectTitle>{project.project_name}</ProjectTitle>
                  <ProjectCode>{project.project_code}</ProjectCode>
                </div>

                <StatusBadge $status={project.status}>
                  {statusMap[project.status] || project.status || '-'}
                </StatusBadge>
              </ProjectHeader>

              <InfoGrid>
                <InfoItem>
                  <InfoLabel>담당자</InfoLabel>
                  <ManagerInfo>
                    <InfoValue>{project.manager_name || '-'}</InfoValue>
                    <DepartmentText>{project.department || '-'}</DepartmentText>
                  </ManagerInfo>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>시작일</InfoLabel>
                  <InfoValue>{project.start_date ? new Date(project.start_date).toLocaleDateString('ko-KR', {timeZone: 'Asia/Seoul'}) : '-'}</InfoValue>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>종료 예정일</InfoLabel>
                  <InfoValue>{project.due_date ? new Date(project.due_date).toLocaleDateString('ko-KR', {timeZone: 'Asia/Seoul'}) : '-'}</InfoValue>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>진행률</InfoLabel>
                  <InfoValue>{'0'}</InfoValue>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>전체 태스크 수</InfoLabel>
                  <InfoValue>{totalTaskCount}</InfoValue>
                </InfoItem>
               
                <InfoItem>
                  <InfoLabel>지연 태스크 수</InfoLabel>
                  <InfoValue>{delayedTaskCount}</InfoValue>
                </InfoItem>

                <InfoItem>
                  <InfoLabel>완료 태스크 수</InfoLabel>
                  <InfoValue>{completeTaskCount}</InfoValue>
                </InfoItem>

                <DescGrid>
                  <DescItem>
                    <InfoLabel>프로젝트 설명</InfoLabel>
                    <InfoValue>{project.project_description}</InfoValue>
                  </DescItem>
                </DescGrid>
                  
                  

                </InfoGrid>
            </Card>
            
            <Card>
              {/* 프로젝트 상세 탭 */}
              <TabArea>
                  <TabButton
                  $active={activeTab === 'wbs'}
                  onClick={() => setActiveTab('wbs')}
                  >
                  WBS
                  </TabButton>

                  <TabButton
                  $active={activeTab === 'tasks'}
                  onClick={() => setActiveTab('tasks')}
                  >
                  전체 태스크
                  </TabButton>
              </TabArea>

              {/* 선택된 탭에 따라 화면 전환 */}
              <TabContent>
                  {activeTab === 'wbs' ? (
                  <WbsManagementPage 
                    projectId={project.id}
                    projectStartDate={project.start_date}
                    projectDueDate={project.due_date}
                   />
                  ) : (
                  <TaskManagementPage 
                    projectId={project.id}
                    projectName={project.project_name}
                  />
                  )}
              </TabContent>
            </Card>
          </CardWrapper>
          
        </Container>
    )
};

export default ProjectPage;