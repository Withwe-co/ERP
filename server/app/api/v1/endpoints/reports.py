"""보고서 API"""

import asyncio
import httpx

from datetime import date, datetime, timedelta
from io import BytesIO
import json
from pathlib import Path
from typing import Literal, Optional
from uuid import uuid4
from zipfile import ZIP_DEFLATED, ZipFile
from pydantic import BaseModel
from app.models.leaves import Leaves

from collections import defaultdict
from xml.sax.saxutils import escape
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, UploadFile
from PIL import Image
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError, TimeoutError
from sqlalchemy.orm import Session, load_only

from app.services.holiday_service import is_korean_holiday
from app.core.database import get_db
from app.models.reports import Reports
from app.schemas.reports import (ReportCalendarStatus, ReportCreateBase, ReportInDBBase, ReportUpdateBase, ReportWithEmployee,)
from app.models.employees import Employees

from reportlab.platypus.tableofcontents import TableOfContents

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Image as ReportLabImage,
    PageBreak,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.paragraph import Paragraph

router = APIRouter()

class ReportExportRequest(BaseModel):
    """
    관리자 보고서 다운로드 요청 조건.
    여러 주차와 여러 직원을 한 번에 선택할 수 있도록 week_starts와 employee_ids를 리스트로 받음.
    """

    week_starts: list[date]
    employee_ids: list[int]

    include_daily: bool = True
    include_weekly: bool = True
    include_attachments: bool = False

# PDF 생성 시 사용할 Pretendard 폰트 경로
APP_DIR = Path(__file__).resolve().parents[3]
PDF_FONT_DIR = APP_DIR / "assets" / "fonts"
PDF_FONT_REGULAR_PATH = (PDF_FONT_DIR / "Pretendard-Regular.ttf")
PDF_FONT_BOLD_PATH = (PDF_FONT_DIR / "Pretendard-Bold.ttf")
PDF_FONT_REGULAR = "Pretendard"
PDF_FONT_BOLD = "Pretendard-Bold"

# 보고서 첨부파일(이미지 포함)이 저장되는 경로
REPORT_ATTACHMENT_DIR = Path("uploads/report_attachments")

# A4 좌우 여백과 ReportLab Frame의 기본 좌우 padding(각 6pt)을 제외한 본문 너비
PDF_CONTENT_WIDTH = A4[0] - (40 * mm) - 12

MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024
MAX_ATTACHMENT_COUNT = 10

ALLOWED_FILE_EXTENSIONS = {
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.csv',
    '.txt',
    '.ppt',
    '.pptx',
    '.hwp',
    '.hwpx',
}

IMAGE_EXTENSIONS_BY_FORMAT = {
    'PNG': {'.png'},
    'JPEG': {'.jpg', '.jpeg'},
    'GIF': {'.gif'},
    'WEBP': {'.webp'},
}

def register_pdf_fonts() -> None:
    """
    업무 보고 PDF 생성에 사용할 Pretendard 폰트를 등록.
    ReportLab은 웹 CSS 폰트를 직접 사용할 수 없으므로
    서버에 저장된 TTF 파일을 명시적으로 등록.
    """

    # 이미 등록된 경우 중복 등록하지 않는다.
    registered_fonts = pdfmetrics.getRegisteredFontNames()

    if PDF_FONT_REGULAR not in registered_fonts:
        pdfmetrics.registerFont(TTFont(PDF_FONT_REGULAR, str(PDF_FONT_REGULAR_PATH),))

    if PDF_FONT_BOLD not in registered_fonts:
        pdfmetrics.registerFont(TTFont(PDF_FONT_BOLD, str(PDF_FONT_BOLD_PATH),))

def draw_report_page_footer(canvas, document,) -> None:
    """
    업무 보고 PDF의 각 페이지 하단에
    문서명과 현재 페이지 번호를 표시한다.
    """

    canvas.saveState()
    canvas.setFont(PDF_FONT_REGULAR, 8,)
    canvas.setFillColor(colors.HexColor("#6B7280"))

    # 왼쪽 하단 문서명
    canvas.drawString(20 * mm, 10 * mm,  "Withwe ERP | 업무 보고서",)
    # 오른쪽 하단 현재 페이지 번호
    canvas.drawRightString(A4[0] - 20 * mm, 10 * mm, str(canvas.getPageNumber()),)

    canvas.restoreState()

class ReportDocTemplate(SimpleDocTemplate):
    """
    직원 이름이 출력되는 페이지를 감지하여
    PDF 목차에 직원명과 시작 페이지를 등록한다.
    """

    def beforeDocument(self) -> None:
        # multiBuild가 여러 번 PDF를 계산하므로
        # 각 계산 시작 시 직원 목차 순번을 초기화한다.
        self.employee_toc_index = 0

    def afterFlowable(self, flowable) -> None:
        # 직원 이름 Paragraph만 목차 대상으로 사용한다.
        if (isinstance(flowable, Paragraph) and flowable.style.name == "EmployeeTitle"):
            employee_name = flowable.getPlainText()
            # 목차 링크에 사용할 고유한 bookmark 이름
            bookmark_key = (f"employee-{self.employee_toc_index}")
            self.employee_toc_index += 1
            # 현재 직원 보고서 시작 페이지에 bookmark 생성
            self.canv.bookmarkPage(bookmark_key)
            # 목차에 직원명 / 현재 페이지 등록
            self.notify("TOCEntry", (0, employee_name, self.page,  bookmark_key,),)

def create_pdf_section_header(title: str, style: ParagraphStyle,) -> Table:
    """
    주간 보고와 일일 보고의 구분 제목을 배경색이 있는 박스 형태로 생성함.
    """

    table = Table( [[Paragraph(title, style)]],colWidths=[PDF_CONTENT_WIDTH],)

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0),  (-1, -1), colors.HexColor("#F3F4F6"),),
                ("LINEBELOW", (0, 0), (-1, -1), 1, colors.HexColor("#D1D5DB"),),
                ("LEFTPADDING", (0, 0),  (-1, -1), 10,),
                ("RIGHTPADDING", (0, 0),  (-1, -1), 10,),
                ("TOPPADDING", (0, 0), (-1, -1),  9,),
                ("BOTTOMPADDING",  (0, 0),  (-1, -1),  9,),
            ]
        )
    )

    return table

def create_depth_body_style(base_style: ParagraphStyle, depth: int,) -> ParagraphStyle:
    """
    목록 depth에 따라 PDF 본문의 왼쪽 들여쓰기를 적용.
    번호 체계에는 depth 제한을 두지 않지만, 너무 깊은 목록에서 본문 폭이 지나치게 좁아지지 않도록
    화면상 들여쓰기는 최대 6단계까지만 적용.
    """

    visual_depth = min(depth, 6)

    return ParagraphStyle(
        name=f"ReportBodyDepth{visual_depth}",
        parent=base_style,
        # depth 한 단계마다 약 4mm 정도 들여쓰기
        leftIndent=(base_style.leftIndent + visual_depth * 12),
    )

def resolve_report_attachment_path(file_src: str | None,) -> Path | None:
    """
    reportImage / reportFile 노드의 src 값을 실제 서버 파일 경로로 변환.
    예:
    /uploads/report_attachments/abc.png -> uploads/report_attachments/abc.png
    """

    if not file_src: return None

    # URL 형식이어도 path 부분만 사용
    parsed = urlparse(file_src)
    path_value = parsed.path or file_src

    # 파일명만 사용해서 상위 경로 접근 방지
    file_name = Path(path_value).name
    if not file_name: return None

    file_path = REPORT_ATTACHMENT_DIR / file_name
    if not file_path.exists(): return None

    return file_path

