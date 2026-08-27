from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.models.projects import Project
from app.models.tasks import Task
from app.api.v1.endpoints.tasks import router

from datetime import datetime

# 테스트용 SQLite DB
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 테스트에서 사용할 DB 세션 생성기
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine,)

# SQLAlchemy에 등록된 모델을 기준으로 테스트용 SQLite DB에 테이블 생성
Base.metadata.create_all(bind=engine)


# 각 요청마다 테스트용 SQLite 세션을 생성하고, 요청이 끝나면 세션을 닫음
def override_get_db():
    '''테스트에서 FastAPI의 실제 get_db 대신 사용할 DB 세션 함수'''
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# 실제 main.py를 사용하지 않고 테스트용 FastAPI 앱 생성
app = FastAPI()
# 태스크 라우터를 /tasks 경로에 연결
app.include_router(router, prefix="/tasks")
# 실제 DB 대신 테스트용 DB를 사용하도록 의존성 변경
app.dependency_overrides[get_db] = override_get_db
# FastAPI API 요청을 테스트할 수 있는 테스트 클라이언트 생성
client = TestClient(app)


def setup_function():
    """각 테스트 전에 Task 데이터를 초기화한다."""

    db = TestingSessionLocal()
    db.query(Task).delete()
    db.commit()
    db.close()


def valid_task_data():
    '''여러 테스트에서 공통으로 사용할 정장적인 태스크 등록 데이터 생성'''
    return {
        "project_id": 1,
        "wbs_code": "1.1",
        "task_name": "태스크 API 구현",
        "description": "Task API 테스트",
        "assignee_name": "홍길동",
        "department": "개발팀",
        "priority": "NORMAL",
        "status": "TODO",
        "planned_start_date": "2026-08-19",
        "planned_end_date": "2026-08-21",
        "note": None,
    }

# POST /tasks/
def test_create_task():
    response = client.post(
        "/tasks/",
        json=valid_task_data(),
    )

    # 실제 HTTP 상태 코드 확인
    assert response.status_code == 201

    response_data = response.json()

    # Response Body에 포함된 상태 코드와 메시지 확인
    assert response_data["status_code"] == 201
    assert response_data["message"] == "태스크가 성공적으로 등록되었습니다."

    # 실제 등록된 태스크 데이터
    task_data = response_data["data"]

    assert task_data["task_name"] == "태스크 API 구현"
    assert task_data["priority"] == "NORMAL"
    assert task_data["status"] == "TODO"

