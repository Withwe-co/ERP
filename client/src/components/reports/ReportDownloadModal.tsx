import {useEffect, useMemo, useState,} from 'react';
import { DayPicker } from '@daypicker/react';
import { ko } from '@daypicker/react/locale';
import { CalendarDays } from 'lucide-react';
import styled from 'styled-components';

import '@daypicker/react/style.css';

import Button from '../common/Button';
import Modal from '../common/Modal';

import {EmployeeApi, type Employee,} from '../../services/api';

// 관리자 보고서 다운로드 시 선택한 조건
export interface ReportDownloadOptions {
  weekStarts: string[];
  employeeIds: number[];
  includeDaily: boolean;
  includeWeekly: boolean;
  includeAttachments: boolean;
}

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (options: ReportDownloadOptions) => void;
  isDownloading: boolean;
}

// 선택된 주차와 직원, 보고서 종류를 표시하는 안내 텍스트
const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// 선택한 주차와 직원, 보고서 종류를 표시하는 안내 텍스트
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// 선택한 주차와 직원, 보고서 종류를 표시하는 안내 텍스트
const Label = styled.div`
  padding-left: 6px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

// 선택한 주차와 달력 팝업의 기준 영역
const WeekPickerWrapper = styled.div`
  position: relative;
`;

// 선택된 월~금 기간을 표시하고 달력을 여는 버튼
const WeekTrigger = styled.button`
  display: flex;
  width: 100%;
  height: 42px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  &:hover {border-color: ${props => props.theme.colors.primary};}
`;

// 주차 범위 텍스트
const WeekRangeText = styled.span`
  font-weight: 500;
`;

// 주차 선택 필드 아래에 표시하는 달력
const CalendarPopover = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.md};
  .rdp-root {margin: 0; --rdp-accent-color: #2563eb;}
  /* 선택된 월요일~금요일을 하나의 범위처럼 표시 */
  .week-selected {background: #dbeafe;}
  .week-selected .rdp-day_button { color: #1d4ed8; font-weight: 600;}
  /* 선택 범위의 시작인 월요일 */
  .week-start {border-radius: 8px 0 0 8px;}
  /* 선택 범위의 끝인 금요일 */
  .week-end {border-radius: 0 8px 8px 0;}
`;

// 선택된 주차를 표시하는 칩
const CheckItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  input {width: 16px; height: 16px; margin: 0; cursor: pointer;}
`;

// 선택한 주차를 표시하는 칩 목록
const SelectedWeekList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

// 선택한 주차를 표시하는 칩
const SelectedWeekChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 13px;
  color: #374151;
`;

