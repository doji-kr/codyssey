"""Open-Meteo 날씨 조회 및 쾌적도 점수 기반 도시 선정."""

import requests
from datetime import date, timedelta
from typing import Callable

CANDIDATE_CITIES = [
    {"name": "서울",  "area_code": 1,  "lat": 37.5665, "lon": 126.9780},
    {"name": "부산",  "area_code": 6,  "lat": 35.1796, "lon": 129.0756},
    {"name": "인천",  "area_code": 2,  "lat": 37.4563, "lon": 126.7052},
    {"name": "강릉",  "area_code": 32, "lat": 37.7519, "lon": 128.8760},
    {"name": "속초",  "area_code": 32, "lat": 38.2070, "lon": 128.5918},
    {"name": "춘천",  "area_code": 32, "lat": 37.8747, "lon": 127.7341},
    {"name": "경주",  "area_code": 35, "lat": 35.8562, "lon": 129.2247},
    {"name": "전주",  "area_code": 37, "lat": 35.8242, "lon": 127.1480},
    {"name": "여수",  "area_code": 38, "lat": 34.7604, "lon": 127.6622},
    {"name": "통영",  "area_code": 36, "lat": 34.8544, "lon": 128.4332},
    {"name": "제주",  "area_code": 39, "lat": 33.4996, "lon": 126.5312},
]

OPEN_METEO_CLIMATE_URL = "https://climate-api.open-meteo.com/v1/climate"
CLIMATE_MODEL = "MRI_AGCM3_2_S"
WINDOW_DAYS = 3   # 타겟 날짜 ± 3일 평균
REF_YEAR = 2000   # 기준 연도 (기후 모델 평년값)


def _comfort_score(temp_c: float, humidity_pct: float) -> float:
    """쾌적도 점수 (0~1). 기온 18~24°C, 습도 40~60%에서 최고점."""
    temp_score = max(0.0, 1.0 - abs(temp_c - 21) / 15)
    hum_score  = max(0.0, 1.0 - abs(humidity_pct - 50) / 40)
    return round(temp_score * 0.6 + hum_score * 0.4, 4)


def _avg(values: list) -> float | None:
    valid = [v for v in values if v is not None]
    return round(sum(valid) / len(valid), 1) if valid else None


def fetch_climate(city: dict, month: int, day: int, errors: list) -> dict | None:
    """Open-Meteo Climate API로 해당 월·일 ±WINDOW_DAYS 기준 평년값 조회."""
    try:
        center = date(REF_YEAR, month, day)
    except ValueError:
        # 2월 29일 같은 경우 28일로 폴백
        center = date(REF_YEAR, month, 28)

    start = (center - timedelta(days=WINDOW_DAYS)).isoformat()
    end   = (center + timedelta(days=WINDOW_DAYS)).isoformat()

    try:
        resp = requests.get(
            OPEN_METEO_CLIMATE_URL,
            params={
                "latitude":  city["lat"],
                "longitude": city["lon"],
                "start_date": start,
                "end_date":   end,
                "models":     CLIMATE_MODEL,
                "daily":      "temperature_2m_mean,relative_humidity_2m_mean",
            },
            timeout=10,
        )
        resp.raise_for_status()
        data  = resp.json()
        daily = data.get("daily", {})

        avg_temp = _avg(daily.get("temperature_2m_mean", []))
        avg_hum  = _avg(daily.get("relative_humidity_2m_mean", []))

        if avg_temp is None or avg_hum is None:
            errors.append({
                "step": "weather",
                "type": "PARSE_ERROR",
                "message": f"{city['name']}: 기후 데이터 없음 (응답 비어있음)",
            })
            return None

        return {"avg_temp_c": avg_temp, "humidity_pct": avg_hum, "source": "open-meteo-climate"}

    except requests.exceptions.Timeout:
        errors.append({"step": "weather", "type": "TIMEOUT", "message": f"{city['name']}: Open-Meteo 타임아웃"})
        return None
    except Exception as e:
        errors.append({"step": "weather", "type": "REQUEST_ERROR", "message": f"{city['name']}: {e}"})
        return None


_FALLBACK_CITY = {
    "recommended_city": "서울",
    "area_code": 1,
    "weather": {"avg_temp_c": 20.0, "humidity_pct": 60, "source": "fallback"},
    "score": 0.0,
}


def _rank_cities(date_str: str, errors: list, log: Callable = print) -> list[dict]:
    """모든 후보 도시의 쾌적도 점수를 계산해 내림차순으로 정렬한 리스트 반환."""
    year, month, day = map(int, date_str.split("-"))
    log(f"  [날씨] {len(CANDIDATE_CITIES)}개 도시 기후 평년값 조회 중 ({month}월 {day}일 기준)...")

    ranked = []
    for city in CANDIDATE_CITIES:
        climate = fetch_climate(city, month, day, errors)
        if climate is None:
            continue

        score = _comfort_score(climate["avg_temp_c"], climate["humidity_pct"])
        log(f"         {city['name']:4s} | {climate['avg_temp_c']:5.1f}°C | 습도 {climate['humidity_pct']:3.0f}% | 점수 {score:.4f}")

        ranked.append({
            "recommended_city": city["name"],
            "area_code":        city["area_code"],
            "weather":          climate,
            "score":            score,
        })

    ranked.sort(key=lambda c: c["score"], reverse=True)
    return ranked


def select_best_city(date_str: str, errors: list, log: Callable = print) -> dict:
    """날짜 기준으로 가장 쾌적한 도시를 결정론적으로 선정.

    Returns:
        {
            "recommended_city": "강릉",
            "area_code": 32,
            "weather": {"avg_temp_c": 25.4, "humidity_pct": 78, "source": "open-meteo-climate"},
            "score": 0.82
        }
    """
    return select_top_cities(date_str, errors, log=log, top_n=1)[0]


def select_top_cities(date_str: str, errors: list, log: Callable = print, top_n: int = 3) -> list[dict]:
    """날짜 기준 쾌적도 점수 상위 top_n개 도시를 내림차순으로 반환 (Fan-Out 대상).

    Returns: [{"recommended_city": "", "area_code": 0, "weather": {}, "score": 0.0}, ...]
    """
    ranked = _rank_cities(date_str, errors, log=log)

    if not ranked:
        errors.append({"step": "weather", "type": "ALL_FAILED", "message": "모든 도시 기후 조회 실패 — 기본값 사용"})
        return [dict(_FALLBACK_CITY)]

    return ranked[:top_n]
