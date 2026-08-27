from dataclasses import dataclass
from typing import Any, Dict, List, Mapping, Optional

import httpx


API_BASE_URL = "https://kakaotalk-bizmessage.api.nhncloudservice.com"


class AlimtalkProviderError(Exception):
    def __init__(self, message: str, *, retryable: bool = False):
        super().__init__(message)
        self.retryable = retryable


@dataclass(frozen=True)
class AlimtalkSendResult:
    request_id: str
    recipient_count: int


class NHNCloudAlimtalkProvider:
    def __init__(self, app_key: str, secret_key: str, *, timeout: float = 5.0,
                 client: Optional[httpx.Client] = None) -> None:
        self.app_key = app_key
        self.secret_key = secret_key
        self.timeout = timeout
        self._client = client

    def send(self, *, sender_key: str, template_code: str,
             recipients: List[str], template_parameters: Mapping[str, str],
             idempotency_key: str) -> AlimtalkSendResult:
        url = f"{API_BASE_URL}/alimtalk/v2.2/appkeys/{self.app_key}/messages"
        headers = {
            "Content-Type": "application/json;charset=UTF-8",
            "X-Secret-Key": self.secret_key,
            "X-NC-API-IDEMPOTENCY-KEY": idempotency_key,
        }
        body = {
            "senderKey": sender_key,
            "templateCode": template_code,
            "recipientList": [
                {"recipientNo": number, "templateParameter": dict(template_parameters)}
                for number in recipients
            ],
        }
        try:
            sender = self._client.post if self._client is not None else httpx.post
            response = sender(url, headers=headers, json=body, timeout=self.timeout)
        except httpx.RequestError as exc:
            raise AlimtalkProviderError(
                "NHN Cloud connection failed", retryable=True
            ) from exc

        if response.status_code >= 400:
            retryable = response.status_code == 429 or response.status_code >= 500
            raise AlimtalkProviderError(
                f"NHN Cloud returned HTTP {response.status_code}", retryable=retryable
            )
        try:
            data: Dict[str, Any] = response.json()
        except ValueError as exc:
            raise AlimtalkProviderError("NHN Cloud returned invalid JSON") from exc

        header = data.get("header") or {}
        if header.get("isSuccessful") is not True:
            code = header.get("resultCode", "unknown")
            raise AlimtalkProviderError(f"NHN Cloud rejected request: code={code}")

        #message = data.get("message") or {}
        #send_results = message.get("sendResults") or []
        view = data.get("view") or {}
        send_results = view.get("recipientList") or []
        if len(send_results) != len(recipients):
            raise AlimtalkProviderError("NHN Cloud recipient result count mismatch")
        failed_codes = [
            item.get("resultCode") for item in send_results
            if item.get("resultCode") != 0
        ]
        if failed_codes:
            raise AlimtalkProviderError(
                f"NHN Cloud rejected recipients: result_codes={failed_codes}"
            )
        return AlimtalkSendResult(
            request_id=str(message.get("requestId") or ""),
            recipient_count=len(send_results),
        )
