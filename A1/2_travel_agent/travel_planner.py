"""국내 여행 추천 CLI — 파이프라인 오케스트레이터."""

import argparse
import json
import os
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


TOP_N_CITIES = 3  # 복수 도시 추천 Fan-Out — 쾌적도 점수 상위 N개 도시를 순회 수집

REQUIRED_KEYS = {
    "OPENROUTER_API_KEY": "OpenRouter — https://openrouter.ai/keys",
    "KAKAO_REST_API_KEY": "Kakao Local — https://developers.kakao.com",
    "TOUR_API_KEY":       "TourAPI (공공데이터포털) — https://www.data.go.kr",
}


def check_required_keys() -> list[str]:
    """누락된 필수 환경변수 키 이름 리스트 반환 (전부 있으면 빈 리스트)."""
    return [key for key in REQUIRED_KEYS if not os.getenv(key)]


def exit_on_missing_keys() -> None:
    """필수 키가 하나라도 없으면 설정 안내를 출력하고 즉시 종료한다."""
    missing = check_required_keys()
    if not missing:
        return

    print("[오류] 다음 API 키가 .env에 설정되지 않았습니다:", file=sys.stderr)
    for key in missing:
        print(f"  - {key} ({REQUIRED_KEYS[key]})", file=sys.stderr)
    print(file=sys.stderr)
    print("설정 방법:", file=sys.stderr)
    print("  1. cp .env.example .env", file=sys.stderr)
    print("  2. .env 파일을 열어 누락된 키 값을 입력", file=sys.stderr)
    sys.exit(1)


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


def run(date_str: str, log: Callable[[str], None] = print, top_n: int = TOP_N_CITIES) -> tuple[str, str, str]:
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

    # ── 1단계: 날씨 기반 상위 N개 도시 선정 (복수 도시 추천) ────────────
    log(f"[1/4] 날씨 데이터 조회 및 상위 {top_n}개 도시 선정 중...")
    top_cities  = weather.select_top_cities(date_str, errors, log=log, top_n=top_n)
    city_result = top_cities[0]
    city_name   = city_result["recommended_city"]
    area_code   = city_result["area_code"]
    log(f"      ✔ 추천 도시: {city_name} (쾌적도 점수: {city_result['score']})")
    if len(top_cities) > 1:
        alt = ", ".join(f"{c['recommended_city']}({c['score']:.2f})" for c in top_cities[1:])
        log(f"      · 대안 후보: {alt}")

    # ── 2단계: 후보 도시별 TourAPI 축제·숙박 Fan-Out 수집 ───────────────
    log(f"[2/4] 후보 도시 {len(top_cities)}곳 TourAPI 축제·숙박 Fan-Out 수집 중...")
    city_bundles = []
    for c in top_cities:
        c_festivals = tour.fetch_festivals(c["area_code"], date_str, errors)
        c_stays     = tour.fetch_stays(c["area_code"], errors)
        city_bundles.append({**c, "festivals": c_festivals, "stays": c_stays})
        log(f"      · {c['recommended_city']}: 축제 {len(c_festivals)}건 / 숙박 {len(c_stays)}건")
    festivals = city_bundles[0]["festivals"]
    stays     = city_bundles[0]["stays"]

    # ── 3단계: 후보 도시별 Kakao Local 맛집·이미지 Fan-Out 수집 ─────────
    log(f"[3/4] 후보 도시 {len(top_cities)}곳 Kakao Local 맛집·이미지 Fan-Out 수집 중...")
    for bundle in city_bundles:
        bundle["restaurants"] = places.fetch_restaurants(bundle["recommended_city"], errors)
        bundle["city_images"] = places.fetch_city_images(bundle["recommended_city"], errors)
        log(f"      · {bundle['recommended_city']}: 맛집 {len(bundle['restaurants'])}건 / 도시 이미지 {len(bundle['city_images'])}장")
    restaurants = city_bundles[0]["restaurants"]
    city_images = city_bundles[0]["city_images"]

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
        "cities": [
            {
                "name":        b["recommended_city"],
                "area_code":   b["area_code"],
                "weather":     b["weather"],
                "score":       b["score"],
                "festivals":   b["festivals"],
                "restaurants": b["restaurants"],
                "stays":       b["stays"],
                "city_images": b["city_images"],
            }
            for b in city_bundles
        ],
        "errors": errors,
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
    exit_on_missing_keys()

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
    parser.add_argument(
        "--top-n",
        type=int,
        default=TOP_N_CITIES,
        metavar="N",
        help=f"쾌적도 상위 N개 도시 추천 (Fan-Out 대상, 기본값 {TOP_N_CITIES})",
    )
    args = parser.parse_args()

    run(args.date, top_n=args.top_n)


if __name__ == "__main__":
    main()
