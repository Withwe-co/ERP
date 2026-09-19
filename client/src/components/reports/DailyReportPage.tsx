import React from 'react';

interface DailyReportPageProps {
  employeeId: string;
}

const DailyReportPage: React.FC<DailyReportPageProps> = ({ employeeId }) => (
  <div>
    <h2>일일 보고</h2>
    <p>직원 ID {employeeId}의 일일 보고 화면입니다.</p>
    <p>보고서 상세 기능은 추후 추가됩니다.</p>
  </div>
);

export default DailyReportPage;
