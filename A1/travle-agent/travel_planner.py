"""국내 여행 추천 CLI — 파이프라인 오케스트레이터."""

import argparse
import sys
from datetime import datetime

from dotenv import load_dotenv

import weather
import tour
import places
import llm
import report


def validate_date(date_string: str) -> str:
    try:
        return datetime.strptime(date_string, "%Y-%m-%d").date().isoformat()
    except ValueError:
        raise argparse.ArgumentTypeError(
            f"올바르지 않은 날짜 형식: '{date_string}'. YYYY-MM-DD 형식을 사용하세요."
        )


def run(date_str: str) -> None:
    errors: list = []

    # ── 1단계: 날씨 기반 도시 선정 ─────────────────────────────────────
    print(f"\n[1/4] 날씨 데이터 조회 및 최적 도시 선정 중...")
    city_result = weather.select_best_city(date_str, errors)
    city_name   = city_result["recommended_city"]
    area_code   = city_result["area_code"]
    print(f"      ✔ 추천 도시: {city_name} (쾌적도 점수: {city_result['score']})")

    # ── 2단계: TourAPI 축제·숙박 ────────────────────────────────────────
    print(f"\n[2/4] TourAPI 축제·숙박 정보 수집 중...")
    festivals = tour.fetch_festivals(area_code, date_str, errors)
    stays     = tour.fetch_stays(area_code, errors)
    print(f"      ✔ 축제 {len(festivals)}건 / 숙박 {len(stays)}건")

    # ── 3단계: Kakao Local 맛집 ─────────────────────────────────────────
    print(f"\n[3/4] Kakao Local 맛집 검색 중...")
    restaurants = places.fetch_restaurants(city_name, errors)
    print(f"      ✔ 맛집 {len(restaurants)}건")

    # ── raw_data 조립 ────────────────────────────────────────────────────
    raw_data = {
        "date": date_str,
        "city": {
            "name":      city_name,
            "area_code": area_code,
            "weather":   city_result["weather"],
            "score":     city_result["score"],
        },
        "festivals":   festivals,
        "restaurants": restaurants,
        "stays":       stays,
        "errors":      errors,
    }

    # ── 4단계: LLM 리포트 생성 ──────────────────────────────────────────
    print(f"\n[4/4] LLM 마크다운 리포트 생성 중...")
    markdown = llm.generate_report(raw_data, errors)
    raw_data["errors"] = errors  # LLM 단계 에러 포함
    print(f"      ✔ 리포트 생성 완료")

    # ── 파일 저장 ────────────────────────────────────────────────────────
    json_path, md_path = report.save(date_str, raw_data, markdown)

    print("\n" + "=" * 72)
    print("[완료] 파이프라인 처리가 정상 완료되었습니다.")
    print(f"- 데이터 원본 JSON : {json_path}")
    print(f"- 최종 마크다운    : {md_path}")
    if errors:
        print(f"- 누적 오류 {len(errors)}건 — {json_path} 내 errors[] 확인")
    print("=" * 72 + "\n")


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
