"""
프로젝트 목록 조회 & 프로젝트 등록,수정
"""
from typing import List, Optional, Any, Literal
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import text, func, or_, and_, extract
import pandas as pd
from io import BytesIO
from datetime import datetime
from pydantic import BaseModel, Field

from app import crud
from app.core.database import get_db
from app.core.config import settings
from app.schemas.projects import (ProjectsBase,UpdateProject,ProjectsList,ProjectInDB)

#from app.crud.purchase_request import project as crud_project
from app.models.projects import Project as DBProject

router = APIRouter()

@router.post("/",response_model=dict)
def create_project(*,db:Session=Depends(get_db),background_tasks: BackgroundTasks,request_in: dict):

    """
        summary : 프로젝트 등록 함수

        arg : db (Session) : DB 세션

        desc : 
            - 필수 항목 검증 (프로젝트명, 상태, 담당자, 부서, 시작일, 종료일)
            - parse_date : 시작일,종료일 데이터 str-> datetime으로 변경 함수
            - DB에 데이터 저장
            - 필수 필드 누락 : 422 에러 반환
            - 예외 처리 : 500 에러 반환
    """

    try:
        # 프로젝트 생성 확인용 출력문
        print(f"프로젝트 생성 시작")

        # 필수 필드 검증
        required_fields = ['project_name', 'status', 'manager_name', 'department', 'start_date', 'due_date']
        for field in required_fields:
            if field not in request_in or not request_in[field]:
                raise HTTPException(
                    status_code=422,
                    detail=f"필수 필드가 누락되었습니다: {field}"
                )
            
        # string-> datetime을 위한 함수
        def parse_date(date_str):
            if not date_str:
                return None
            try:
                return datetime.fromisoformat(str(date_str).strip())
            except (ValueError, TypeError):
                return None
            
        # 데이터 생성
        safe_data = {
            'project_code': str(request_in.get('project_code', '')).strip(),
            'project_name': str(request_in['project_name']).strip(),
            'manager_name': str(request_in['manager_name']).strip(),
            'department': request_in.get('department','S/W 개발팀'),
            'start_date': parse_date(request_in.get('start_date')),
            'due_date': parse_date(request_in.get('due_date')),
            'status': request_in.get('status','IN_PROGRESS'),
            'project_description': request_in.get('project_description'),
        }

        # None 값 제거 (선택사항)
        filtered_data = {k: v for k, v in safe_data.items() if v is not None}

        # DB 객체 생성
        project = DBProject(**filtered_data)
        db.add(project)
        db.commit()
        db.refresh(project)

        print(f"프로젝트 생성 완료: ID={project.id}")
                
        return {
            "success": True,
            "message": "프로젝트가 성공적으로 등록되었습니다.",
            "data": {
                "id": project.id,
                "project_code": project.project_code,
                "project_name": project.project_name,
                "manager_name": project.manager_name,
                "department": project.department,
                "start_date": project.start_date,
                "due_date": project.due_date,
                "status": project.status,
                "project_description": project.project_description
            }
        }
    
    except Exception as e:
        db.rollback()
        print(f"프로젝트 등록 실패: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 등록에 실패했습니다: {str(e)}"
        )