// 선택한 주차를 제거하는 버튼
const RemoveWeekButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  &:hover {color: #111827;}
`;

// 직원 목록과 검색어를 표시하는 영역
const EmployeeSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

// 선택된 직원 수를 표시하는 텍스트
const EmployeeCount = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

// 직원 검색 입력 필드
const EmployeeSearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  &:focus {outline: none; border-color: #9ca3af;}
`;

// 검색어가 없을 때 표시하는 안내 텍스트
const EmployeeList = styled.div`
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

// 검색어가 없을 때 표시하는 안내 텍스트
const EmployeeItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 14px;
  cursor: pointer;
  &:hover {background: #f9fafb;}
`;

// 선택된 직원의 이름을 표시하는 텍스트
const EmployeeActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 직원 선택/해제 버튼
const EmployeeActionButton = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
  &:hover {color: #111827; text-decoration: underline;}
`;

// 선택된 직원의 이름을 표시하는 텍스트
const SelectedEmployeeTitle = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

// 선택된 직원이 없을 때 표시하는 안내 텍스트
const EmployeeSearchWrapper = styled.div`
  position: relative;
`;

// 검색어를 지우는 버튼
const ClearSearchButton = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
`;

// 선택된 주차와 직원, 보고서 종류를 표시하는 안내 텍스트
const Description = styled.div`
  margin-top: 6px;
  margin-left: 24px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.85rem;
`;

// 직원 검색 결과가 없을 때 표시하는 안내 텍스트
const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

// Date 객체를 API에서 사용하는 YYYY-MM-DD 형식으로 변환
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1,).padStart(2, '0');
  const day = String(date.getDate(),).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// 선택한 날짜가 속한 주의 월요일을 계산
const getMonday = (date: Date) => {
  const monday = new Date(date);
  monday.setDate(date.getDate() -((date.getDay() + 6) % 7),);

  return monday;
};

// 선택한 주차의 월요일~금요일 범위를 한글 날짜 형식으로 표시
const formatWeekRange = (weekStart: Date,) => {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  // 선택한 주의 금요일 계산
  end.setDate(start.getDate() + 4);

  return (
    `${start.getFullYear()}년 ` +
    `${start.getMonth() + 1}월 ` +
    `${start.getDate()}일 ~ ` +
    `${end.getMonth() + 1}월 ` +
    `${end.getDate()}일`
  );
};

// 한글 글자의 받침을 제거해 이름 검색에 사용
const removeHangulBatchim = (value: string) => {
  const HANGUL_START = 0xac00;
  const HANGUL_END = 0xd7a3;
  const JONGSEONG_COUNT = 28;

  return Array.from(value)
    .map(char => {
      const code = char.charCodeAt(0);
      if (code < HANGUL_START || code > HANGUL_END) {return char;}
      const jongseong = (code - HANGUL_START) % JONGSEONG_COUNT;
      return String.fromCharCode(code - jongseong,);
    })
    .join('');
};

// 보고서 다운로드 모달
const ReportDownloadModal = ({isOpen, onClose, onDownload, isDownloading,}: ReportDownloadModalProps) => {
  // 기본 주차는 현재 날짜가 포함된 주의 월요일로 설정
  // 여러 주차를 선택할 수 있도록 각 주의 월요일을 배열로 관리
  const [selectedWeeks, setSelectedWeeks] = useState<Date[]>([getMonday(new Date()),]);
  // ERP 팀원 목록
  const [employees, setEmployees] = useState<Employee[]>([]);
  // 선택된 직원 ID 목록
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  // 직원 검색어
  const [employeeSearch, setEmployeeSearch] = useState('');
  // 직원 목록 조회 상태
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  // 주차 선택 달력의 표시 여부
  const [isCalendarOpen, setIsCalendarOpen,] = useState(false);
  // 달력에서 현재 보여주고 있는 월
  const [calendarMonth, setCalendarMonth,] = useState(getMonday(new Date()),);
  // 일일 보고와 주간 보고는 기본적으로 모두 포함
  const [includeDaily, setIncludeDaily] = useState(true);
  const [includeWeekly, setIncludeWeekly] = useState(true);
  // 첨부파일은 용량이 커질 수 있으므로 기본적으로 제외
  const [includeAttachments, setIncludeAttachments,] = useState(false);
  // 이름 검색 결과만 화면에 표시
  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch.trim().toLowerCase();
    if (!keyword) {return employees;}
    const normalizedKeyword = removeHangulBatchim(keyword);

    return employees.filter(employee => {
      const employeeName = employee.name.toLowerCase();
      // 일반적인 부분 일치 검색
      if (employeeName.includes(keyword)) {return true;}
      // 받침을 제거한 이름으로도 검색
      return removeHangulBatchim(employeeName,).includes(normalizedKeyword);
    });
  }, [employees, employeeSearch]);

  // 현재 실제로 선택된 직원만 별도로 계산
  const selectedEmployees = useMemo(() => {
    return employees.filter(employee => selectedEmployeeIds.includes(employee.id),);
  }, [employees, selectedEmployeeIds]);

  // 검색어가 입력되어 있는지 확인
  const hasEmployeeSearch = employeeSearch.trim().length > 0;

  // 모달을 새로 열 때 다운로드 조건을 기본값으로 초기화
  useEffect(() => {
    if (!isOpen) {return;}
    const currentMonday =getMonday(new Date());
    // 모달을 새로 열 때 현재 주차 하나를 기본 선택
    setSelectedWeeks([currentMonday]);
    // 달력 역시 현재 주가 포함된 월부터 표시
    setCalendarMonth(currentMonday);
    // 모달을 새로 열 때 직원 검색어 초기화
    setEmployeeSearch('');
    setIncludeDaily(true);
    setIncludeWeekly(true);
    setIncludeAttachments(false);
    // 모달을 새로 열 때 달력 팝업은 닫힌 상태로 시작
    setIsCalendarOpen(false);
  }, [isOpen]);

  // 모달이 열릴 때 최신 팀원 목록을 조회 &팀원이 새로 추가되어도 별도 코드 수정 없이 자동 반영함.
  useEffect(() => {
    if (!isOpen) {return;}
    const loadEmployees = async () => {
      try {
        setIsEmployeeLoading(true);
        // 다운로드 대상 선택에는 전체 팀원 목록이 필요하므로 페이지를 끝까지 조회하는 전용 API 함수를 사용함.
        const employeeList = await EmployeeApi.getAllEmployees();
        setEmployees(employeeList);
        // 모달을 처음 열 때는 모든 직원을 기본 선택한다.
        setSelectedEmployeeIds(employeeList.map(employee => employee.id,),);
      } catch (error) {
        console.error('직원 목록 조회 실패:', error,);
        setEmployees([]);
        setSelectedEmployeeIds([]);
      } finally {setIsEmployeeLoading(false);}
    };
    loadEmployees();
  }, [isOpen]);

  // 선택된 모든 주차의 월요일~금요일 범위를 생성
  const selectedWeekRanges = useMemo(() => {
      return selectedWeeks.map(monday => {
          const friday = new Date(monday);
          friday.setDate(monday.getDate() + 4);
          return {from: monday, to: friday,};
      });
  }, [selectedWeeks]);


  // 주차가 하나 이상 선택되고, 일일/주간 보고 중 하나 이상 선택되어야 다운로드 가능
  const canDownload =
    selectedWeeks.length > 0 &&
    selectedEmployeeIds.length > 0 &&
    (includeDaily || includeWeekly);

  // 달력에서 날짜를 선택하면 해당 날짜가 포함된 주차를 선택/해제
  const handleDayClick = (selectedDate: Date,) => {
    const monday = getMonday(selectedDate);
    const mondayKey = formatDate(monday);

    setSelectedWeeks(currentWeeks => {
      const alreadySelected = currentWeeks.some(weekStart => formatDate(weekStart) === mondayKey,);
      // 이미 선택된 주차라면 선택 해제
      if (alreadySelected) {return currentWeeks.filter(weekStart => formatDate(weekStart) !== mondayKey,);}
      // 새로운 주차를 추가한 뒤 오래된 주차부터 정렬
      return [...currentWeeks, monday].sort((a, b) => a.getTime() - b.getTime(),);
    });

    // 여러 주차를 계속 선택해야 하므로 날짜를 클릭해도 달력은 닫지 않음.
  };

  return (
      <Modal isOpen={isOpen} onClose={onClose} title="보고서 다운로드">
      <Form>
          <Section>
              <Label>주차</Label>
              <WeekPickerWrapper>
                  <WeekTrigger
                  type="button"
                  onClick={() => setIsCalendarOpen(previous => !previous,)}
                  aria-expanded={isCalendarOpen}
                  >
                  <WeekRangeText>
                      {selectedWeeks.length === 0
                          ? '주차를 선택해주세요'
                          : selectedWeeks.length === 1
                              ? `${formatDate(selectedWeeks[0])} ~ ${formatDate(selectedWeekRanges[0].to)}`
                              : `${selectedWeeks.length}개 주차 선택`}
                  </WeekRangeText>
                  <CalendarDays size={18} />
                  </WeekTrigger>

                  {isCalendarOpen && (
                  <CalendarPopover>
                      <DayPicker
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}

                      // 오래된 보고서도 빠르게 찾을 수 있도록
                      // 연도와 월을 드롭다운으로 선택
                      captionLayout="dropdown"
                      reverseYears
                      // 달력의 첫 번째 요일을 일요일로 표시
                      weekStartsOn={0}
                      locale={ko}
                      // 이전/다음 달 날짜도 함께 표시
                      showOutsideDays
                      fixedWeeks
                      // 선택된 모든 보고 주차의 월요일~금요일을 표시
                      modifiers={{
                          weekSelected: selectedWeekRanges,
                          weekStart: selectedWeekRanges.map(range => range.from),
                          weekEnd: selectedWeekRanges.map(range => range.to),
                      }}
                      modifiersClassNames={{
                          weekSelected: 'week-selected',
                          weekStart: 'week-start',
                          weekEnd: 'week-end',
                      }}
                      onDayClick={handleDayClick}
                      />
                  </CalendarPopover>
                  )}

                  {selectedWeeks.length > 0 && (
                    <SelectedWeekList>
                      {selectedWeeks.map(weekStart => {
                        const weekKey = formatDate(weekStart);

                        return (
                          <SelectedWeekChip key={weekKey}>
                            {formatWeekRange(weekStart)}

                            <RemoveWeekButton
                              type="button"
                              onClick={() => {
                                setSelectedWeeks(currentWeeks =>currentWeeks.filter(week => formatDate(week) !== weekKey,),);
                              }}
                              aria-label={`${formatWeekRange(weekStart)} 선택 해제`}
                            >
                              ×
                            </RemoveWeekButton>
                          </SelectedWeekChip>
                        );
                      })}
                    </SelectedWeekList>
                  )}
              </WeekPickerWrapper>
          </Section>

          <Section>
            <EmployeeSectionHeader>
              <Label>대상자</Label>

              <EmployeeCount>{selectedEmployeeIds.length}명 선택</EmployeeCount>
            </EmployeeSectionHeader>

            {/* 직원 검색 */}
            <EmployeeSearchWrapper>
              <EmployeeSearchInput
                type="text"
                placeholder="이름 검색"
                value={employeeSearch}
                onChange={event => setEmployeeSearch(event.target.value)}
              />

              {employeeSearch && (
                <ClearSearchButton
                  type="button"
                  onClick={() => setEmployeeSearch('')}
                  aria-label="검색어 지우기"
                >
                  ×
                </ClearSearchButton>
              )}
            </EmployeeSearchWrapper>

            {/* 검색어가 있을 때만 검색 결과 영역 표시 */}
            {hasEmployeeSearch && (
              <>
                <SelectedEmployeeTitle>
                  검색 결과 {filteredEmployees.length}명
                </SelectedEmployeeTitle>

                <EmployeeList>
                  {isEmployeeLoading ? (
                    <Description>직원 목록을 불러오는 중입니다.</Description>
                  ) : filteredEmployees.length === 0 ? (
                    <Description>검색 결과가 없습니다.</Description>
                  ) : (
                    filteredEmployees.map(employee => (
                      <EmployeeItem key={employee.id}>
                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.includes(employee.id,)}
                          onChange={event => {
                            if (event.target.checked) {
                              setSelectedEmployeeIds(currentIds => [...currentIds, employee.id,],);
                              return;
                            }

                            setSelectedEmployeeIds(
                              currentIds => currentIds.filter(id => id !== employee.id,),);
                          }}
                        />
                        <span>{employee.name}</span>
                      </EmployeeItem>
                    ))
                  )}
                </EmployeeList>
              </>
            )}

            {/* 현재 선택된 대상자 */}
            <EmployeeSectionHeader>
              <SelectedEmployeeTitle>선택된 대상자</SelectedEmployeeTitle>

              <EmployeeActions>
                <EmployeeActionButton
                  type="button"
                  onClick={() =>
                    setSelectedEmployeeIds(employees.map(employee => employee.id,),)
                  }
                >
                  전체 선택
                </EmployeeActionButton>

                <EmployeeActionButton
                  type="button"
                  onClick={() => setSelectedEmployeeIds([])}
                >
                  전체 해제
                </EmployeeActionButton>
              </EmployeeActions>
            </EmployeeSectionHeader>

            <EmployeeList>
              {isEmployeeLoading ? (
                <Description>직원 목록을 불러오는 중입니다.</Description>
              ) : selectedEmployees.length === 0 ? (
                <Description>선택된 대상자가 없습니다.</Description>
              ) : (
                selectedEmployees.map(employee => (
                  <EmployeeItem key={employee.id}>
                    <input
                      type="checkbox"
                      checked
                      onChange={() =>
                        setSelectedEmployeeIds(currentIds => currentIds.filter(id => id !== employee.id,),)
                      }
                    />
                    <span>{employee.name}</span>
                  </EmployeeItem>
                ))
              )}
            </EmployeeList>
          </Section>

          <Section>
          <Label>보고서 종류</Label>

          <div>
              <CheckItem>
              <input
                  type="checkbox"
                  checked={includeDaily}
                  onChange={event => setIncludeDaily(event.target.checked,)}
              />
              일일 보고
              </CheckItem>

              <Description>선택한 주차의 일일 보고서를 포함합니다.</Description>
          </div>

          <div>
              <CheckItem>
              <input
                  type="checkbox"
                  checked={includeWeekly}
                  onChange={event =>setIncludeWeekly(event.target.checked,)}
              />
              주간 보고
              </CheckItem>

              <Description>선택한 주차의 주간 보고서를 포함합니다.</Description>
          </div>
          </Section>

          <Section>
          <Label>첨부파일</Label>

          <div>
              <CheckItem>
              <input
                  type="checkbox"
                  checked={includeAttachments}
                  onChange={event => setIncludeAttachments(event.target.checked,)}
              />
              첨부파일 포함
              </CheckItem>
              <Description>
                이미지 외 첨부파일을 PDF와 함께 다운로드합니다.
                <br />
                이미지는 PDF에 항상 포함됩니다.
              </Description>
          </div>
          </Section>

          <Footer>
          <Button
              variant="outline"
              onClick={onClose}
              disabled={isDownloading}
          >
              취소
          </Button>

          <Button
              disabled={!canDownload || isDownloading}
              onClick={() =>
              onDownload({
                weekStarts: selectedWeeks.map(week => formatDate(week),),
                employeeIds: selectedEmployeeIds,
                includeDaily,
                includeWeekly,
                includeAttachments,
              })
              }
          >
              {isDownloading ? '생성 중...' : '다운로드'}
          </Button>
          </Footer>
      </Form>
      </Modal>
  );
};

export default ReportDownloadModal;
