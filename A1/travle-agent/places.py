"""Kakao Local API 맛집 검색."""

import os
import requests

KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"


def fetch_restaurants(city_name: str, errors: list) -> list:
    """Kakao Local 키워드 검색으로 맛집 리스트 반환.

    Returns:
        [{"name": "", "address": "", "category": "", "url": "", "x": "", "y": ""}, ...]
    """
    api_key = os.getenv("KAKAO_REST_API_KEY")
    if not api_key:
        errors.append({"step": "place_search", "type": "KEY_MISSING", "message": "KAKAO_REST_API_KEY 환경변수 누락"})
        return []

    # TODO: 실제 HTTP 호출 구현
    print(f"  [Kakao] '{city_name} 맛집' 검색 중... (stub)")
    return []
