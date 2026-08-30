"""Task 데이터베이스 모델에 필요한 컬럼이 정확히 정의되어 있는지 확인"""
from app.models.tasks import Task


def test_task_model_has_expected_columns():
    """Task 모델에 필요한 기본 컬럼이 정의되어 있는지 확인"""

    # SQLAlchemy가 가지고 있는 tasks 테이블의 메타데이터의 컬럼 정보 가져오기
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

    # Task 모델의 컬럼 구성이 정확히 설계와 같아야 함
    assert expected_columns == set(columns.keys())
