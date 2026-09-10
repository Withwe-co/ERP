"""
엔드포인트에서 API 요청 횟수를 제한
"""
from collections import defaultdict, deque
from functools import wraps
from time import time

from fastapi import HTTPException, Request

def rate_limit(max_requests: int, window_seconds: int):
    # 엔드포인트별로 독립된 요청 기록
    request_history: dict[str, deque[float]] = defaultdict(deque)

    def decorator(endpoint):
        @wraps(endpoint)
        def wrapper(*args, **kwargs):
            request: Request | None = kwargs.get("request")

            if request is None:
                raise RuntimeError(
                    "rate_limit을 적용한 엔드포인트에는 "
                    "`request: Request` 파라미터가 필요합니다."
                )

            client_id = request.headers.get("X-Client-Id")

            if client_id:
                # 브라우저별 요청 이력
                limit_key = f"browser:{client_id}"
            else:
                # 헤더가 없는 요청(Postman 등)은 IP 기준으로 제한
                client_ip = request.client.host if request.client else "unknown"
                limit_key = f"ip:{client_ip}"
            now = time()
            history = request_history[limit_key]

            while history and now - history[0] >= window_seconds:
                history.popleft()

            if len(history) >= max_requests:
                retry_after = max(1,int(window_seconds - (now - history[0])))
                raise HTTPException(status_code=429,detail="요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",headers={"Retry-After": str(retry_after)})

            history.append(now)
            return endpoint(*args, **kwargs)

        return wrapper
    return decorator