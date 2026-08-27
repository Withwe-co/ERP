import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Mail, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import LoadingSpinner from '../common/LoadingSpinner';
import { emailNotificationApi, EmailNotificationLog } from '../../services/api';

const Container = styled.div`padding: 20px;`;

const PageTitle = styled.h1`
  margin: 0 0 6px;
  color: ${p => p.theme.colors.text};
  font-size: 2rem;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  margin: 0 0 24px;
  color: ${p => p.theme.colors.textSecondary};
`;

const Toolbar = styled.form`
  display: flex; gap: 12px; margin-bottom: 20px; padding: 16px;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.lg};
  @media (max-width: ${p => p.theme.breakpoints.mobile}) { flex-direction: column; }
`;

const SearchBox = styled.div`
  position: relative; flex: 1;
  svg { position: absolute; top: 50%; left: 12px; transform: translateY(-50%); color: ${p => p.theme.colors.textSecondary}; }
`;

const SearchInput = styled.input`
  width: 100%; height: 42px; padding: 0 14px 0 40px;
  border: 1px solid ${p => p.theme.colors.border}; border-radius: ${p => p.theme.borderRadius.md};
  background: ${p => p.theme.colors.surface}; color: ${p => p.theme.colors.text}; font: inherit;
  &:focus { border-color: ${p => p.theme.colors.primary}; box-shadow: 0 0 0 3px ${p => p.theme.colors.primary}20; }
`;

const Select = styled.select`
  min-width: 140px; height: 42px; padding: 0 12px;
  border: 1px solid ${p => p.theme.colors.border}; border-radius: ${p => p.theme.borderRadius.md};
  background: ${p => p.theme.colors.surface}; color: ${p => p.theme.colors.text}; font: inherit;
`;

const RefreshButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 42px; padding: 0 16px; cursor: pointer;
  border: 1px solid ${p => p.theme.colors.border}; border-radius: ${p => p.theme.borderRadius.md};
  background: ${p => p.theme.colors.surface}; color: ${p => p.theme.colors.text};
  &:hover { background: ${p => p.theme.colors.background}; }
`;

const Summary = styled.div`
  margin-bottom: 12px; color: ${p => p.theme.colors.textSecondary}; font-size: 0.875rem;
`;
const List = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const LogCard = styled.article`
  background: ${p => p.theme.colors.surface}; border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.lg}; box-shadow: ${p => p.theme.shadows.sm}; overflow: hidden;
`;

const LogHeader = styled.button`
  width: 100%; display: grid;
  grid-template-columns: minmax(200px, 1.4fr) minmax(150px, 1fr) max-content 100px 24px;
  align-items: center; gap: 16px; padding: 18px 20px;
  border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer;
  &:hover { background: ${p => p.theme.colors.background}; }
  @media (max-width: ${p => p.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr auto;
    .optional { display: none; }
  }
`;

const Subject = styled.div`
  display: flex; align-items: center; gap: 12px; min-width: 0;
  .icon { flex: 0 0 auto; color: ${p => p.theme.colors.primary}; }
  strong, span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  span { margin-top: 4px; color: ${p => p.theme.colors.textSecondary}; font-size: 0.8rem; }
`;

const Cell = styled.div`
  min-width: auto; color: ${p => p.theme.colors.textSecondary}; font-size: 0.875rem;
  overflow: visible; 
  text-overflow: clip; 
  white-space: nowrap;
  }
`;

const StatusBadge = styled.span<{ $success: boolean }>`
  display: inline-flex; align-items: center; gap: 5px; width: fit-content; padding: 5px 9px;
  border-radius: 999px; font-size: 0.78rem; font-weight: 700;
  background: ${p => p.$success ? '#dcfce7' : '#fee2e2'};
  color: ${p => p.$success ? '#15803d' : '#b91c1c'};
`;

const Detail = styled.div`
  padding: 0 20px 20px 64px; border-top: 1px solid ${p => p.theme.colors.border};
  @media (max-width: ${p => p.theme.breakpoints.mobile}) { padding: 16px 20px 20px; }
`;
const Content = styled.pre`
  margin-top: 16px; padding: 16px; border-radius: ${p => p.theme.borderRadius.md};
  background: ${p => p.theme.colors.background}; color: ${p => p.theme.colors.text};
  font-family: inherit; font-size: 0.875rem; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere;
`;
const EmailPreview = styled.iframe`
  width: 100%;
  height: 720px;
  margin-top: 16px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.md};
  background: #ffffff;
