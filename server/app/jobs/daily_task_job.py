"""Slack 일일 태스크 cron Job."""

import asyncio
import logging
from datetime import date, datetime

import httpx

from zoneinfo import ZoneInfo

from app.core.database import SessionLocal
from app.services.daily_task_service import send_daily_tasks_to_slack
from app.services.holiday_service import is_korean_holiday

logger = logging.getLogger(__name__)

def run_daily_task_job(target_date: date | None = None,) -> bool:
    """오늘의 태스크를 조회하여 Slack으로 전송한다."""

    if target_date is None:
        target_date = datetime.now(ZoneInfo("Asia/Seoul")).date()

    try:
        is_holiday = asyncio.run(is_korean_holiday(target_date))
    except (RuntimeError, httpx.HTTPError, ValueError):
        logger.exception("공휴일 조회에 실패하여 Slack 알림을 계속 진행합니다.")
        is_holiday = False

    if is_holiday:
        return False

    db = SessionLocal()

    try:
        return send_daily_tasks_to_slack(
            db=db,
            target_date=target_date,
        )
    finally:
        db.close()


if __name__ == "__main__":
    run_daily_task_job()