def create_report_pdf(
    week_start: date,
    week_end: date,
    reports: list,
    selected_employees: list[tuple[int, str]],
    include_daily: bool,
    include_weekly: bool,
    holiday_dates: set[date],
    leave_dates_by_employee: dict[int, set[date]],
) -> bytes:
    """
    조회된 업무 보고서를 직원별로 묶어 하나의 PDF로 생성.
    직원별로 주간 보고서를 먼저 표시하고, 이어서 일일 보고서를 날짜순으로 출력.
    """

    register_pdf_fonts()
    buffer = BytesIO()

    document = ReportDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    # PDF 제목 스타일
    title_style = ParagraphStyle(
        name="ReportTitle",
        fontName=PDF_FONT_BOLD,
        fontSize=22,
        leading=30,
        alignment=1,
        spaceAfter=14,
    )

    # 보고 기간 표시 스타일
    period_style = ParagraphStyle(
        name="ReportPeriod",
        fontName=PDF_FONT_REGULAR,
        fontSize=11,
        leading=18,
        alignment=1,
        spaceAfter=24,
    )

    # 첫 페이지 목차 제목 스타일
    toc_title_style = ParagraphStyle(
        name="TableOfContentsTitle",
        fontName=PDF_FONT_BOLD,
        fontSize=14,
        leading=20,
        textColor=colors.HexColor("#111827"),
        spaceBefore=10,
        spaceAfter=12,
    )

    # 목차에 표시되는 직원 이름 스타일
    toc_employee_style = ParagraphStyle(
        name="TableOfContentsEmployee",
        fontName=PDF_FONT_REGULAR,
        fontSize=10.5,
        leading=20,
        textColor=colors.HexColor("#374151"),
        leftIndent=8,
        rightIndent=8,
        spaceAfter=4,
    )

    # 직원 이름 스타일
    employee_style = ParagraphStyle(
        name="EmployeeTitle",
        fontName=PDF_FONT_BOLD,
        fontSize=18,
        leading=24,
        spaceAfter=16,
    )

    # 일일 보고 / 주간 보고 제목 스타일
    section_style = ParagraphStyle(
        name="ReportSection",
        fontName=PDF_FONT_BOLD,
        fontSize=13,
        leading=19,
        textColor=colors.HexColor("#111827"),
    )

    # 일일 보고 날짜 스타일
    date_style = ParagraphStyle(
        name="ReportDate",
        fontName=PDF_FONT_BOLD,
        fontSize=11.5,
        leading=18,
        textColor=colors.HexColor("#111827"),
        leftIndent=6,
        spaceBefore=6,
        spaceAfter=8,
    )

    # 실제 보고서 본문 스타일
    body_style = ParagraphStyle(
        name="ReportBody",
        fontName=PDF_FONT_REGULAR,
        fontSize=10.5,
        leading=18,
        textColor=colors.HexColor("#374151"),
        leftIndent=10,
        rightIndent=4,
        spaceAfter=6,
    )

    # 작성된 내용이 없을 때 표시하는 안내 문구 스타일
    empty_style = ParagraphStyle(
        name="EmptyReport",
        fontName=PDF_FONT_REGULAR,
        fontSize=9.5,
        leading=16,
        textColor=colors.HexColor("#9CA3AF"),
        leftIndent=10,
        spaceAfter=6,
    )

    story = []

    # 직원별 보고서 시작 페이지를 자동으로 표시하는 목차
    table_of_contents = TableOfContents()
    table_of_contents.levelStyles = [toc_employee_style,]
    # 직원명과 페이지 번호 사이를 점선으로 표시함.
    table_of_contents.dotsMinLevel = 0

    # 첫 페이지에 보고서 제목과 기간을 표시함.
    story.append(Paragraph("업무 보고서",  title_style,))
    story.append(
        Paragraph(
            (
                f"{week_start.year}년 "
                f"{week_start.month}월 "
                f"{week_start.day}일"
                f" ~ "
                f"{week_end.year}년 "
                f"{week_end.month}월 "
                f"{week_end.day}일"
            ),
            period_style,
        )
    )
    story.append(Paragraph("목차", toc_title_style,))
    story.append(table_of_contents)
    story.append(PageBreak())

    # 실제 작성된 보고서를 직원 ID 기준으로 그룹화함.
    reports_by_employee = defaultdict(list)

    for report, _employee_name in reports:
        reports_by_employee[report.employee_id].append(report)

    # 보고서 존재 여부가 아니라 사용자가 선택한 직원 전체를 기준으로 PDF 페이지를 생성함.
    employee_items = [
        ((employee_id, employee_name), reports_by_employee.get(employee_id, [],),)
        for employee_id, employee_name
        in selected_employees
    ]

    # 직원별로 주간 보고 → 일일 보고 순서로 출력한다.
    for employee_index, ((employee_id, employee_name), employee_reports,) in enumerate(employee_items):

        # 두 번째 직원부터는 새 페이지에서 시작함.
        if employee_index > 0: story.append(PageBreak())
        # 직원 이름을 페이지 상단에 표시
        story.append(Paragraph(escape(employee_name), employee_style,))
        story.append(Spacer(1, 2 * mm,))
        story.append(
            HRFlowable(
                width=PDF_CONTENT_WIDTH,
                thickness=1.2,
                color=colors.HexColor("#9CA3AF"),
                hAlign="LEFT",
                spaceBefore=4,
                spaceAfter=12,
            )
        )

        weekly_reports = [report for report in employee_reports if report.report_type == "WEEKLY"]

        daily_reports = sorted(
            [report for report in employee_reports  if report.report_type == "DAILY"],
            key=lambda report: report.period_start,
        )
        # 날짜별 일일 보고서를 빠르게 찾기 위한 매핑
        daily_reports_by_date = {report.period_start: report for report in daily_reports}

        # 사용자가 주간 보고를 선택한 경우에만 주간 보고 영역 표시
        if include_weekly:
            story.append(create_pdf_section_header("주간 보고", section_style,))
            story.append(Spacer(1, 5 * mm))

            if weekly_reports:
                for report in weekly_reports:
                    content_flowables = (build_report_content_flowables(report.content, body_style,))
                    if content_flowables:
                        story.extend(content_flowables)
                    else:
                        # 보고서는 존재하지만 본문 내용이 비어 있는 경우
                        story.append(Paragraph("작성된 내용이 없습니다.", empty_style,))
            else:
                # 해당 주차의 주간 보고서를 작성하지 않은 경우
                story.append(Paragraph("작성하지 않음", empty_style,))

            story.append(Spacer(1, 5 * mm))

            story.append(
                HRFlowable(
                    width=PDF_CONTENT_WIDTH,
                    thickness=0.8,
                    color=colors.HexColor("#E5E7EB"),
                    hAlign="LEFT",
                    spaceBefore=4,
                    spaceAfter=10,
                )
            )
        # 사용자가 일일 보고를 선택한 경우에만 일일 보고 영역 표시
        if include_daily:
            story.append(create_pdf_section_header("일일 보고", section_style,))
            story.append(Spacer(1, 5 * mm))

            # 월요일부터 금요일까지 실제 보고서 존재 여부와 관계없이 출력
            for day_offset in range(5):
                report_date = (week_start + timedelta(days=day_offset))
                story.append(Paragraph(format_korean_report_date(report_date), date_style,))
                report = (daily_reports_by_date.get(report_date))
                if report is None:
                    employee_leave_dates = (leave_dates_by_employee.get(employee_id, set(),))
                    # 보고서가 없는 경우 공휴일/휴가 여부를 먼저 확인한다.
                    if report_date in holiday_dates:
                        missing_label = "공휴일"
                    elif report_date in employee_leave_dates:
                        missing_label = "휴가"
                    else:
                        missing_label = "작성하지 않음"
                    story.append(Paragraph(missing_label, empty_style,))
                else:
                    content_flowables = (build_report_content_flowables(report.content, body_style,))
                    if content_flowables:
                        story.extend(content_flowables)
                    else:
                        # 보고서는 등록됐지만 본문 내용이 없는 경우
                        story.append(Paragraph("작성된 내용이 없습니다.", empty_style,))
                story.append(Spacer(1, 4 * mm))

    document.multiBuild(
        story,
        # 첫 페이지는 footer 없이 유지
        onFirstPage=lambda canvas, document: None,
        # 실제 보고서 페이지부터 문서명과 페이지 번호 표시
        onLaterPages=draw_report_page_footer,
    )
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes

