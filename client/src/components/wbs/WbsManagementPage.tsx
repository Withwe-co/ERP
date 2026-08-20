import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus,RefreshCw,Archive} from 'lucide-react'

// Components
import Card from "../common/Card";
import Button from '../common/Button';
import Modal from '../common/Modal';
import WbsUploadForm from './WbsUploadForm';
// 테이블 컨테이너 (가로 스크롤 가능하게 처리) 임시
const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  background: #fff;
`;
//임시
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;

  th, td {
    border: 1px solid #e0e0e0;
    padding: 8px;
    white-space: nowrap;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
`;
// 날짜 셀 안에서 막대(Bar)를 표현하기 위한 컴포넌트 임시
const GanttBar = styled.div<{ color?: string }>`
  background-color: ${({ color }) => color || '#3b82f6'};
  height: 20px;
  border-radius: 4px;
  width: 100%;
`;

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
    //임시
    const tasks = [
        { category: "콘텐츠 제작계획", name: "아이템 선정", startDay: 1, endDay: 1, type: "blue" },
        { category: "콘텐츠 제작계획", name: "제작목표 수립", startDay: 2, endDay: 2, type: "blue" },
        { category: "콘텐츠 기획", name: "시장조사", startDay: 8, endDay: 10, type: "blue" },
        { category: "콘텐츠 제작", name: "제품사진촬영", startDay: 18, endDay: 18, type: "green" },
    ];
    // 1일부터 7일까지만 예시로 표시 (원하는 날짜만큼 동적으로 생성 가능) 임시
    const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    

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
                <TableWrapper>
                    <StyledTable>
                        <thead>
                        <tr>
                            <th rowSpan={2}>상위업무</th>
                            <th rowSpan={2}>세부업무</th>
                            <th colSpan={days.length}>3월 일정</th>
                        </tr>
                        <tr>
                            {days.map((day) => (
                            <th key={day} style={{ width: '35px', fontSize: '12px' }}>{day}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map((task, idx) => (
                            <tr key={idx}>
                            <td>{task.category}</td>
                            <td style={{ textAlign: 'left' }}>{task.name}</td>
                            {days.map((day) => {
                                // 현재 날짜(day)가 작업의 시작일과 종료일 사이에 포함되는지 확인
                                const isInRange = day >= task.startDay && day <= task.endDay;
                                return (
                                <td key={day}>
                                    {isInRange && (
                                    <GanttBar color={task.type === 'green' ? '#65a30d' : '#2563eb'} />
                                    )}
                                </td>
                                );
                            })}
                            </tr>
                        ))}
                        </tbody>
                    </StyledTable>
                </TableWrapper>
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