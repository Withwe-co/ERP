"""CAPS-FPI XLS/TXT의 사용자ID/근무일자/출근/퇴근 열을 읽는다."""
from dataclasses import dataclass
from datetime import date, datetime, time
import math
import re

import xlrd
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from app.models.attendance import EmployeeAttendance
from app.models.employees import Employees

MAX_FILE_SIZE = 10 * 1024 * 1024
REQUIRED_COLUMNS = ("사용자ID", "이름", "근무일자", "출근", "퇴근")


@dataclass(frozen=True)
class AttendanceRow:
    row: int
    caps_user_id: str
    employee_name: str
    work_date: date
    check_in: time | None
    check_out: time | None


def _text(cell):
    return str(cell.value).strip() if cell.value is not None else ""


def _user_id(book, cell):
    if cell.ctype == xlrd.XL_CELL_TEXT:
        result = _text(cell)
    elif cell.ctype == xlrd.XL_CELL_NUMBER and math.isfinite(cell.value) and cell.value.is_integer():
        # 숫자로 저장했더라도 0000 표시 형식이 있다면 앞자리 0을 유지한다.
        value_format = book.format_map[book.xf_list[cell.xf_index].format_key].format_str
        result = str(int(cell.value))
        if re.fullmatch(r"0+", value_format):
            result = result.zfill(len(value_format))
    else:
        raise ValueError("사용자ID는 문자 또는 정수여야 합니다.")
    if not result or len(result) > 50:
        raise ValueError("사용자ID는 1~50자여야 합니다.")
    return result


def _date(book, cell):
    if cell.ctype == xlrd.XL_CELL_DATE:
        return xlrd.xldate_as_datetime(cell.value, book.datemode).date()
    return _date_text(_text(cell))


def _date_text(value):
    for pattern in ("%Y/%m/%d", "%Y-%m-%d", "%Y.%m.%d"):
        try:
            return datetime.strptime(value, pattern).date()
        except ValueError:
            pass
    raise ValueError("근무일자는 YYYY/MM/DD 형식이어야 합니다.")


