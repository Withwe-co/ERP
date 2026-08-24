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

// Api
import {WbsApi} from '../../services/api'

////////////////////임시
const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  background: #fff;
`;
//임시
const StyledTable = styled.table`
  width: ${({}) => 'auto'};
  border-collapse: collapse;
  table-layout: fixed; /* 열 너비를 내용이 아니라 지정값으로 고정 */
  text-align: center;
  font-size: 14px;

  th, td {
    border: 1px solid #e0e0e0;
    padding: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* 긴 내용은 ... 처리 */
    box-sizing: border-box;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
`;
// 날짜 칸이 이어지는 타임라인 바 (끊기지 않고 연결됨)
const GanttBar = styled.div<{ color?: string }>`
  position: absolute;
  top: 8px;
  bottom: 8px;
  background-color: ${({ color }) => color || '#3b82f6'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  z-index: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
`;

const StyledRow = styled.tr` 
  position: relative;
`;


////////////////////////////임시

interface WbsManagementPageProps {
    projectId: number;
    projectStartDate: string;
    projectDueDate: string;
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
    projectStartDate,
    projectDueDate,
}) => {

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    //임시
    const {
        data: tasks = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['projectwbs', projectId],
        queryFn: () => WbsApi.getWbsList(projectId),
        enabled: Boolean(projectId),
    });
    
    const Depth1 = 200;
    const Depth2 = 200;
    const Depth3 = 200;
    const cellWidth = 40;
    const timelineStart = projectStartDate?.slice(0,10) ?? '';
    const timelineEnd = projectDueDate?.slice(0,10)?? '';

    const toUtcDate = (dateString: string) => {
        const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);

        return Date.UTC(year, month - 1, day);
    };

    const getDayOffset = (dateString: string, baseDate: string) => {
        const oneDay = 1000 * 60 * 60 * 24;

        return Math.floor((toUtcDate(dateString) - toUtcDate(baseDate)) / oneDay);
    };

    const days =
    timelineStart && timelineEnd
        ? Array.from(
            { length: getDayOffset(timelineEnd, timelineStart) + 1 },
            (_, i) => {
            const date = new Date(`${timelineStart}T00:00:00Z`);
            date.setUTCDate(date.getUTCDate() + i);
            return date.toISOString().slice(0, 10);
            },
        )
    : []

    const tableWidth = Depth1+Depth2+Depth3 + days.length * cellWidth;

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
                    <StyledTable style={{ width: `${tableWidth}px` }}>
                        <colgroup>
                            <col style={{ width: `${Depth1}px` }} />
                            <col style={{ width: `${Depth2}px` }} />
                            <col style={{ width: `${Depth3}px` }} />
                            {days.map((day) => (
                            <col key={day} style={{ width: `${cellWidth}px` }} />
                            ))}
                        </colgroup>

                        <thead>
                            <tr>
                            <th style={{textAlign: 'center'}}>Depth 1</th>
                            <th style={{textAlign: 'center'}}>Depth 2</th>
                            <th style={{textAlign: 'center'}}>Task</th>
                            {days.map((date) => ( <th key={date}>{new Date(`${date}T00:00:00Z`).getUTCDate()}</th>))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => {
                                const depth = task.wbs_code.split('.').length;

                                if (depth > 2)
                                    return null;
                                
                                const startOffset = getDayOffset(task.start_date, timelineStart);
                                const endOffset = getDayOffset(task.due_date, timelineStart);

                                const visibleStart = Math.max(0, startOffset);
                                const visibleEnd = Math.min(days.length - 1, endOffset);

                                if (visibleEnd < 0 || visibleStart >= days.length)
                                    return null;
                                
                                const leftOffset = Depth1 + Depth2 + Depth3 + visibleStart * cellWidth;
                                const barWidth = (visibleEnd - visibleStart + 1) * cellWidth - 4;

                                return (
                                    <StyledRow key={task.wbs_code}>
                                        <td
                                            style={{
                                            fontWeight: '500',
                                            background: '#fafafa',
                                            textAlign: 'center',
                                            }}
                                        >
                                            {depth === 1 ? task.wbs_code +' / '+task.wbs_name : ''}
                                        </td>

                                        <td
                                            style={{
                                            textAlign: 'center',
                                            fontWeight: '500',
                                            paddingLeft: '12px',
                                            }}
                                        >
                                            {depth === 2 ? task.wbs_code +' / '+task.wbs_name : ''}
                                        </td>

                                        <td
                                            style={{
                                            textAlign: 'left',
                                            fontWeight: '500',
                                            paddingLeft: '12px',
                                            }}
                                        >
                                            {/* Task 열은 비워 둠 */}
                                        </td>

                                        {days.map((day) => (
                                            <td
                                            key={day}
                                            style={{ width: `${cellWidth}px`, background: '#fff' }}
                                            />
                                        ))}

                                        <GanttBar
                                            style={{
                                            left: `${leftOffset + 2}px`,
                                            width: `${barWidth}px`,
                                            }}
                                        />
                                    </StyledRow>
                                );
                            })}
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