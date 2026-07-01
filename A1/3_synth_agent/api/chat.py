import os
import json
import urllib.request
import urllib.error
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context

DIST_DIR = Path(__file__).parent.parent / "frontend" / "dist"
app = Flask(__name__, static_folder=str(DIST_DIR), static_url_path="")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

# ── Knowledge base ──────────────────────────────────────────────────────────

DEVICE_KNOWLEDGE = {
    "ep-133": """
EP-133 K.O. II — 64MB 샘플러 + 비트 컴포저

[컨트롤]
- VOLUME: 마스터 출력 볼륨 노브
- KEYS: 패드를 음계 키보드로 전환
- FADER: 왼쪽 슬라이더로 벨로시티 제어
- SHIFT: 보조 기능 전환 (다른 버튼과 함께)
- SOUND: 사운드 브라우저. SHIFT+SOUND = EDIT
- MAIN: 메인 패턴 뷰. SHIFT+MAIN = COMMIT
- TEMPO: 누른 채 X 노브로 BPM 설정. SHIFT+TEMPO = LOOP
- X 노브: TEMPO 누른 채 BPM 조절; 단독으로는 파라미터 X
- Y 노브: TEMPO 누른 채 스윙 조절; 단독으로는 파라미터 Y
- 그룹 A/B/C/D: 샘플 그룹 전환 (A=슬롯1-12, B=13-24, C=25-36, D=37-48)
- SAMPLE: 누른 채 패드 탭 → 내장 마이크 녹음. SHIFT+SAMPLE = CHOP
- FX: FX 이펙트 (딜레이·리버브·디스토션). SHIFT+FX = OUTPUT
- ERASE: 스텝/패턴 삭제. SHIFT+ERASE = SYSTEM
- TIMING: Note Repeat & 타이밍. SHIFT+TIMING = CORRECT
- ENTER: 선택 확인
- RECORD: 라이브 녹음 시작
- PLAY: 시퀀스 재생/정지
- −/+: 파라미터 감소/증가

[가이드: 첫 시작]
1. POWER 스위치 약 2초 꾹 눌러 전원 켜기
2. TEMPO 누른 채 X 노브 돌려 BPM 설정 (90 BPM 권장)
3. SAMPLE 누른 채 패드 1 탭 → 마이크에 소리 → SAMPLE 놓으면 저장

[가이드: 첫 비트 만들기]
1. PLAY 눌러 시작 → SAMPLE 눌러 스텝 녹음 모드 진입
2. 패드 1·9 탭해 비트 1·3에 킥 배치
3. PLAY 다시 눌러 종료 → 루프 청취

[가이드: 로파이 비트]
1. 그룹 A 탭 활성화
2. SOUND+패드 탭 → 사운드 브라우저 → −/+ 스크롤 → ENTER 확정
3. 패드2=스네어, 패드3=하이햇
4. TEMPO+X 노브로 85 BPM
5. RECORD 눌러 라이브 녹음
6. PLAY로 청취, ERASE+패드로 스텝 삭제

[SHIFT 조합]
SHIFT+SOUND=EDIT / SHIFT+MAIN=COMMIT / SHIFT+TEMPO=LOOP
SHIFT+SAMPLE=CHOP / SHIFT+FX=OUTPUT / SHIFT+ERASE=SYSTEM / SHIFT+TIMING=CORRECT
""",
    "op-1f": """
OP-1 Field — 휴대용 신디사이저 + 4트랙 테이프 레코더

[컨트롤]
- 키보드: 애프터터치 지원 25건반
- 초록 노브: 어택 / 첫 번째 신디 파라미터
- 파란 노브: 필터 컷오프 / 두 번째 파라미터
- REC: 테이프 트랙 녹음 준비
- PLAY: 테이프 트랙 재생

[가이드]
1. SYN 버튼 → 엔코더로 엔진 탐색 → 눌러 로드
2. 키보드 건반 눌러 소리 확인
3. 초록 노브로 어택, 파란 노브로 필터 조절
""",
    "tx-6": """
TX-6 — 포켓 사이즈 6채널 스테레오 믹서

[컨트롤]
- CH 1/2/3: 채널 볼륨 페이더
- MASTER: 마스터 출력 페이더
- FX 노브: 리버브/딜레이 센드량

[가이드]
1. 소스를 USB-C 또는 3.5mm 입력에 연결
2. CH 1/2/3 페이더로 채널 밸런스
3. MASTER 페이더로 출력 레벨
4. FX 노브로 리버브 추가
""",
}

