from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.models.projects import Project
from app.models.tasks import Task
from app.api.v1.endpoints.tasks import router


# 테스트용 SQLite DB
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base.metadata.create_all(bind=engine)


# 테스트용 DB 세션 주입
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# 실제 main.py를 사용하지 않고 테스트용 FastAPI 앱 생성
app = FastAPI()
app.include_router(router, prefix="/tasks")
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def setup_function():
    """각 테스트 전에 Task 데이터를 초기화한다."""

    db = TestingSessionLocal()
    db.query(Task).delete()
    db.commit()
    db.close()


def valid_task_data():
    return {
        "project_id": 1,
        "wbs_id": 1,
        "task_name": "태스크 API 구현",
        "description": "Task API 테스트",
        "assignee_name": "홍길동",
        "department": "개발팀",
        "priority": "NORMAL",
        "status": "TODO",
        "planned_start_date": "2026-08-19",
        "planned_end_date": "2026-08-21",
        "progress_rate": 0,
        "note": None,
    }


def test_create_task():
    response = client.post(
        "/tasks/",
        json=valid_task_data(),
    )

    assert response.status_code == 201

    data = response.json()

    assert data["task_name"] == "태스크 API 구현"
    assert data["priority"] == "NORMAL"
    assert data["status"] == "TODO"
    assert data["progress_rate"] == 0


def test_get_task_list():
    client.post(
        "/tasks/",
        json=valid_task_data(),
    )

    response = client.get("/tasks/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["task_name"] == "태스크 API 구현"

def test_get_tasks_by_project_id():
    task_1 = valid_task_data()
    task_1["project_id"] = 1
    task_1["task_name"] = "프로젝트 1 태스크"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "프로젝트 2 태스크"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    response = client.get(
        "/tasks/",
        params={"project_id": 1},
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["project_id"] == 1
    assert data[0]["task_name"] == "프로젝트 1 태스크"


def test_get_task_by_id():
    create_response = client.post(
        "/tasks/",
        json=valid_task_data(),
    )

    task_id = create_response.json()["id"]

    response = client.get(f"/tasks/{task_id}")

    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_missing_task_returns_404():
    response = client.get("/tasks/99999")

    assert response.status_code == 404
