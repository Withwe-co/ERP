from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.tasks import Task
from app.schemas.tasks import TaskCreate, TaskResponse


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
@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED,)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db),):
    '''태스크 등록'''
    task = Task(**task_in.model_dump()) # Pydantic의 TaskCreate 데이터를Python dict로 바꾼 다음 SQLAlchemy Task 객체에 전달

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# 태스크 목록 조회
@router.get("/", response_model=List[TaskResponse],)
def get_tasks(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """태스크 목록 조회"""
    # 태스크 테이블을 조회할 준비(아직 DB에서 결과 가져오지 않음)
    query = db.query(Task)

    # project_id가 전달되면 해당 프로젝트의 태스크만 조회
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

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
