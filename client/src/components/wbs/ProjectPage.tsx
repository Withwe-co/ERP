import React, {useState,useMemo} from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus,RefreshCw} from 'lucide-react'
import Table from '../common/Table';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { TableColumn } from '../../types';
import { useLocation,useNavigate } from 'react-router-dom';

import TaskManagementPage from './TaskManagementPage';

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


// 실제 WBS 상세 화면 연결 전 임시 영역
const WbsPlaceholder = styled.div`
  min-height: 400px;
  padding: 20px;
`;

const ProjectPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const project = location.state?.project;

    // 현재 선택된 프로젝트 상세 탭
    const [activeTab, setActiveTab] = useState<'wbs' | 'tasks'>('wbs');
    return(
        <Container>
        {/* 프로젝트 기본 정보 */}
        <h1>{project.project_name}</h1>
        <p>코드: {project.project_code}</p>
        <p>담당자: {project.manager_name} ({project.department})</p>
        <p>상태: {project.status}</p>

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
            <WbsPlaceholder>
                WBS 상세 영역
            </WbsPlaceholder>
            ) : (
            <TaskManagementPage />
            )}
        </TabContent>
        </Container>
    )
};

export default ProjectPage;