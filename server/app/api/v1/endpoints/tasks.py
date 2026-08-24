from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tasks import Task
from app.schemas.tasks import TaskCreate, TaskResponse, TaskCreateResponse


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
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_name: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """태스크 목록 조회"""

    # 태스크 테이블 조회 쿼리 생성
    # 아직 실제 데이터를 가져오는 단계는 아님
    query = db.query(Task)

    # project_id가 전달되면 해당 프로젝트의 태스크만 조회
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

    # 검색어가 전달되면 태스크명에 검색어가 포함된 태스크만 조회
    if search:
        query = query.filter(
            Task.task_name.ilike(f"%{search}%")
        )

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
