"""대한민국 공휴일 조회 서비스."""

from datetime import date
from typing import Any

import httpx

from app.core.config import settings


HOLIDAY_API_URL = (
    "https://apis.data.go.kr/B090041/openapi/service/"
    "SpcdeInfoService/getRestDeInfo"
)

holiday_cache: dict[int, list[dict[str, str]]] = {}


async def get_korean_holidays(year: int,) -> list[dict[str, str]]:
    """한국천문연구원 API에서 해당 연도의 공휴일을 조회한다."""

    if year in holiday_cache:
        return holiday_cache[year]

    if not settings.KOREA_HOLIDAY_SERVICE_KEY:
        raise RuntimeError(
            "KOREA_HOLIDAY_SERVICE_KEY 환경변수가 설정되지 않았습니다."
        )

    params = {
        "ServiceKey": settings.KOREA_HOLIDAY_SERVICE_KEY,
        "solYear": str(year),
        "numOfRows": 100,
        "_type": "json",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(HOLIDAY_API_URL, params=params,)
        response.raise_for_status()
        payload: dict[str, Any] = response.json()

    body = payload.get("response", {}).get("body", {})
    items = body.get("items", {}).get("item", [])

    if isinstance(items, dict):
        items = [items]

    holidays = []

    for item in items:
        if item.get("isHoliday") != "Y":
            continue

        locdate = str(item["locdate"])

        holidays.append({
            "date": (
                f"{locdate[:4]}-"
                f"{locdate[4:6]}-"
                f"{locdate[6:8]}"
            ),
            "name": item.get("dateName", ""),
        })

    holiday_cache[year] = holidays

    return holidays


async def is_korean_holiday(target_date: date,) -> bool:
    """지정한 날짜가 대한민국 공휴일인지 확인한다."""

    holidays = await get_korean_holidays(target_date.year)
    target = target_date.isoformat()

    return any(
        holiday["date"] == target
        for holiday in holidays
    )
