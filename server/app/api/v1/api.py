from fastapi import APIRouter
from app.api.v1.endpoints import (
    dashboard,
    email_notifications,
    inventory,
    purchase_request,
    upload,
    wbs,
)

api_router = APIRouter()

# 재고 관리 엔드포인트
api_router.include_router(
    inventory.router, 
    prefix="/inventory", 
    tags=["inventory"]
)

# 대시보드 엔드포인트
api_router.include_router(
    dashboard.router, 
    prefix="/dashboard", 
    tags=["dashboard"]
)

# 파일 업로드 엔드포인트
api_router.include_router(
    upload.router, 
    prefix="/upload", 
    tags=["upload"]
)

# 구매 요청 엔드포인트
api_router.include_router(
    purchase_request.router,
    prefix="/purchase-requests",
    tags=["purchase-requests"]
)

# 이메일 발송 엔드포인트
api_router.include_router(
    email_notifications.router,
    prefix="/email-notifications",
    tags=["email-notifications"],
)

# wbs페이지 엔드포인트
api_router.include_router(
    wbs.router,
    prefix="/wbs",
    tags=["wbs"],
)