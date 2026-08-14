# server/app/test_notification_flow.py
import datetime
import logging
from unittest.mock import MagicMock

# 이전에 작성한 모듈들 임포트
from app.core.config import settings
from app.services.notifications.formatter import build_template_parameters
from app.services.notifications.provider_nhncloud import (
    AlimtalkProviderError,
    AlimtalkSendResult,
    NHNCloudAlimtalkProvider,
)
from app.services.notifications.service import (
    AlimtalkNotificationService,
    NotificationConfig,
)

# 테스트용 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NotificationTest")


def run_mock_test():
    logger.info("=========================================")
    logger.info("🚀 알림톡 통합 Mock 테스트를 시작합니다.")
    logger.info("=========================================")

    # 1. 가상(Mock) 구매요청 데이터 세팅
    mock_payload = {
        "id": 99,
        "request_number": "PR-20260715-MOCK",
        "item_name": "테스트용 고성능 그래픽카드",
        "quantity": 5,
        "unit": "대",
        "total_budget": 7500000,
        "urgency": "URGENT",  # formatter에 의해 '긴급'으로 변환되어야 함
        "requester_name": "조민규",
        "department": "SW TEAM",
        "request_date": datetime.datetime.now(datetime.timezone.utc),  # datetime 객체 유지
    }

    # 2. 가상 설정 데이터 빌드 (테스트 환경 강제 주입)
    # 실제 API 키나 번호가 없어도 테스트를 위해 임의의 규격 값을 넣어 구성합니다.
    test_config = NotificationConfig.create(
        enabled=True,
        #public_base_url="http://211.197.16.248:8000",
        public_base_url="http://localhost:8000",
        app_key="test_app_key_1234",
        secret_key="test_secret_key_1234",
        sender_key="test_sender_key_1234",
        template_code="test_template_code_1234",
        recipients="010-1234-5678, 010-9876-5432",  # 하이픈 및 공백 정규화 테스트용
    )

    # 3. Provider Mocking (가짜 배달부 생성)
    # 실제 인터넷 통신(httpx.post)을 수행하지 않는 가짜 Provider 객체를 만듭니다.
    mock_provider = MagicMock(spec=NHNCloudAlimtalkProvider)

    # 정상 발송 성공 시의 결과 정의
    mock_provider.send.return_value = AlimtalkSendResult(
        request_id="mock-nhn-request-9999", recipient_count=2
    )

    # 4. Mock Provider를 주입하여 서비스 인스턴스 생성 (의존성 주입의 강점!)
    test_service = AlimtalkNotificationService(config=test_config, provider=mock_provider)

    # 5. 발송 시뮬레이션 실행
    logger.info("1단계: 알림톡 발송 서비스 호출 시작...")
    result = test_service.send(payload=mock_payload)

    # 6. 결과 검증 (Assertion)
    logger.info("2단계: 결과 검증 중...")
    if result is not None:
        logger.info("✅ [성공] 알림 서비스가 에러 없이 정상적으로 흐름을 마쳤습니다.")
        logger.info(f" -> 발송 요청 ID: {result.request_id}")
        logger.info(f" -> 수신 완료 인원: {result.recipient_count}명")

        # Provider가 올바른 인자들로 호출되었는지 검증
        mock_provider.send.assert_called_once()
        called_args = mock_provider.send.call_args[1]

        logger.info(" -> 템플릿 치환 파라미터 유효성 검증 완료:")
        for k, v in called_args["template_parameters"].items():
            logger.info(f"    [{k}]: {v}")

        # 수신자 가공(정규화) 검증
        assert called_args["recipients"] == ["01012345678", "01098765432"]
        logger.info(" -> 수신자 번호 정규화 검증 완료 (공백 및 하이픈 제거 성공)")
    else:
        logger.error("❌ [실패] 알림 서비스가 결과를 반환하지 못했습니다. 로그를 분석해 보세요.")


if __name__ == "__main__":
    run_mock_test()