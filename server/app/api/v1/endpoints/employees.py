from typing import List, Optional, Any, Literal
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response,Request
from sqlalchemy.orm import Session
from sqlalchemy import text, func, or_, and_, extract
import pandas as pd
from io import BytesIO
from datetime import datetime
from pydantic import BaseModel, Field
from collections import defaultdict
from zoneinfo import ZoneInfo

from app import crud
from app.core.database import get_db
from app.core.config import settings
from app.schemas.employees import (EmployeesBase,UpdateEmployee,EmployeesList,EmployeeInDB)
from app.core.rate_limit import rate_limit

from app.models.employees import Employees as DBEmployee



router = APIRouter()

@router.get("/",response_model=EmployeesList)
def read_employees(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(default=20, ge=1, le=100, description="반환할 최대 항목 수"),
):
    """
        summary : 팀원 목록 목록 호출 함수
        
        arg : 
            - db (Session) : DB 세션
            - skip (int) : 건너뛸 항목 수
            - limit (int) : 반환할 최대 항목 수
            
        desc : 
            - 팀원 목록을 조회하고, 총 개수와 페이지 정보를 포함한 결과를 반환합니다.
            - 조회된 항목 수, 총 개수, 현재 페이지, 페이지 크기, 총 페이지 수를 포함한 딕셔너리를 반환합니다.
    """

    try:
        # 조회 쿼리
        query=db.query(DBEmployee)

        # 총 개수 조회
        total = query.count()
        print(f"총 개수: {total}")

        # 데이터 조회
        items = query.order_by(DBEmployee.id.desc()).offset(skip).limit(limit).all()
        print(f"조회된 항목 수: {len(items)}")

        result = {
            "items": items,
            "total": total,
            "page": skip // limit + 1,
            "size": limit,
            "pages": (total + limit - 1) // limit if total > 0 else 0,
        }

        return result

    except HTTPException:
            raise
    
    except Exception as e:
        print(f"팀원 목록 조회 오류: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"팀원 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.post("/",response_model=dict)
def create_employee(*,request: Request,db:Session=Depends(get_db),background_tasks: BackgroundTasks,request_in: dict):

    """
        summary : 팀원 등록 함수

        arg : db (Session) : DB 세션

        desc : 
            - 필수 필드 검증 후, 팀원 데이터를 DB에 등록합니다.
            - 등록 성공 시, 생성된 팀원의 정보를 반환합니다.
    """

    try:
        # 팀원 생성 확인용 출력문
        print(f"팀원 생성 시작")

        # 필수 필드 검증
        required_fields = ['name', 'position', 'total_leave', 'used_leave']
        for field in required_fields:
            if field not in request_in or not request_in[field]:
                raise HTTPException(status_code=422 , detail=f"필수 필드가 누락되었습니다: {field}")
            
        # 데이터 생성
        safe_data = {
            'name': str(request_in['name']).strip(),
            'position': str(request_in['position']).strip(),
            'total_leave': int(request_in['total_leave']),
            'used_leave': int(request_in['used_leave']),
        }

        # None 값 제거
        filtered_data = {k: v for k, v in safe_data.items() if v is not None}

        # DB 객체 생성
        employee = DBEmployee(**filtered_data)
        db.add(employee)
        db.commit()
        db.refresh(employee)

        print(f"팀원 생성 완료: ID={employee.id}")
                
        return {
            "success": 201,
            "message": "팀원이 성공적으로 등록되었습니다.",
            "data": {
                "id": employee.id,
                "name": employee.name,
                "position": employee.position,
                "total_leave": employee.total_leave,
                "used_leave": employee.used_leave
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print(f"팀원 등록 실패: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"팀원 등록에 실패했습니다: {str(e)}")