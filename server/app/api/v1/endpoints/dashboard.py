"""
대시보드 통계 정보 조회 및 그래프 정보 
"""
from fastapi import APIRouter, Depends
from datetime import date, datetime, timedelta
from sqlalchemy import func,text,select,extract
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.purchase_request import PurchaseRequest
from app.models.unified_inventory import UnifiedInventory
router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
        summary : 대시보드 화면에 표시할 통계 정보 조회 및 그래프 정보 조회
        
        arg : db (Session) : 데이터베이스 세션 객체
        
        desc:
                - 구매 요청,구매 완료,수령 대기,수령 완료 수 전달 
                - 제출된 구매 요청 목록 (구매 요청 상태)
                - 월별 구매 금액 합계 (연간)
                - 월별 카테고리별 구매 금액 합계 (연간)
                - 이번 달 기타 항목 구매 내역
    """

    # 오늘 날짜, 이번 연도, 이번 달의 시작 계산
    today = date.today()
    start_of_month = today.replace(day=1)
    start_of_next_month = (start_of_month + timedelta(days=32)).replace(day=1)
    start_of_year = today.replace(month=1, day=1)
    start_of_next_year = today.replace(year=today.year + 1, month=1, day=1)

    # 지표 카드 통계 정보 조회 (구매 요청 수, 완료된 구매 요청 수, 수령 대기 재고 수, 수령된 통합 재고 수)
    submitted_purchase_requests=(db.query(func.count(PurchaseRequest.id)).filter(PurchaseRequest.status=="SUBMITTED").scalar()) or 0
    completed_purchase_requests=(db.query(func.count(PurchaseRequest.id)).filter(PurchaseRequest.status=="COMPLETED").scalar()) or 0
    unreceipt_unified_inventory=(db.query(func.count(UnifiedInventory.id)).filter(func.json_array_length(UnifiedInventory.receipt_history)==0).scalar()) or 0
    receipt_unified_inventory=(db.query(func.count(UnifiedInventory.id)).filter(func.json_array_length(UnifiedInventory.receipt_history)!=0).scalar()) or 0

    # 구매 요청 목록 조회 (구매 요청 상태)
    recent_purchase_requests=(db.query(PurchaseRequest).filter(PurchaseRequest.status=="SUBMITTED").order_by(PurchaseRequest.request_date.desc()).all())

    # 월별 구매 금액 합계 (연간)
    # 상태 COMPLETED인 구매 요청을 대상으로, 이번 연도에 해당하는 월별 구매 금액 합계를 계산
    monthly_purchase_rows=(db.query(
        func.to_char(PurchaseRequest.request_date,"MM").label("month"),
        func.coalesce(func.sum(PurchaseRequest.total_budget),0).label("amount")
        )
        .filter(
            PurchaseRequest.status == "COMPLETED",
            PurchaseRequest.request_date >= start_of_year,
            PurchaseRequest.request_date < start_of_next_year
            )
            .group_by(func.to_char(PurchaseRequest.request_date, "MM"))
            .order_by(func.to_char(PurchaseRequest.request_date, "MM")).all())

    # 월별 카테고리별 구매 금액 합계 (연간)
    # 상태 COMPLETED인 구매 요청을 대상으로, 이번 연도에 해당하는 월별 카테고리별 구매 금액 합계를 계산
    monthly_category_purchase_rows=(db.query(
            func.to_char(PurchaseRequest.request_date,"MM").label("month"),
            PurchaseRequest.category.label("category"),
            func.coalesce(func.sum(PurchaseRequest.total_budget),0).label("amount")
            )
            .filter(
                PurchaseRequest.status == "COMPLETED",
                PurchaseRequest.request_date >= start_of_year,
                PurchaseRequest.request_date < start_of_next_year
                )
                .group_by(func.to_char(PurchaseRequest.request_date, "MM"), PurchaseRequest.category)
                .order_by(func.to_char(PurchaseRequest.request_date, "MM"), PurchaseRequest.category).all())

    # 이번 달 기타 항목 구매 내역 조회
    # 상태 COMPLETED인 구매 요청을 대상으로, 이번 연도에 해당하는 월별 카테고리: 기타, 품목명 별 구매 내역을 조회
    monthly_other_item_purchase_rows=(db.query(
            func.to_char(PurchaseRequest.request_date,"MM").label("month"),
            PurchaseRequest.item_name.label("item_name"),
            func.coalesce(func.sum(PurchaseRequest.total_budget),0).label("amount")
            )
            .filter(
                PurchaseRequest.status == "COMPLETED",
                PurchaseRequest.category=="OTHER",
                PurchaseRequest.request_date >= start_of_year,
                PurchaseRequest.request_date < start_of_next_year
                )
                .group_by(func.to_char(PurchaseRequest.request_date, "MM"), PurchaseRequest.item_name)
                .order_by(func.to_char(PurchaseRequest.request_date, "MM"), PurchaseRequest.item_name).all()
            )

    # 이번 달 기타 항목 구매 내역을 월별로 정리
    other_item_monthly_amounts = {}
    current_month_number = datetime.now().month
    current_month = f"{current_month_number:02d}"

    # 새로운 품목의 모든 달 금액을 0으로 초기화하고, 해당 달의 금액을 업데이트
    for row in monthly_other_item_purchase_rows:
        if row.item_name not in other_item_monthly_amounts:
            other_item_monthly_amounts[row.item_name] = {str(month).zfill(2): 0 for month in range(1, current_month_number+1)}

        other_item_monthly_amounts[row.item_name][row.month] = float(row.amount)

    # 이번 달에 구매된 기타 항목 이름 목록 생성 => 동적 Tab으로 표시하기 위함
    this_month_other_items = [
        item_name
        for item_name, months in other_item_monthly_amounts.items()
        if months[current_month] > 0
    ]
    
    return {
        "submittedPurchaseRequests": submitted_purchase_requests,
        "completedPurchaseRequests": completed_purchase_requests,
        "unreceiptUnifiedInventory": unreceipt_unified_inventory,
        "receiptUnifiedInventory": receipt_unified_inventory,
        "recentPurchaseRequests" : [
            {
                "id":request.id,
                "itemName": request.item_name,
                "requesterName":request.requester_name,
                "quantity":request.quantity,
                "requestDate":request.request_date.isoformat() if request.request_date else None,
                "totalBudget":request.total_budget,
                "currency":request.currency,
            }
            for request in recent_purchase_requests
        ],
        "monthlyPurchaseAmounts":[
            {
                "month":row.month,
                "amount":float(row.amount)
            }
            for row in monthly_purchase_rows
        ],
        "monthlyCategoryPurchaseAmounts":[
            {
                "month":row.month,
                "category":row.category,
                "amount":float(row.amount)
            }
            for row in monthly_category_purchase_rows
        ],
        "this_month_other_items": this_month_other_items,
        "other_item_monthly_amounts":[
            {
                "item_name": item_name,
                "monthly_amounts": [
                    {"month": month, "amount": float(amount)}
                    for month, amount in months.items()
                ],
            }
            for item_name,months in other_item_monthly_amounts.items()
        ]
    }

@router.get("/")
async def get_dashboard():
    """대시보드 메인"""
    return {
        "message": "인벤토리 관리 대시보드",
        "version": "1.0.0",
        "endpoints": {
            "stats": "/api/v1/dashboard/stats",
            "inventory": "/api/v1/inventory",
            "upload": "/api/v1/upload"
        }
    }