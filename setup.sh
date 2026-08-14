#!/bin/bash

# 시놀로지 NAS용 인벤토리 관리 시스템 설정 스크립트

set -e

echo "🚀 시놀로지 NAS용 인벤토리 관리 시스템 설정 시작"

# 색깔 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 필요한 디렉토리 생성
create_directories() {
    log_info "필요한 디렉토리 생성 중..."
    
    directories=(
        "data/postgres"
        "data/pgadmin"
        "uploads"
        "logs/api"
        "logs/nginx"
        "logs/postgres"
        "logs/pgadmin"
        "nginx"
        "backend"
        "client"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_success "디렉토리 생성: $dir"
        else
            log_info "디렉토리 존재함: $dir"
        fi
    done
}

# 환경변수 파일 생성
create_env_files() {
    log_info "환경변수 파일 생성 중..."
    
    # 백엔드 .env 파일
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# 앱 설정
PROJECT_NAME=Inventory Management System
VERSION=1.0.0
DEBUG=false
HOST=0.0.0.0
PORT=8000

# API 설정
API_V1_STR=/api/v1

# 데이터베이스 설정
DATABASE_URL=postgresql://inventory_user:inventory_password@postgres:5432/inventory_db

# 보안 설정 - 반드시 변경하세요!
SECRET_KEY=$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS 설정 - NAS IP로 변경하세요
ALLOWED_HOSTS=["http://localhost", "http://localhost:80", "http://http://211.197.16.248/"]
TRUSTED_HOSTS=["localhost", "http://211.197.16.248/"]

# 파일 업로드 설정
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=[".xlsx", ".xls", ".csv"]

# 로그 설정
LOG_LEVEL=info
EOF
        log_success "backend/.env 파일 생성됨"
        log_warning "backend/.env 파일에서 YOUR_NAS_IP를 실제 NAS IP로 변경하세요!"
    else
        log_info "backend/.env 파일이 이미 존재함"
    fi
    
    # 프론트엔드 .env 파일
    if [ ! -f "client/.env" ]; then
        cat > client/.env << EOF
# API URL - NAS IP로 변경하세요
VITE_API_URL=http://http://211.197.16.248:8000/api/v1
VITE_APP_TITLE=Inventory Management System
VITE_APP_VERSION=1.0.0

# 개발용 설정
VITE_DEV_MODE=false
EOF
        log_success "client/.env 파일 생성됨"
        log_warning "client/.env 파일에서 YOUR_NAS_IP를 실제 NAS IP로 변경하세요!"
    else
        log_info "client/.env 파일이 이미 존재함"
    fi
}

# Nginx 설정 파일 복사
setup_nginx() {
    log_info "Nginx 설정 파일 확인 중..."
    
    if [ ! -f "nginx/nginx.conf" ]; then
        log_warning "nginx/nginx.conf 파일이 없습니다. 기본 설정을 생성하세요."
        log_info "GitHub에서 nginx.conf 파일을 다운로드하거나 수동으로 생성하세요."
    else
        log_success "nginx/nginx.conf 파일 존재함"
    fi
}

# Docker 및 Docker Compose 확인
check_docker() {
    log_info "Docker 환경 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        log_info "시놀로지 NAS에서 Package Center -> Docker 설치하세요."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다."
        log_info "SSH로 접속하여 docker-compose를 설치하세요:"
        log_info "sudo curl -L \"https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
        log_info "sudo chmod +x /usr/local/bin/docker-compose"
        exit 1
    fi
    
    log_success "Docker 환경 확인 완료"
}

# 디스크 공간 확인
check_disk_space() {
    log_info "디스크 공간 확인 중..."
    
    available_space=$(df -h . | awk 'NR==2{print $4}')
    log_info "사용 가능한 공간: $available_space"
    
    # 최소 2GB 필요 (대략적인 체크)
    available_kb=$(df . | awk 'NR==2{print $4}')
    if [ "$available_kb" -lt 2097152 ]; then  # 2GB = 2097152KB
        log_warning "디스크 공간이 부족할 수 있습니다. 최소 2GB 이상 권장합니다."
    else
        log_success "디스크 공간 충분함"
    fi
}

# 권한 설정
set_permissions() {
    log_info "디렉토리 권한 설정 중..."
    
    # 로그 디렉토리 권한
    chmod -R 755 logs/
    chmod -R 755 uploads/
    chmod -R 755 data/
    
    log_success "권한 설정 완료"
}

# Docker 이미지 빌드 및 시작
start_services() {
    log_info "Docker 서비스 시작 중..."
    
    # 이전 컨테이너 정리
    docker-compose down 2>/dev/null || true
    
    # 이미지 빌드 및 서비스 시작
    if docker-compose up -d --build; then
        log_success "서비스 시작 완료!"
        
        log_info "서비스 상태 확인 중..."
        sleep 10
        docker-compose ps
        
        log_info ""
        log_success "🎉 설정 완료!"
        log_info ""
        log_info "접속 정보:"
        log_info "- 메인 애플리케이션: http://http://211.197.16.248/"
        log_info "- API 문서: http://http://211.197.16.248:8000/docs"
        log_info "- pgAdmin (관리도구): http://http://211.197.16.248:5050"
        log_info ""
        log_info "유용한 명령어:"
        log_info "- 로그 확인: docker-compose logs -f"
        log_info "- 서비스 중지: docker-compose down"
        log_info "- 서비스 재시작: docker-compose restart"
        log_info ""
        log_warning "환경변수 파일(.env)에서 YOUR_NAS_IP를 실제 IP로 변경하는 것을 잊지 마세요!"
        
    else
        log_error "서비스 시작 실패"
        log_info "로그를 확인하세요: docker-compose logs"
        exit 1
    fi
}

# 메인 실행
main() {
    echo "============================================"
    echo "🏠 시놀로지 NAS용 인벤토리 관리 시스템 설정"
    echo "============================================"
    echo ""
    
    check_docker
    check_disk_space
    create_directories
    create_env_files
    setup_nginx
    set_permissions
    
    echo ""
    read -p "Docker 서비스를 시작하시겠습니까? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    else
        log_info "나중에 'docker-compose up -d'로 서비스를 시작할 수 있습니다."
    fi
}

# 스크립트 실행
main "$@"