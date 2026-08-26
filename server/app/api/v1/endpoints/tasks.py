from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tasks import Task
from app.schemas.tasks import (TaskCreate, TaskUpdate, TaskResponse, TaskCreateResponse, TaskUpdateResponse,)

from app.models.projects import Project
from app.models.tasks import Task

from datetime import datetime
from zoneinfo import ZoneInfo

router = APIRouter()
# 현재 구현 API
# - 태스크 등록
# - 태스크 목록 조회
# - 태스크 단건 조회
#
# 추후 구현 예정
# - 태스크 수정
# - 태스크 삭제 및 보관
# - 검색 및 필터
# - 상태 변경
# - projectId / wbsId 검증
# - 상태 / 진척률 규칙

# 태스크 등록
@router.post("/", response_model=TaskCreateResponse, status_code=status.HTTP_201_CREATED,)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db),):
    """태스크 등록"""

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
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "태스크 일정은 프로젝트 기간 내에서만 "
                    "설정할 수 있습니다."
                ),
            )
        
    task = Task(**task_in.model_dump())

    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "status_code": status.HTTP_201_CREATED,
        "message": "태스크가 성공적으로 등록되었습니다.",
        "data": task,
    }


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
    """태스크 목록 조회"""

    # 태스크 테이블 조회 쿼리 생성
    # 아직 실제 데이터를 가져오는 단계는 아님
    query = db.query(Task)

    # 기본 조회는 일반 태스크, is_archived=true이면 보류 태스크만 조회
    query = query.filter(Task.is_archived == is_archived)

    # project_id가 전달되면 해당 프로젝트의 태스크만 조회
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

    # 검색어가 전달되면 태스크명에 검색어가 포함된 태스크만 조회
    if search:
        query = query.filter(Task.task_name.ilike(f"%{search}%"))

    # 존재하는 WBS 코드 중에서 고른 WBS 코드인 태스크만 조회
    if wbs_code:
        query = query.filter(Task.wbs_code == wbs_code)

    # 상태가 전달되면 해당 상태의 태스크만 조회
    if status:
        query = query.filter(Task.status == status)

    # 우선순위가 전달되면 해당 우선순위의 태스크만 조회
    if priority:
        query = query.filter(Task.priority == priority)

    # 담당자가 전달되면 담당자명에 검색어가 포함된 태스크만 조회
    if assignee_name:
        query = query.filter(Task.assignee_name.ilike(f"%{assignee_name}%"))

    # 부서가 전달되면 부서명에 검색어가 포함된 태스크만 조회
    if department:
        query = query.filter(Task.department.ilike(f"%{department}%"))

    # 위에서 적용한 모든 조건에 맞는 태스크 조회
    return query.all()

# 태스크 단건 조회
@router.get("/{task_id}", response_model=TaskResponse,)
def get_task(task_id: int, db: Session = Depends(get_db),):
    '''태스크 단건 조회'''
    # 특정 ID를 찾고 없으면 404 Not Found 반환
    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    return task

# 태스크 수정
@router.put("/{task_id}", response_model=TaskUpdateResponse,)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db),):
    """태스크 수정"""

    # 수정할 태스크 조회
    task = db.query(Task).filter(Task.id == task_id).first()

    # 해당 태스크가 존재하지 않으면 404 반환
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    # 요청에서 실제로 전달된 필드만 가져옴
    update_data = task_in.model_dump(exclude_unset=True)

    # 요청에서 실제로 전달된 필드만 가져옴
    update_data = task_in.model_dump(exclude_unset=True)

    # 수정 후 적용될 최종 값을 기준으로 프로젝트 기간 검증
    project_id = update_data.get("project_id", task.project_id,)

    planned_start_date = update_data.get("planned_start_date", task.planned_start_date,)

    planned_end_date = update_data.get("planned_end_date", task.planned_end_date,)

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if project is not None:
        project_start = project.start_date.date()
        project_due = project.due_date.date()

        if (planned_start_date < project_start or planned_end_date > project_due):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "태스크 일정은 프로젝트 기간 내에서만 "
                    "설정할 수 있습니다."
                ),
            )

    # 검증이 끝난 후 실제 값 반영
    for field, value in update_data.items(): setattr(task, field, value)

    # 전달된 필드만 기존 Task 객체에 반영
    for field, value in update_data.items(): setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return {
        "status_code": status.HTTP_200_OK,
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    task.is_archived = True
    task.archived_at = datetime.now(ZoneInfo("Asia/Seoul"))

    db.commit()
    db.refresh(task)

    return {
        "status_code": status.HTTP_200_OK,
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="태스크를 찾을 수 없습니다.",
        )

    task.is_archived = False
    task.archived_at = None

    db.commit()
    db.refresh(task)

    return {
        "status_code": status.HTTP_200_OK,
        "message": "태스크가 다시 진행됩니다.",
        "data": task,
    }