def extract_inline_text(node: dict) -> str:
    """
    TipTap 노드 내부의 텍스트를 재귀적으로 추출함.
    paragraph, heading, listItem 등의 내부에 중첩된 text 노드를
    하나의 문자열로 합치기 위해 사용함.
    """

    if not isinstance(node, dict): return ""
    node_type = node.get("type")
    # 실제 문자열이 저장되는 TipTap text 노드
    if node_type == "text": return str(node.get("text") or "")
    # 줄바꿈 노드는 실제 줄바꿈 문자로 변환
    if node_type == "hardBreak": return "\n"
    text_parts = []
    for child in node.get("content") or []: text_parts.append(extract_inline_text(child))

    return "".join(text_parts)

def format_korean_report_date(target_date: date,) -> str:
    """
    PDF에 표시할 보고 날짜를 한글 형식으로 변환함.
    """
    weekday_labels = ["월", "화", "수", "목", "금", "토", "일"]
    weekday = weekday_labels[target_date.weekday()]

    return (f"{target_date.month}월 " f"{target_date.day}일 ({weekday})")

def extract_list_item_text(node: dict,) -> str:
    """
    TipTap listItem 하나에서 화면에 표시할 텍스트를 추출함.
    """
    parts = []

    for child in node.get("content") or []:
        child_type = child.get("type")
        # 리스트 항목의 첫 paragraph 내용을 대표 텍스트로 사용
        if child_type in {"paragraph", "heading",}:
            text = extract_inline_text(child).strip()
            if text: parts.append(text)

    return " ".join(parts)

def convert_report_content_to_lines(content: dict,) -> list[tuple[str, int]]:
    """
    TipTap JSON 본문을 PDF 출력에 사용할 문자열 목록으로 변환함.
    일반 문단, 제목, 목록, 첨부파일, 이미지 등을
    보고서에 표시할 순서대로 문자열 형태로 반환함.
    """

    # 각 본문을 (텍스트, 목록 깊이) 형태로 저장한다.
    lines: list[tuple[str, int]] = []

    def append_list_lines(list_node: dict, parent_numbers: list[int] | None = None, depth: int = 0,) -> None:
        """
        중첩된 TipTap 목록을 재귀적으로 탐색함.
        orderedList는 1., 2-1., 2-3-1. 형태로 번호를 생성하고,
        목록 depth는 PDF 들여쓰기에 사용할 값으로 함께 저장함.
        """

        node_type = list_node.get("type")
        children = list_node.get("content") or []
        attrs = list_node.get("attrs") or {}

        # 순서 있는 목록
        if node_type == "orderedList":
            start_number = int(attrs.get("start") or 1)
            for index, item in enumerate(children, start=start_number,):
                if item.get("type") != "listItem":
                    continue
                # 상위 번호를 유지하여 2 → 2-1 → 2-1-1 형태로 생성.
                current_numbers = [*(parent_numbers or []),  index,]
                text = extract_list_item_text(item)
                if text:
                    number_text = "-".join(str(number) for number in current_numbers)
                    lines.append((f"{number_text}. {text}", depth,))
                # listItem 내부의 하위 목록을 계속 탐색한다.
                for child in (item.get("content") or []):
                    child_type = child.get("type")
                    if child_type == "orderedList":
                        append_list_lines(child, current_numbers, depth + 1,)
                    elif child_type == "bulletList":
                        append_list_lines(child, None, depth + 1,)

            return

        # 순서 없는 목록
        if node_type == "bulletList":
            for item in children:
                if item.get("type") != "listItem": continue
                text = extract_list_item_text(item)
                if text:
                    lines.append((f"• {text}", depth,))
                for child in (item.get("content") or []):
                    child_type = child.get("type")

                    if child_type == "orderedList":
                        append_list_lines(child,  None,  depth + 1,)
                    elif child_type == "bulletList":
                        append_list_lines(child,  None, depth + 1,)

    def walk(node: dict) -> None:
        if not isinstance(node, dict): return
        node_type = node.get("type")
        children = node.get("content") or []
        attrs = node.get("attrs") or {}
        # 일반 문단
        if node_type == "paragraph":
            text = extract_inline_text(node).strip()
            if text: lines.append((text, 0))
            return
        # 제목 노드
        if node_type == "heading":
            text = extract_inline_text(node).strip()
            if text: lines.append((text, 0))
            return
        # 순서 없는 목록은 중첩 구조까지 재귀적으로 처리함
        if node_type == "bulletList":
            append_list_lines(node)
            return
        # 순서 있는 목록은 2-1, 2-3-1 등의 중첩 번호 체계를 유지하며 재귀적으로 처리함
        if node_type == "orderedList":
            append_list_lines(node)
            return

        # 일반 첨부파일
        if node_type == "reportFile":
            file_name = (attrs.get("name") or "첨부파일")
            lines.append((f"[첨부파일] {file_name}", 0))
            return

        # 이미지 첨부
        if node_type == "reportImage":
            image_name = (attrs.get("name") or "이미지")
            lines.append((f"[이미지] {image_name}", 0,))
            return

        # 나머지 컨테이너 노드는 내부 노드를 계속 탐색
        for child in children:
            walk(child)

    walk(content)

    return lines

