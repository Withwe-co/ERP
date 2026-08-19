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

        print(f"✅ 구매 요청 생성 완료: ID={project.id}")
                
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

    except HTTPException:
            raise
    except Exception as e:
        db.rollback()
        print(f"❌ 프로젝트 등록 실패: {e}")
        import traceback
        print(f"📋 스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"프로젝트 등록에 실패했습니다: {str(e)}"
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
        valid_statuses=['COMPLETED','IN_PROGRESS','CANCELLED','PLANNED','ON_HOLD']

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
        print(f"📊 총 개수: {total}")

        # 데이터 조회
        items = query.order_by(DBProject.id.desc()).offset(skip).limit(limit).all()
        print(f"📋 조회된 항목 수: {len(items)}")

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
        print(f"❌ 구매 요청 목록 조회 오류: {e}")
        import traceback
        print(f"📋 스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"구매 요청 목록 조회 중 오류가 발생했습니다: {str(e)}"
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
