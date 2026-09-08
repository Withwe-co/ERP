"""
엔드포인트에서 API 요청 횟수를 제한
"""
from collections import defaultdict, deque
from functools import wraps
from time import time

from fastapi import HTTPException, Request

request_history: dict[str, deque[float]] = defaultdict(deque)

def rate_limit(max_requests: int, window_seconds: int):
    def decorator(endpoint):
        @wraps(endpoint)
        def wrapper(*args, **kwargs):
            request: Request | None = kwargs.get("request")

            if request is None:
                raise RuntimeError(
                    "rate_limit을 적용한 엔드포인트에는 "
                    "`request: Request` 파라미터가 필요합니다."
                )

            client_ip = request.client.host if request.client else "unknown"
            now = time()
            history = request_history[client_ip]

            while history and now - history[0] >= window_seconds:
                history.popleft()

            if len(history) >= max_requests:
                raise HTTPException(status_code=429,detail="요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",headers={"Retry-After": str(window_seconds)})

            history.append(now)
            return endpoint(*args, **kwargs)

        return wrapper
    return decorator