def build_report_content_flowables(content: dict, body_style: ParagraphStyle,) -> list:
    """
    TipTap JSON 본문을 PDF 출력용 Flowable 목록으로 변환.
    - 일반 문단: Paragraph
    - 중첩 목록: Paragraph + depth 기반 들여쓰기
    - 이미지: ReportLabImage
    - 일반 첨부파일: 파일명 텍스트
    """

    flowables = []

    attachment_style = ParagraphStyle(
        name="AttachmentStyle",
        parent=body_style,
        fontSize=9.5,
        textColor=colors.HexColor("#6B7280"),
        spaceBefore=4,
        spaceAfter=4,
    )

    def append_text(text: str,  depth: int = 0,) -> None:
        """
        일반 텍스트를 depth에 맞는 들여쓰기로 PDF에 추가.
        """

        cleaned_text = text.strip()

        if not cleaned_text: return

        # PDF에서 이미 섹션 제목으로 따로 보여주므로
        # 본문 안의 단독 "일일 보고", "주간 보고"는 중복 출력하지 않음
        if cleaned_text in {"일일 보고", "주간 보고",}:return

        text_style = create_depth_body_style(body_style,  depth,)
        flowables.append(Paragraph(escape(cleaned_text).replace("\n", "<br/>",), text_style,))

    def append_file(file_name: str,  depth: int = 0,) -> None:
        """
        일반 첨부파일은 PDF 본문에 파일명만 표시.
        """

        file_style = ParagraphStyle(
            name=f"AttachmentDepth{depth}",
            parent=attachment_style,
            leftIndent=(create_depth_body_style(body_style,  depth,).leftIndent),
        )

        flowables.append(Paragraph(f"[첨부파일] {escape(file_name)}", file_style,))

    def append_image(node: dict,  depth: int = 0,) -> None:
        """
        reportImage 노드를 실제 PDF 이미지로 변환.
        이미지 파일이 없거나 읽을 수 없으면 파일명 텍스트로 대체.
        """

        attrs = node.get("attrs") or {}
        image_name = (attrs.get("name")  or "이미지")
        image_src = attrs.get("src")
        image_path = resolve_report_attachment_path(
            image_src
        )

        # 파일 경로를 찾지 못하면 텍스트로 대체
        if not image_path:
            append_text(f"[이미지] {image_name}", depth,)
            return

        try:
            pdf_image = ReportLabImage(str(image_path))

            # depth에 따라 이미지도 같이 들여쓰기
            text_style = create_depth_body_style(body_style, depth,)

            left_indent = text_style.leftIndent

            # 본문 폭 안에서 이미지 최대 너비 설정
            max_width = (PDF_CONTENT_WIDTH - left_indent  - 10)

            # 이미지 최대 높이 제한
            max_height = 110 * mm

            original_width = pdf_image.drawWidth
            original_height = pdf_image.drawHeight

            scale = min(
                max_width / original_width,
                max_height / original_height,
                1.0,
            )

            pdf_image.drawWidth = (original_width * scale)
            pdf_image.drawHeight = (original_height * scale)
            pdf_image.hAlign = "LEFT"

            # 이미지도 본문처럼 left indent를 맞추기 위해
            # Table 안에 감싸서 출력
            image_wrapper = Table([[pdf_image]], colWidths=[PDF_CONTENT_WIDTH],)

            image_wrapper.setStyle(
                TableStyle(
                    [
                        ("LEFTPADDING", (0, 0),  (-1, -1), left_indent,),
                        ("RIGHTPADDING", (0, 0),  (-1, -1),  0,),
                        ("TOPPADDING", (0, 0), (-1, -1), 2,),
                        ("BOTTOMPADDING",  (0, 0),  (-1, -1), 2,),
                    ]
                )
            )

            flowables.append(Spacer(1, 2 * mm,))
            flowables.append(image_wrapper)
            flowables.append(Spacer(1, 2 * mm,))

        except Exception:
            # 이미지 읽기 실패 시 PDF 생성이 깨지지 않도록 텍스트 대체
            append_text(f"[이미지] {image_name}", depth,)

    def append_list(list_node: dict, parent_numbers: list[int] | None = None, depth: int = 0,) -> None:
        """
        orderedList / bulletList를 재귀적으로 처리한다.
        """

        node_type = list_node.get("type")
        children = list_node.get("content") or []
        attrs = list_node.get("attrs") or {}

        if node_type == "orderedList":
            start_number = int(attrs.get("start") or 1)

            for index, item in enumerate(children, start=start_number,):
                if item.get("type") != "listItem": continue

                current_numbers = [*(parent_numbers or []), index,]
                item_content = (item.get("content") or [])

                # listItem 자체 텍스트 먼저 출력
                item_text = extract_list_item_text(item)

                if item_text:
                    number_text = "-".join(str(number) for number in current_numbers)

                    append_text(f"{number_text}. {item_text}", depth,)

                # 그 다음 내부 요소를 순서대로 처리
                for child in item_content:
                    child_type = child.get("type")

                    if child_type in {"paragraph", "heading",}:
                        continue

                    if child_type == "orderedList":
                        append_list(child, current_numbers, depth + 1,)

                    elif child_type == "bulletList":
                        append_list(child,  None, depth + 1,)

                    elif child_type == "reportImage":
                        append_image(child,  depth + 1,)

                    elif child_type == "reportFile":
                        attrs = child.get("attrs") or {}
                        append_file(attrs.get("name") or "첨부파일", depth + 1,)

            return

        if node_type == "bulletList":
            for item in children:
                if item.get("type") != "listItem": continue

                item_content = (item.get("content") or [])

                item_text = extract_list_item_text(item)

                if item_text:
                    append_text(f"• {item_text}", depth,)

                for child in item_content:
                    child_type = child.get("type")

                    if child_type in {"paragraph", "heading",}:
                        continue

                    if child_type in {"orderedList", "bulletList",}:
                        append_list(child, None, depth + 1,)

                    elif child_type == "reportImage":
                        append_image(child, depth + 1,)

                    elif child_type == "reportFile":
                        attrs = child.get("attrs") or {}
                        append_file(attrs.get("name") or "첨부파일", depth + 1,)

    def walk(node: dict, depth: int = 0,) -> None:
        if not isinstance(node, dict):
            return

        node_type = node.get("type")
        children = node.get("content") or []
        attrs = node.get("attrs") or {}

        if node_type == "paragraph":
            append_text(extract_inline_text(node), depth,)
            return

        if node_type == "heading":
            append_text(extract_inline_text(node),  depth,)
            return

        if node_type in {"orderedList", "bulletList",}:
            append_list(node, None, depth,)
            return

        if node_type == "reportImage":
            append_image(node, depth,)
            return

        if node_type == "reportFile":
            append_file(attrs.get("name") or "첨부파일", depth,)
            return

        for child in children:
            walk(child, depth,)

    walk(content)

    return flowables

