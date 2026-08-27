# 종합 ERP 관리 시스템

시놀로지 NAS에서 Docker를 통해 실행되는 구매 요청 및 물품 수령 관리 웹 애플리케이션입니다.

## 🎯 주요 기능

- **구매 요청 관리**: 품목 구매 요청 등록, 승인, 추적
- **품목 관리**: 품목 등록, 현황 조회, 상태 관리
- **수령 처리**: 물품 수령 등록 및 처리
- **이메일 발송**: 물품 구매 시 담당자에게 이메일 발송 후 발송 이력 저장
- **Excel 파일 지원**: 대량 데이터 업로드 및 내보내기
- **실시간 대시보드**: 구매 현황 및 통계 확인
- **프로젝트 관리**: WBS(간트차트, 칸반보드)를 이용한 프로젝트 관리
- **반응형 디자인**: 모바일 및 데스크톱 최적화

## 📋 시스템 요구사항

- 시놀로지 NAS (DSM 7.0 이상 권장)
- Docker 패키지 설치
- Docker Compose 지원
- 최소 1GB RAM (2GB 권장)
- 2GB 디스크 공간

## 🚀 빠른 설치 (시놀로지 NAS)

### 1. SSH 접속
```bash
ssh admin@your-nas-ip
```

### 2. 프로젝트 다운로드
```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p /volume1/docker/inventory-system
cd /volume1/docker/inventory-system

# 프로젝트 파일들을 이 디렉토리에 업로드하세요
```

### 3. 자동 설치 스크립트 실행
```bash
sudo bash setup.sh
```

### 4. 웹 접속
브라우저에서 `http://your-nas-ip` 접속

## 🔧 수동 설치

### 1. 환경 설정
```bash
# .env 파일 생성
cp .env.example .env
nano .env
```

### 2. Docker 컨테이너 빌드 및 실행
```bash
# 이미지 빌드
docker-compose build

# 컨테이너 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 3. 서비스 확인
```bash
# 컨테이너 상태 확인
docker-compose ps

# 헬스체크
curl http://localhost:3001/api/health
```

## 📱 사용 방법

### 대시보드
- 전체 현황 한눈에 보기
- 최근 활동 내역 확인
- 빠른 작업 링크

### 구매 요청
1. "구매 요청" 메뉴 선택
2. "새 구매 요청" 버튼 클릭
3. 품목 정보 입력
4. 제출 후 승인 대기

### 재고 관리
1. "품목 관리" 메뉴 선택
2. 품목 목록 확인
3. 필터링 및 검색 기능 활용
4. 품목 상태 업데이트

### 수령 처리
1. "수령 관리" 메뉴 선택
2. "수령 등록" 버튼 클릭
3. 품목 번호 입력 후 조회
4. 수령 정보 입력 후 처리

### 이메일 발송
1. 구매 요청 성공 시 구매 담당자에게 이메일 발송
2. "이메일 발송 이력" 메뉴 선택
3. 필터링 및 검색 기능 활용
4. 이메일 발송 이력 조회

### 프로젝트 관리
1. "WBS" 메뉴 선택
2. "프로젝트 등록" 버튼 클릭
3. 프로젝트 정보 입력
4. 프로젝트 관리
5. 프로젝트 행 선택
6. "WBS 추가" 버튼 클릭
7. WBS 정보 입력
8. 프로젝트 관리
9. "전체 태스크" 탭 클릭
10. "태스크 등록" 버튼 클릭
11. 태스크 정보 입력
12. 태스크 관리

### Excel 파일 업로드
1. "파일 관리" 메뉴 선택
2. Excel 파일 드래그 앤 드롭 또는 선택
3. 업로드 후 처리 결과 확인

## 🛠️ 관리 및 운영

### 컨테이너 관리
```bash
# 상태 확인
docker-compose ps

# 서비스 재시작
docker-compose restart

# 서비스 중지
docker-compose stop

# 서비스 시작
docker-compose start

