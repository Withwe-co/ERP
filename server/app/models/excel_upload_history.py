from sqlalchemy import Column, Date, Integer, String

from app.core.database import Base


class ExcelUploadHistory(Base):
    __tablename__ = "excel_upload_history"

    id = Column(Integer, primary_key=True, index=True)
    upload_date = Column(Date, nullable=True)
    file_name = Column(String(255), nullable=False)
    uploader = Column(String(100), nullable=False)
    stored_filename = Column(String(255), nullable=True)
    relative_path = Column(String(500), nullable=True)