@router.post("/{report_type}", response_model=ReportInDBBase)
async def create_report(report_type: Literal["daily", "weekly"],request: Request,db: Session = Depends(get_db),)-> ReportInDBBase:
    """
        summary : 일일/주간 보고서 생성 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - request (Request) : 보고서 JSON 또는 첨부 파일이 포함된 FormData
            - db (Session) : DB 세션

        desc :
            - 일일 또는 주간 보고서를 생성하고, 생성된 보고서 데이터를 반환
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 같은 직원과 보고 유형, 기준 날짜의 보고서가 이미 존재하는 경우에는 409 에러를 반환
            - 경로와 요청 데이터의 report_type이 일치하지 않는 경우에는 422 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
            - 드롭한 첨부 파일을 본문의 해당 위치에 연결한 뒤 저장

    """
    # JSON 요청과 파일이 포함된 FormData 요청을 같은 생성 모델로 검증한다.
    files: list[UploadFile] = []
    upload_ids: list[str] = []
    if request.headers.get('content-type', '').startswith('multipart/form-data'):
        form = await request.form()
        try:
            payload = json.loads(str(form.get('report')))
            report_in = ReportCreateBase.model_validate(payload)
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc
        files = form.getlist('files')
        upload_ids = [str(value) for value in form.getlist('upload_ids')]
    else:
        try:
            report_in = ReportCreateBase.model_validate(await request.json())
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc

    # 첨부 ID와 본문 노드의 대응을 확인하고 저장할 파일을 준비한다.
    if len(files) != len(upload_ids) or len(set(upload_ids)) != len(upload_ids) or len(files) > MAX_ATTACHMENT_COUNT:
        raise HTTPException(status_code=422, detail='첨부 파일 목록이 올바르지 않습니다.')
    pending_nodes = {}
    stack = [report_in.content]
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            attrs = node.get('attrs') or {}
            if attrs.get('uploadId'):
                if attrs['uploadId'] in pending_nodes:
                    raise HTTPException(status_code=422, detail='첨부 파일 ID가 중복되었습니다.')
                pending_nodes[attrs['uploadId']] = node
            stack.extend(node.get('content') or [])
    if set(pending_nodes) != set(upload_ids):
        raise HTTPException(status_code=422, detail='본문과 첨부 파일 목록이 일치하지 않습니다.')

    attachments = []
    for file, upload_id in zip(files, upload_ids):
        content = await file.read(MAX_ATTACHMENT_SIZE + 1)
        if not content or len(content) > MAX_ATTACHMENT_SIZE:
            raise HTTPException(status_code=400, detail='첨부 파일은 각각 10MB 이하만 허용됩니다.')
        node = pending_nodes[upload_id]
        if node.get('type') == 'reportImage':
            try:
                image = Image.open(BytesIO(content))
                image.verify()
                image_format = image.format

            except Exception as exc:
                raise HTTPException(status_code=400,  detail='이미지 파일 형식이 올바르지 않습니다.',) from exc

            original_extension = Path((file.filename or '').replace('\\', '/')).suffix.lower()
            allowed_extensions = IMAGE_EXTENSIONS_BY_FORMAT.get(image_format)

            if (allowed_extensions is None or original_extension not in allowed_extensions):
                raise HTTPException(status_code=400, detail='PNG, JPG, JPEG, GIF, WebP 이미지만 허용됩니다.',)

            extension = original_extension
            target_attr = 'src'

        elif node.get('type') == 'reportFile':
            extension = Path((file.filename or '').replace('\\', '/')).suffix.lower()
            if extension not in ALLOWED_FILE_EXTENSIONS:
                raise HTTPException(status_code=400, detail='지원하지 않는 첨부 파일 형식입니다.')
            target_attr = 'href'
        else:
            raise HTTPException(status_code=422, detail='본문 첨부 노드가 올바르지 않습니다.')
        file_path = Path('uploads/report_attachments') / f'{uuid4()}{extension}'
        attachments.append((file_path, content, node, target_attr))

    # 경로의 보고 유형을 데이터베이스에 저장하는 대문자 형식으로 변환한다.
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 경로와 요청 본문의 보고 유형이 같은지 확인한다.
    if report_in.report_type != normalized_report_type:
        raise HTTPException(status_code=422,detail=f"{report_name} 보고서는 report_type이 {normalized_report_type}여야 합니다.")

    # 주간 보고서의 기준 날짜가 해당 주의 월요일인지 확인한다.
    if normalized_report_type == "WEEKLY" and report_in.period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 period_start는 월요일이어야 합니다.")

    # 같은 직원·보고 유형·기준 날짜의 보고서가 이미 있는지 확인한다.
    existing_report = db.query(Reports).filter(Reports.employee_id == report_in.employee_id,Reports.report_type == normalized_report_type,Reports.period_start == report_in.period_start,).first()

    # 같은 조건의 보고서가 이미 존재하면 409 에러 반환
    if existing_report is not None:
        raise HTTPException(status_code=409,detail=f"해당 직원과 날짜의 {report_name} 보고서가 이미 존재합니다.")

    # 파일 주소를 드롭 위치의 노드에 넣고 제출 완료 보고서를 생성한다.
    saved_paths = []
    try:
        if attachments:
            Path('uploads/report_attachments').mkdir(parents=True, exist_ok=True)
        for file_path, content, node, target_attr in attachments:
            saved_paths.append(file_path)
            file_path.write_bytes(content)
            node['attrs'][target_attr] = f'/uploads/report_attachments/{file_path.name}'
            node['attrs'].pop('uploadId', None)
    except OSError as exc:
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail='보고서 첨부 파일 저장에 실패했습니다.') from exc

    report = Reports(
        employee_id=report_in.employee_id,
        report_type=normalized_report_type,
        period_start=report_in.period_start,
        content=report_in.content,
        submitted=True,
    )

    try:
        # 새 보고서를 저장한 뒤 생성된 식별자와 시간을 반영한다.
        db.add(report)
        db.commit()
        db.refresh(report)
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 생성 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 생성 중 데이터베이스 오류가 발생했습니다.",) from exc

    # 저장이 완료된 보고서 데이터를 반환한다.
    return report


@router.get("/statuses", response_model=list[ReportWithEmployee])
def read_report_statuses(daily_period_start: date = Query(..., description="일일 보고 대상 날짜"),weekly_period_start: date = Query(..., description="주간 보고 시작일"),db: Session = Depends(get_db),) -> list[ReportWithEmployee]:
    """
        summary : 직원별 일일/주간 보고서 제출 상태 조회 함수

        arg :
            - daily_period_start (date) : 조회할 일일 보고 날짜
            - weekly_period_start (date) : 조회할 주간 보고 시작일
            - db (Session) : DB 세션

        desc :
            - 선택한 일일 보고 날짜와 주간 시작일에 해당하는 보고서 목록을 반환
            - 주간 보고 시작일이 월요일이 아닌 경우에는 422 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
    """
    # 주간 보고서의 기준 날짜가 해당 주의 월요일인지 확인한다.
    if weekly_period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 weekly_period_start는 월요일이어야 합니다.")

    try:
        # 직원 테이블을 연결해 보고서와 필수 직원 이름을 함께 반환한다.
        reports = db.query(Reports, Employees.name.label("employee_name")).join(Employees, Reports.employee_id == Employees.id).filter(or_(and_(Reports.report_type == "DAILY",Reports.period_start == daily_period_start,),and_(Reports.report_type == "WEEKLY",Reports.period_start == weekly_period_start,),)).all()
        return [
            {**ReportInDBBase.model_validate(report).model_dump(), "employee_name": employee_name}
            for report, employee_name in reports
        ]
   
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        raise HTTPException(status_code=504,detail="보고서 상태 조회 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        raise HTTPException(status_code=500,detail="보고서 상태 조회 중 데이터베이스 오류가 발생했습니다.",) from exc


@router.get("/daily/calendar-status", response_model=list[ReportCalendarStatus],)
def read_daily_report_calendar_status(
    employee_id: int = Query(..., description="직원 ID"),
    start_date: date = Query(..., description="조회 시작일"),
    end_date: date = Query(..., description="조회 종료일"),
    db: Session = Depends(get_db),
) -> list[ReportCalendarStatus]:
    """
    일일 업무 보고 달력의 작성 상태를 기간 기준으로 조회한다.
    """

    if start_date > end_date:
        raise HTTPException(status_code=422, detail="조회 종료일은 시작일보다 빠를 수 없습니다.",)

    try:
        reports = (
            db.query(Reports)
            .options(load_only(Reports.id, Reports.period_start, Reports.submitted,),)
            .filter(
                Reports.employee_id == employee_id,
                Reports.report_type == "DAILY",
                Reports.period_start >= start_date,
                Reports.period_start <= end_date,
            )
            .order_by(Reports.period_start.asc())
            .all()
        )

        return reports

    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=("일일 보고서 달력 상태 조회 중 데이터베이스 연결 시간이 초과되었습니다."),) from exc

    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail="일일 보고서 달력 상태 조회 중 데이터베이스 오류가 발생했습니다.",) from exc