# GET /tasks/
def test_get_task_list():
    '''등록된 태스크 전체 목록을 정상적으로 조회하는지 확인'''
    client.post("/tasks/", json=valid_task_data(),)

    response = client.get("/tasks/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["task_name"] == "태스크 API 구현"

# GET /tasks/?project_id=
def test_get_tasks_by_project_id():
    '''특정 프로젝트에 속한 태스크만 조회되는지 확인'''
    task_1 = valid_task_data()
    task_1["project_id"] = 1
    task_1["task_name"] = "프로젝트 1 태스크"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "프로젝트 2 태스크"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    response = client.get("/tasks/", params={"project_id": 1},)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["project_id"] == 1
    assert data[0]["task_name"] == "프로젝트 1 태스크"

def test_get_tasks_by_search():
    """태스크명에 검색어가 포함된 태스크만 조회되는지 확인한다."""

    # 같은 프로젝트에 서로 다른 이름의 태스크 2개 생성
    task_1 = valid_task_data()
    task_1["project_id"] = 2
    task_1["task_name"] = "태스크 목록 구현"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "API 테스트"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    # 2번 프로젝트에서 태스크명에 "목록"이 포함된 태스크 조회
    response = client.get("/tasks/", params={"project_id": 2, "search": "목록",},)

    assert response.status_code == 200

    data = response.json()

    # 검색어가 포함된 태스크 하나만 조회되어야 함
    assert len(data) == 1
    assert data[0]["task_name"] == "태스크 목록 구현"

# GET /tasks/{task_id}
def test_get_task_by_id():
    '''태스크 ID를 이용해 특정 태스크 한 건을 조회할 수 있는지 확인'''
    create_response = client.post("/tasks/", json=valid_task_data(),)

    task_id = create_response.json()["data"]["id"]

    response = client.get(f"/tasks/{task_id}")

    assert response.status_code == 200
    assert response.json()["id"] == task_id

# GET /tasks/?status=
def test_get_tasks_by_status():
    """선택한 상태와 같은 태스크만 조회되는지 확인한다."""

    task_1 = valid_task_data()
    task_1["project_id"] = 2
    task_1["task_name"] = "진행 중 태스크"
    task_1["status"] = "IN_PROGRESS"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "대기 태스크"
    task_2["status"] = "TODO"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    response = client.get("/tasks/", params={"project_id": 2,"status": "IN_PROGRESS",},)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["status"] == "IN_PROGRESS"
    assert data[0]["task_name"] == "진행 중 태스크"

# GET /tasks/?priority=
def test_get_tasks_by_priority():
    """선택한 우선순위와 같은 태스크만 조회되는지 확인한다."""

    task_1 = valid_task_data()
    task_1["project_id"] = 2
    task_1["task_name"] = "높은 우선순위 태스크"
    task_1["priority"] = "HIGH"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "보통 우선순위 태스크"
    task_2["priority"] = "NORMAL"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    response = client.get("/tasks/", params={"project_id": 2,"priority": "HIGH",},)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["priority"] == "HIGH"
    assert data[0]["task_name"] == "높은 우선순위 태스크"

# GET /tasks/?assignee_name=
def test_get_tasks_by_assignee_name():
    """입력한 담당자명이 포함된 태스크만 조회되는지 확인한다."""

    task_1 = valid_task_data()
    task_1["project_id"] = 2
    task_1["task_name"] = "담당자1 태스크"
    task_1["assignee_name"] = "담당자1"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "담당자2 태스크"
    task_2["assignee_name"] = "담당자2"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    response = client.get("/tasks/", params={"project_id": 2,"assignee_name": "자1",},)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["assignee_name"] == "담당자1"
    assert data[0]["task_name"] == "담당자1 태스크"

# GET /tasks/?department=
def test_get_tasks_by_department():
    """입력한 부서명이 포함된 태스크만 조회되는지 확인한다."""

    task_1 = valid_task_data()
    task_1["project_id"] = 2
    task_1["task_name"] = "담당부서1 태스크"
    task_1["department"] = "담당부서1"

    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "담당부서2 태스크"
    task_2["department"] = "담당부서2"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)

    response = client.get("/tasks/", params={"project_id": 2,"department": "부서1",},)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["department"] == "담당부서1"
    assert data[0]["task_name"] == "담당부서1 태스크"

# GET /tasks/ +여러 query parameter
def test_get_tasks_with_multiple_filters():
    """검색어와 여러 필터가 동시에 적용되는지 확인한다."""

    # 모든 검색/필터 조건에 일치하는 태스크
    task_1 = valid_task_data()
    task_1["project_id"] = 2
    task_1["task_name"] = "태스크 목록 화면 구현"
    task_1["status"] = "IN_PROGRESS"
    task_1["priority"] = "HIGH"
    task_1["assignee_name"] = "담당자1"
    task_1["department"] = "담당부서1"

    # 같은 프로젝트이지만 상태가 다른 태스크
    task_2 = valid_task_data()
    task_2["project_id"] = 2
    task_2["task_name"] = "태스크 API 구현"
    task_2["status"] = "TODO"
    task_2["priority"] = "HIGH"
    task_2["assignee_name"] = "담당자1"
    task_2["department"] = "담당부서1"

    # 같은 프로젝트이지만 담당자가 다른 태스크
    task_3 = valid_task_data()
    task_3["project_id"] = 2
    task_3["task_name"] = "태스크 목록 테스트"
    task_3["status"] = "IN_PROGRESS"
    task_3["priority"] = "HIGH"
    task_3["assignee_name"] = "담당자2"
    task_3["department"] = "담당부서1"

    client.post("/tasks/", json=task_1)
    client.post("/tasks/", json=task_2)
    client.post("/tasks/", json=task_3)

    # 여러 검색/필터 조건을 동시에 전달
    response = client.get(
        "/tasks/",
        params={
            "project_id": 2,
            "search": "목록",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "assignee_name": "담당자1",
            "department": "담당부서1",
        },
    )

    assert response.status_code == 200

    data = response.json()

    # 모든 조건을 만족하는 task_1 하나만 조회되어야 함
    assert len(data) == 1
    assert data[0]["task_name"] == "태스크 목록 화면 구현"
    assert data[0]["status"] == "IN_PROGRESS"
    assert data[0]["priority"] == "HIGH"
    assert data[0]["assignee_name"] == "담당자1"
    assert data[0]["department"] == "담당부서1"