INITIAL_SUGGESTIONS = {
    "ep-133": "샘플은 어떻게 녹음하나요?",
    "op-1f": "신디 엔진은 어떻게 선택하나요?",
    "tx-6": "채널 밸런스는 어떻게 잡나요?",
}

DEVICE_NAMES = {
    "ep-133": "EP-133 K.O. II",
    "op-1f": "OP-1 Field",
    "tx-6": "TX-6",
}

# Content is streamed, metadata (heading/suggestions/tags) comes after |||META||| separator
SYSTEM_PROMPT_TEMPLATE = """당신은 Teenage Engineering {device_name} 전문 가이드입니다.

아래 매뉴얼 내용을 기반으로 정확하게 답변하세요:
{knowledge}

답변 규칙:
- 한국어로 명확하게 답변하세요
- 컨트롤 버튼 이름은 반드시 **BUTTON_NAME** 형식으로 감싸세요 (예: **SAMPLE**, **TEMPO**, **PLAY**)
- 번호 목록은 "1. ", "2. " 형식, 불릿은 "- " 형식 사용
- 답변이 끝나면 아래 구분자와 JSON을 정확히 출력하세요:

|||META|||
{{"heading":"답변 제목(한국어, 간결하게)","suggestions":["후속질문1","후속질문2","후속질문3"],"tags":["tag1","tag2"]}}"""

# ── Routes ──────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "key_set": bool(OPENROUTER_API_KEY)})


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return "", 204

    body = request.get_json(silent=True) or {}
    device_slug = body.get("deviceSlug", "ep-133")
    messages = body.get("messages", [])

    # Initial suggestion (no messages yet)
    if not messages:
        suggestion = INITIAL_SUGGESTIONS.get(device_slug, "어떻게 시작하나요?")
        return jsonify({"type": "initial", "suggestion": suggestion})

    knowledge = DEVICE_KNOWLEDGE.get(device_slug, DEVICE_KNOWLEDGE["ep-133"])
    device_name = DEVICE_NAMES.get(device_slug, "EP-133 K.O. II")
    system = SYSTEM_PROMPT_TEMPLATE.format(device_name=device_name, knowledge=knowledge)

    payload = json.dumps({
        "model": "anthropic/claude-3-haiku",
        "messages": [{"role": "system", "content": system}, *messages],
        "stream": True,
        "max_tokens": 1200,
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://synth-agent.vercel.app",
            "X-Title": "Synth Agent",
        },
        method="POST",
    )

    def generate():
        accumulated = ""
        content_sent_len = 0  # how many chars of content we've already streamed

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                for raw_line in resp:
                    line = raw_line.decode("utf-8").strip()
                    if not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        delta = chunk["choices"][0]["delta"].get("content", "")
                        if not delta:
                            continue

                        accumulated += delta

                        # Check if separator has appeared
                        SEP = "|||META|||"
                        sep_pos = accumulated.find(SEP)
                        if sep_pos == -1:
                            # Hold back trailing chars that might be a partial separator
                            safe_end = len(accumulated)
                            for i in range(1, len(SEP)):
                                if accumulated.endswith(SEP[:i]):
                                    safe_end = len(accumulated) - i
                                    break
                            new_content = accumulated[content_sent_len:safe_end]
                            if new_content:
                                yield f"data: {json.dumps({'type': 'chunk', 'text': new_content})}\n\n"
                                content_sent_len = safe_end
                        else:
                            # Separator found — stream remaining content before it
                            content_part = accumulated[:sep_pos]
                            unsent = content_part[content_sent_len:]
                            if unsent:
                                yield f"data: {json.dumps({'type': 'chunk', 'text': unsent})}\n\n"
                                content_sent_len = len(content_part)
                            # Stop streaming content (accumulate metadata silently)
                    except (json.JSONDecodeError, KeyError):
                        pass

            # Parse metadata after stream ends
            sep_pos = accumulated.find("|||META|||")
            if sep_pos != -1:
                meta_str = accumulated[sep_pos + len("|||META|||"):].strip()
                try:
                    meta = json.loads(meta_str)
                except json.JSONDecodeError:
                    meta = {}
            else:
                meta = {}

            yield f"data: {json.dumps({'type': 'done', 'heading': meta.get('heading', '답변'), 'suggestions': meta.get('suggestions', []), 'tags': meta.get('tags', [])})}\n\n"

        except urllib.error.HTTPError as e:
            err = e.read().decode()
            yield f"data: {json.dumps({'type': 'error', 'error': f'OpenRouter {e.code}: {err}'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Frontend static serving ─────────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def frontend(path: str):
    if path and (DIST_DIR / path).is_file():
        return send_from_directory(str(DIST_DIR), path)
    return send_from_directory(str(DIST_DIR), "index.html")
