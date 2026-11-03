"""
    KakaoPage.tsx에 이메일 발송 이력 조회
"""
from datetime import timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.email_notification_log import EmailNotificationLog


router = APIRouter()


@router.get("/")
def read_email_notification_logs(
    db: Session = Depends(get_db),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
):
    """
        summary: 이메일 발송 이력을 불러오는 함수

        arg: 
            db : 데이터베이스 세션 객체
            skip : 
            limit : 
            search : 
            status : 

    """
    query = db.query(EmailNotificationLog)

    if search and search.strip():
        keyword = f"%{search.strip()}%"
        query = query.filter(
            or_(
                EmailNotificationLog.request_number.ilike(keyword),
                EmailNotificationLog.recipients.ilike(keyword),
                EmailNotificationLog.subject.ilike(keyword),
                EmailNotificationLog.content.ilike(keyword),
            )
        )
    if status in {"SUCCESS", "FAILED"}:
        query = query.filter(EmailNotificationLog.status == status)

    total = query.count()
    items = (
        query.order_by(EmailNotificationLog.sent_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "request_number": item.request_number,
                "recipients": item.recipients.split(",") if item.recipients else [],
                "subject": item.subject,
                "content": item.content,
                "html_content": item.html_content,
                "status": item.status,
                "error_message": item.error_message,
                "sent_at": (
                    item.sent_at.replace(tzinfo=timezone.utc).isoformat()
                    if item.sent_at and item.sent_at.tzinfo is None
                    else item.sent_at.isoformat() if item.sent_at else None
                ),
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.delete("/{log_id}")
def delete_email_notification_log(
    log_id: int,
    db: Session = Depends(get_db),
):
    item = db.query(EmailNotificationLog).filter(
        EmailNotificationLog.id == log_id
    ).first()
    if item is None:
        raise HTTPException(status_code=404, detail="이메일 발송 이력을 찾을 수 없습니다.")

    db.delete(item)
    db.commit()
    return {"success": True, "id": log_id}
