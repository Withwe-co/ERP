"""태스크 관리 API 엔드포인트를 정의하는 모듈"""
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.projects import Project
from app.models.tasks import Task
from app.schemas.tasks import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskCreateResponse,
    TaskUpdateResponse,
)

# FastAPI에서 API endpoint들을 하나의 Router로 묶는 객체
router = APIRouter()


# 태스크 등록
@router.post("/", response_model=TaskCreateResponse, status_code=http_status.HTTP_201_CREATED,)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db),):
    """새로운 태스크 등록"""

    # 태스크가 속한 프로젝트 조회
    project = (
        db.query(Project)
        .filter(Project.id == task_in.project_id)
        .first()
    )

    # 프로젝트가 존재하는 경우 프로젝트 기간 검증
    if project is not None:
        project_start = project.start_date.date()
        project_due = project.due_date.date()

        if (task_in.planned_start_date < project_start or task_in.planned_end_date > project_due):
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=(
                    "태스크 일정은 프로젝트 기간 내에서만 "
                    "설정할 수 있습니다."
                ),
            )

    # 검증이 완료된 요청 데이터를 SQLAlchemy Task 객체로 반환
    task = Task(**task_in.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "status_code": http_status.HTTP_201_CREATED,
        "message": "태스크가 성공적으로 등록되었습니다.",
        "data": task,
    }

# 태스크 목록 조회
@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    search: Optional[str] = None,
    wbs_code: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_name: Optional[str] = None,
    department: Optional[str] = None,
    is_archived: bool = False,
    db: Session = Depends(get_db),
):
    """검색 및 필터 조건에 맞는 태스크 목록을 조회"""

    # Task 테이블을 대상으로 조회 쿼리를 생성
    # 아직 실제 데이터를 가져오는 단계는 아님 (실제 DB 조회 실행되지 않음)
    query = db.query(Task)

    # 기본 조회는 일반 태스크, is_archived=true이면 보류 태스크만 조회
    query = query.filter(Task.is_archived == is_archived)

    # project_id가 전달되면 해당 프로젝트의 태스크만 조회
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

    # 태스크면 부분 일치 검색
    if search:
        query = query.filter(Task.task_name.ilike(f"%{search}%"))

    # 존재하는 WBS 코드 중에서 고른 WBS 코드와 정확히 일치하는 태스크만 조회
    if wbs_code:
        query = query.filter(Task.wbs_code == wbs_code)

    if status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    # 담당자명 부분 일치 검색 - 담당자명에 검색어가 포함된 태스크만 조회
    if assignee_name:
        query = query.filter(Task.assignee_name.ilike(f"%{assignee_name}%"))

    # 부서명 부분 일치 검색
    if department:
        query = query.filter(Task.department.ilike(f"%{department}%"))

    # 지금까지 설정한 모든 조건을 적용하여 실제 DB 조회 실행
    return query.all()

# 태스크 단건 조회
@router.get("/{task_id}", response_model=TaskResponse,)
def get_task(task_id: int, db: Session = Depends(get_db),):
    '''태스크 ID를 기준으로 태스크 한 건을 조회'''

    # 특정 ID를 찾고 없으면 404 Not Found 반환
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    return task

# 태스크 수정
@router.put("/{task_id}", response_model=TaskUpdateResponse,)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db),):
    """태스크 ID를 기준으로 전달된 필드만 수정"""

    # 수정할 태스크 조회
    task = db.query(Task).filter(Task.id == task_id).first()

    # 해당 태스크가 존재하지 않으면 404 반환
    if task is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    # 요청에서 실제로 전달된 필드만 수정 대상으로 추출
    update_data = task_in.model_dump(exclude_unset=True)

    # 전달되지 않은 필드는 기존 값을 사용하여 수정 후 일정을 계산
    project_id = update_data.get("project_id", task.project_id,)

    planned_start_date = update_data.get("planned_start_date", task.planned_start_date,)

    planned_end_date = update_data.get("planned_end_date", task.planned_end_date,)

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    # 수정 결과가 프로젝트 기간을 벗어나는지 검증
    if project is not None:
        project_start = project.start_date.date()
        project_due = project.due_date.date()

        if (planned_start_date < project_start or planned_end_date > project_due):
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=(
                    "태스크 일정은 프로젝트 기간 내에서만 "
                    "설정할 수 있습니다."
                ),
            )

    # 검증이 완료된 필드만 기존 Task 객체에 반영
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return {
        "status_code": http_status.HTTP_200_OK,
        "message": "태스크가 성공적으로 수정되었습니다.",
        "data": task,
    }

# 태스크 보류
@router.patch("/{task_id}/archive", response_model=TaskUpdateResponse,)
def archive_task(task_id: int, db: Session = Depends(get_db),):
    """태스크를 보류함으로 이동"""

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    task.is_archived = True
    task.archived_at = datetime.now(ZoneInfo("Asia/Seoul"))

    db.commit()
    db.refresh(task)

    return {
        "status_code": http_status.HTTP_200_OK,
        "message": "태스크가 보류되었습니다.",
        "data": task,
    }

# 보류 태스크 다시 진행(복원)
@router.patch("/{task_id}/restore", response_model=TaskUpdateResponse,)
def restore_task(task_id: int, db: Session = Depends(get_db),):
    """보류 태스크를 전체 태스크로 복원"""

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if task is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    task.is_archived = False
    task.archived_at = None

    db.commit()
    db.refresh(task)

    return {
        "status_code": http_status.HTTP_200_OK,
        "message": "태스크가 다시 진행됩니다.",
        "data": task,
    }
