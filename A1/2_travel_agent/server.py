"""FastAPI 웹 서버 — SSE로 파이프라인 진행 상황 스트리밍."""

import asyncio
import json
import queue
import threading
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

import travel_planner

load_dotenv()
travel_planner.exit_on_missing_keys()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def index():
    return Path("static/index.html").read_text(encoding="utf-8")


@app.get("/api/plan")
async def plan_stream(date: str):
    """날짜를 받아 파이프라인을 실행하고 SSE로 진행 상황을 스트리밍."""
    try:
        date = travel_planner.check_date(date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    msg_queue: queue.Queue = queue.Queue()

    def log(message: str):
        msg_queue.put({"type": "log", "message": message})

    def run_pipeline():
        try:
            json_path, md_path, markdown, raw_data = travel_planner.run(date, log=log)
            msg_queue.put({
                "type":        "done",
                "markdown":    markdown,
                "city_images": raw_data.get("city_images", []),
                "restaurants": raw_data.get("restaurants", []),
                "stays":       raw_data.get("stays", []),
                "festivals":   raw_data.get("festivals", []),
                "json_path":   json_path,
                "md_path":     md_path,
            })
        except Exception as e:
            msg_queue.put({"type": "error", "message": str(e)})

    thread = threading.Thread(target=run_pipeline, daemon=True)
    thread.start()

    async def generate():
        while True:
            try:
                msg = msg_queue.get(timeout=0.1)
                yield f"data: {json.dumps(msg, ensure_ascii=False)}\n\n"
                if msg["type"] in ("done", "error"):
                    break
            except queue.Empty:
                if not thread.is_alive():
                    break
                await asyncio.sleep(0.05)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/history")
async def list_history():
    """results/ 디렉토리의 완성된 리포트 목록 반환."""
    results_dir = Path("results")
    if not results_dir.exists():
        return []

    entries = []
    for json_file in sorted(results_dir.glob("*_raw_data.json"), reverse=True):
        date_str = json_file.name.replace("_raw_data.json", "")
        md_file  = results_dir / f"{date_str}_travel_plan.md"
        if not md_file.exists():
            continue
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
            entries.append({
                "date":    date_str,
                "city":    data.get("city", {}).get("name", ""),
                "score":   data.get("city", {}).get("score", 0),
                "weather": data.get("city", {}).get("weather", {}),
            })
        except Exception:
            entries.append({"date": date_str, "city": "알 수 없음", "score": 0, "weather": {}})

    return entries


@app.get("/api/results/{date}")
async def get_result(date: str):
    """저장된 날짜의 리포트 데이터를 즉시 반환 (스트리밍 없음)."""
    json_path = Path("results") / f"{date}_raw_data.json"
    md_path   = Path("results") / f"{date}_travel_plan.md"
    if not json_path.exists() or not md_path.exists():
        raise HTTPException(status_code=404, detail="결과 없음")

    raw_data = json.loads(json_path.read_text(encoding="utf-8"))
    markdown = md_path.read_text(encoding="utf-8")

    return {
        "markdown":    markdown,
        "city":        raw_data.get("city", {}),
        "city_images": raw_data.get("city_images", []),
        "restaurants": raw_data.get("restaurants", []),
        "stays":       raw_data.get("stays", []),
        "festivals":   raw_data.get("festivals", []),
    }


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
