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

const Container = styled.div`
  padding: 20px;
`;

const ProjectPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const project = location.state?.project;
    return(
        <div style={{ padding: '20px' }}>
        <h1>{project.project_name}</h1>
        <p>코드: {project.project_code}</p>
        <p>담당자: {project.manager_name} ({project.department})</p>
        <p>상태: {project.status}</p>
        {/* 나머지 상세 정보들 출력 */}
        </div>
    )
};

export default ProjectPage;