`;
const ErrorText = styled.div`
  margin-top: 12px; padding: 12px; border-radius: ${p => p.theme.borderRadius.md};
  background: #fef2f2; color: #b91c1c; font-size: 0.85rem;
`;
const DetailActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
`;
const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid #fecaca;
  border-radius: ${p => p.theme.borderRadius.md};
  background: #ffffff;
  color: #dc2626;
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;

  &:hover { background: #fef2f2; }
  &:disabled { cursor: not-allowed; opacity: 0.55; }
`;
const Empty = styled.div`
  padding: 64px 20px; border: 1px dashed ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.lg}; color: ${p => p.theme.colors.textSecondary}; text-align: center;
  svg { margin-bottom: 12px; opacity: 0.45; }
`;

const formatDate = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
}).format(new Date(value));

const KakaoPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['email-notification-logs', search, status],
    queryFn: () => emailNotificationApi.getLogs({
      limit: 100, search: search || undefined, status: status || undefined,
    }),
    refetchInterval: 30000,
    retry: 1,
  });
  const logs = useMemo(() => data?.items ?? [], [data]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const deleteLog = async (log: EmailNotificationLog) => {
    if (!window.confirm(`'${log.subject}' 발송 이력을 삭제하시겠습니까?`)) return;

    setDeletingId(log.id);
    try {
      await emailNotificationApi.deleteLog(log.id);
      if (expandedId === log.id) setExpandedId(null);
      await refetch();
      toast.success('이메일 발송 이력이 삭제되었습니다.');
    } catch (error) {
      console.error('이메일 발송 이력 삭제 실패:', error);
      toast.error('이메일 발송 이력을 삭제하지 못했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container>
      <PageTitle>이메일 발송 이력</PageTitle>
      <PageSubtitle>구매요청 이메일의 발송 시각, 수신자, 내용과 성공 여부를 확인합니다.</PageSubtitle>
      <Toolbar onSubmit={submitSearch}>
        <SearchBox>
          <Search size={18} />
          <SearchInput value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="요청 번호, 수신자, 제목 또는 내용 검색" />
        </SearchBox>
        <Select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">전체 상태</option><option value="SUCCESS">발송 성공</option><option value="FAILED">발송 실패</option>
        </Select>
        <RefreshButton type="button" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={17} /> 새로고침
        </RefreshButton>
      </Toolbar>

      {isLoading ? <LoadingSpinner text="이메일 발송 이력을 불러오는 중..." />
        : isError ? <Empty><AlertCircle size={42} /><div>발송 이력을 불러오지 못했습니다.</div></Empty>
        : logs.length === 0 ? <Empty><Mail size={42} /><div>저장된 이메일 발송 이력이 없습니다.</div></Empty>
        : <>
          <Summary>총 {data?.total ?? 0}건 · 최근 발송순</Summary>
          <List>{logs.map((log: EmailNotificationLog) => {
            const success = log.status === 'SUCCESS';
            const expanded = expandedId === log.id;
            return <LogCard key={log.id}>
              <LogHeader type="button" onClick={() => setExpandedId(expanded ? null : log.id)}>
                <Subject><Mail size={20} className="icon" /><div><strong>{log.subject}</strong>
                  <span>{log.request_number || '요청 번호 없음'}</span></div></Subject>
                <Cell className="optional" title={log.recipients.join(', ')}>{log.recipients.join(', ')}</Cell>
                <Cell className="optional">{formatDate(log.sent_at)}</Cell> 
                <StatusBadge $success={success}>
                  {success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}{success ? '성공' : '실패'}
                </StatusBadge>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </LogHeader>
              {expanded && <Detail>
                {log.html_content ? (
                  <EmailPreview
                    title={`${log.subject} 미리보기`}
                    srcDoc={log.html_content}
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                  />
                ) : (
                  <Content>{log.content}</Content>
                )}
                {log.error_message && <ErrorText>오류: {log.error_message}</ErrorText>}
                <DetailActions>
                  <DeleteButton
                    type="button"
                    onClick={() => deleteLog(log)}
                    disabled={deletingId === log.id}
                  >
                    <Trash2 size={16} />
                    {deletingId === log.id ? '삭제 중...' : '이력 삭제'}
                  </DeleteButton>
                </DetailActions>
              </Detail>}
            </LogCard>;
          })}</List>
        </>}
    </Container>
  );
};

export default KakaoPage;
