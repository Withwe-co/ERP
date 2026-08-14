from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.core.database import Base


class EmailNotificationLog(Base):
    __tablename__ = "email_notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String, index=True, nullable=True)
    recipients = Column(Text, nullable=False)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    html_content = Column(Text, nullable=True)
    status = Column(String, index=True, nullable=False)
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
