"""Slack 일일 태스크 cron Job."""

from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.core.database import SessionLocal
from app.services.daily_task_service import send_daily_tasks_to_slack


def run_daily_task_job(
    target_date: date | None = None,
) -> bool:
    """오늘의 태스크를 조회하여 Slack으로 전송한다."""

    if target_date is None:
        target_date = datetime.now(
            ZoneInfo("Asia/Seoul")
        ).date()

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