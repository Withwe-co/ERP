"""
프로젝트 선택 후 WBS탭 선택 시 사용하는 함수들
"""
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
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

@router.put("/{wbs_id}",response_model=dict)
def update_wbs(wbs_id: int,request_in: UpdateWbs,db:Session=Depends(get_db)):

    """
        summary : WBS 수정 함수

        arg : 
            - project_id (int) : 수정 WBS ID
            - request_in : 수정스키마
            - db (Session) : DB 세션
            
        desc : 
            - DB에서 전달받은 id와 같은 데이터 조회
            - 전달받은 id가 DB에 없으면 404 에러 반환
            - WBS명 중복 -> 400에러 반환
            - DB에 데이터 저장
            - 예외 처리 -> 500 에러 반환 & Rollback
    """

    try:
        # DB에서 전달받은 id조회
        wbs=db.query(DBWbs).filter(DBWbs.id==wbs_id).first()

        # DB에서 id조회 실패 -> 404에러
        if wbs is None:
            raise HTTPException(status_code=404,detail="WBS를 찾을 수 없습니다.")

        # 실제로 전달된 항목만 추출
        update_data = request_in.model_dump(exclude_unset=True)

        # 실제로 변경된 부분 확인 (updated_at은 제외)
        changed_data = {
            field: value
            for field, value in update_data.items()
            if field != "updated_at" and getattr(wbs, field) != value
        }

        # 실제로 변경된 값 X -> 400 에러
        if not changed_data:
            raise HTTPException(status_code=400,detail="수정 사항이 없습니다.")
        
        # WBS명 중복 -> 400 에러
        if "wbs_name" in changed_data:
            if db.query(DBWbs.id).filter(func.lower(DBWbs.wbs_name)==changed_data["wbs_name"].lower(),DBWbs.id != wbs_id).first():
                raise HTTPException(status_code=400,detail="이미 등록된 WBS명입니다.")

        # 수정값으로 변경
        for field, value in changed_data.items():
            setattr(wbs,field,value)

        # 수정시간에 현재시간 저장
        wbs.updated_at=datetime.now()

        db.commit()
        db.refresh(wbs)

        return {
            # 성공 코드
            "success": 200,
            "message": "WBS가 수정되었습니다.",
            "data": WbsInDB.model_validate(wbs).model_dump(),
        }

    except HTTPException:
            raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"WBS 수정 중 오류가 발생했습니다: {str(e)}")

@router.get("/", response_model=List[WbsInDB])
def get_wbs_list(project_id: int = Query(...),db: Session = Depends(get_db),):
    """
        summary : Project의 하위 WBS 조회 함수
        
        arg : 
            - project_id(int) : 해당 프로젝트의 ID
            - db (Session) : 데이터베이스

        desc :
            - 프로젝트 아이디에 해당하는 wbs 조회

    """
    # 프로젝트 아이디에 해당하는 wbs 조회
    return ( db.query(DBWbs).filter(DBWbs.project_id == project_id).order_by(DBWbs.wbs_order.asc(), DBWbs.id.asc()).all() )

@router.delete("/{wbs_id}")
def delete_wbs(wbs_id: int,db: Session = Depends(get_db)):
    """
        summary : WBS 삭제 함수

        arg : 
            - id(int) : 해당 WBS의 ID
            - db(Session) : 데이터베이스
        
        desc :
            - 해당 ID에 맞는 wbs 조회
            - 조회 실패 시 -> 404에러
            - db에서 wbs삭제
            - 삭제 실패 시 -> 500에러
    """
    # 해당 ID에 맞는 wbs 조회
    wbs=db.query(DBWbs).filter(DBWbs.id==wbs_id).first()

    # 조회 실패 시 -> 404에러
    if wbs is None:
        raise HTTPException(status_code=404, detail="WBS를 찾을 수 없습니다.")

    # db에서 wbs삭제
    try:
         
        db.delete(wbs)
        db.commit()
    except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"WBS 삭제 중 오류가 발생했습니다: {str(e)}")

    
    return {
        "success": 204,
        "message": "재고 항목이 삭제되었습니다.",
    }

