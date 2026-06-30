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

    return f"""당신은 국내 여행 전문 작가입니다.
아래 실데이터를 바탕으로 **한국어 마크다운 여행 리포트**를 작성하세요.
오전/오후/저녁 1일 동선 시나리오를 반드시 포함하세요.
데이터가 없는 항목은 "데이터 없음 (검색 결과 0건)"으로 표기하세요.

## 입력 데이터
- 날짜: {raw_data['date']}
- 도시: {city['name']}
- 날씨: 평균기온 {weather.get('avg_temp_c')}°C, 습도 {weather.get('humidity_pct')}%
- 쾌적도 점수: {city.get('score')}
- 축제/행사: {json.dumps(festivals, ensure_ascii=False)}
- 맛집: {json.dumps(restaurants, ensure_ascii=False)}
- 숙박: {json.dumps(stays, ensure_ascii=False)}
"""


def generate_report(raw_data: dict, errors: list) -> str:
    """LLM으로 마크다운 리포트 생성. 파싱 실패 시 1회 재시도."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        errors.append({"step": "llm", "type": "KEY_MISSING", "message": "OPENROUTER_API_KEY 환경변수 누락"})
        return _fallback_report(raw_data)

    prompt = _build_prompt(raw_data)

    # TODO: 실제 API 호출 구현 (재시도 로직 포함)
    print("  [LLM] OpenRouter Gemini-2.5-flash 리포트 생성 중... (stub)")
    return _fallback_report(raw_data)


def _fallback_report(raw_data: dict) -> str:
    """API 실패 시 기본 마크다운 반환."""
    city = raw_data["city"]
    return f"""# {raw_data['date']} 국내 여행 추천 리포트

## 추천 도시: {city['name']}

> LLM 리포트 생성 실패 — raw_data.json 을 확인하세요.
"""
