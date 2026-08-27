# 구매요청 등록 시 카카오 알림톡 발송

구매요청이 새로 등록되면 구매 담당자 카카오톡으로 알림톡이 가도록 개발해 주세요. NHN Cloud KakaoTalk Bizmessage 알림톡 API v2.2 기준으로 작업하면 됩니다.

## 작업 범위

- 대상: `POST /api/v1/purchase-requests/`
- 구매요청이 DB에 정상 저장된 경우에만 발송
- 수정, 승인, 반려, 완료, 삭제, Excel 일괄 등록은 제외
- 프런트 화면과 기존 `KakaoPage.tsx`는 수정하지 않음

## 알림 내용

```text
[NAS ERP 구매요청 안내]
신규 구매요청이 등록되었습니다.
요청번호 / 품목 / 수량 / 예상금액 / 긴급도
요청자·부서 / 등록시각 / 구매요청 목록 링크
```

- 금액이 없으면 `미입력`, 긴급도는 한글로 표시해 주세요.
- 등록시각은 한국 시간, 요청자는 `이름 / 부서` 형식으로 표시해 주세요.
- 이메일, 전화번호, 공급업체 연락처, 상세 사양, 구매 사유는 넣지 마세요.

## 구현 기준

- DB 저장 후 FastAPI `BackgroundTasks`로 발송해 주세요.
- 알림 발송이 실패해도 구매요청 등록은 정상 처리되어야 합니다.
- 알림 코드는 `server/app/services/notifications/`로 분리해 주세요.
- 같은 구매요청이 중복 발송되지 않도록 구매요청 ID를 멱등성 키로 사용해 주세요.
- 타임아웃은 5초로 하고 연결 오류, 429, 500 이상 오류만 한 번 재시도해 주세요.
- 문자 대체발송은 사용하지 마세요.

## 환경설정

`.env`에서 아래 값을 관리해 주세요.

`NOTIFICATION_ENABLED`, `ERP_PUBLIC_BASE_URL`, `KAKAO_ALIMTALK_APP_KEY`, `KAKAO_ALIMTALK_SECRET_KEY`, `KAKAO_ALIMTALK_SENDER_KEY`, `KAKAO_ALIMTALK_TEMPLATE_CODE`, `KAKAO_ALIMTALK_RECIPIENTS`

실제 키와 전화번호는 코드, 로그, Git에 남기지 마세요. 키, 승인 템플릿, 테스트 전화번호가 준비되지 않았으면 mock 테스트까지만 진행해 주세요.

## 완료 기준

- 신규 구매요청 등록 후 알림톡이 한 건만 오는지 확인
- 알림 내용이 구매요청 정보와 일치하는지 확인
- 알림 실패 또는 비활성 상태에서도 구매요청이 정상 등록되는지 확인
- 수정 및 일괄 등록에서는 알림이 발생하지 않는지 확인
- 기존 구매요청 등록 기능에 문제가 없는지 확인
- 변경 파일과 테스트 결과 정리

API 참고: [NHN Cloud 알림톡 API v2.2](https://docs.nhncloud.com/ko/Notification/KakaoTalk%20Bizmessage/ko/alimtalk-api-guide-v2.2/)

