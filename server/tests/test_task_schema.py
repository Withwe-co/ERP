from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.tasks import TaskCreate, TaskUpdate


def valid_task_data():
    return {
        "project_id": 1,
        "wbs_id": 1,
        "task_name": "태스크 관리 기능 구현",
        "description": "태스크 기능 구현",
        "assignee_name": "홍길동",
        "department": "개발팀",
        "priority": "NORMAL",
        "status": "TODO",
        "planned_start_date": date(2026, 8, 19),
        "planned_end_date": date(2026, 8, 21),
        "progress_rate": 0,
        "note": None,
    }


def test_task_create_accepts_valid_data():
    task = TaskCreate(**valid_task_data())

    assert task.task_name == "태스크 관리 기능 구현"
    assert task.priority == "NORMAL"
    assert task.status == "TODO"
    assert task.progress_rate == 0


def test_task_create_rejects_progress_rate_over_100():
    data = valid_task_data()
    data["progress_rate"] = 101

    with pytest.raises(ValidationError):
        TaskCreate(**data)


def test_task_create_rejects_invalid_priority():
    data = valid_task_data()
    data["priority"] = "MEDIUM"

    with pytest.raises(ValidationError):
        TaskCreate(**data)


def test_task_create_rejects_invalid_status():
    data = valid_task_data()
    data["status"] = "COMPLETED"

    with pytest.raises(ValidationError):
        TaskCreate(**data)


def test_task_update_allows_partial_data():
    task = TaskUpdate(progress_rate=50)

    assert task.progress_rate == 50