"""
프로젝트 목록 조회 & 프로젝트 등록,수정
"""
from typing import List, Optional, Any, Literal
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import text, func, or_, and_, extract
from io import BytesIO
from datetime import datetime
from pydantic import BaseModel, Field

from app import crud
from app.core.database import get_db
from app.core.config import settings
from app.schemas.projects import (ProjectsBase,UpdateProject)

#from app.crud.purchase_request import project as crud_project
from app.models.projects import Project as DBProject

router = APIRouter()

@router.post("/",response_model=dict)
def create_project(*,db:Session=Depends(get_db),background_tasks: BackgroundTasks,request_in: dict):

    """
        summary : 프로젝트 등록 함수

        arg : db (Session) : DB 세션

        desc : 
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