def test_get_missing_task_returns_404():
    '''존재하지 않는 태스크 ID를 조회하면 FastAPI가 HTTP 404 Not Found를 반환하는지 확인'''
    response = client.get("/tasks/99999")

    assert response.status_code == 404


# PUT /tasks/{task_id}
def test_update_task():
    """기존 태스크의 일부 정보를 정상적으로 수정할 수 있는지 확인한다."""

    # 수정할 태스크를 먼저 등록
    create_response = client.post(
        "/tasks/",
        json=valid_task_data(),
    )

    task_id = create_response.json()["data"]["id"]

    # 수정할 필드만 전달
    update_data = {
        "task_name": "수정된 태스크명",
        "status": "IN_PROGRESS",
    }

    response = client.put(
        f"/tasks/{task_id}",
        json=update_data,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status_code"] == 200
    assert data["message"] == "태스크가 성공적으로 수정되었습니다."

    task_data = data["data"]

    assert task_data["task_name"] == "수정된 태스크명"
    assert task_data["status"] == "IN_PROGRESS"

    # 전달하지 않은 값은 그대로 유지
    assert task_data["assignee_name"] == "홍길동"
    assert task_data["department"] == "개발팀"


# PUT /tasks/{task_id} - 존재하지 않는 태스크
def test_update_missing_task_returns_404():
    """존재하지 않는 태스크를 수정하면 404를 반환하는지 확인한다."""

    response = client.put("/tasks/99999", json={"task_name": "수정된 태스크명",},)

    assert response.status_code == 404
    assert response.json()["detail"] == "태스크를 찾을 수 없습니다."

def test_create_task_rejects_on_hold_status():
    """태스크 상태로 ON_HOLD를 사용할 수 없다."""

    task_data = valid_task_data()
    task_data["status"] = "ON_HOLD"

    response = client.post("/tasks/", json=task_data,)

    assert response.status_code == 422

def test_update_task_rejects_on_hold_status():
    """태스크 수정 시 ON_HOLD 상태를 사용할 수 없다."""

    create_response = client.post("/tasks/", json=valid_task_data(),)

    task_id = create_response.json()["data"]["id"]

    response = client.put(f"/tasks/{task_id}", json={"status": "ON_HOLD"},)

    assert response.status_code == 422

def test_create_task_rejects_date_before_project_start():
    """태스크 시작 예정일은 프로젝트 시작일보다 빠를 수 없다."""

    db = TestingSessionLocal()

    project = Project(
        project_code="PRJ-DATE-001",
        project_name="날짜 검증 프로젝트",
        manager_name="홍길동",
        department="S/W 개발팀",
        start_date=datetime(2026, 8, 10),
        due_date=datetime(2026, 8, 31),
        status="IN_PROGRESS",
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    project_id = project.id

    db.close()

    task_data = valid_task_data()
    task_data["project_id"] = project_id
    task_data["planned_start_date"] = "2026-08-09"
    task_data["planned_end_date"] = "2026-08-20"

    response = client.post("/tasks/", json=task_data,)

    assert response.status_code == 400
    assert response.json()["detail"] == ("태스크 일정은 프로젝트 기간 내에서만 설정할 수 있습니다.")

def test_update_task_rejects_date_after_project_due():
    """태스크 수정 시 프로젝트 종료일 이후로 변경할 수 없다."""

    db = TestingSessionLocal()

    project = Project(
        project_code="PRJ-DATE-002",
        project_name="수정 날짜 검증 프로젝트",
        manager_name="홍길동",
        department="S/W 개발팀",
        start_date=datetime(2026, 8, 10),
        due_date=datetime(2026, 8, 31),
        status="IN_PROGRESS",
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    project_id = project.id
    db.close()

    task_data = valid_task_data()
    task_data["project_id"] = project_id
    task_data["planned_start_date"] = "2026-08-15"
    task_data["planned_end_date"] = "2026-08-20"

    create_response = client.post("/tasks/", json=task_data,)

    task_id = create_response.json()["data"]["id"]

    response = client.put(f"/tasks/{task_id}", json={"planned_end_date": "2026-09-01",},)

    assert response.status_code == 400
    assert response.json()["detail"] == ("태스크 일정은 프로젝트 기간 내에서만 설정할 수 있습니다.")

def test_get_tasks_by_wbs_code():
    """WBS 코드로 태스크를 필터링한다."""

    task1 = valid_task_data()
    task1["wbs_code"] = "1.1"
    task1["task_name"] = "WBS 1.1 태스크"

    task2 = valid_task_data()
    task2["wbs_code"] = "2.1"
    task2["task_name"] = "WBS 2.1 태스크"

    client.post("/tasks/", json=task1)
    client.post("/tasks/", json=task2)

    response = client.get("/tasks/", params={"wbs_code": "1.1"},)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["wbs_code"] == "1.1"

def test_archive_task():
    """태스크를 보류해도 status는 변경되지 않는다."""

    task_data = valid_task_data()
    task_data["status"] = "IN_PROGRESS"

    create_response = client.post("/tasks/", json=task_data,)

    task_id = create_response.json()["data"]["id"]

    response = client.patch(f"/tasks/{task_id}/archive",)

    assert response.status_code == 200

    data = response.json()

    assert data["status_code"] == 200
    assert data["message"] == "태스크가 보류되었습니다."

    task = data["data"]

    assert task["is_archived"] is True
    assert task["archived_at"] is not None

    # 보류는 태스크 상태와 무관
    assert task["status"] == "IN_PROGRESS"

def test_restore_archived_task():
    """보류 태스크를 다시 진행 상태로 복원한다."""

    task_data = valid_task_data()
    task_data["status"] = "IN_PROGRESS"

    create_response = client.post("/tasks/", json=task_data,)

    task_id = create_response.json()["data"]["id"]

    archive_response = client.patch(f"/tasks/{task_id}/archive",)

    archived_task = archive_response.json()["data"]

    assert archived_task["is_archived"] is True
    assert archived_task["archived_at"] is not None

    response = client.patch(f"/tasks/{task_id}/restore",)

    assert response.status_code == 200

    data = response.json()

    assert data["status_code"] == 200
    assert data["message"] == "태스크가 다시 진행됩니다."

    task = data["data"]

    assert task["is_archived"] is False
    assert task["archived_at"] is None

    # 복원해도 기존 태스크 status는 그대로 유지
    assert task["status"] == "IN_PROGRESS"

def test_get_archived_tasks():
    """보류 태스크만 별도로 조회한다."""

    task1 = valid_task_data()
    task1["task_name"] = "일반 태스크"

    task2 = valid_task_data()
    task2["task_name"] = "보류 태스크"

    response1 = client.post("/tasks/", json=task1,)

    response2 = client.post("/tasks/", json=task2,)

    archived_task_id = response2.json()["data"]["id"]

    client.patch(f"/tasks/{archived_task_id}/archive",)

    # 전체 태스크 조회
    response = client.get("/tasks/")

    assert response.status_code == 200

    active_tasks = response.json()

    assert len(active_tasks) == 1
    assert active_tasks[0]["task_name"] == "일반 태스크"
    assert active_tasks[0]["is_archived"] is False

    # 보류 태스크 조회
    response = client.get("/tasks/", params={"is_archived": True},)

    assert response.status_code == 200

    archived_tasks = response.json()

    assert len(archived_tasks) == 1
    assert archived_tasks[0]["task_name"] == "보류 태스크"
    assert archived_tasks[0]["is_archived"] is True
