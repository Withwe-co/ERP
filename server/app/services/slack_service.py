"""Slack 메시지 전송 서비스."""

from slack_sdk import WebClient

from app.core.config import settings


def send_slack_message(
    text: str,
    client=None,
    channel_id: str | None = None,
) -> bool:
    """지정한 Slack 채널에 메시지를 전송한다."""

    slack_client = client or WebClient(token=settings.SLACK_BOT_TOKEN)
    target_channel = channel_id or settings.SLACK_TASK_CHANNEL_ID

    response = slack_client.chat_postMessage(
        channel=target_channel,
        text=text,
    )

    return bool(response["ok"])