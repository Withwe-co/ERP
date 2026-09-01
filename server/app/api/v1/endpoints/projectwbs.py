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
from app.models.tasks import Task as DBTask
router = APIRouter()

@router.post("/",response_model=dict)
def create_wbs(*,db:Session=Depends(get_db),background_tasks: BackgroundTasks,request_in: dict):

    """
        summary : WBS 등록 함수

        arg : db (Session) : DB 세션

        desc : 
            - 필수 항목 검증 (WBS코드,WBS명)
            - parse_date : 시작일,종료일 데이터 str-> datetime으로 변경 함수
            - WBS 순서 변경
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
            'wbs_code': str(request_in['wbs_code']).strip(),
            'wbs_name': str(request_in['wbs_name']).strip(),
            'parent_wbs': str(request_in['parent_wbs']).strip(),
            'wbs_order': int(request_in.get('wbs_order') or 0),
            'project_id':int(request_in['project_id']),
            'wbs_description': str(request_in.get('wbs_description' or '')).strip(),
        }

        # None 값 제거
        filtered_data = {k: v for k, v in safe_data.items() if v is not None}

        # 프로젝트 ID / 상위 WBS Code 저장
        project_id = safe_data["project_id"]
        parent_wbs = safe_data["parent_wbs"] or ""

        # 동일 프로젝트 내 상위 WBS가 같은 데이터
        scope_filters = [DBWbs.project_id == project_id,func.coalesce(DBWbs.parent_wbs, "") == parent_wbs]

        # 순서 잠그기
        existing_wbs = (db.query(DBWbs).filter(*scope_filters).order_by(DBWbs.wbs_order.asc(), DBWbs.id.asc()).with_for_update().all())

        # 신규 WBS 항목의 위치
        target_order = safe_data["wbs_order"]

        # 순서값 가능 범위
        target_order = max(1, min(target_order, len(existing_wbs) + 1))

        # 새 항목의 위치 & 뒤 항목들 순서 +1
        db.query(DBWbs).filter(*scope_filters, DBWbs.wbs_order >= target_order).update({DBWbs.wbs_order: DBWbs.wbs_order + 1},synchronize_session=False)
        safe_data["wbs_order"] = target_order

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
            - 실제로 전달된 부분과 변경된 부분 확인
            - 변경된 값 X -> 400에러 반환
            - 변경된 값 O & WBS명 중복 -> 400에러 반환
            - 상위 WBS 변경 + WBS 순서 변경
            - 상위 WBS 변경 X + WBS 순서 변경
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

        # 순서 또는 상위 WBS 변경 로직
        if "wbs_order" in changed_data or "parent_wbs" in changed_data:
            old_parent_wbs = wbs.parent_wbs or ""
            new_parent_wbs = changed_data.get("parent_wbs", old_parent_wbs) or ""

            old_order = int(wbs.wbs_order or 1)
            target_order = int(changed_data.get("wbs_order", old_order))

            # 같은 프로젝트 WBS를 잠가 동시 수정으로 인한 순서 꼬임 방지
            db.query(DBWbs).filter(DBWbs.project_id == wbs.project_id).with_for_update().all()
            

            # 상위 WBS의 하위 WBS 목록 (과거)
            old_scope_filters = [DBWbs.project_id == wbs.project_id, func.coalesce(DBWbs.parent_wbs, "") == old_parent_wbs]

            # 상위 WBS의 하위 WBS 목록 (신규)
            new_scope_filters = [DBWbs.project_id == wbs.project_id, func.coalesce(DBWbs.parent_wbs, "") == new_parent_wbs]

            # 같은 상위 WBS 안에서 순서만 변경
            if old_parent_wbs == new_parent_wbs:
                sibling_count = db.query(DBWbs).filter(*old_scope_filters).count()

                target_order = max(1, min(target_order, sibling_count))

                if target_order < old_order:
                    # 위로 이동: 중간 WBS들을 한 칸 뒤로
                    db.query(DBWbs).filter(*old_scope_filters,DBWbs.id != wbs.id,DBWbs.wbs_order >= target_order,DBWbs.wbs_order < old_order,).update({DBWbs.wbs_order: DBWbs.wbs_order + 1},synchronize_session=False)
                    
                elif target_order > old_order:
                    # 아래로 이동: 중간 WBS들을 한 칸 앞으로
                        db.query(DBWbs).filter(*old_scope_filters,DBWbs.id != wbs.id,DBWbs.wbs_order > old_order,DBWbs.wbs_order <= target_order,).update({DBWbs.wbs_order: DBWbs.wbs_order - 1},synchronize_session=False)

            # 상위 WBS를 다른 WBS로 변경
            else:
                new_sibling_count = db.query(DBWbs).filter(*new_scope_filters).count()

                # 새 그룹에는 아직 수정 대상이 포함되지 않았으므로 +1 가능 -> 요휴 범위 제한
                target_order = max(1, min(target_order, new_sibling_count + 1))

                # 기존 그룹에서 빠진 자리 뒤 항목들을 앞으로 이동
                db.query(DBWbs).filter(*old_scope_filters,DBWbs.id != wbs.id,DBWbs.wbs_order > old_order,).update({DBWbs.wbs_order: DBWbs.wbs_order - 1},synchronize_session=False)
                
                # 새 그룹의 삽입 위치 및 뒤 항목들을 뒤로 이동
                db.query(DBWbs).filter(*new_scope_filters,DBWbs.wbs_order >= target_order,).update({DBWbs.wbs_order: DBWbs.wbs_order + 1},synchronize_session=False)

            changed_data["parent_wbs"] = new_parent_wbs
            changed_data["wbs_order"] = target_order

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
            - wbs 하위 task 확인, 존재 -> 409에러 삭제 불가
            - wbs 하위 wbs 확인, 존재 -> 409에러 삭제 불가
            - db에서 wbs삭제
            - 삭제 실패 시 -> 500에러
    """
    # 해당 ID에 맞는 wbs 조회
    wbs=db.query(DBWbs).filter(DBWbs.id==wbs_id).first()

    # 조회 실패 시 -> 404에러
    if wbs is None:
        raise HTTPException(status_code=404, detail="WBS를 찾을 수 없습니다.")

    # 해당 wbs에 하위 task가 존재하는지 확인
    task = db.query(DBTask).filter(DBTask.project_id==wbs.project_id,DBTask.wbs_code==wbs.wbs_code).first()

    # 존재 -> 409에러 삭제 불가
    if task:
        raise HTTPException(status_code=409, detail="태스크가 존재하는 WBS는 삭제할 수 없습니다.")

    # 해당 wbs에 하위 wbs가 존재하는지 확인
    child_wbs=db.query(DBWbs).filter(DBWbs.project_id==wbs.project_id,DBWbs.parent_wbs==wbs.wbs_code).first()

    # 존재 -> 409에러 삭제 불가
    if child_wbs:
         raise HTTPException(status_code=409, detail="하위 WBS가 존재하는 WBS는 삭제할 수 없습니다.")

    # db에서 wbs삭제
    try:
        db.delete(wbs)
        db.commit()
    except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"WBS 삭제 중 오류가 발생했습니다: {str(e)}")

    return {
        "success": 204,
        "message": "WBS가 삭제되었습니다.",
    }

