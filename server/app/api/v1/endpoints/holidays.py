from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings

router = APIRouter()

HOLIDAY_API_URL = (
    "https://apis.data.go.kr/B090041/openapi/service/"
    "SpcdeInfoService/getRestDeInfo"
)

# 서버가 실행되는 동안 같은 연도의 결과를 재사용
holiday_cache: dict[int, list[dict[str, str]]] = {}


@router.get("/")
async def get_korean_holidays(year: int = Query(..., ge=1900, le=2100),):
    """
        summary : 한국천문연구원 특일 정보를 이용하여 공휴일을 불러오는 함수

        arg : 
            - year : 해당 년도
        
        desc : 
            - 
    """
    if year in holiday_cache:
        return {"year": year, "holidays": holiday_cache[year]}

    # 키 미설정 시 500에러 반환
    if not settings.KOREA_HOLIDAY_SERVICE_KEY:
        raise HTTPException(status_code=500,detail="KOREA_HOLIDAY_SERVICE_KEY 환경변수가 설정되지 않았습니다.",)


    params = {
        "ServiceKey": settings.KOREA_HOLIDAY_SERVICE_KEY,
        "solYear": str(year),
        "numOfRows": 100,
        "_type": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(HOLIDAY_API_URL, params=params)
            response.raise_for_status()
            payload: dict[str, Any] = response.json()
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(status_code=502,detail="공휴일 정보를 불러오지 못했습니다.",) from error

    body = payload.get("response", {}).get("body", {})
    items = body.get("items", {}).get("item", [])

    # 공휴일이 하나일 때 API가 객체 하나만 반환하는 경우 대응
    if isinstance(items, dict):
        items = [items]

    holidays = []

    for item in items:
        if item.get("isHoliday") != "Y":
            continue

        locdate = str(item["locdate"])  # 예: 20260101

        holidays.append({
            "date": f"{locdate[:4]}-{locdate[4:6]}-{locdate[6:8]}",
            "name": item.get("dateName", ""),
        })

    holiday_cache[year] = holidays

    return {"year": year, "holidays": holidays}