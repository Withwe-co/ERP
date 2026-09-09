"""Slack 메시지 전송 서비스 테스트."""

from app.services.slack_service import send_slack_message

from datetime import date, datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.models.projects import Project
from app.models.tasks import Task


# 시나리오: 지정한 채널에 Slack 메시지를 정상 전송한다.
def test_send_slack_message():
    """채널 ID와 메시지가 Slack client에 정상 전달되는지 확인한다."""

    class FakeSlackClient:
        def __init__(self):
            self.channel = None
            self.text = None

        def chat_postMessage(self, channel, text):
            self.channel = channel
            self.text = text
            return {"ok": True}

    client = FakeSlackClient()

    result = send_slack_message(
        text="ERP Slack 테스트",
        client=client,
        channel_id="C123456",
    )

    assert result is True
    assert client.channel == "C123456"
    assert client.text == "ERP Slack 테스트"

# =========================
# 오늘의 태스크 조회
# =========================

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

def setup_function():
    """각 테스트 전에 프로젝트와 태스크 데이터를 초기화한다."""

    db = TestingSessionLocal()

    db.query(Task).delete()
    db.query(Project).delete()

    db.commit()
    db.close()

def create_project(
    db,
    project_id=1,
    project_name="ERP 프로젝트",
):
    """Slack 테스트용 프로젝트를 생성한다."""

    project = Project(
        id=project_id,
        project_code=f"P{project_id}",
        project_name=project_name,
        manager_name="담당자",
        department="S/W 개발팀",
        start_date=datetime(2026, 9, 1),
        due_date=datetime(2026, 9, 30),
        status="IN_PROGRESS",
    )

    db.add(project)
    db.commit()

    return project

def create_task(
    db,
    task_name,
    status,
    start_date,
    end_date,
    is_archived=False,
    assignee_name="담당자1",
    description="테스트 설명",
    department="S/W 개발팀",
):
    """일일 태스크 조회 테스트용 태스크를 생성한다."""

    task = Task(
        project_id=1,
        wbs_code="1.1",
        task_name=task_name,
        description=description,
        assignee_name=assignee_name,
        department=department,
        priority="NORMAL",
        status=status,
        planned_start_date=start_date,
        planned_end_date=end_date,
        is_archived=is_archived,
    )

    db.add(task)
    db.commit()

    return task


# 시나리오: 오늘 진행 대상인 대기/진행중 태스크만 조회한다.
def test_get_daily_tasks_filters_today_tasks():
    """상태, 기간, 보관 여부, 담당 부서에 따라 오늘의 태스크만 조회하는지 확인한다."""

    from app.services.daily_task_service import get_daily_tasks

    db = TestingSessionLocal()
    today = date(2026, 9, 9)

    create_project(
        db,
        project_id=1,
        project_name="ERP 프로젝트",
    )
    
    create_task(
        db,
        "대기 태스크",
        "TODO",
        date(2026, 9, 9),
        date(2026, 9, 12),
    )

    create_task(
        db,
        "진행중 태스크",
        "IN_PROGRESS",
        date(2026, 9, 8),
        date(2026, 9, 9),
    )

    create_task(
        db,
        "완료 태스크",
        "DONE",
        date(2026, 9, 1),
        date(2026, 9, 12),
    )

    create_task(
        db,
        "시작 전 태스크",
        "TODO",
        date(2026, 9, 10),
        date(2026, 9, 12),
    )

    create_task(
        db,
        "기간 종료 태스크",
        "IN_PROGRESS",
        date(2026, 9, 1),
        date(2026, 9, 8),
    )

    create_task(
        db,
        "보관 태스크",
        "TODO",
        date(2026, 9, 1),
        date(2026, 9, 12),
        is_archived=True,
    )

    create_task(
        db,
        "타 부서 태스크",
        "TODO",
        date(2026, 9, 1),
        date(2026, 9, 12),
        department="영업팀",
    )

    tasks = get_daily_tasks(db, today)

    task_names = [task.task_name for task in tasks]

    assert task_names == [
        "대기 태스크",
        "진행중 태스크",
    ]


    db.close()

