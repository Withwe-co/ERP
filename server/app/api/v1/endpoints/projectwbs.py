"""
프로젝트 선택 후 WBS탭 선택 시 사용하는 함수들
"""
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
import pandas as pd
from io import BytesIO
from datetime import datetime

from app.core.database import get_db
from app.schemas.wbs import WbsBase,UpdateWbs,WbsInDB

from app.models.wbs import Wbs as DBWbs

router = APIRouter()

@router.post("/",response_model=dict)
def create_wbs(*,db:Session=Depends(get_db),background_tasks: BackgroundTasks,request_in: dict):

    """
        summary : WBS 등록 함수

        arg : db (Session) : DB 세션

        desc : 
            - 필수 항목 검증 (WBS코드,WBS명)
            - parse_date : 시작일,종료일 데이터 str-> datetime으로 변경 함수
            - DB에 데이터 저장
            - 필수 필드 누락 : 422 에러 반환
            - 예외 처리 : 500 에러 반환
    """

    try:
        # 프로젝트 생성 확인용 출력문
        print(f"WBS 생성 시작")

        # 필수 필드 검증
        required_fields = ['wbs_code', 'wbs_name']
        for field in required_fields:
            if field not in request_in or not request_in[field]:
                raise HTTPException(status_code=422,detail=f"필수 필드가 누락되었습니다: {field}")
            
        # 데이터 생성
        safe_data = {
            'wbs_code': str(request_in.get('wbs_code', '')).strip(),
            'wbs_name': str(request_in['wbs_name']).strip(),
            'parent_wbs': str(request_in['parent_wbs']).strip(),
            'wbs_order': int(request_in.get('wbs_order') or 0),
            'project_id':int(request_in.get('project_id') or 0),
            'wbs_description': request_in.get('wbs_description'),
        }

        # None 값 제거 (선택사항)
        filtered_data = {k: v for k, v in safe_data.items() if v is not None}

        # DB 객체 생성
        wbs = DBWbs(**filtered_data)
        db.add(wbs)
        db.commit()
        db.refresh(wbs)

        print(f"WBS 생성 완료: ID={wbs.id}")
                
        return {
            "success": 201,
            "message": "WBS가 성공적으로 등록되었습니다.",
            "data": {
                "id": wbs.id,
                "wbs_code": wbs.wbs_code,
                "wbs_name": wbs.wbs_name,
                "parent_wbs": wbs.parent_wbs,
                "project_id": wbs.project_id,
                "wbs_description": wbs.wbs_description
            }
        }

    except HTTPException:
            raise

    except Exception as e:
        db.rollback()
        print(f"WBS 등록 실패: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"WBS 등록에 실패했습니다: {str(e)}")

@router.get("/", response_model=List[WbsInDB])
def get_wbs_list(project_id: int = Query(...),db: Session = Depends(get_db),):
    """
        summary : Project의 하위 WBS 조회 함수
        
        arg : 
            - project_id(int) : 해당 프로젝트의 ID
            - db (Session) : 데이터베이스

        desc :
            - 

    """
    # 프로젝트 아이디에 해당하는 wbs 조회
    return ( db.query(DBWbs).filter(DBWbs.project_id == project_id).order_by(DBWbs.wbs_order.asc(), DBWbs.id.asc()).all() )