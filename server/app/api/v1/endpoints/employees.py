from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response,Request
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.schemas.employees import (UpdateEmployee,EmployeesList,EmployeeInDB)

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


@router.put("/{employee_id}",response_model=dict)
def update_employee(employee_id: int,request_in: UpdateEmployee,db:Session=Depends(get_db)):

    """
        summary : 팀원 수정 함수

        arg : 
            - employee_id (int) : 수정 팀원 ID
            - request_in : 수정스키마
            - db (Session) : DB 세션
            
        desc : 
            - DB에서 전달받은 id와 같은 데이터 조회
            - 전달받은 id가 DB에 없으면 404 에러 반환
            - 실제로 전달된 부분과 변경된 부분 확인
            - 변경된 값 X -> 400에러 반환
            - DB에 데이터 저장
            - 예외 처리 : 500 에러 반환 & Rollback
    """

    try:
        # DB에서 전달받은 id조회
        employee=db.query(DBEmployee).filter(DBEmployee.id==employee_id).first()

        # DB에서 id조회 실패 -> 404에러
        if employee is None:
            raise HTTPException(status_code=404,detail="팀원을 찾을 수 없습니다.")

        # 실제로 전달된 항목만 추출
        update_data = request_in.model_dump(exclude_unset=True)

        # 실제로 변경된 부분 확인
        changed_data = {
            field: value
            for field, value in update_data.items()
            if getattr(employee, field) != value
        }

        # 실제로 변경된 값 X -> 400 에러
        if not changed_data:
            raise HTTPException(status_code=400,detail="수정 사항이 없습니다.")

        # 수정값으로 변경
        for field, value in changed_data.items():
            setattr(employee,field,value)

        db.commit()
        db.refresh(employee)

        return {
            # 성공 코드
            "success": 200,
            "message": "팀원정보가 수정되었습니다.",
            "data": EmployeeInDB.model_validate(employee).model_dump(),
        }

    except HTTPException:
            raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"팀원 수정 중 오류가 발생했습니다: {str(e)}")


@router.delete("/{employee_id}")
def delete_employee(employee_id: int,db: Session = Depends(get_db)):
    """
        summary : 팀원 삭제 함수

        arg : 
            - id(int) : 해당 팀원의 ID
            - db(Session) : 데이터베이스
        
        desc :
            - 해당 ID에 맞는 팀원 조회
            - 조회 실패 시 -> 404에러
            - db에서 팀원 삭제
            - 삭제 실패 시 -> 500에러
    """
    # 해당 ID에 맞는 팀원 조회
    employee=db.query(DBEmployee).filter(DBEmployee.id==employee_id).first()

    # 조회 실패 시 -> 404에러
    if employee is None:
        raise HTTPException(status_code=404, detail="팀원을 찾을 수 없습니다.")

    # db에서 팀원 삭제
    try:
        db.delete(employee)
        db.commit()
    except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"팀원 삭제 중 오류가 발생했습니다: {str(e)}")

    return {
        "success": 204,
        "message": "팀원이 삭제되었습니다.",
    }