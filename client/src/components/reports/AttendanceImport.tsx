import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../common/Button';
import Card from '../common/Card';
import { attendanceApi, AttendanceImportResult } from '../../services/api';

const ImportCard = styled(Card)`
  margin-bottom: 20px;
  h3 { margin: 0 0 8px; }
  p { margin: 8px 0; line-height: 1.6; }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
  input { max-width: 100%; }
`;

const Result = styled.div`
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f0fdf4;
  color: #166534;
`;

const ErrorText = styled.p`
  color: #b91c1c;
`;

const AttendanceImport = () => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AttendanceImportResult | null>(null);
  const [error, setError] = useState('');

  const upload = useMutation({
    mutationFn: attendanceApi.importFile,
    onSuccess: async (data) => {
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      await queryClient.invalidateQueries({ queryKey: ['attendance-calendar'] });
    },
    onError: (failure: any) => {
      const message = failure.response?.data?.message || failure.response?.data?.detail;
      setError(typeof message === 'string' ? message : '출퇴근 파일을 가져오지 못했습니다.');
    },
  });

  const importFile = () => {
    if (!file) return;
    setResult(null);
    setError('');
    if (!/\.(xls|txt)$/i.test(file.name) || !file.size || file.size > 10 * 1024 * 1024) {
      setError('캡스에서 내보낸 10MB 이하 XLS 또는 TXT 파일을 선택해주세요.');
      return;
    }
    upload.mutate(file);
  };

  return (
    <ImportCard>
      <h3>출퇴근 기록 가져오기</h3>
      <p>
        <Link to="/employees">팀원 관리</Link>에서 캡스 사용자 ID를 등록한 뒤 전날 근태 XLS 또는 TXT 파일을 선택하세요.
        등록된 ID와 일치하고 출근·퇴근 시각이 모두 있는 행만 저장합니다.
        같은 직원·날짜의 기존 기록은 변경하지 않습니다.
      </p>
      <p>TXT는 사용자ID · 이름 · 근무일자 · 출근 · 퇴근 순서로 탭으로 구분된 파일을 사용하세요.</p>
      <Controls>
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.txt"
          aria-label="캡스 출퇴근 XLS 또는 TXT 파일"
          disabled={upload.isLoading}
          onChange={event => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
            setError('');
          }}
        />
        <Button onClick={importFile} disabled={!file || upload.isLoading} loading={upload.isLoading}>
          파일 가져오기
        </Button>
      </Controls>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      {result && (
        <Result role="status">
          <div>전체 {result.total}건 중 {result.imported}건 저장</div>
          <div>
            기존 기록 {result.skipped_existing}건 · 미등록 ID {result.skipped_unregistered}건 ·
            출퇴근 시각 공란 {result.skipped_empty}건 제외
          </div>
          {result.skipped_not_due > 0 && <div>당일·미래 기록 {result.skipped_not_due}건 제외</div>}
          {result.start_date && (
            <div>자료 기간: {result.start_date} ~ {result.end_date}. 직원의 일일 보고에서 해당 날짜를 확인하세요.</div>
          )}
          {result.skipped_unregistered > 0 && (
            <div>미등록 ID의 기록은 저장하지 않았습니다. 직원 ID 등록 후 같은 파일을 다시 가져올 수 있습니다.</div>
          )}
        </Result>
      )}
    </ImportCard>
  );
};

export default AttendanceImport;
