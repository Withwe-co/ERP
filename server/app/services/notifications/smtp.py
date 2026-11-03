import logging
import smtplib
import ssl
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import EmailMessage
from html import escape
from pathlib import Path
from string import Template
from typing import Any, Mapping, Optional, Tuple
from zoneinfo import ZoneInfo

from app.core.database import SessionLocal
from app.models.email_notification_log import EmailNotificationLog


logger = logging.getLogger(__name__)
KST = ZoneInfo("Asia/Seoul")
PURCHASE_REQUEST_TEMPLATE = (
    Path(__file__).resolve().parent / "template" / "purchase_request_message.html"
)


@dataclass(frozen=True)
class SMTPConfig:
    enabled: bool
    host: str
    port: int
    username: str
    password: str
    from_email: str
    recipients: Tuple[str, ...]
    use_tls: bool = True
    use_ssl: bool = False
    timeout: float = 10.0

    @classmethod
    def from_settings(cls, settings: Any) -> "SMTPConfig":
        recipients = tuple(
            address.strip()
            for address in settings.SMTP_RECIPIENTS.split(",")
            if address.strip()
        )
        return cls(
            enabled=settings.SMTP_ENABLED,
            host=settings.SMTP_HOST.strip(),
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME.strip(),
            password=settings.SMTP_PASSWORD,
            from_email=settings.SMTP_FROM_EMAIL.strip(),
            recipients=recipients,
            use_tls=settings.SMTP_USE_TLS,
            use_ssl=settings.SMTP_USE_SSL,
        )

    def is_complete(self) -> bool:
        return bool(self.host and self.port and self.from_email and self.recipients)