# 로그 실시간 보기
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f api-server
docker-compose logs -f web-client
```

### 데이터 백업
```bash
# 전체 데이터 백업
tar -czf backup-$(date +%Y%m%d).tar.gz data/ uploads/

# 데이터만 백업
tar -czf data-backup-$(date +%Y%m%d).tar.gz data/

# 업로드 파일 백업
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### 업데이트
```bash
# 최신 이미지 가져오기
docker-compose pull

# 서비스 재시작
docker-compose up -d

# 또는 전체 재빌드
docker-compose build --no-cache
docker-compose up -d
```

## 🌐 네트워크 설정

### 포트 포워딩 (외부 접속)
시놀로지 DSM에서:
1. 제어판 → 외부 접근 → 라우터 구성
2. 포트 80, 3001을 외부 포트로 설정
3. 방화벽에서 해당 포트 허용

### 리버스 프록시 설정 (HTTPS)
1. DSM → 제어판 → 애플리케이션 포털
2. 리버스 프록시 → 생성
3. 소스: your-domain.com, 대상: localhost:80

### 도메인 설정
1. DDNS 설정 (DSM → 제어판 → 외부 접근 → DDNS)
2. SSL 인증서 설정 (Let's Encrypt)
3. 리버스 프록시에 HTTPS 적용

## 🔒 보안 설정

### 필수 보안 설정
1. **.env 파일의 기본 시크릿 키 변경**
```bash
# 강력한 랜덤 키 생성
openssl rand -base64 32

# .env 파일 수정
SESSION_SECRET=your_strong_secret_here
JWT_SECRET=your_strong_jwt_secret_here
```

2. **방화벽 설정**
- 필요한 포트만 개방 (80, 443, 3001)
- 불필요한 포트 차단

3. **접근 제한**
- VPN 사용 권장
- IP 제한 설정 (필요시)

4. **정기 업데이트**
- Docker 이미지 정기 업데이트
- 시놀로지 DSM 업데이트

## 📊 모니터링

### 시스템 상태 확인
```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 메모리 사용량
free -h

# 시스템 로그
docker-compose logs --tail=100
```

### 성능 최적화
1. 메모리 부족 시 Docker 메모리 제한 조정
2. 로그 파일 정기 정리
3. 불필요한 데이터 정리

## 🛠️ 문제 해결

### 일반적인 문제

**1. 컨테이너가 시작되지 않는 경우**
```bash
# 포트 충돌 확인
netstat -tlnp | grep :80
netstat -tlnp | grep :3001

# 로그 확인
docker-compose logs

# 컨테이너 재빌드
docker-compose build --no-cache
docker-compose up -d
```

**2. 웹페이지에 접속되지 않는 경우**
```bash
# 방화벽 상태 확인
sudo iptables -L

# 서비스 상태 확인
curl http://localhost/api/health

# Nginx 설정 확인 (컨테이너 내부)
docker-compose exec web-client nginx -t
```

**3. 파일 업로드 오류**
- 파일 크기 제한 확인 (50MB)
- Excel 파일 형식 확인 (.xlsx, .xls)
- 업로드 디렉토리 권한 확인

**4. 메모리 부족**
```bash
# 메모리 사용량 확인
docker stats

# Docker Compose에서 메모리 제한 조정
# docker-compose.yml의 deploy.resources.limits.memory 값 수정
```

### 로그 파일 위치
- 애플리케이션 로그: `./logs/`
- Docker 로그: `docker-compose logs`
- 시놀로지 시스템 로그: DSM → 로그 센터


### 개발 환경 설정
```bash
# 개발 모드로 실행
docker-compose -f docker-compose.dev.yml up

# 프론트엔드 개발 서버
cd client && npm run dev

# 백엔드 개발 서버  
cd server && npm run dev
```


## 🔄 버전 히스토리

- **v1.0.0**: 초기 릴리스
  - 구매 요청 관리
  - 재고 관리
  - 수령 처리
  - 카카오톡 메시지 파싱
  - Excel 업로드/다운로드
  - 반응형 웹 인터페이스

---