@router.post("/export/download")
def export_reports(
    export_in: ReportExportRequest,
    db: Session = Depends(get_db),
):
    """
    선택한 여러 주차와 여러 직원의 업무 보고서를 다운로드한다.

    - 한 주만 선택하고 일반 첨부파일이 없으면 PDF 반환
    - 여러 주차를 선택하면 하나의 ZIP 반환
    - 첨부파일 포함 시 reportFile만 ZIP에 포함
    - reportImage는 항상 각 PDF 본문에 포함
    """

    # 다운로드할 주차가 하나 이상 필요하다.
    if not export_in.week_starts:
        raise HTTPException(
            status_code=422,
            detail="하나 이상의 주차를 선택해야 합니다.",
        )

    # 다운로드할 직원이 하나 이상 필요하다.
    if not export_in.employee_ids:
        raise HTTPException(
            status_code=422,
            detail="하나 이상의 대상자를 선택해야 합니다.",
        )

    # 일일/주간 보고가 모두 해제되면 다운로드할 대상이 없다.
    if (
        not export_in.include_daily
        and not export_in.include_weekly
    ):
        raise HTTPException(
            status_code=422,
            detail=(
                "일일 보고 또는 주간 보고 중 "
                "하나 이상을 선택해야 합니다."
            ),
        )

    # 중복된 주차와 직원 ID를 제거하고 정렬한다.
    week_starts = sorted(set(export_in.week_starts))
    employee_ids = sorted(set(export_in.employee_ids))

    # 선택된 전체 기간의 시작일과 종료일
    export_start_date = week_starts[0]
    export_end_date = (week_starts[-1] + timedelta(days=4))

    # 사용자가 선택한 직원 전체를 조회한다.
    # 보고서를 하나도 작성하지 않은 직원도 PDF에 표시하기 위해
    # 보고서 조회와 별도로 직원 목록을 가져온다.
    selected_employees = (
        db.query(
            Employees.id,
            Employees.name,
        )
        .filter(
            Employees.id.in_(
                employee_ids
            )
        )
        .order_by(
            Employees.name.asc()
        )
        .all()
    )

    selected_employee_items = [
        (
            employee_id,
            employee_name,
        )
        for employee_id, employee_name
        in selected_employees
    ]

    # 선택한 직원들의 다운로드 기간 내 휴가를 조회한다.
    selected_leaves = (
        db.query(Leaves)
        .filter(
            Leaves.employee_id.in_(employee_ids),
            Leaves.start_date <= export_end_date,
            Leaves.end_date >= export_start_date,
        )
        .all()
    )

    # 직원별 휴가 날짜를 Set으로 정리한다.
    leave_dates_by_employee: dict[int, set[date],] = defaultdict(set)

    for leave in selected_leaves:
        # 휴가 모델의 날짜가 datetime인 경우 PDF 비교용 date로 변환한다.
        leave_start_date = (leave.start_date.date() if isinstance(leave.start_date, datetime) else leave.start_date)
        leave_end_date = (leave.end_date.date() if isinstance(leave.end_date, datetime) else leave.end_date)

        # 다운로드 기간과 실제 휴가 기간이 겹치는 날짜만 사용한다.
        current_date = max(leave_start_date, export_start_date,)
        leave_end_date = min(leave_end_date, export_end_date,)
        while current_date <= leave_end_date:
            leave_dates_by_employee[leave.employee_id].add(current_date)
            current_date += timedelta(days=1)

    # 선택한 모든 주차의 월~금 날짜를 수집한다.
    report_dates = {
        week_start + timedelta(days=day_offset)
        for week_start in week_starts
        for day_offset in range(5)
    }

    holiday_dates: set[date] = set()

    for report_date in report_dates:
        try:
            if asyncio.run(is_korean_holiday(report_date)):
                holiday_dates.add(report_date)
        except (RuntimeError, ValueError, httpx.HTTPError,):
            # 공휴일 조회 실패 때문에 보고서 다운로드 전체가 실패하지 않도록 일반 평일로 처리함.
            continue

    # 모든 주차의 기준일이 월요일인지 확인함.
    for week_start in week_starts:
        if week_start.weekday() != 0:
            raise HTTPException(
                status_code=422,
                detail=("모든 week_start는 월요일이어야 합니다."),
            )

    # 선택한 모든 주차를 한 번의 DB 조회로 가져오기 위한 기간/보고 유형 조건을 생성함.
    report_conditions = []

    for week_start in week_starts:
        week_end = (week_start + timedelta(days=4))

        if export_in.include_daily:
            report_conditions.append(
                and_(
                    Reports.report_type == "DAILY",
                    Reports.period_start >= week_start,
                    Reports.period_start <= week_end,
                )
            )

        if export_in.include_weekly:
            report_conditions.append(
                and_(
                    Reports.report_type == "WEEKLY",
                    Reports.period_start == week_start,
                )
            )

    try:
        # 선택된 직원의 선택된 주차 보고서만 한 번에 조회한다.
        reports = (
            db.query(
                Reports,
                Employees.name.label("employee_name"),
            )
            .join(
                Employees,
                Reports.employee_id == Employees.id,
            )
            .filter(
                Reports.employee_id.in_(employee_ids),
                or_(*report_conditions),
            )
            .order_by(
                Employees.name.asc(),
                Reports.period_start.asc(),
                Reports.id.asc(),
            )
            .all()
        )

    except TimeoutError as exc:
        raise HTTPException(
            status_code=504,
            detail=(
                "보고서 다운로드 대상 조회 중 데이터베이스 연결 시간이 초과되었습니다."
            ),
        ) from exc

    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "보고서 다운로드 대상 조회 중 데이터베이스 오류가 발생했습니다."
            ),
        ) from exc

    # 주차별로 보고서를 나누기 위한 기본 구조를 만든다.
    reports_by_week = {week_start: [] for week_start in week_starts}

    for report, employee_name in reports:
        if report.report_type == "WEEKLY":
            report_week_start = (report.period_start)

        else:
            # 일일 보고 날짜가 속한 주의 월요일 계산
            report_week_start = (report.period_start - timedelta(days=report.period_start.weekday()))

        if report_week_start in reports_by_week:
            reports_by_week[
                report_week_start
            ].append((report, employee_name,))

    # 각 주차별 PDF와 일반 첨부파일 정보를 저장한다.
    export_weeks = []

    for week_start in week_starts:
        week_end = (week_start  + timedelta(days=4))

        week_reports = reports_by_week[week_start]

        pdf_bytes = create_report_pdf(
            week_start,
            week_end,
            week_reports,
            selected_employee_items,
            export_in.include_daily,
            export_in.include_weekly,
            holiday_dates,
            leave_dates_by_employee,
        )
        pdf_file_name = (
            f"work_report_"
            f"{week_start.isoformat()}_"
            f"{week_end.isoformat()}.pdf"
        )

        attachment_entries = []

        # 일반 첨부파일 포함을 선택한 경우에만
        # reportFile 노드를 찾아 ZIP 대상에 추가한다.
        if export_in.include_attachments:
            for (
                report,
                employee_name,
            ) in week_reports:
                stack = (
                    [report.content]
                    if report.content
                    else []
                )

                file_index = 0

                while stack:
                    node = stack.pop()
                    if not isinstance(node,  dict,):
                        continue
                    attrs = (node.get("attrs") or {})

                    if (node.get("type") == "reportFile"):
                        file_name = str(attrs.get("name") or "첨부파일")
                        file_href = attrs.get("href")

                        file_path = (resolve_report_attachment_path(file_href))

                        if file_path is None:
                            raise HTTPException(
                                status_code=500,
                                detail=("첨부파일을 찾을 수 없습니다: " f"{file_name}"),
                            )

                        file_index += 1

                        safe_employee_name = (
                            str(employee_name)
                            .replace("/", "_")
                            .replace("\\", "_")
                        )

                        safe_file_name = Path(file_name.replace("\\", "/",)).name

                        report_type_name = (
                            "주간보고"
                            if report.report_type
                            == "WEEKLY"
                            else "일일보고"
                        )

                        archive_name = (
                            f"첨부파일/"
                            f"{safe_employee_name}/"
                            f"{report_type_name}/"
                            f"{report.period_start.isoformat()}/"
                            f"{file_index:02d}_"
                            f"{safe_file_name}"
                        )

                        attachment_entries.append((file_path, archive_name,))

                    # 중첩된 목록 안의 파일도 찾는 경우를 위해 재귀적으로 탐색
                    stack.extend(reversed(node.get("content") or []))

        export_weeks.append(
            {
                "week_start": week_start,
                "week_end": week_end,
                "pdf_bytes": pdf_bytes,
                "pdf_file_name": pdf_file_name,
                "attachments": attachment_entries,
            }
        )

    # 한 주만 선택했고 일반 첨부파일도 없다면 기존처럼 PDF 하나를 바로 반환함.
    if (
        len(export_weeks) == 1
        and not export_weeks[0][
            "attachments"
        ]
    ):
        export_week = export_weeks[0]

        return Response(
            content=export_week["pdf_bytes"],
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    (
                        'attachment; filename="'
                        f'{export_week["pdf_file_name"]}'
                        '"'
                    ),
            },
        )

    # 여러 주차를 선택했거나 일반 첨부파일이 존재하면 모든 결과를 하나의 ZIP으로 묶음.
    zip_buffer = BytesIO()

    with ZipFile(
        zip_buffer,
        "w",
        ZIP_DEFLATED,
    ) as zip_file:
        for export_week in export_weeks:
            week_folder = (
                f"{export_week['week_start'].isoformat()}_"
                f"{export_week['week_end'].isoformat()}"
            )

            zip_file.writestr(
                (
                    f"{week_folder}/"
                    f"{export_week['pdf_file_name']}"
                ),
                export_week["pdf_bytes"],
            )

            for (
                file_path,
                archive_name,
            ) in export_week["attachments"]:
                zip_file.write(
                    file_path,
                    arcname=(f"{week_folder}/" f"{archive_name}"),
                )

    zip_bytes = zip_buffer.getvalue()
    zip_buffer.close()

    first_week = export_weeks[0]
    last_week = export_weeks[-1]

    zip_file_name = (
        f"work_reports_"
        f"{first_week['week_start'].isoformat()}_"
        f"{last_week['week_end'].isoformat()}.zip"
    )

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition":
                (
                    'attachment; filename="'
                    f"{zip_file_name}"
                    '"'
                ),
        },
    )