@router.put("/{project_id}",response_model=dict)
def update_project(project_id: int,request_in: UpdateProject,db:Session=Depends(get_db)):

    """
        summary : 프로젝트 수정 함수

        arg : 
            - project_id (int) : 수정 프로젝트 ID
            - request_in : 수정스키마
            - db (Session) : DB 세션
            
        desc : 
            - DB에서 전달받은 id와 같은 데이터 조회
            - 전달받은 id가 DB에 없으면 404 에러 반환
            - 프로젝트 코드 제거
            - 날짜 유효성 검증 -> 400에러 반환
            - DB에 데이터 저장
            - 예외 처리 : 500 에러 반환 & Rollback
    """

    try:
        # DB에서 전달받은 id조회
        project=db.query(DBProject).filter(DBProject.id==project_id).first()

        # DB에서 id조회 실패 -> 404에러
        if project is None:
            raise HTTPException(status_code=404,detail="프로젝트를 찾을 수 없습니다.")

        # 실제로 전달된 항목만 추출
        update_data = request_in.model_dump(exclude_unset=True)

        # 프로젝트 코드가 전달되면 제거
        update_data.pop("project_code",None)

        # 날짜 유효성 검증
        start_date=update_data.get("start_date",project.start_date)
        due_date=update_data.get("due_date",project.due_date)

        # 종료일이 시작일보다 빠르면 400 에러 반환
        if start_date > due_date:
            raise HTTPException(status_code=400,detail="종료일은 시작일보다 빠를 수 없습니다.")

        # 수정값으로 변경
        for field, value in update_data.items():
            setattr(project,field,value)

        # 수정시간에 현재시간 저장
        project.updated_at=datetime.now()

        db.commit()
        db.refresh(project)

        return {
            # 성공 코드
            "success": True,
            "message": "프로젝트가 수정되었습니다.",
            "data": ProjectInDB.model_validate(project).model_dump(),
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 수정 중 오류가 발생했습니다: {str(e)}",
        )
    
@router.get("/",response_model=ProjectsList)
def read_projectlist(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(default=20, ge=1, le=100, description="반환할 최대 항목 수"),
    search: Optional[str] = Query(default=None, description="검색어"),
    status: Optional[str] = Query(default=None, description="상태 필터"),
    department: Optional[str] = Query(default=None, description="부서 필터")
):
    """
        summary : 프로젝트 목록 호출 함수
        
        arg : 
            - db (Session) : DB 세션
            - skip (int) : 건너뛸 항목 수
            - limit (int) : 반환할 최대 항목 수
            - search (str) : 검색어 
            - status (str) : 상태 필터
            - department (str) : 부서 필터

        desc : 
            - 유효 상태 설정 (완료,진행중,취소,계획중)
            - 유효 상태 조회
            - 검색어/상태/부서 필터 적용 쿼리
            - 예외 처리 : 500 에러 반환
    """
    try:
        # 유효한 상태만 조회
        valid_statuses=['COMPLETED','IN_PROGRESS','CANCELLED','PLANNED']

        # 조회 쿼리 (유효한 상태만 조회)
        query=db.query(DBProject).filter(DBProject.status.in_(valid_statuses))

        # 검색어 필터 적용
        if search:
            query=query.filter(or_(DBProject.project_name.ilike(f"%{search}%"),DBProject.manager_name.ilike(f"%{search}%")))

        # 상태 필터 적용
        if status and status in valid_statuses:
            query = query.filter(DBProject.status==status)

        # 부서 필터 적용
        if department:
            query = query.filter(DBProject.department==department)

        # 총 개수 조회
        total = query.count()
        print(f"총 개수: {total}")

        # 데이터 조회
        items = query.order_by(DBProject.id.desc()).offset(skip).limit(limit).all()
        print(f"조회된 항목 수: {len(items)}")

        # Response 객체로 반환
        response_items = [
            ProjectInDB.model_validate(item)
            for item in items
        ]

        result = {
            "items": response_items,
            "total": total,
            "page": skip // limit + 1,
            "size": limit,
            "pages": (total + limit - 1) // limit if total > 0 else 0,
        }

        return result
    
    except Exception as e:
        print(f"프로젝트 목록 조회 오류: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/on_hold",response_model=ProjectsList)
