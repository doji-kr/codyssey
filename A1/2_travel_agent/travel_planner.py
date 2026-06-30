"""국내 여행 추천 CLI — 파이프라인 오케스트레이터."""

import argparse
import json
import sys
from datetime import datetime, date as date_type
from pathlib import Path
from typing import Callable

from dotenv import load_dotenv

import weather
import tour
import places
import llm
import report


def validate_date(date_string: str) -> str:
    try:
        target = datetime.strptime(date_string, "%Y-%m-%d").date()
    except ValueError:
        raise argparse.ArgumentTypeError(
            f"올바르지 않은 날짜 형식: '{date_string}'. YYYY-MM-DD 형식을 사용하세요."
        )

    today = datetime.now().date()
    if target <= today:
        raise argparse.ArgumentTypeError(
            f"'{date_string}'은 오늘 이전 날짜입니다. 내일 이후 날짜를 입력하세요."
        )
    if (target - today).days > 365:
        raise argparse.ArgumentTypeError(
            f"'{date_string}'은 오늘로부터 1년 초과입니다. 1년 이내 날짜를 입력하세요."
        )

    return target.isoformat()


def check_date(date_string: str) -> str:
    """서버에서 사용하는 날짜 검증 — ValueError를 raise."""
    try:
        target = datetime.strptime(date_string, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"올바르지 않은 날짜 형식: '{date_string}'. YYYY-MM-DD 형식을 사용하세요.")

    today = datetime.now().date()
    if target <= today:
        raise ValueError(f"'{date_string}'은 오늘 이전 날짜입니다. 내일 이후 날짜를 입력하세요.")
    if (target - today).days > 365:
        raise ValueError(f"'{date_string}'은 오늘로부터 1년 초과입니다. 1년 이내 날짜를 입력하세요.")

    return target.isoformat()


def _load_cache(date_str: str) -> tuple[dict, str] | None:
    """raw_data.json과 travel_plan.md가 모두 있으면 (raw_data, markdown) 반환, 없으면 None."""
    json_path = Path("results") / f"{date_str}_raw_data.json"
    md_path   = Path("results") / f"{date_str}_travel_plan.md"
    if json_path.exists() and md_path.exists():
        raw_data = json.loads(json_path.read_text(encoding="utf-8"))
        markdown = md_path.read_text(encoding="utf-8")
        return raw_data, markdown
    return None


def run(date_str: str, log: Callable[[str], None] = print) -> tuple[str, str, str]:
    """파이프라인 실행. (json_path, md_path, markdown) 반환."""
    errors: list = []

    # ── 캐시 확인 ────────────────────────────────────────────────────────
    cached = _load_cache(date_str)
    if cached:
        raw_data, markdown = cached
        log(f"[캐시 HIT] 기존 결과 반환 — API·LLM 호출 없음")
        log(f"- 데이터 원본 JSON : results/{date_str}_raw_data.json")
        log(f"- 최종 마크다운    : results/{date_str}_travel_plan.md")
        json_path = str(Path("results") / f"{date_str}_raw_data.json")
        md_path   = str(Path("results") / f"{date_str}_travel_plan.md")
        return json_path, md_path, markdown, raw_data

    # ── 1단계: 날씨 기반 도시 선정 ─────────────────────────────────────
    log("[1/4] 날씨 데이터 조회 및 최적 도시 선정 중...")
    city_result = weather.select_best_city(date_str, errors, log=log)
    city_name   = city_result["recommended_city"]
    area_code   = city_result["area_code"]
    log(f"      ✔ 추천 도시: {city_name} (쾌적도 점수: {city_result['score']})")

    # ── 2단계: TourAPI 축제·숙박 ────────────────────────────────────────
    log("[2/4] TourAPI 축제·숙박 정보 수집 중...")
    festivals = tour.fetch_festivals(area_code, date_str, errors)
    stays     = tour.fetch_stays(area_code, errors)
    log(f"      ✔ 축제 {len(festivals)}건 / 숙박 {len(stays)}건")

    # ── 3단계: Kakao Local 맛집 + 도시 이미지 ──────────────────────────
    log("[3/4] Kakao Local 맛집 및 이미지 검색 중...")
    restaurants  = places.fetch_restaurants(city_name, errors)
    city_images  = places.fetch_city_images(city_name, errors)
    log(f"      ✔ 맛집 {len(restaurants)}건 / 도시 이미지 {len(city_images)}장")

    # ── raw_data 조립 ────────────────────────────────────────────────────
    raw_data = {
        "date": date_str,
        "city": {
            "name":      city_name,
            "area_code": area_code,
            "weather":   city_result["weather"],
            "score":     city_result["score"],
        },
        "city_images": city_images,
        "festivals":   festivals,
        "restaurants": restaurants,
        "stays":       stays,
        "errors":      errors,
    }

    # ── 4단계: LLM 리포트 생성 ──────────────────────────────────────────
    log("[4/4] LLM 마크다운 리포트 생성 중...")
    markdown = llm.generate_report(raw_data, errors)
    raw_data["errors"] = errors
    log("      ✔ 리포트 생성 완료")

    # ── 파일 저장 ────────────────────────────────────────────────────────
    json_path, md_path = report.save(date_str, raw_data, markdown)

    log("=" * 60)
    log("[완료] 파이프라인 처리가 정상 완료되었습니다.")
    log(f"- 데이터 원본 JSON : {json_path}")
    log(f"- 최종 마크다운    : {md_path}")
    if errors:
        log(f"- 누적 오류 {len(errors)}건")
    log("=" * 60)

    return json_path, md_path, markdown, raw_data


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(
        description="날짜 기반 국내 여행 추천 리포트 생성기",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--date",
        required=True,
        type=validate_date,
        metavar="YYYY-MM-DD",
        help="여행 날짜 (예: 2026-07-15)",
    )
    args = parser.parse_args()

    run(args.date)


if __name__ == "__main__":
    main()
