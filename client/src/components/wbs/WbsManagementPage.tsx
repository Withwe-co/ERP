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
        { wbs_code:"1",wbs_name:"A",parent_wbs:'',start_date:'2026-9-1',due_date:'2026-9-20',wbs_order:1 },
        { wbs_code:"2",wbs_name:"B",parent_wbs:'',start_date:'2026-9-10',due_date:'2026-9-20',wbs_order:2},
        { wbs_code:"1.1",wbs_name:"C",parent_wbs:'1',start_date:'2026-9-21',due_date:'2026-9-30',wbs_order:1 },
        { wbs_code:"1.1.1",wbs_name:"D",parent_wbs:'1.1',start_date:'202-9-4',due_date:'2026-9-12',wbs_order:1 },
        { wbs_code:"3",wbs_name:"E",parent_wbs:'',start_date:'2026-9-14',due_date:'2026-9-22',wbs_order:3},
    ]
    // 1일부터 7일까지만 예시로 표시 (원하는 날짜만큼 동적으로 생성 가능) 임시
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const Depth1 = 200;
    const Depth2 = 200;
    const Depth3 = 200;
    const cellWidth = 40;
    const tableWidth = Depth1+Depth2+Depth3 + days.length * cellWidth;
    const timelineStart = '2026-09-01';

    const toUtcDate = (dateString: string) => {
    const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);

    return Date.UTC(year, month - 1, day);
    };

    const getDayOffset = (dateString: string, baseDate: string) => {
    const oneDay = 1000 * 60 * 60 * 24;

    return Math.floor(
        (toUtcDate(dateString) - toUtcDate(baseDate)) / oneDay
    );
    };

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
                            <th style={{textAlign: 'center'}}>Depth 3</th>
                            {days.map((day) => (
                                <th key={day}>{day}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task, index) => {
                                const startOffset = getDayOffset(task.start_date, timelineStart);
                                const endOffset = getDayOffset(task.due_date, timelineStart);

                                // 화면에 표시하는 기간 밖으로 나가는 경우 보정
                                const visibleStart = Math.max(0, startOffset);
                                const visibleEnd = Math.min(days.length - 1, endOffset);

                                // 표시할 구간이 없으면 렌더링하지 않음
                                if (visibleEnd < 0 || visibleStart >= days.length) {
                                    return null;
                                }

                                const leftOffset =
                                    Depth1 + Depth2 + Depth3 + visibleStart * cellWidth;

                                const barWidth =
                                    (visibleEnd - visibleStart + 1) * cellWidth - 4;

                                return (
                                    <StyledRow key={task.wbs_code}>
                                    <td style={{ fontWeight: '500', background: '#fafafa', textAlign: 'center' }}>{task.wbs_code}</td>
                                    <td style={{ textAlign: 'left', fontWeight: '500', paddingLeft: '12px' }}>{task.wbs_code}</td>
                                    <td style={{ textAlign: 'left', fontWeight: '500', paddingLeft: '12px' }}>{task.wbs_code}</td>
                                    
                                    {days.map((day) => (
                                        <td key={day} style={{ width: `${cellWidth}px`, background: '#fff' }} />
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