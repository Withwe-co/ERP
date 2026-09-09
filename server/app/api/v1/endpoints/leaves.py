from typing import List, Optional, Any, Literal
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response,Request
from sqlalchemy.orm import Session
from sqlalchemy import text, func, or_, and_, extract
import pandas as pd
from io import BytesIO
from datetime import datetime,date,timedelta
from pydantic import BaseModel, Field
from decimal import Decimal

from app.core.database import get_db
from app.models.employees import Employees as DBEmployee
from app.models.leaves import Leaves as DBLeaves

router = APIRouter()

@router.post("/",response_model=dict)
def create_leave(*,request: Request,db:Session=Depends(get_db),background_tasks: BackgroundTasks,request_in: dict):

    """
        summary : 휴가 일정 등록 함수

        arg : db (Session) : DB 세션

        desc : 
            - 필수 필드 검증 후, 휴가 일정 데이터를 DB에 등록합니다.
            - 등록 성공 시, 생성된 휴가 일정의 정보를 반환합니다.
    """

    try:
        # 휴가 일정 생성 확인용 출력문
        print(f"휴가 일정 생성 시작")

        # 필수 필드 검증
        required_fields = ['employee_id', 'leave_type', 'start_date', 'end_date', 'total_days']
        for field in required_fields:
            if field not in request_in or not request_in[field]:
                raise HTTPException(status_code=422 , detail=f"필수 필드가 누락되었습니다: {field}")
            
        # 데이터 생성
        safe_data = {
            'employee_id': int(request_in['employee_id']),
            'leave_type': str(request_in['leave_type']).strip(),
            'start_date': datetime.strptime(request_in['start_date'], "%Y-%m-%d").date(),
            'end_date': datetime.strptime(request_in['end_date'], "%Y-%m-%d").date(),
            'total_days': Decimal(str(request_in['total_days'])),
        }

        # 직원 존재 여부 확인
        employee = db.query(DBEmployee).filter(DBEmployee.id == safe_data['employee_id']).first()

        # 직원이 존재하지 않으면 404 에러 발생
        if not employee:
            raise HTTPException(status_code=404, detail=f"해당 ID의 팀원을 찾을 수 없습니다: {safe_data['employee_id']}")

        # 요청된 휴가
        requested_days = safe_data["total_days"]

        # 사용 휴가
        current_used_leave = Decimal(str(employee.used_leave or 0))

        # 전체 휴가
        total_leave = Decimal(str(employee.total_leave or 0))

        # 남은 휴가
        remaining_leave = total_leave - current_used_leave

        if requested_days <= 0:
            raise HTTPException(status_code=422,detail="휴가 일수는 0보다 커야 합니다.")
        
        # 요청된 휴가가 남은 휴가보다 많으면 422 에러 발생
        if requested_days > remaining_leave:   
            raise HTTPException(status_code=422, detail=f"요청된 휴가 일수({requested_days})가 남은 휴가 일수({remaining_leave})보다 많습니다.")

        # 휴가 일정 저장
        leave = DBLeaves(**safe_data)
        db.add(leave)

        # 해당 직원의 사용 휴가 일수 누적
        employee.used_leave = current_used_leave + requested_days

        # 휴가 등록과 사용 일수 수정
        db.commit()
        db.refresh(leave)
        db.refresh(employee)

        print(f"휴가 일정 생성 완료")
                
        return {
            "success": 201,
            "message": "휴가 일정이 성공적으로 등록되었습니다.",
            "data": {
                "id": leave.id,
                "employee_id": leave.employee_id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "total_days": leave.total_days
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print(f"휴가 일정 등록 실패: {e}")
        import traceback
        print(f"스택 트레이스: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"휴가 일정 등록에 실패했습니다: {str(e)}")


@router.get("/")
def read_leave_events(
    start: date | None = Query(None, description="조회 시작일"),
    end: date | None = Query(None, description="조회 종료일"),
    db: Session = Depends(get_db),
):
    """
        summary : 휴가 일정 조회 함수
    
        arg : db (Session) : DB 세션
    
        desc : 
            - 
    """
    if start and end and start >= end:
        raise HTTPException(status_code=422,detail="종료일은 시작일보다 이후여야 합니다.")

    query = db.query(DBLeaves, DBEmployee).join(DBEmployee, DBLeaves.employee_id == DBEmployee.id)

    # 조회 기간과 겹치는 휴가만 반환
    if start:
        query = query.filter(DBLeaves.end_date >= start)

    if end:
        query = query.filter(DBLeaves.start_date < end)

    leave_rows = query.order_by(DBLeaves.start_date.asc(), DBLeaves.id.asc()).all()
    
    return [
        {
            "id": str(leave.id),
            "title": f"{employee.name} · {leave.leave_type}",
            "start": leave.start_date.date().isoformat(),
            # FullCalendar 종일 이벤트의 end는 제외 날짜이므로 하루를 더함
            "end": (leave.end_date.date() + timedelta(days=1)).isoformat(),
            "allDay": True,
            "extendedProps": {
                "employeeId": leave.employee_id,
                "leaveType": leave.leave_type,
                "totalDays": float(leave.total_days),
            },
        }
        for leave, employee in leave_rows
    ]