class SMTPEmailService:
    def __init__(self, config: SMTPConfig) -> None:
        self.config = config

    def send_purchase_request(self, payload: Mapping[str, Any]) -> bool:
        request_number = str(payload.get("request_number") or "unknown")
        if not self.config.enabled:
            logger.info("SMTP email disabled request_number=%s", request_number)
            return False
        if not self.config.is_complete():
            logger.error("SMTP configuration incomplete request_number=%s", request_number)
            return False

        subject = f"[구매 요청] {request_number}"
        content = self._build_log_content(payload)
        html_content: Optional[str] = None
        try:
            message = self._build_message(payload)
            html_part = message.get_body(preferencelist=("html",))
            if html_part is not None:
                html_content = html_part.get_content()
            self._send(message)
        except Exception as exc:
            logger.exception("SMTP email failed request_number=%s", request_number)
            self._save_log(
                request_number=request_number,
                subject=subject,
                content=content,
                html_content=html_content,
                status="FAILED",
                error_message=str(exc),
            )
            return False

        self._save_log(
            request_number=request_number,
            subject=subject,
            content=content,
            html_content=html_content,
            status="SUCCESS",
        )

        logger.info(
            "SMTP email sent request_number=%s recipient_count=%s",
            request_number,
            len(self.config.recipients),
        )
        return True

    def _build_log_content(self, payload: Mapping[str, Any]) -> str:
        return (
            f"품목명: {payload.get('item_name') or '-'}\n"
            f"요청 번호: {payload.get('request_number') or '-'}\n"
            f"수량: {payload.get('quantity') or '-'} {payload.get('unit') or ''}\n"
            f"예상금액: {self._format_budget(payload.get('total_budget'))}\n"
            f"긴급도: {payload.get('urgency') or '-'}\n"
            f"요청자: {payload.get('requester_name') or '-'}\n"
            f"부서: {payload.get('department') or '-'}\n"
            f"등록시각: {self._format_date(payload.get('request_date'))}\n"
            f"구매사유: {payload.get('justification') or '-'}\n"
            f"링크: {payload.get('detail_url') or '-'}"
        )

    def _save_log(
        self,
        *,
        request_number: str,
        subject: str,
        content: str,
        html_content: Optional[str],
        status: str,
        error_message: Optional[str] = None,
    ) -> None:
        db = SessionLocal()
        try:
            db.add(
                EmailNotificationLog(
                    request_number=request_number,
                    recipients=",".join(self.config.recipients),
                    subject=subject,
                    content=content,
                    html_content=html_content,
                    status=status,
                    error_message=error_message,
                )
            )
            db.commit()
        except Exception:
            db.rollback()
            logger.exception(
                "Failed to save SMTP log request_number=%s", request_number
            )
        finally:
            db.close()

    def _build_message(self, payload: Mapping[str, Any]) -> EmailMessage:
        request_number = str(payload.get("request_number") or "-")
        message = EmailMessage()
        message["Subject"] = f"[구매 요청] {request_number}"
        message["From"] = self.config.from_email
        message["To"] = ", ".join(self.config.recipients)
        #message.set_content(
        #    "[NAS ERP 구매요청 안내]\n"
        #    "신규 구매요청이 등록되었습니다.\n"
        #    f"품목명 : {payload.get('item_name') or '-'}\n"
        #    f"요청 번호 : {request_number}\n"
        #    f"수량 : {payload.get('quantity') or '-'} {payload.get('unit') or ''}\n"
        #    f"예상금액 : {self._format_budget(payload.get('total_budget'))}\n"
        #    f"긴급도 : {payload.get('urgency') or '-'}\n"
        #    f"요청자 : {payload.get('requester_name') or '-'}\n"
        #    f"부서 : {payload.get('department') or '-'}\n"
        #    f"등록시각 : {self._format_date(payload.get('request_date'))}\n"
        #    f"{payload.get('justification') or '-'}\n"
        #)
        template = Template(PURCHASE_REQUEST_TEMPLATE.read_text(encoding="utf-8"))
        template_data = {
            "request_number": escape(request_number),
            "item_name": escape(str(payload.get("item_name") or "-")),
            "quantity": escape(
                f"{payload.get('quantity') or '-'} {payload.get('unit') or ''}".strip()
            ),
            "total_budget": escape(
                self._format_budget(payload.get("total_budget"))
            ),
            "urgency": escape(str(payload.get("urgency") or "-")),
            "requester_name": escape(
                str(payload.get("requester_name") or "-")
            ),
            "department": escape(str(payload.get("department") or "-")),
            "request_date": escape(
                self._format_date(payload.get("request_date"))
            ),
            "justification": escape(
                str(payload.get("justification") or "-")
            ),
            "detail_url": escape(
                str(payload.get("detail_url") or "#"), quote=True
            ),
        }
        html_content = template.substitute(template_data)
        plain_text = (
            "[NAS ERP 구매요청 안내]\n"
            "신규 구매요청이 등록되었습니다.\n"
            f"품목명 : {payload.get('item_name') or '-'}\n"
            f"요청 번호 : {request_number}\n"
            f"수량 : {payload.get('quantity') or '-'} {payload.get('unit') or ''}\n"
            f"예상금액 : {self._format_budget(payload.get('total_budget'))}\n"
            f"긴급도 : {payload.get('urgency') or '-'}\n"
            f"요청자 : {payload.get('requester_name') or '-'}\n"
            f"부서 : {payload.get('department') or '-'}\n"
            f"등록시각 : {self._format_date(payload.get('request_date'))}\n"
            f"{payload.get('justification') or '-'}\n"
        )
        message.set_content(plain_text)
        message.add_alternative(html_content, subtype="html")
        return message

    def _send(self, message: EmailMessage) -> None:
        context = ssl.create_default_context()
        smtp: Optional[smtplib.SMTP] = None
        try:
            if self.config.use_ssl:
                smtp = smtplib.SMTP_SSL(
                    self.config.host,
                    self.config.port,
                    timeout=self.config.timeout,
                    context=context,
                )
            else:
                smtp = smtplib.SMTP(
                    self.config.host, self.config.port, timeout=self.config.timeout
                )
                if self.config.use_tls:
                    smtp.starttls(context=context)

            if self.config.username:
                smtp.login(self.config.username, self.config.password)
            smtp.send_message(message)
        finally:
            if smtp is not None:
                try:
                    smtp.quit()
                except smtplib.SMTPException:
                    smtp.close()

    @staticmethod
    def _format_budget(value: Any) -> str:
        if value is None or value == "":
            return "-"
        try:
            return f"{float(value):,.0f}원"
        except (TypeError, ValueError):
            return str(value)

    @staticmethod
    def _format_date(value: Any) -> str:
        if isinstance(value, datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            return value.astimezone(KST).strftime("%Y-%m-%d %H:%M")
        return str(value or "-")