@router.get("/{report_type}", response_model=Optional[ReportInDBBase])
def read_report(report_type: Literal["daily", "weekly"],employee_id: int = Query(..., description="직원 ID"),period_start: date = Query(..., description="보고 대상 날짜 또는 주 시작일"),db: Session = Depends(get_db),) -> Optional[ReportInDBBase]:
    """
        summary : 일일/주간 보고서 조회 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - employee_id (int) : 조회할 직원 ID
            - period_start (date) : 보고 대상 날짜 또는 주 시작일
            - db (Session) : DB 세션

        desc :
            - 보고 유형과 기준 날짜로 일일 또는 주간 보고서를 조회
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 요청한 조건에 해당하는 보고서가 존재하지 않는 경우에는 404 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
    """
    # 경로의 보고 유형을 데이터베이스 조회에 사용하는 대문자 형식으로 변환한다.
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 주간 보고서의 기준 날짜가 해당 주의 월요일인지 확인한다.
    if normalized_report_type == "WEEKLY" and period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 period_start는 월요일이어야 합니다.")

    try:
        # 요청한 직원·보고 유형·기준 날짜를 사용해 보고서를 조회한다.
        report = db.query(Reports).filter(Reports.employee_id == employee_id,Reports.report_type == normalized_report_type,Reports.period_start == period_start,).first()

        # 주간 보고서가 없으면 정상 빈 응답, 일일 보고서가 없으면 기존처럼 404 반환
        if report is None and normalized_report_type == "WEEKLY":
            return None

        if report is None:
            raise HTTPException(status_code=404,detail=f"해당 직원과 날짜의 {report_name} 보고서를 찾을 수 없습니다.")

        return report

    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 조회 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 조회 중 데이터베이스 오류가 발생했습니다.",) from exc