# 시나리오: Slack 일일 태스크 메시지를 정해진 형식과 순서로 생성한다.
def test_build_daily_task_message_orders_tasks():
    """상태 > 담당자 > Due Date 순서와 메시지 표시 형식을 확인한다."""

    from app.services.daily_task_service import (
        build_daily_task_message,
        get_daily_tasks,
    )

    db = TestingSessionLocal()
    today = date(2026, 9, 9)

    create_project(
        db,
        project_id=1,
        project_name="ERP 프로젝트",
    )

    long_description = "가" * 120

    # 일부러 정렬되지 않은 순서로 생성한다.
    create_task(
        db,
        "대기 태스크2",
        "TODO",
        date(2026, 9, 1),
        date(2026, 9, 12),
        assignee_name="담당자1",
        description="대기 태스크2 설명",
    )

    create_task(
        db,
        "진행중 태스크1",
        "IN_PROGRESS",
        date(2026, 9, 1),
        date(2026, 9, 10),
        assignee_name="담당자1",
        description=long_description,
    )

    create_task(
        db,
        "대기 태스크3",
        "TODO",
        date(2026, 9, 1),
        date(2026, 9, 11),
        assignee_name="담당자2",
        description="대기 태스크3 설명",
    )

    create_task(
        db,
        "대기 태스크1",
        "TODO",
        date(2026, 9, 1),
        date(2026, 9, 9),
        assignee_name="담당자1",
        description="대기 태스크1 설명",
    )

    tasks = get_daily_tasks(db, today)
    message = build_daily_task_message(tasks, today)

    # 날짜는 제목과 같은 줄에 표시
    assert message.startswith(
        "📋 오늘의 태스크 (2026.09.09)\n\n\n"
    )

    # 진행중 → 대기 순서
    assert message.index(
        "🔵 진행중인 태스크"
    ) < message.index(
        "🟡 대기 태스크"
    )

    # 상태별 태스크 개수
    assert "🔵 진행중인 태스크 (1건)" in message
    assert "🟡 대기 태스크 (3건)" in message

    # 담당자별 태스크 개수
    assert "👤 담당자1 (1건)" in message
    assert "👤 담당자1 (2건)" in message
    assert "👤 담당자2 (1건)" in message

    # 같은 담당자의 태스크는 Due Date가 빠른 순
    assert message.index("• 대기 태스크1") < message.index("• 대기 태스크2")

    # 태스크명 앞에 bullet 표시
    assert "• 진행중 태스크1" in message

    # 필수 정보 표시
    assert "프로젝트: ERP 프로젝트" in message
    assert "Due Date: 2026.09.09" in message

    # 설명은 최대 100자까지만 표시 후 말줄임표 처리
    expected_description = ("가" * 100) + "..."
    assert f"설명: {expected_description}" in message
    assert ("가" * 101) not in message

    # 설명 뒤에 빈 줄 추가
    assert f"설명: {expected_description}\n\n\n" in message

    db.close()

# 시나리오: 오늘의 태스크를 조회해 Slack 메시지로 전송한다.
def test_send_daily_tasks_to_slack():
    """조회, 메시지 생성, Slack 전송이 한 흐름으로 동작하는지 확인한다."""

    from app.services.daily_task_service import send_daily_tasks_to_slack

    class FakeSlackClient:
        def __init__(self):
            self.channel = None
            self.text = None

        def chat_postMessage(self, channel, text):
            self.channel = channel
            self.text = text
            return {"ok": True}

    db = TestingSessionLocal()
    today = date(2026, 9, 9)

    create_project(
        db,
        project_id=1,
        project_name="ERP 프로젝트",
    )

    create_task(
        db,
        "Slack 연동 태스크",
        "TODO",
        date(2026, 9, 1),
        date(2026, 9, 10),
        assignee_name="담당자1",
        description="Slack 일일 태스크 알림 기능 구현",
    )

    client = FakeSlackClient()

    result = send_daily_tasks_to_slack(
        db=db,
        target_date=today,
        client=client,
        channel_id="C123456",
    )

    assert result is True
    assert client.channel == "C123456"

    assert "📋 오늘의 태스크 (2026.09.09)" in client.text
    assert "🟡 대기 태스크 (1건)" in client.text
    assert "👤 담당자1 (1건)" in client.text
    assert "• Slack 연동 태스크" in client.text
    assert "프로젝트: ERP 프로젝트" in client.text
    assert "Due Date: 2026.09.10" in client.text
    assert "설명: Slack 일일 태스크 알림 기능 구현" in client.text

    # 상태는 그룹 제목으로만 구분하고 태스크 내부에는 표시하지 않는다.
    assert "상태:" not in client.text

    db.close()

# 시나리오: 일일 태스크 Job이 DB를 열고 Slack 전송 후 DB를 닫는다.
def test_run_daily_task_job(monkeypatch):
    """cron에서 실행할 Job의 DB 연결과 Slack 전송 흐름을 확인한다."""

    from app.jobs import daily_task_job

    class FakeDb:
        def __init__(self):
            self.closed = False

        def close(self):
            self.closed = True

    fake_db = FakeDb()
    called = {}

    monkeypatch.setattr(
        daily_task_job,
        "SessionLocal",
        lambda: fake_db,
    )

    def fake_send_daily_tasks_to_slack(db, target_date):
        called["db"] = db
        called["target_date"] = target_date
        return True

    monkeypatch.setattr(
        daily_task_job,
        "send_daily_tasks_to_slack",
        fake_send_daily_tasks_to_slack,
    )

    result = daily_task_job.run_daily_task_job(
        target_date=date(2026, 9, 9),
    )

    assert result is True
    assert called["db"] is fake_db
    assert called["target_date"] == date(2026, 9, 9)
    assert fake_db.closed is True