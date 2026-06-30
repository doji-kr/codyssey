"""Kakao Local API 맛집 검색 + 이미지 검색."""

import os
import requests
from concurrent.futures import ThreadPoolExecutor

KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
KAKAO_IMAGE_URL = "https://dapi.kakao.com/v2/search/image"


def _fetch_one_image(query: str, api_key: str) -> str:
    """Kakao Image Search로 첫 번째 image_url 반환. 실패 시 빈 문자열."""
    try:
        resp = requests.get(
            KAKAO_IMAGE_URL,
            headers={"Authorization": f"KakaoAK {api_key}"},
            params={"query": query, "size": 1, "sort": "accuracy"},
            timeout=5,
        )
        if resp.status_code == 200:
            docs = resp.json().get("documents", [])
            if docs:
                return docs[0].get("image_url", "")
    except Exception:
        pass
    return ""


def fetch_city_images(city_name: str, errors: list, n: int = 6) -> list:
    """도시 여행 이미지 n장 반환."""
    api_key = os.getenv("KAKAO_REST_API_KEY")
    if not api_key:
        return []
    try:
        resp = requests.get(
            KAKAO_IMAGE_URL,
            headers={"Authorization": f"KakaoAK {api_key}"},
            params={"query": f"{city_name} 여행 관광", "size": n, "sort": "accuracy"},
            timeout=8,
        )
        if resp.status_code == 200:
            return [
                d.get("image_url", "")
                for d in resp.json().get("documents", [])
                if d.get("image_url")
            ]
    except Exception as e:
        errors.append({"step": "city_images", "type": "REQUEST_ERROR", "message": str(e)})
    return []


def fetch_restaurants(city_name: str, errors: list) -> list:
    """Kakao Local 키워드 검색으로 맛집 리스트 + 이미지 반환.

    Returns:
        [{"name": "", "address": "", "category": "", "url": "", "x": "", "y": "", "image_url": ""}, ...]
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
                "query":               f"{city_name} 맛집",
                "category_group_code": "FD6",
                "size":                10,
                "sort":                "accuracy",
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

        result = [
            {
                "name":      doc.get("place_name", ""),
                "address":   doc.get("road_address_name") or doc.get("address_name", ""),
                "category":  doc.get("category_name", ""),
                "url":       doc.get("place_url", ""),
                "x":         doc.get("x", ""),
                "y":         doc.get("y", ""),
                "image_url": "",
            }
            for doc in documents
        ]

        # 이미지 병렬 검색 (최대 5개 동시)
        def fill_image(item):
            img = _fetch_one_image(f"{city_name} {item['name']}", api_key)
            return {**item, "image_url": img}

        with ThreadPoolExecutor(max_workers=5) as executor:
            result = list(executor.map(fill_image, result))

        return result

    except requests.exceptions.Timeout:
        errors.append({"step": "place_search", "type": "TIMEOUT", "message": "Kakao Local 응답 타임아웃"})
    except Exception as e:
        errors.append({"step": "place_search", "type": "REQUEST_ERROR", "message": str(e)})

    return []
