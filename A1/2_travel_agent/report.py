"""결과 파일 저장 (raw_data.json + travel_plan.md)."""

import json
import os
from pathlib import Path

RESULTS_DIR = Path("results")


def save(date_str: str, raw_data: dict, markdown: str) -> tuple[str, str]:
    """results/ 디렉토리에 JSON과 MD 파일 저장. 경로 튜플 반환."""
    RESULTS_DIR.mkdir(exist_ok=True)

    json_path = RESULTS_DIR / f"{date_str}_raw_data.json"
    md_path   = RESULTS_DIR / f"{date_str}_travel_plan.md"

    json_path.write_text(json.dumps(raw_data, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(markdown, encoding="utf-8")

    return str(json_path), str(md_path)
