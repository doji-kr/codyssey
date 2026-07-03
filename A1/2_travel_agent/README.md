# 국내 여행 추천 CLI
![프로젝트구조](assets/app.png)
날짜를 입력하면 실시간 기후 데이터로 최적 여행지를 선별하고, 축제·맛집·숙박 정보를 수집해 LLM이 1일 여행 리포트(Markdown)를 생성하는 CLI 프로그램.

> 학습 목표, 과제 요구사항 대비 구현 검증, 보안 자체 점검은 [docs/explainer.html](docs/explainer.html) 참고.

## 아키텍처

```
[입력: --date YYYY-MM-DD]
        │
        ▼
① Open-Meteo (기후 평년값)  ──>  11개 후보 도시 쾌적도 점수 계산 (LLM 미사용)
        │
        ▼  쾌적도 상위 N개 도시 선정 (기본 3개, Fan-Out 대상)
        ├──> ② TourAPI searchFestival2  (N개 도시 각각 → 축제/행사)
        ├──> ③ Kakao Local              (N개 도시 각각 → 맛집 10곳)
        └──> ④ TourAPI searchStay2      (N개 도시 각각 → 숙박 10곳)
        │
        ▼
⑤ OpenRouter LLM (google/gemini-2.5-flash)
   N개 도시 비교 + 최종 추천 도시의 오전/오후/저녁 일정 포함 마크다운 리포트
        │
        ▼
[결과: results/{DATE}_raw_data.json + {DATE}_travel_plan.md]
```
![프로젝트구조](assets/result.png)


> **캐시**: 동일 날짜를 재실행하면 `results/` 파일을 그대로 반환하고 모든 API 호출을 생략한다.
>
> **복수 도시 추천 (Fan-Out)**: 쾌적도 점수 상위 `--top-n`(기본 3)개 도시를 순회하며 축제·맛집·숙박·이미지를 각각 수집한다. 1위 도시는 `raw_data.json`의 최상위 필드(`city`/`festivals`/`restaurants`/`stays`)에, 전체 후보는 `cities[]` 배열에 담기며 리포트 맨 앞에 도시 비교 섹션으로 요약된다.

## 실행 방법 한눈에 보기