def _time(cell):
    if not _text(cell):
        return None
    if cell.ctype in (xlrd.XL_CELL_DATE, xlrd.XL_CELL_NUMBER):
        value = cell.value
        if not math.isfinite(value) or not 0 <= value < 1:
            raise ValueError("출퇴근 시각은 같은 날의 00:00~23:59 범위여야 합니다.")
        seconds = round(value * 86400)
        if seconds >= 86400:
            raise ValueError("24시 이후의 출퇴근 시각은 지원하지 않습니다.")
        return time(seconds // 3600, seconds // 60 % 60, seconds % 60)
    return _time_text(_text(cell))


def _time_text(value):
    if not re.fullmatch(r"\d{1,2}:\d{2}(:\d{2})?", value):
        raise ValueError("출퇴근 시각은 HH:MM 형식이어야 합니다.")
    try:
        return time(*map(int, value.split(":")))
    except ValueError as exc:
        raise ValueError("유효하지 않은 출퇴근 시각입니다.") from exc


@dataclass
class ParsedAttendance:
    rows: list[AttendanceRow]
    total: int = 0
    skipped_unregistered: int = 0
    skipped_empty: int = 0
    skipped_not_due: int = 0


def _append_row(result, seen, item):
    if item.check_out < item.check_in:
        raise ValueError("퇴근 시각이 출근보다 빠릅니다. 자정 이후 근무는 지원하지 않습니다.")
    key = (item.caps_user_id, item.work_date)
    if key in seen:
        raise ValueError("같은 사용자ID와 근무일자의 행이 중복되어 있습니다.")
    seen.add(key)
    result.rows.append(item)


def parse_attendance_xls(content: bytes, registered_ids: set[str], max_work_date: date | None = None) -> ParsedAttendance:
    if not content or len(content) > MAX_FILE_SIZE:
        raise ValueError("비어 있지 않은 10MB 이하 XLS 파일을 선택해주세요.")
    try:
        book = xlrd.open_workbook(file_contents=content, formatting_info=True,
                                  encoding_override="cp949", on_demand=True)
    except Exception as exc:
        raise ValueError("캡스에서 내보낸 정상적인 XLS 파일을 선택해주세요.") from exc
    try:
        sheet = book.sheet_by_index(0)
        if sheet.nrows > 20001 or sheet.ncols > 200:
            raise ValueError("한 파일에는 20,000행, 200열까지 가져올 수 있습니다.")
        columns = None
        header_row = None
        for row in range(min(30, sheet.nrows)):
            labels = [_text(cell) for cell in sheet.row(row)]
            if all(label in labels for label in REQUIRED_COLUMNS):
                if any(labels.count(label) != 1 for label in REQUIRED_COLUMNS):
                    raise ValueError("필수 열 제목이 중복되어 있습니다.")
                columns = {label: labels.index(label) for label in REQUIRED_COLUMNS}
                header_row = row
                break
        if columns is None:
            raise ValueError("필수 열을 찾을 수 없습니다: " + ", ".join(REQUIRED_COLUMNS))
        result = ParsedAttendance(rows=[])
        seen = set()
        for row in range(header_row + 1, sheet.nrows):
            if not any(_text(cell) for cell in sheet.row(row)):
                continue
            result.total += 1
            cells = {label: sheet.cell(row, column) for label, column in columns.items()}
            try:
                caps_user_id = _user_id(book, cells["사용자ID"])
            except ValueError:
                caps_user_id = None
            # 미등록 ID의 날짜/시각은 해석하거나 저장하지 않는다.
            if caps_user_id not in registered_ids:
                result.skipped_unregistered += 1
                continue
            if not _text(cells["출근"]) or not _text(cells["퇴근"]):
                result.skipped_empty += 1
                continue
            try:
                work_date = _date(book, cells["근무일자"])
                if max_work_date is not None and work_date > max_work_date:
                    result.skipped_not_due += 1
                    continue
                item = AttendanceRow(
                    row=row + 1, caps_user_id=caps_user_id,
                    employee_name=_text(cells["이름"]),
                    work_date=work_date,
                    check_in=_time(cells["출근"]), check_out=_time(cells["퇴근"]),
                )
                _append_row(result, seen, item)
            except (ValueError, xlrd.XLDateError) as exc:
                raise ValueError(f"{row + 1}행: {exc}") from exc
        if not result.total:
            raise ValueError("가져올 근태 기록이 없습니다.")
        return result
    finally:
        book.release_resources()



def parse_attendance_txt(content: bytes, registered_ids: set[str], max_work_date: date | None = None) -> ParsedAttendance:
    if not content or len(content) > MAX_FILE_SIZE:
        raise ValueError("비어 있지 않은 10MB 이하 TXT 파일을 선택해주세요.")
    decoded = None
    for encoding in ("utf-8-sig", "cp949"):
        try:
            decoded = content.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    if decoded is None or "\x00" in decoded:
        raise ValueError("TXT 파일은 CP949 또는 UTF-8 인코딩이어야 합니다.")
    lines = decoded.splitlines()
    if len(lines) > 20001:
        raise ValueError("한 파일에는 20,000행까지 가져올 수 있습니다.")
    result = ParsedAttendance(rows=[])
    seen = set()
    for row, line in enumerate(lines, 1):
        if not line.strip():
            continue
        cells = [value.strip() for value in line.split("\t")]
        if len(cells) < 5 or len(cells) > 200 or any(cells[5:]):
            raise ValueError(f"{row}행: TXT 열은 사용자ID, 이름, 근무일자, 출근, 퇴근 순서이며 탭으로 구분해야 합니다.")
        if result.total == 0 and tuple(cells[:5]) == REQUIRED_COLUMNS:
            continue
        result.total += 1
        if result.total > 20000:
            raise ValueError("한 파일에는 20,000행까지 가져올 수 있습니다.")
        caps_user_id, employee_name, work_date, check_in, check_out = cells[:5]
        # 이름이나 사원번호로 추정하지 않고 문자열 ID를 그대로 비교한다.
        if caps_user_id not in registered_ids:
            result.skipped_unregistered += 1
            continue
        if not check_in or not check_out:
            result.skipped_empty += 1
            continue
        try:
            work_date = _date_text(work_date)
            if max_work_date is not None and work_date > max_work_date:
                result.skipped_not_due += 1
                continue
            item = AttendanceRow(
                row=row, caps_user_id=caps_user_id, employee_name=employee_name,
                work_date=work_date, check_in=_time_text(check_in), check_out=_time_text(check_out),
            )
            _append_row(result, seen, item)
        except ValueError as exc:
            raise ValueError(f"{row}행: {exc}") from exc
    if not result.total:
        raise ValueError("가져올 근태 기록이 없습니다.")
    return result

def import_attendance(db, content: bytes, filename: str, max_work_date: date | None = None):
    # 직원에 등록된 캡스 ID만 연결한다. 이름이나 ID 숫자값으로 추정하지 않는다.
    employees = {employee.caps_user_id: employee.id for employee in
                 db.query(Employees).filter(Employees.caps_user_id.isnot(None)).all()}
    if filename.lower().endswith(".txt"):
        parsed = parse_attendance_txt(content, set(employees), max_work_date)
    elif filename.lower().endswith(".xls"):
        parsed = parse_attendance_xls(content, set(employees), max_work_date)
    else:
        raise ValueError("캡스에서 내보낸 XLS 또는 TXT 파일을 선택해주세요.")
    dialect = db.get_bind().dialect.name
    if dialect not in ("postgresql", "sqlite"):
        raise ValueError("지원하지 않는 근태 저장 DB입니다.")
    insert = pg_insert if dialect == "postgresql" else sqlite_insert
    imported = 0
    skipped_existing = 0
    for row in parsed.rows:
        statement = insert(EmployeeAttendance).values(
            employee_id=employees[row.caps_user_id], caps_user_id=row.caps_user_id,
            work_date=row.work_date, check_in=row.check_in, check_out=row.check_out,
            source_filename=filename,
        ).on_conflict_do_nothing().returning(EmployeeAttendance.id)
        # 고유 제약으로 동시 업로드에도 최초 직원/날짜 기록만 보존한다.
        if db.execute(statement).scalar_one_or_none() is None:
            skipped_existing += 1
        else:
            imported += 1
    db.commit()
    dates = [row.work_date for row in parsed.rows]
    return dict(total=parsed.total, imported=imported, skipped_existing=skipped_existing,
                skipped_unregistered=parsed.skipped_unregistered, skipped_empty=parsed.skipped_empty,
                skipped_not_due=parsed.skipped_not_due,
                start_date=min(dates) if dates else None, end_date=max(dates) if dates else None)
