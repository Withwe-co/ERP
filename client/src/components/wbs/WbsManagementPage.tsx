import styled from "styled-components";
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {Edit,Plus,RefreshCw,Archive, Underline} from 'lucide-react'

// Components
import Card from "../common/Card";
import Button from '../common/Button';
import Modal from '../common/Modal';
import WbsUploadForm from './WbsUploadForm';

// Api
import {WbsApi, taskApi, type Wbs} from '../../services/api'

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
    const [editingWbs, setEditingWbs] = useState<Wbs | null>(null);

    // wbs 생성 모달 오픈
    const openCreateModal = () => {
        setEditingWbs(null);
        setIsFormModalOpen(true);
    }
    // wbs 수정 모달 오픈
    const openEditModal = (wbs:Wbs) =>{
        setEditingWbs(wbs);
        setIsFormModalOpen(true);
    }

    // wbs 목록 불러오기
    const {
        data: tasks = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['projectwbs', projectId],
        queryFn: () => WbsApi.getWbsList(projectId),
        enabled: Boolean(projectId),
    });
    
    // Task 이름 + 일정 불러오기
    const { data: taskList = [] } = useQuery({
        queryKey: ['tasks', projectId],
        queryFn: () => taskApi.getTasks(projectId),
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
    const taskByWbsCode = new Map(taskList.map((task) => [task.wbs_code, task]));
    
    const tableRows = tasks.filter((task) => task.wbs_code.split('.').length === 1)
        .flatMap((parent) => {const children = tasks.filter((task) =>  task.wbs_code.split('.').length === 2 &&task.parent_wbs === parent.wbs_code);
    
        if (children.length === 0){
            return [{parent,child: null,showParent: true,}];
        }
    
        return children.map((child, index) => ({parent,child,showParent: index === 0}));
    });

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
                            {tableRows.map(({ parent, child, showParent }) => {
                                const rowTask = child ?? parent;
                                const matchedTask = taskByWbsCode.get(rowTask.wbs_code);

                                const chartStartDate = matchedTask?.planned_start_date;
                                const chartEndDate = matchedTask?.planned_end_date;
                                const hasTaskSchedule = Boolean(chartStartDate && chartEndDate);

                                let leftOffset = 0;
                                let barWidth = 0;
                                let showGanttBar = false;

                                if (hasTaskSchedule) {
                                    const startOffset = getDayOffset(chartStartDate, timelineStart);
                                    const endOffset = getDayOffset(chartEndDate, timelineStart);

                                    const visibleStart = Math.max(0, startOffset);
                                    const visibleEnd = Math.min(days.length - 1, endOffset);

                                    showGanttBar =visibleEnd >= 0 && visibleStart < days.length;

                                    if (showGanttBar) {
                                        leftOffset = Depth1 + Depth2 + Depth3 + visibleStart * cellWidth;

                                        barWidth = (visibleEnd - visibleStart + 1) * cellWidth - 4;
                                    }
                                }

                                return (
                                    <StyledRow key={rowTask.wbs_code}>
                                        <td
                                            onClick={showParent? () => openEditModal(parent): undefined}
                                            style={{
                                            fontWeight: '500',
                                            background: '#fafafa',
                                            textAlign: 'center',
                                            }}
                                        >
                                            {showParent ? parent.wbs_code +' / '+ parent.wbs_name : ''}
                                        </td>

                                        <td
                                            onClick={child? ()=> openEditModal(child):undefined}
                                            style={{
                                            textAlign: 'center',
                                            fontWeight: '500',
                                            paddingLeft: '12px',
                                            }}
                                        >
                                            {child? child.wbs_code +' / '+ child.wbs_name : ''}
                                        </td>

                                        <td
                                            style={{
                                            textAlign: 'left',
                                            fontWeight: '500',
                                            paddingLeft: '12px',
                                            }}
                                        >
                                           {child ? matchedTask?.task_name ?? '' : ''}
                                        </td>

                                        {days.map((day) => (
                                            <td
                                            key={day}
                                            style={{ width: `${cellWidth}px`, background: '#fff' }}
                                            />
                                        ))}
                                        {showGanttBar && (
                                            <GanttBar
                                                style={{
                                                left: `${leftOffset + 2}px`,
                                                width: `${barWidth}px`,
                                                }}
                                            />
                                        )}
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
            title={editingWbs ? "WBS 수정" : "WBS 등록"}
            size="xl"
            >
            <WbsUploadForm
                key={editingWbs?.id ?? 'create'}
                projectId={projectId}
                initialData={editingWbs ?? undefined}
                isEdit={Boolean(editingWbs)}
                onSuccess={() => {
                    setIsFormModalOpen(false);
                    setEditingWbs(null);
                }}
                onCancel={() => {
                    setIsFormModalOpen(false);
                    setEditingWbs(null);
                }}
            />
        </Modal>
        </>
    )
};

export default WbsManagementPage;