def read_on_hold_projectlist(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(default=20, ge=1, le=100, description="반환할 최대 항목 수"),
    search: Optional[str] = Query(default=None, description="검색어"),
    status: Optional[str] = Query(default=None, description="상태 필터"),
    department: Optional[str] = Query(default=None, description="부서 필터")
):
    """
        summary : 보류된 프로젝트 목록 호출 함수
        
        arg : 
            - db (Session) : DB 세션
            - skip (int) : 건너뛸 항목 수
            - limit (int) : 반환할 최대 항목 수
            - search (str) : 검색어 
            - status (str) : 상태 필터
            - department (str) : 부서 필터

        desc : 
            - 보류(ON_HOLD)상태의 프로젝트만 조회
            - 검색어/부서 필터 적용
            - 예외 처리 : 500 에러 반환
    """
    try:
        # 유효한 상태만 조회
        valid_statuses=['ON_HOLD']

        # 조회 쿼리 (유효한 상태만 조회)
        query=db.query(DBProject).filter(DBProject.status.in_(valid_statuses))

        # 검색어 필터 적용
        if search:
            query=query.filter(or_(DBProject.project_name.ilike(f"%{search}%"),DBProject.manager_name.ilike(f"%{search}%")))

        # 부서 필터 적용
        if department:
            query = query.filter(DBProject.department==department)

        # 총 개수 조회
        total = query.count()
        print(f"총 개수: {total}")

        # 데이터 조회
        items = query.order_by(DBProject.id.desc()).offset(skip).limit(limit).all()
        print(f"조회된 항목 수: {len(items)}")

        # Response 객체로 반환
        response_items = [
            ProjectInDB.model_validate(item)
            for item in items
        ]

        result = {
            "items": response_items,
            "total": total,
            "page": skip // limit + 1,
            "size": limit,
            "pages": (total + limit - 1) // limit if total > 0 else 0,
        }

        return result
    except Exception as e:
        print(f"구매 요청 목록 조회 오류: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/next-code",response_model=dict)
def get_next_project_code(db: Session = Depends(get_db)):
    """
        summary : 프로젝트 코드 자동 생성 함수

        arg : db(Session) : DB 세션

        desc : 
            - 마지막 프로젝트 DB에서 선택
            - 마지막 프로젝트가 없을 시 PRJ-000001
            - 기존 프로젝트 +1로 다음 프로젝트 코드 생성
    """
    last_project = (db.query(DBProject.project_code).filter(DBProject.project_code.like("PRJ-%")).order_by(DBProject.project_code.desc()).first())

    if last_project is None:
        next_number = 1
    else:
        try:
            next_number = int(last_project[0].replace("PRJ-", "")) + 1
        except (ValueError, AttributeError):
            next_number = 1

    return {
        "project_code": f"PRJ-{next_number:06d}"
    }

@router.patch("/{project_id}/store",response_model=dict)
def Store_project(project_id:int , db:Session=Depends(get_db)):
    """
        summary : 프로젝트 상태(Status)를 보류(ON_HOLD)로 변경하는 함수

        arg : db (Session) : DB 세션
        
        desc :
            - 요청된 ID의 구매 요청을 조회하고, 상태가 'SUBMITTED'인 경우에만 업데이트
            - 요청된 ID 중 DB에서 찾지 못한 ID가 있으면 404 에러 반환
            - 요청 상태가 'SUBMITTED'이 아닌 구매 요청이 있으면 400 에러 반환, 처리 불가 id 출력
            - 상태 업데이트 후 DB 커밋 완료 메시지 출력
            - 예외 처리: DB 롤백 및 500 에러 반환
    """
    #
    try:
        project=db.query(DBProject).filter(DBProject.id == project_id).first()

        # project를 찾을 수 없으면 404 에러 반환
        if project is None:
            raise HTTPException(status_code=404,detail=f"프로젝트를 찾을 수 없습니다: {project_id}",)

        # project의 상태가 이미 보류(ON_HOLD)이면 메시지 출력
        if project.status == "ON_HOLD":
            return {
                "success": True,
                "message": "이미 보류 상태인 프로젝트입니다.",
                "project_id": project.id,
                "status": project.status,
            }

        project.status = "ON_HOLD"
        db.commit()
        db.refresh(project)

        return {
            # 성공 코드
            "success": True,
            "message": "프로젝트가 보류 처리되었습니다.",
            "project_id": project.id,
            "status": project.status,
        }

    # 예외 처리: DB 롤백 및 500 에러 반환
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500,detail=f"상태 업데이트 중 오류가 발생했습니다: {str(e)}")
