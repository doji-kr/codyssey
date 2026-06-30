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

    try:
        resp = requests.get(
            KAKAO_LOCAL_URL,
            headers={"Authorization": f"KakaoAK {api_key}"},
            params={
                "query":        f"{city_name} 맛집",
                "category_group_code": "FD6",   # 음식점만
                "size":         10,
                "sort":         "accuracy",
            },
            timeout=10,
        )

        if resp.status_code == 401:
            errors.append({"step": "place_search", "type": "AUTH_ERROR", "message": "HTTP 401 - KAKAO_REST_API_KEY 권한 점검"})
            return []
        if resp.status_code == 403:
            errors.append({"step": "place_search", "type": "AUTH_ERROR", "message": f"HTTP 403 - {resp.json().get('message', '')}"})
            return []

        resp.raise_for_status()
        documents = resp.json().get("documents", [])

        result = []
        for doc in documents:
            result.append({
                "name":     doc.get("place_name", ""),
                "address":  doc.get("road_address_name") or doc.get("address_name", ""),
                "category": doc.get("category_name", ""),
                "url":      doc.get("place_url", ""),
                "x":        doc.get("x", ""),
                "y":        doc.get("y", ""),
            })
        return result

    except requests.exceptions.Timeout:
        errors.append({"step": "place_search", "type": "TIMEOUT", "message": "Kakao Local 응답 타임아웃"})
    except Exception as e:
        errors.append({"step": "place_search", "type": "REQUEST_ERROR", "message": str(e)})

    return []
