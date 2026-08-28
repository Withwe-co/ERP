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

    // 차트 일정 보기 조절
    type GanttViewMode = 'day' | 'week' | 'month';
    const [ganttViewMode, setGanttViewMode] = useState<GanttViewMode>('day');

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

    // wbs 순서 설정
    const sortedWbs = [...tasks].sort((a, b) => {
        const aOrder = a.wbs_order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.wbs_order ?? Number.MAX_SAFE_INTEGER;

        // 1차: DB의 wbs_order 순서
        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }

        // 2차: 같은 순서값이거나 순서값이 없을 때 WBS 코드 순서
        return a.wbs_code.localeCompare(b.wbs_code, undefined, {
            numeric: true,
        });
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
    const cellWidthByMode: Record<GanttViewMode, number> = {
        day: 40,
        week: 160,
        month: 250,
    };
    const cellWidth = cellWidthByMode[ganttViewMode];

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

    interface TimelineColumn {
        key: string;
        label: string;
        startDate: string;
        endDate: string;
    }

    const formatDate = (date: Date) => date.toISOString().slice(0, 10);

    const addDays = (dateString: string, amount: number) => {
        const date = new Date(`${dateString}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + amount);
        return formatDate(date);
    };

    const getMonthStart = (dateString: string) => `${dateString.slice(0, 7)}-01`;
    const getMonthEnd = (dateString: string) => {
        const date = new Date(`${getMonthStart(dateString)}T00:00:00Z`);
        date.setUTCMonth(date.getUTCMonth() + 1);
        date.setUTCDate(0);
        return formatDate(date);
    };

    const timelineColumns: TimelineColumn[] = (() => {
        if (!timelineStart || !timelineEnd) {
            return [];
        }

        // 일 단위
        if (ganttViewMode === 'day') {
            return Array.from(
                { length: getDayOffset(timelineEnd, timelineStart) + 1 },
                (_, index) => {
                    const date = addDays(timelineStart, index);

                    return {
                        key: date,
                        label: String(new Date(`${date}T00:00:00Z`).getUTCDate()),
                        startDate: date,
                        endDate: date,
                    };
                },
            );
        }

        // 주 단위
        if (ganttViewMode === 'week') {
            const columns: TimelineColumn[] = [];

            const firstDate = new Date(`${timelineStart}T00:00:00Z`);
            const dayOfWeek = (firstDate.getUTCDay() + 6) % 7; // 월요일: 1
            firstDate.setUTCDate(firstDate.getUTCDate() - dayOfWeek);

            let cursor = formatDate(firstDate);

            while (cursor <= timelineEnd) {
                const weekEnd = addDays(cursor, 6);

                // 프로젝트 기간 밖의 부분은 잘라냄
                const columnStart = cursor < timelineStart ? timelineStart : cursor;
                const columnEnd = weekEnd > timelineEnd ? timelineEnd : weekEnd;

                columns.push({
                    key: cursor,
                    label: `${columnStart.slice(5).replace('-', '/')} ~ ${columnEnd
                    .slice(5)
                    .replace('-', '/')}`,
                    startDate: columnStart,
                    endDate: columnEnd,
                });

                cursor = addDays(cursor, 7);
            }

            return columns;
        }

        // 월 단위
        const columns: TimelineColumn[] = [];
        let cursor = getMonthStart(timelineStart);

        while (cursor <= timelineEnd) {
            const monthEnd = getMonthEnd(cursor);

            const columnStart = cursor < timelineStart ? timelineStart : cursor;
            const columnEnd = monthEnd > timelineEnd ? timelineEnd : monthEnd;

            const [year, month] = cursor.slice(0, 7).split('-');

            columns.push({
            key: cursor,
            label: `${year}년 ${Number(month)}월`,
            startDate: columnStart,
            endDate: columnEnd,
            });

            const nextMonth = new Date(`${cursor}T00:00:00Z`);
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
            cursor = formatDate(nextMonth);
        }

        return columns;
    })();

    const tableWidth = Depth1 + Depth2 + Depth3 + timelineColumns.length * cellWidth;
    const taskByWbsCode = taskList.reduce<Record<string, typeof taskList>>((result, task) => {
        (result[task.wbs_code] ??= []).push(task);

        return result;
    }, {});
        
    const tableRows = sortedWbs.filter((task) => task.wbs_code.split('.').length === 1) .flatMap((parent) => {
        const parentTasks = taskByWbsCode[parent.wbs_code] ?? [];
        const children = sortedWbs.filter((task) =>  task.wbs_code.split('.').length === 2 &&task.parent_wbs === parent.wbs_code);
        
        const parentTaskRows = parentTasks.map((linkedTask, index) => ({parent,child: null,linkedTask,showParent: index === 0,showChild: false,}));

        const childRows=children.flatMap((child, childIndex) => {
            const childTasks = taskByWbsCode[child.wbs_code] ?? [];
    
            if (childTasks.length === 0){
                return [{parent,child,linkedTask: null,showParent: parentTasks.length === 0 && childIndex === 0,showChild: true}];
            }

            return childTasks.map((linkedTask, index) => ({parent,child,linkedTask,showParent:parentTasks.length === 0 && childIndex === 0 && index === 0,showChild: index === 0}));
        });

        if (parentTaskRows.length === 0 && childRows.length === 0) {
            return [{parent,child: null,linkedTask: null,showParent: true,showChild: false,}];
        }

        return [...parentTaskRows, ...childRows];
    });

    return(
        <>
        <Container>
            <FilterContainer>
                <ActionButtons>
                    <Button
                        variant={ganttViewMode === 'day' ? 'primary' : 'outline'}
                        onClick={() => setGanttViewMode('day')}
                    >
                        일
                    </Button>

                    <Button
                        variant={ganttViewMode === 'week' ? 'primary' : 'outline'}
                        onClick={() => setGanttViewMode('week')}
                    >
                        주
                    </Button>

                    <Button
                        variant={ganttViewMode === 'month' ? 'primary' : 'outline'}
                        onClick={() => setGanttViewMode('month')}
                    >
                        월
                    </Button>
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
                            {timelineColumns.map((column) => (
                                <col key={column.key} style={{ width: `${cellWidth}px` }} />
                            ))}
                        </colgroup>

                        <thead>
                            <tr>
                            <th style={{textAlign: 'center'}}>Depth 1</th>
                            <th style={{textAlign: 'center'}}>Depth 2</th>
                            <th style={{textAlign: 'center'}}>Task</th>
                            {timelineColumns.map((column) => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map(({ parent, child,linkedTask, showParent, showChild,}) => {
                                /*const rowTask = child ?? parent;
                                const matchedTask = taskByWbsCode[rowTask.wbs_code] ?? [];
                                
                                const gantTask = matchedTask[0];*/


                                const chartStartDate = linkedTask?.planned_start_date;
                                const chartEndDate = linkedTask?.planned_end_date;
                                const hasTaskSchedule = Boolean(chartStartDate && chartEndDate);

                                let leftOffset = 0;
                                let barWidth = 0;
                                let showGanttBar = false;

                                if (hasTaskSchedule) {
                                    const startColumnIndex = timelineColumns.findIndex(
                                        (column) =>
                                            chartStartDate >= column.startDate &&
                                            chartStartDate <= column.endDate,
                                    );

                                    const endColumnIndex = timelineColumns.findIndex(
                                        (column) =>
                                            chartEndDate >= column.startDate &&
                                            chartEndDate <= column.endDate,
                                    );

                                    showGanttBar = startColumnIndex !== -1 && endColumnIndex !== -1;

                                    if (showGanttBar) {
                                        const firstColumn = Math.min(startColumnIndex, endColumnIndex);
                                        const lastColumn = Math.max(startColumnIndex, endColumnIndex);

                                        leftOffset =
                                            Depth1 + Depth2 + Depth3 + firstColumn * cellWidth;

                                        barWidth = (lastColumn - firstColumn + 1) * cellWidth - 4;
                                    }
                                }
                                const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Seoul',});

                                return (
                                    <StyledRow key={`${child?.id ?? parent.id}-${linkedTask?.id ?? 'empty'}`}>
                                        <td
                                            onClick={showParent? () => openEditModal(parent): undefined}
                                            style={{
                                            fontWeight: '500',
                                            background: '#fafafa',
                                            textAlign: 'center',
                                            }}
                                        >
                                            {showParent ? parent.wbs_code +' | '+ parent.wbs_name : ''}
                                        </td>

                                        <td
                                            onClick={showChild && child ? () => openEditModal(child) : undefined}
                                            style={{
                                            textAlign: 'center',
                                            fontWeight: '500',
                                            paddingLeft: '12px',
                                            }}
                                        >
                                            {showChild && child ? child.wbs_code + ' | ' + child.wbs_name : ''}
                                        </td>

                                        <td
                                            style={{
                                            textAlign: 'center',
                                            fontWeight: '500',
                                            paddingLeft: '12px',
                                            }}
                                        >
                                           {linkedTask?.task_name ?? ''}
                                        </td>

                                        {timelineColumns.map((column) => {
                                            const isTodayColumn =
                                                today >= column.startDate && today <= column.endDate;

                                            return (
                                                <td
                                                key={column.key}
                                                style={{
                                                    width: `${cellWidth}px`,
                                                    background: isTodayColumn ? '#FFF3CD' : '#fff',
                                                }}
                                                />
                                            );
                                        })}
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