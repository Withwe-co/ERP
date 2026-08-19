from app.api.v1.api import api_router


def test_task_routes_are_registered():
    """Task API가 실제 v1 API Router에 등록되어 있는지 확인한다."""

    paths = {route.path for route in api_router.routes}

    assert "/tasks/" in paths
    assert "/tasks/{task_id}" in paths