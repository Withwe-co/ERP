"""Slack 일일 태스크 조회 및 메시지 생성 서비스."""

from collections import defaultdict
from datetime import date

from sqlalchemy.orm import Session

from app.models.projects import Project
from app.models.tasks import Task
from app.services.slack_service import send_slack_message


def get_daily_tasks(
    db: Session,
    target_date: date,
) -> list[Task]:
    """지정한 날짜에 진행 대상인 S/W 개발팀 태스크를 조회한다."""

    rows = (
        db.query(
            Task,
            Project.project_name,
        )
        .outerjoin(
            Project,
            Task.project_id == Project.id,
        )
        .filter(
            Task.status.in_(["TODO", "IN_PROGRESS"]),
            Task.is_archived.is_(False),
            Task.department == "S/W 개발팀",
            Task.planned_start_date <= target_date,
            Task.planned_end_date >= target_date,
        )
        .order_by(Task.id.asc())
        .all()
    )

    tasks = []

    for task, project_name in rows:
        task.project_name = project_name or "-"
        tasks.append(task)

    return tasks


def build_daily_task_message(
    tasks: list[Task],
    target_date: date,
) -> str:
    """태스크를 상태 > 담당자 > Due Date 순으로 Slack 메시지로 변환한다."""

    status_groups = {
        "TODO": [],
        "IN_PROGRESS": [],
    }

    for task in tasks:
        if task.status in status_groups:
            status_groups[task.status].append(task)

    lines = [
        f"📋 오늘의 태스크 ({target_date.strftime('%Y.%m.%d')})",
        "",
        "",
    ]

    status_labels = {
        "TODO": "🟡 대기 태스크",
        "IN_PROGRESS": "🔵 진행중인 태스크",
    }

    # 진행중 태스크를 먼저 표시하고 대기 태스크를 뒤에 표시
    for status in ["IN_PROGRESS", "TODO"]:
        title = status_labels[status]
        status_tasks = status_groups[status]

        lines.append(f"{title} ({len(status_tasks)}건)")
        lines.append("")

        assignee_groups = defaultdict(list)

        for task in status_tasks:
            assignee_groups[task.assignee_name].append(task)

        for assignee_name in sorted(assignee_groups):
            assignee_tasks = sorted(
                assignee_groups[assignee_name],
                key=lambda task: task.planned_end_date,
            )

            lines.append(
                f"👤 {assignee_name} ({len(assignee_tasks)}건)"
            )
            lines.append("")

            for task in assignee_tasks:
                description = format_description(task.description)

                lines.append(f"• {task.task_name}")
                lines.append(f"프로젝트: {task.project_name}")
                lines.append(
                    f"Due Date: "
                    f"{task.planned_end_date.strftime('%Y.%m.%d')}"
                )
                lines.append(f"설명: {description}")
                lines.append("")
                lines.append("")

    return "\n".join(lines).strip()

def send_daily_tasks_to_slack(
    db: Session,
    target_date: date,
    client=None,
    channel_id: str | None = None,
) -> bool:
    """오늘의 태스크를 조회하여 Slack으로 전송한다."""

    tasks = get_daily_tasks(
        db=db,
        target_date=target_date,
    )

    message = build_daily_task_message(
        tasks=tasks,
        target_date=target_date,
    )

    return send_slack_message(
        text=message,
        client=client,
        channel_id=channel_id,
    )

def format_description(
    description: str | None,
    max_length: int = 100,
) -> str:
    """Slack에 표시할 태스크 설명을 최대 길이에 맞게 변환한다."""

    if not description:
        return "-"

    if len(description) <= max_length:
        return description

    return f"{description[:max_length]}..."