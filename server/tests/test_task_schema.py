from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.tasks import TaskCreate, TaskUpdate


# 여러 테스트에서 공통으로 사용할 정상적인 태스크 데이터
def valid_task_data():
    return {
        "project_id": 1,
        "wbs_code": "1.1",
        "task_name": "태스크 관리 기능 구현",
        "description": "태스크 기능 구현",
        "assignee_name": "홍길동",
        "department": "개발팀",
        "priority": "NORMAL",
        "status": "TODO",
        "planned_start_date": date(2026, 8, 19),
        "planned_end_date": date(2026, 8, 21),
        "note": None,
    }


# 정상적인 데이터를 전달하면 TaskCreate 스키마가 생성되는지 확인
def test_task_create_accepts_valid_data():
    task = TaskCreate(**valid_task_data())

    assert task.task_name == "태스크 관리 기능 구현"
    assert task.priority == "NORMAL"
    assert task.status == "TODO"


# 허용되지 않은 우선순위를 전달하면 검증 오류가 발생하는지 확인
def test_task_create_rejects_invalid_priority():
    data = valid_task_data()

    # TaskPriority에 정의되지 않은 값
    data["priority"] = "MEDIUM"

    with pytest.raises(ValidationError):
        TaskCreate(**data)


# 허용되지 않은 상태값을 전달하면 검증 오류가 발생하는지 확인
def test_task_create_rejects_invalid_status():
    data = valid_task_data()

    # TaskStatus에 정의되지 않은 값
    data["status"] = "COMPLETED"

    with pytest.raises(ValidationError):
        TaskCreate(**data)


# TaskUpdate는 수정할 필드만 전달해도 생성되는지 확인
def test_task_update_allows_partial_data():
    task = TaskUpdate(status="IN_PROGRESS")

    assert task.status == "IN_PROGRESS"