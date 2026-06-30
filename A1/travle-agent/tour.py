"""TourAPI 범용 클라이언트 (축제·숙박 공통 사용)."""

import os
import requests

TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService1"


def _call_tour_api(endpoint: str, params: dict, errors: list) -> list:
    """TourAPI 범용 호출 함수. endpoint와 추가 params를 받아 items 반환."""
    api_key = os.getenv("TOUR_API_KEY")
    if not api_key:
        errors.append({"step": endpoint, "type": "KEY_MISSING", "message": "TOUR_API_KEY 환경변수 누락"})
        return []

    base_params = {
        "serviceKey": api_key,
        "MobileOS": "ETC",
        "MobileApp": "TravelPlanner",
        "_type": "json",
        "numOfRows": 10,
        "pageNo": 1,
    }
    base_params.update(params)

    # TODO: 실제 HTTP 호출 구현
    return []


def fetch_festivals(area_code: int, date_str: str, errors: list) -> list:
    """해당 날짜·지역의 축제·행사 목록 반환.

    Returns: [{"title": "", "eventplace": "", "start": "", "end": ""}, ...]
    """
    # TODO: searchFestival 엔드포인트 호출 구현
    print("  [TourAPI] 축제 데이터 조회 중... (stub)")
    return []


def fetch_stays(area_code: int, errors: list) -> list:
    """해당 지역의 숙박 정보 반환.

    Returns: [{"name": "", "address": "", "tel": "", "url": ""}, ...]
    """
    # TODO: searchStay 엔드포인트 호출 구현
    print("  [TourAPI] 숙박 데이터 조회 중... (stub)")
    return []