@router.put("/{report_type}/{report_id}", response_model=ReportInDBBase)
async def update_report(report_type: Literal["daily", "weekly"],report_id: int,request: Request,db: Session = Depends(get_db),) -> ReportInDBBase:
    """
        summary : 일일/주간 보고서 수정 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - report_id (int) : 수정할 보고서 ID
            - request (Request) : 보고서 JSON 또는 첨부 파일이 포함된 FormData
            - db (Session) : DB 세션

        desc :
            - 보고 유형과 ID로 일일 또는 주간 보고서를 수정
            - 주간 보고서는 해당 주의 월요일, 일일 보고서는 선택한 날짜를 period_start로 사용
            - 요청한 보고 유형과 ID에 해당하는 보고서가 존재하지 않는 경우에는 404 에러를 반환
            - 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과 시에는 504 에러를 반환
            - 그 밖의 SQLAlchemy 데이터베이스 오류 발생 시에는 500 에러를 반환
            - 새 첨부 파일을 드롭 위치에 연결하고 기존 본문 첨부는 유지
    """
    # JSON 요청과 파일이 포함된 FormData 요청을 같은 수정 모델로 검증한다.
    files: list[UploadFile] = []
    upload_ids: list[str] = []
    if request.headers.get('content-type', '').startswith('multipart/form-data'):
        form = await request.form()
        try:
            payload = json.loads(str(form.get('report')))
            report_in = ReportUpdateBase.model_validate(payload)
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc
        files = form.getlist('files')
        upload_ids = [str(value) for value in form.getlist('upload_ids')]
    else:
        try:
            report_in = ReportUpdateBase.model_validate(await request.json())
        except (ValueError, TypeError) as exc:
            raise HTTPException(status_code=422, detail='보고서 요청 형식이 올바르지 않습니다.') from exc

    # 새 첨부 ID가 본문 노드와 일치하는지 확인하고 파일을 준비한다.
    if len(files) != len(upload_ids) or len(set(upload_ids)) != len(upload_ids) or len(files) > MAX_ATTACHMENT_COUNT:
        raise HTTPException(status_code=422, detail='첨부 파일 목록이 올바르지 않습니다.')
    pending_nodes = {}
    stack = [report_in.content] if report_in.content else []
    while stack:
        node = stack.pop()
        if isinstance(node, dict):
            attrs = node.get('attrs') or {}
            if attrs.get('uploadId'):
                if attrs['uploadId'] in pending_nodes:
                    raise HTTPException(status_code=422, detail='첨부 파일 ID가 중복되었습니다.')
                pending_nodes[attrs['uploadId']] = node
            stack.extend(node.get('content') or [])
    if set(pending_nodes) != set(upload_ids):
        raise HTTPException(status_code=422, detail='본문과 첨부 파일 목록이 일치하지 않습니다.')

    attachments = []
    for file, upload_id in zip(files, upload_ids):
        content = await file.read(MAX_ATTACHMENT_SIZE + 1)
        if not content or len(content) > MAX_ATTACHMENT_SIZE:
            raise HTTPException(status_code=400, detail='첨부 파일은 각각 10MB 이하만 허용됩니다.')
        node = pending_nodes[upload_id]
        if node.get('type') == 'reportImage':
            try:
                image = Image.open(BytesIO(content))
                image.verify()
                image_format = image.format
            except Exception as exc:
                raise HTTPException(status_code=400, detail='이미지 파일 형식이 올바르지 않습니다.',) from exc

            original_extension = Path((file.filename or '').replace('\\', '/')).suffix.lower()

            allowed_extensions = IMAGE_EXTENSIONS_BY_FORMAT.get(image_format)

            if (allowed_extensions is None or original_extension not in allowed_extensions):
                raise HTTPException(
                    status_code=400,
                    detail='PNG, JPG, JPEG, GIF, WebP 이미지만 허용됩니다.',
                )

            extension = original_extension
            target_attr = 'src'
        elif node.get('type') == 'reportFile':
            extension = Path((file.filename or '').replace('\\', '/')).suffix.lower()
            if extension not in ALLOWED_FILE_EXTENSIONS:
                raise HTTPException(status_code=400, detail='지원하지 않는 첨부 파일 형식입니다.')
            target_attr = 'href'
        else:
            raise HTTPException(status_code=422, detail='본문 첨부 노드가 올바르지 않습니다.')
        file_path = Path('uploads/report_attachments') / f'{uuid4()}{extension}'
        attachments.append((file_path, content, node, target_attr))

    # 경로의 보고 유형을 데이터베이스 조회에 사용하는 대문자 형식으로 변환한다.
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 수정할 주간 기준 날짜가 해당 주의 월요일인지 확인한다.
    if normalized_report_type == "WEEKLY" and report_in.period_start is not None and report_in.period_start.weekday() != 0:
        raise HTTPException(status_code=422,detail="주간 보고서의 period_start는 월요일이어야 합니다.")

    # 요청한 보고 유형과 ID를 사용해 수정할 보고서를 조회한다.
    report = db.query(Reports).filter(Reports.id == report_id,Reports.report_type == normalized_report_type,).first()

    # 요청한 보고 유형과 ID에 해당하는 보고서가 존재하지 않으면 404 에러 반환
    if report is None:
        raise HTTPException(status_code=404,detail=f"해당 ID의 {report_name} 보고서를 찾을 수 없습니다.")

    # 새 파일 주소를 드롭 위치의 노드에 넣고 보고서 필드를 업데이트한다.
    saved_paths = []
    try:
        if attachments:
            Path('uploads/report_attachments').mkdir(parents=True, exist_ok=True)
        for file_path, content, node, target_attr in attachments:
            saved_paths.append(file_path)
            file_path.write_bytes(content)
            node['attrs'][target_attr] = f'/uploads/report_attachments/{file_path.name}'
            node['attrs'].pop('uploadId', None)
    except OSError as exc:
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail='보고서 첨부 파일 저장에 실패했습니다.') from exc

    for field, value in report_in.model_dump(exclude_unset=True).items():
        setattr(report, field, value)

    try:
        # 변경된 보고서를 저장한다.
        db.commit()
    except TimeoutError as exc:
        # 데이터베이스 연결 또는 커넥션 풀 대기 시간 초과를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=504,detail=f"{report_name} 보고서 수정 중 데이터베이스 연결 시간이 초과되었습니다.",) from exc
    except IntegrityError as exc:
        # 데이터베이스 무결성 제약 조건 위반을 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=409,detail="데이터베이스 무결성 제약 조건 위반.") from exc
    except SQLAlchemyError as exc:
        # 그 밖의 SQLAlchemy 데이터베이스 오류를 처리한다.
        db.rollback()
        for file_path in saved_paths:
            file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500,detail=f"{report_name} 보고서 수정 중 데이터베이스 오류가 발생했습니다.",) from exc

    # 업데이트된 보고서를 다시 불러온다.
    db.refresh(report)
    return report

@router.delete("/{report_type}/{report_id}", status_code=204)
def delete_report(
    report_type: Literal["daily", "weekly"],
    report_id: int,
    db: Session = Depends(get_db),
):
    """
        summary : 일일/주간 보고서 삭제 함수

        arg :
            - report_type (Literal["daily", "weekly"]) : 보고 유형
            - report_id (int) : 삭제할 보고서 ID
            - db (Session) : DB 세션

        desc :
            - 보고 유형과 ID로 일일 또는 주간 보고서를 삭제
            - 요청한 보고서가 존재하지 않는 경우에는 404 에러를 반환
            - 보고서 삭제 후 연결된 첨부 파일도 함께 삭제
            - 데이터베이스 오류 발생 시에는 해당 상태 코드의 에러를 반환
    """
    normalized_report_type = report_type.upper()
    report_name = "주간" if normalized_report_type == "WEEKLY" else "일일"

    # 요청한 보고 유형과 ID를 사용해 삭제할 보고서를 조회한다.
    report = (
        db.query(Reports)
        .filter(Reports.id == report_id, Reports.report_type == normalized_report_type,)
        .first()
    )

    if report is None:
        raise HTTPException(status_code=404, detail=f"해당 ID의 {report_name} 보고서를 찾을 수 없습니다.",)

    # 보고서 본문에 연결된 첨부 파일 경로를 수집한다.
    attachment_paths: list[Path] = []
    stack = [report.content] if report.content else []

    while stack:
        node = stack.pop()

        if not isinstance(node, dict):
            continue

        attrs = node.get("attrs") or {}

        for key in ("src", "href"):
            file_url = attrs.get(key)

            if (
                isinstance(file_url, str)
                and file_url.startswith("/uploads/report_attachments/")
            ):
                attachment_paths.append(Path("uploads/report_attachments") / Path(file_url).name)

        stack.extend(node.get("content") or [])

    try:
        # 보고서를 삭제하고 변경사항을 데이터베이스에 반영한다.
        db.delete(report)
        db.commit()

    except TimeoutError as exc:
        db.rollback()
        raise HTTPException(
            status_code=504,
            detail=f"{report_name} 보고서 삭제 중 데이터베이스 연결 시간이 초과되었습니다.",
        ) from exc

    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"{report_name} 보고서 삭제 중 데이터베이스 오류가 발생했습니다.",
        ) from exc

    # DB 삭제가 정상적으로 완료된 뒤 연결된 첨부 파일을 정리한다.
    for file_path in attachment_paths:
        try:
            file_path.unlink(missing_ok=True)
        except OSError:
            continue

    return Response(status_code=204)
