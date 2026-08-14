import logging
from dataclasses import dataclass
from typing import Any, Mapping, Optional, Tuple
from app.core.config import settings
from .formatter import build_template_parameters
from .provider_nhncloud import (
    AlimtalkProviderError,
    AlimtalkSendResult,
    NHNCloudAlimtalkProvider,
)


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class NotificationConfig:
    enabled: bool
    public_base_url: str
    app_key: str
    secret_key: str
    sender_key: str
    template_code: str
    recipients: Tuple[str, ...]

    @classmethod
    def create(cls, *, enabled: bool, public_base_url: str, app_key: str,
               secret_key: str, sender_key: str, template_code: str,
               recipients: str) -> "NotificationConfig":
        normalized = tuple(
            number.strip().replace("-", "").replace(" ", "")
            for number in recipients.split(",") if number.strip()
        )
        return cls(
            enabled=enabled,
            public_base_url=public_base_url.strip(),
            app_key=app_key.strip(),
            secret_key=secret_key.strip(),
            sender_key=sender_key.strip(),
            template_code=template_code.strip(),
            recipients=normalized,
        )

    def is_complete(self) -> bool:
        return bool(self.public_base_url and self.app_key and self.secret_key
                    and self.sender_key and self.template_code and self.recipients)

    @classmethod
    def from_settings(cls, settings: Any) -> "NotificationConfig":
        return cls.create(
            enabled=settings.NOTIFICATION_ENABLED,
            public_base_url=settings.ERP_PUBLIC_BASE_URL,
            app_key=settings.KAKAO_ALIMTALK_APP_KEY,
            secret_key=settings.KAKAO_ALIMTALK_SECRET_KEY,
            sender_key=settings.KAKAO_ALIMTALK_SENDER_KEY,
            template_code=settings.KAKAO_ALIMTALK_TEMPLATE_CODE,
            recipients=settings.KAKAO_ALIMTALK_RECIPIENTS,
        )


class AlimtalkNotificationService:
    def __init__(self, config: NotificationConfig,
                 provider: Optional[NHNCloudAlimtalkProvider] = None) -> None:
        self.config = config
        self.provider = provider or NHNCloudAlimtalkProvider(
            config.app_key, config.secret_key, timeout=5.0
        )

    def send(self, payload: Mapping[str, Any]) -> Optional[AlimtalkSendResult]:
        request_number = str(payload.get("request_number") or "unknown")
        if not self.config.enabled:
            logger.info("Alimtalk disabled request_number=%s", request_number)
            return None
        if not self.config.is_complete():
            logger.error("Alimtalk configuration incomplete request_number=%s", request_number)
            return None
        if payload.get("id") is None:
            logger.error("Alimtalk payload missing id request_number=%s", request_number)
            return None

        try:
            parameters = build_template_parameters(payload, self.config.public_base_url)
            result = self._send_with_retry(payload, parameters)
        except Exception as exc:
            logger.error(
                "Alimtalk failed request_number=%s error_type=%s",
                request_number, type(exc).__name__,
            )
            return None

        logger.info(
            "Alimtalk sent request_number=%s recipient_count=%s",
            request_number, result.recipient_count,
        )
        return result

    def _send_with_retry(self, payload: Mapping[str, Any],
                         parameters: Mapping[str, str]) -> AlimtalkSendResult:
        for attempt in range(2):
            try:
                return self.provider.send(
                    sender_key=self.config.sender_key,
                    template_code=self.config.template_code,
                    recipients=list(self.config.recipients),
                    template_parameters=parameters,
                    idempotency_key=f"purchase-request-{payload['id']}",
                )
            except AlimtalkProviderError as exc:
                if not exc.retryable or attempt == 1:
                    raise
                logger.warning(
                    "Alimtalk transient failure; retrying request_number=%s",
                    payload.get("request_number", "unknown"),
                )
        raise RuntimeError("unreachable")


notification_config = NotificationConfig.from_settings(settings)
notification_service = AlimtalkNotificationService(notification_config)