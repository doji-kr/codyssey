"""TourAPI 범용 클라이언트 (축제·숙박 공통 사용) — KorService2."""

import os
import requests

TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2"


def _call_tour_api(endpoint: str, extra_params: dict, errors: list) -> list:
    """TourAPI 범용 호출. endpoint 이름과 추가 파라미터를 받아 items 리스트 반환."""
    api_key = os.getenv("TOUR_API_KEY")
    if not api_key:
        errors.append({"step": endpoint, "type": "KEY_MISSING", "message": "TOUR_API_KEY 환경변수 누락"})
        return []

    params = {
        "serviceKey": api_key,
        "MobileOS":   "ETC",
        "MobileApp":  "TravelPlanner",
        "_type":      "json",
        "numOfRows":  10,
        "pageNo":     1,
    }
    params.update(extra_params)

    try:
        resp = requests.get(f"{TOUR_API_BASE}/{endpoint}", params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        body  = data.get("response", {}).get("body", {})
        items = body.get("items", {})

        # 결과 0건이면 items가 빈 문자열로 오는 경우가 있음
        if not items or items == "":
            return []

        item_list = items.get("item", [])
        # 단건이면 dict로 오므로 리스트로 정규화
        if isinstance(item_list, dict):
            item_list = [item_list]

        return item_list

    except requests.exceptions.Timeout:
        errors.append({"step": endpoint, "type": "TIMEOUT", "message": f"{endpoint} 응답 타임아웃"})
    except requests.exceptions.HTTPError as e:
        code = e.response.status_code if e.response else "?"
        errors.append({"step": endpoint, "type": f"HTTP_{code}", "message": str(e)})
    except Exception as e:
        errors.append({"step": endpoint, "type": "REQUEST_ERROR", "message": str(e)})

    return []


def fetch_festivals(area_code: int, date_str: str, errors: list) -> list:
    """searchFestival2 — 해당 날짜·지역의 축제·행사 목록 반환.

    당월 1일부터 조회해 타겟 날짜가 행사 기간(start~end) 내에 있는 것만 필터링.
    Returns: [{"title": "", "eventplace": "", "start": "", "end": ""}, ...]
    """
    target = date_str.replace("-", "")          # YYYYMMDD
    month_start = target[:6] + "01"             # 당월 1일

    raw = _call_tour_api(
        "searchFestival2",
        {"areaCode": area_code, "eventStartDate": month_start, "numOfRows": 50},
        errors,
    )

    result = []
    for item in raw:
        start = item.get("eventstartdate", "")
        end   = item.get("eventenddate", "") or start
        # 타겟 날짜가 행사 기간 내에 있는 항목만 포함
        if start <= target <= end:
            result.append({
                "title":      item.get("title", ""),
                "eventplace": item.get("addr1", ""),
                "start":      start,
                "end":        end,
            })
    return result


def fetch_stays(area_code: int, errors: list) -> list:
    """searchStay2 — 해당 지역의 숙박 정보 반환.

    Returns: [{"name": "", "address": "", "tel": "", "url": ""}, ...]
    """
    raw = _call_tour_api(
        "searchStay2",
        {"areaCode": area_code},
        errors,
    )

    result = []
    for item in raw:
        result.append({
            "name":    item.get("title", ""),
            "address": item.get("addr1", ""),
            "tel":     item.get("tel", ""),
            "url":     item.get("firstimage", ""),
        })
    return result
