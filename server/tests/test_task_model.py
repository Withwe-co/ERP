from app.models.tasks import Task


def test_task_model_has_expected_columns():
    """Task 모델에 필요한 기본 컬럼이 정의되어 있는지 확인한다."""

    columns = Task.__table__.columns

    expected_columns = {
        "id",
        "project_id",
        "wbs_code",
        "task_name",
        "description",
        "assignee_name",
        "department",
        "priority",
        "status",
        "planned_start_date",
        "planned_end_date",
        "note",
        "is_archived",
        "archived_at",
        "created_at",
        "updated_at",
    }

    assert expected_columns == set(columns.keys())