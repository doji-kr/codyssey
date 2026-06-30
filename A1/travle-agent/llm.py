"""OpenRouter LLM 연동 — 최종 마크다운 리포트 생성."""

import os
import json
import requests

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.5-flash"


def _build_prompt(raw_data: dict) -> str:
    city    = raw_data["city"]
    weather = city["weather"]
    festivals   = raw_data.get("festivals", [])
    restaurants = raw_data.get("restaurants", [])
    stays       = raw_data.get("stays", [])

    festivals_text   = json.dumps(festivals,   ensure_ascii=False, indent=2) if festivals   else "검색 결과 0건"
    restaurants_text = json.dumps(restaurants, ensure_ascii=False, indent=2) if restaurants else "검색 결과 0건"
    stays_text       = json.dumps(stays,       ensure_ascii=False, indent=2) if stays       else "검색 결과 0건"

    return f"""당신은 국내 여행 전문 작가입니다.
아래 실데이터를 바탕으로 **한국어 마크다운 여행 리포트**를 작성하세요.

## 작성 규칙
- 데이터에 없는 정보를 지어내지 마세요.
- 데이터가 없는 항목은 "데이터 없음 (검색 결과 0건)"으로 표기하세요.
- 오전/오후/저녁 1일 동선 시나리오를 반드시 포함하세요.
- 맛집은 제공된 목록에서 3~5곳을 선별해 상세히 소개하세요.
- 숙박은 제공된 목록에서 2~3곳을 소개하세요.
- 마크다운 형식으로 작성하세요 (헤더, 목록, 강조 활용).

## 입력 데이터

### 기본 정보
- 날짜: {raw_data['date']}
- 추천 도시: {city['name']}
- 날씨 (평년값): 평균기온 {weather.get('avg_temp_c')}°C, 습도 {weather.get('humidity_pct')}%
- 쾌적도 점수: {city.get('score')} / 1.0

### 축제·행사
{festivals_text}

### 맛집 (Kakao Local)
{restaurants_text}

### 숙박 (TourAPI)
{stays_text}
"""


def _call_llm(prompt: str, api_key: str) -> str:
    resp = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def generate_report(raw_data: dict, errors: list) -> str:
    """LLM으로 마크다운 리포트 생성. 실패 시 폴백 반환."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        errors.append({"step": "llm", "type": "KEY_MISSING", "message": "OPENROUTER_API_KEY 환경변수 누락"})
        return _fallback_report(raw_data)

    prompt = _build_prompt(raw_data)

    try:
        return _call_llm(prompt, api_key)
    except Exception as e:
        errors.append({"step": "llm", "type": "RETRY", "message": f"1차 실패: {e} — 재시도"})

    # 1회 재시도: 프롬프트에 마크다운만 반환 강조
    retry_prompt = prompt + "\n\n※ 반드시 순수한 마크다운 텍스트만 반환하세요. 다른 설명 없이 리포트만 작성하세요."
    try:
        return _call_llm(retry_prompt, api_key)
    except Exception as e:
        errors.append({"step": "llm", "type": "LLM_ERROR", "message": f"재시도 실패: {e}"})
        return _fallback_report(raw_data)


def _fallback_report(raw_data: dict) -> str:
    city = raw_data["city"]
    return f"""# {raw_data['date']} 국내 여행 추천 리포트

## 추천 도시: {city['name']}

> LLM 리포트 생성 실패 — `results/{raw_data['date']}_raw_data.json` 을 확인하세요.
"""
