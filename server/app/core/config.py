import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # 앱 설정
    PROJECT_NAME: str = "Inventory Management System"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # API 설정
    API_V1_STR: str = "/api/v1"
    
    # 데이터베이스 설정
    DATABASE_URL: str = "postgresql://username:password@localhost:5432/inventory_db"
    
    # 보안 설정
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS 설정
    ALLOWED_HOSTS: List[str] = ["http://localhost:3001", "http://127.0.0.1:3001"]
    TRUSTED_HOSTS: Optional[List[str]] = None
    
    # 파일 업로드 설정
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".xlsx", ".xls", ".csv"]
    
    # 카카오 API 설정 (필요시)
    KAKAO_API_KEY: Optional[str] = None

    # NHN Cloud KakaoTalk Bizmessage Alimtalk
    NOTIFICATION_ENABLED: bool = False
    ERP_PUBLIC_BASE_URL: str = ""
    KAKAO_ALIMTALK_APP_KEY: str = ""
    KAKAO_ALIMTALK_SECRET_KEY: str = ""
    KAKAO_ALIMTALK_SENDER_KEY: str = ""
    KAKAO_ALIMTALK_TEMPLATE_CODE: str = ""
    KAKAO_ALIMTALK_RECIPIENTS: str = ""

    # SMTP email notification
    SMTP_ENABLED: bool = False
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_RECIPIENTS: str = ""
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    # 한국천문연구원 특일 정보 API 일반 키
    KOREA_HOLIDAY_SERVICE_KEY: Optional[str] = None
    
    #class Config:
    #    env_file = ".env"
    #    case_sensitive = True

    class Config:
        env_file = Path(__file__).resolve().parents[2] / ".env"
        case_sensitive = True

# 환경변수에서 설정 로드
settings = Settings()

# 업로드 디렉토리 생성
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
