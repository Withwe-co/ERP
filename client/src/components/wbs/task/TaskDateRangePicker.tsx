import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import { ko } from "@daypicker/react/locale";
import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import styled from "styled-components";

import "@daypicker/react/style.css";


interface TaskDateRangePickerProps {
    startDate: string;
    endDate: string;
    projectStartDate: string;
    projectDueDate: string;
    onChange: (startDate: string, endDate: string) => void;
}


// 태스크 시작 예정일과 완료 예정일을 하나의 달력에서 선택
function TaskDateRangePicker({
    startDate,
    endDate,
    projectStartDate,
    projectDueDate,
    onChange,
}: TaskDateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // 기존 일정이 있으면 달력에 선택된 범위로 표시
    const selectedRange: DateRange | undefined = startDate
        ? {
            from: parseISO(startDate),
            to: endDate ? parseISO(endDate) : undefined,
        }
        : undefined;

    // 프로젝트 기간을 벗어난 날짜 선택 여부 확인
    const isOutsideProjectPeriod = (start: string, end: string,) => {
        if (!projectStartDate || !projectDueDate) {return false;}

        return Boolean(
            (start &&
                (start < projectStartDate ||
                    start > projectDueDate)) ||
            (end &&
                (end < projectStartDate ||
                    end > projectDueDate))
        );
    };

    const hasDateWarning = isOutsideProjectPeriod(startDate, endDate,);

    // 달력 외부를 클릭하면 닫기
    useEffect(() => {
        if (!isOpen) {return;}

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {document.removeEventListener("mousedown", handleOutsideClick);};
    }, [isOpen]);

    // 달력에서 시작일 / 완료일 선택
    const handleSelect = (range: DateRange | undefined) => {
        const nextStartDate = range?.from
            ? format(range.from, "yyyy-MM-dd")
            : "";

        const nextEndDate = range?.to
            ? format(range.to, "yyyy-MM-dd")
            : "";

        onChange(nextStartDate, nextEndDate);

        const isOutside = isOutsideProjectPeriod(
            nextStartDate,
            nextEndDate,
        );

        // 정상적인 기간을 모두 선택했을 때만 달력 닫기
        if (range?.from && range?.to && !isOutside) {setIsOpen(false);}
    };

    return (
        <PickerContainer ref={pickerRef}>
            <DateGrid>
                <DateFieldGroup>
                    <Label>
                        시작 예정일
                        <Required>*</Required>
                    </Label>

                    <DateField
                        type="button"
                        onClick={() => setIsOpen(true)}
                    >
                        <DateText $empty={!startDate}>
                            {startDate || "날짜를 선택하세요."}
                        </DateText>

                        <CalendarDays size={18} />
                    </DateField>
                </DateFieldGroup>

                <DateFieldGroup>
                    <Label>
                        완료 예정일
                        <Required>*</Required>
                    </Label>

                    <DateField
                        type="button"
                        onClick={() => setIsOpen(true)}
                    >
                        <DateText $empty={!endDate}>
                            {endDate || "날짜를 선택하세요."}
                        </DateText>

                        <CalendarDays size={18} />
                    </DateField>
                </DateFieldGroup>
            </DateGrid>

            {isOpen && (
                <CalendarPopover>
                    <DayPicker
                        mode="range"
                        selected={selectedRange}
                        onSelect={handleSelect}
                        resetOnSelect
                        locale={ko}
                        defaultMonth={selectedRange?.from}
                    />

                    {hasDateWarning && (
                        <CalendarWarning>
                            프로젝트 기간({projectStartDate} ~ {projectDueDate})을
                            벗어난 날짜는 선택할 수 없습니다.
                        </CalendarWarning>
                    )}
                </CalendarPopover>
            )}
        </PickerContainer>
    );
}


export default TaskDateRangePicker;


// 날짜 선택 전체 영역
const PickerContainer = styled.div`
    position: relative;
`;


// 기존 태스크 등록 폼과 동일한 2열 구조
const DateGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;


const DateFieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;


const Label = styled.label`
    padding-left: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
`;


const Required = styled.span`
    color: #ef4444;
`;


/* 전체 영역을 클릭할 수 있는 날짜 입력 박스 */
const DateField = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #374151;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
`;


const DateText = styled.span<{ $empty: boolean }>`
    color: ${({ $empty }) => ($empty ? "#9ca3af" : "#374151")};
`;


/* 시작 예정일과 완료 예정일이 함께 사용하는 달력 */
const CalendarPopover = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 1000;
    max-width: 480px;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #ffffff;
    box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -4px rgba(0, 0, 0, 0.1);

    .rdp-root {
        width:100%;
        --rdp-accent-color: #3b82f6;
        --rdp-accent-background-color: #dbeafe;

        --rdp-day-width: 32px;
        --rdp-day-height: 32px;
        --rdp-day_button-width: 30px;
        --rdp-day_button-height: 30px;

        --rdp-nav_button-width: 26px;
        --rdp-nav_button-height: 26px;
        --rdp-nav-height: 28px;

        --rdp-range_middle-background-color: #dbeafe;
        --rdp-range_middle-color: #1f2937;

        font-size: 13px;
    }
        /* 달력 자체를 팝업 너비만큼 확장 */
        .rdp-months,
        .rdp-month,
        .rdp-month_grid {
            width: 100%;
        }

        /* 요일과 날짜 칸을 동일한 너비로 배치 */
        .rdp-month_grid {
            table-layout: fixed;
        }
`;

const CalendarWarning = styled.p`
    width: 100%;
    box-sizing: border-box;
    margin: 8px 0 0;
    padding: 8px 4px 0;
    border-top: 1px solid #e5e7eb;
    color: ${({ theme }) => theme.colors.error};
    font-size: 13px;
    line-height: 1.4;
`;