날짜 쿼리를 던지는 방법은 실행 환경(Docker/로컬)과 인터페이스(웹 API/CLI)에 따라 4가지다. 상세 설명은 각각 [Docker](#docker-권장) · [로컬 설치](#로컬-설치) 절 참고.

| 상황 | 명령 |
|------|------|
| **Docker** 컨테이너에 날짜 쿼리 (웹 API, curl) | `curl -N "http://localhost:8000/api/plan?date=2026-07-15"` |
| **Docker** 컨테이너 내부에서 CLI 직접 실행 | `docker exec -it travel-agent python travel_planner.py --date "2026-07-15"` |
| **Docker 없이** 로컬에서 CLI 직접 실행 | `source .venv/bin/activate && python travel_planner.py --date "2026-07-15"` |
| **Docker 없이** 로컬 웹서버 실행 후 쿼리 | `.venv/bin/python server.py` 실행 후 `curl -N "http://localhost:8000/api/plan?date=2026-07-15"` |

> 웹 API(`/api/plan`)는 Docker로 띄우든 로컬(`server.py`)로 띄우든 포트(`8000`)와 요청 형식이 동일하다. 컨테이너 이름은 `docker-compose.yml`(compose 사용 시) 또는 `docker run --name`에 지정한 이름(예시는 `travel-agent`)을 따른다.

## Docker (권장)

API 키만 넣으면 환경 설치 없이 바로 실행된다.

```bash
# 1. 키 파일 준비
cp .env.example .env
# .env 파일을 열어 세 가지 키 입력

# 2. 빌드 + 실행 (최초 1회)
docker compose up --build -d

# 3. 브라우저 접속
http://localhost:8000

# 중지
docker compose down
```

생성된 리포트는 호스트의 `./results/` 폴더에 저장되어 컨테이너를 삭제해도 유지된다.

키를 바꾸려면 `.env` 수정 후 `docker compose restart`만 하면 된다.

### 실행 중인 컨테이너에 명령 내리기

컨테이너가 떠 있는 상태에서 여행 리포트를 만드는 방법은 두 가지다.

**방법 A — 웹 API로 날짜 쿼리 (curl)**

`/api/plan`은 SSE(Server-Sent Events)로 응답하므로 `-N`(no-buffer) 옵션을 붙여야 진행 로그가 실시간으로 보인다.

```bash
curl -N "http://localhost:8000/api/plan?date=2026-07-15"
```

**방법 B — 컨테이너 내부에서 CLI 스크립트 직접 실행**

`docker exec`로 컨테이너 안에 들어가 `travel_planner.py`를 웹서버 없이 바로 돌릴 수 있다. 결과는 볼륨 마운트된 `./results/`에 그대로 저장되므로 호스트에서 즉시 확인 가능하다.

```bash
# docker compose로 띄운 경우 (서비스명 = travel-agent)
docker compose exec travel-agent python travel_planner.py --date "2026-07-15"

# docker run --name travel-agent 로 띄운 경우
docker exec -it travel-agent python travel_planner.py --date "2026-07-15"
```

컨테이너 이름/서비스명이 다르면 `docker ps`로 확인한다.

### Docker Hub 이미지 (`42doji/travel-agent`)

빌드된 이미지는 Docker Hub `42doji/travel-agent`에 배포되어 있다. 소스를 받지 않고도 이미지만 받아 바로 실행할 수 있다.

```bash
# 1. 이미지 받기
docker pull 42doji/travel-agent:latest

# 2. 키 파일 준비 (results 저장용 폴더도 함께 생성)
mkdir -p results
cp .env.example .env   # .env 열어 세 가지 키 입력

# 3. 실행
docker run -d \
  --name travel-agent \
  -p 8000:8000 \
  --env-file .env \
  -v "$(pwd)/results:/app/results" \
  42doji/travel-agent:latest

# 4. 브라우저 접속
http://localhost:8000

# 상태 확인 / 로그 / 중지
docker ps
docker logs -f travel-agent
docker rm -f travel-agent
```

#### 이미지 직접 빌드 & 푸시 (배포자용)

코드 수정 후 Docker Hub 이미지를 갱신하려면:

Apple Silicon(arm64) 맥에서 `docker build`만 실행하면 arm64 이미지만 만들어져,
Intel(amd64) 환경에서 `no matching manifest for linux/amd64` 오류가 발생한다.
`buildx`로 두 아키텍처를 함께 빌드해 하나의 매니페스트로 푸시한다.

```bash
# 1. 로그인 (최초 1회)
docker login

# 2. amd64 + arm64 동시 빌드 후 푸시
docker buildx build --platform linux/amd64,linux/arm64 -t 42doji/travel-agent:latest --push .

# (참고) 매니페스트에 두 아키텍처가 모두 포함됐는지 확인
docker manifest inspect 42doji/travel-agent:latest
```

---

## 로컬 설치 (Docker 없이 실행)

Docker 없이 호스트에 Python 환경을 직접 구성해 실행하는 방법이다.

```bash
# 1. 가상환경 생성 및 활성화
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. 의존성 설치
pip install -r requirements.txt
```

## 환경변수 설정

`.env.example`을 복사해 `.env`를 만들고 API 키를 입력한다.

```bash
cp .env.example .env
```

```ini
# .env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx   # https://openrouter.ai
KAKAO_REST_API_KEY=xxxxxxxxxxxxxxxx     # https://developers.kakao.com
TOUR_API_KEY=xxxxxxxxxxxxxxxx           # https://www.data.go.kr
```

### API 키 발급 안내

| 서비스 | 발급처 | 비고 |
|--------|--------|------|
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | `google/gemini-2.5-flash` 모델 사용 |
| Kakao Local | [developers.kakao.com](https://developers.kakao.com) → 앱 생성 → REST API 키 | 카카오맵 서비스 활성화 필요 |
| TourAPI | [data.go.kr](https://www.data.go.kr) → "한국관광공사_국문 관광정보 서비스_GW" 활용신청 | End Point: `KorService2` |

> **키 미설정 시 즉시 종료**: `OPENROUTER_API_KEY` · `KAKAO_REST_API_KEY` · `TOUR_API_KEY` 중 하나라도 없으면 CLI(`travel_planner.py`)와 웹 서버(`server.py`) 모두 파이프라인을 시작하기 전에 누락된 키 목록과 설정 방법을 안내하고 종료 코드 1로 즉시 종료한다 (`travel_planner.py: exit_on_missing_keys()`).

## 실행

### CLI

```bash
# 정상 실행 (기본: 쾌적도 상위 3개 도시 Fan-Out)
python travel_planner.py --date "2026-10-24"

# 상위 N개 도시로 Fan-Out 범위 조정 (복수 도시 추천)
python travel_planner.py --date "2026-10-24" --top-n 5

# 잘못된 날짜 형식 → 에러 메시지 출력 후 종료
python travel_planner.py --date "2026-13-99"

# 오늘 이전 날짜 → 종료
python travel_planner.py --date "2026-01-01"

# 1년 초과 → 종료
python travel_planner.py --date "2028-01-01"
```

### 웹 서버

```bash
# 서버 시작 (reload 모드 — 코드 변경 시 자동 재시작)
.venv/bin/python server.py

# 브라우저에서 접속
http://localhost:8000
```

| 기능 | 설명 |
|------|------|
| Planner 탭 | 날짜 선택 → 실시간 로그 스트리밍 → 마크다운 리포트 + 사진 카드 |
| History 탭 | 과거 생성된 리포트 목록 → 클릭 시 토글로 결과 확인 |
| Docs 탭 | 요구사항·파이프라인·API·스키마 설명 |

> 동일 날짜를 다시 실행하면 캐시(`results/`)에서 즉시 반환하며 API 호출을 생략한다.

### API 호출 예시 (curl)

`/api/plan`은 SSE(Server-Sent Events)로 응답한다. `-N`(no-buffer) 옵션을 붙여야 스트리밍 로그가 실시간으로 보인다. 서버를 Docker로 띄웠든 `server.py`로 로컬에서 띄웠든 요청 형식은 동일하다.

```bash
# 올바른 요청 — 오늘(2026-07-01) 이후 ~ 1년 이내 날짜
curl -N "http://localhost:8000/api/plan?date=2026-07-15"
```

```bash
# 잘못된 요청 — 형식 오류(월 13, 일 99) → HTTP 400 반환
curl -i "http://localhost:8000/api/plan?date=2026-13-99"
# {"detail":"올바르지 않은 날짜 형식: '2026-13-99'. YYYY-MM-DD 형식을 사용하세요."}

# 잘못된 요청 예시 — 과거 날짜도 동일하게 400
curl -i "http://localhost:8000/api/plan?date=2026-01-01"
# {"detail":"'2026-01-01'은 오늘 이전 날짜입니다. 내일 이후 날짜를 입력하세요."}
```

### CLI 실행 결과 예시

```
[1/4] 날씨 데이터 조회 및 최적 도시 선정 중...
  [날씨] 11개 도시 기후 평년값 조회 중 (10월 24일 기준)...
         서울   |  15.2°C | 습도  68% | 점수 0.7210
         ...
      ✔ 추천 도시: 경주 (쾌적도 점수: 0.821)

[2/4] TourAPI 축제·숙박 정보 수집 중...
      ✔ 축제 3건 / 숙박 10건

[3/4] Kakao Local 맛집 검색 중...
      ✔ 맛집 10건

[4/4] LLM 마크다운 리포트 생성 중...
      ✔ 리포트 생성 완료

========================================================================
[완료] 파이프라인 처리가 정상 완료되었습니다.
- 데이터 원본 JSON : results/2026-10-24_raw_data.json
- 최종 마크다운    : results/2026-10-24_travel_plan.md
========================================================================
```

### 결과 파일

| 파일 | 내용 |
|------|------|
| `results/{DATE}_raw_data.json` | 수집된 원본 데이터 + 에러 로그 |
| `results/{DATE}_travel_plan.md` | LLM이 작성한 오전/오후/저녁 일정 포함 여행 리포트 |

## 보안 가이드

**API 키는 절대 코드에 하드코딩하지 않는다.**

`.env` 파일은 `.gitignore`에 등록되어 있어 Git에 커밋되지 않는다. 키가 공개 저장소에 노출될 경우:

- **OpenRouter 키**: 무단 LLM API 호출로 즉각 과금 피해
- **Kakao 키**: 위치/검색 API 악용, 쿼터 소진
- **TourAPI 키**: 공공데이터 포털 계정 제재 가능성

키가 노출되었다면 즉시 해당 서비스 콘솔에서 **키 재발급 또는 폐기** 처리한다.

```bash
# 커밋 전 반드시 확인
git status          # .env가 목록에 없어야 함
git diff --cached   # 키 문자열이 포함되어 있지 않아야 함
```
