import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.holiday_service import (
    get_korean_holidays as get_korean_holidays_service,
)


router = APIRouter()


@router.get("/")
async def get_korean_holidays(year: int = Query(..., ge=1900, le=2100),):
    """한국천문연구원 특일 정보를 이용하여 공휴일을 조회한다."""

    try:
        holidays = await get_korean_holidays_service(year)

    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error),) from error

    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(status_code=502, detail="공휴일 정보를 불러오지 못했습니다.",) from error

    return {"year": year, "holidays": holidays,}
