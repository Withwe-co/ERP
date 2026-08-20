import styled from "styled-components";
import React, {useState,useMemo} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus,RefreshCw,Archive} from 'lucide-react'

// Components
import Card from "../common/Card";
import Button from '../common/Button';
import Modal from '../common/Modal';
import WbsUploadForm from './WbsUploadForm';

interface WbsManagementPageProps {
  projectId: number;
}

const Container = styled.div`
  padding: 20px;
`;

// 버튼 컨데이너
const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`;

// 버튼 컨테이너 용도
const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
`;

const WbsManagementPage: React.FC<WbsManagementPageProps> = ({
    projectId,
}) => {

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    return(
        <>
        <Container>
            <FilterContainer>
                <ActionButtons>
                    <Button
                        onClick={() => setIsFormModalOpen(true)}       
                        title="WBS 추가"
                    >
                        <Plus size={16}/>
                        WBS 추가
                    </Button>
                </ActionButtons>
            </FilterContainer>
            <Card>
                <p> wbs Test</p>
            </Card>
        </Container>
        <Modal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            title="WBS 등록"
            size="xl"
            >
            <WbsUploadForm
                projectId={projectId}
                onSuccess={() => setIsFormModalOpen(false)}
                onCancel={() => setIsFormModalOpen(false)}
            />
        </Modal>
        </>
    )
};

export default WbsManagementPage;