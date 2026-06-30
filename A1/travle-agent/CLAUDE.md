# CLAUDE.md

이 파일은 Claude Code가 본 프로젝트에서 작업할 때 따라야 할 맥락·규약·제약을 정의한다.

---

## 1. 프로젝트 개요 (Project Overview)

날짜(`YYYY-MM-DD`)를 입력받아, **실제 날씨 데이터로 여행지를 선별**하고, 그 지역의 **축제·맛집(·숙박)** 정보를 외부 API로 수집한 뒤, **LLM이 1일 여행 리포트(Markdown)** 를 생성하는 CLI 프로그램.

핵심 설계 철학: **LLM은 데이터를 지어내지 않는다.** 날씨·축제·맛집·숙박은 전부 실데이터 API에서 가져오고, LLM은 마지막 "취합 → 일정 편성 → 문장화" 단계에서만 사용한다.

---

## 2. 아키텍처 / 파이프라인 (Pipeline)

```
[입력: --date YYYY-MM-DD]
        │
        ▼
① Open-Meteo (날씨 평년값)  ──>  후보 도시별 온도·습도 수집
        │
        ▼  (Python 결정론적 쾌적도 점수 계산 — LLM 미사용)
② 최적 도시 선정  ──>  areaCode 매핑
        │
        ├──> ③ TourAPI searchFestival  (날짜+지역 → 축제/행사)   [실데이터]
        ├──> ④ Kakao Local            ("○○ 맛집" → 식당 리스트)  [실데이터]
        └──> ⑤ TourAPI searchStay     (지역 → 숙박, ★보너스)     [실데이터]
        │
        ▼
⑥ OpenRouter LLM (google/gemini-2.5-flash)
   취합 데이터 → 마크다운 리포트 + 오전/오후/저녁 일정 편성
        │
        ▼
[산출물: results/{DATE}_raw_data.json + {DATE}_travel_plan.md]
```

---

## 3. 기술 스택 (Tech Stack)

| 레이어 | 채택 | 비고 |
| :--- | :--- | :--- |
| 언어 | Python 3.11+ | |
| CLI | `argparse` (표준 라이브러리) | |
| HTTP | `requests` | |
| 날씨 | **Open-Meteo** | API 키 불필요, 미래 날짜는 평년값/과거평균 사용 |
| 지역 선별 | Python 결정론 로직 | 재현·테스트 가능. LLM 위임 금지 |
| 축제 | **TourAPI** `searchFestival` | 공공데이터포털 인증키 |
| 맛집 | **Kakao Local** 키워드 검색 | REST API 키 |
| 숙박(보너스) | **TourAPI** `searchStay` | 축제와 **동일 키 재사용** |
| LLM | **OpenRouter** → `google/gemini-2.5-flash` | |
| 보안 | `python-dotenv` | |

---

## 4. 디렉토리 구조 (Directory Structure)

```
travel-planner/
├── CLAUDE.md                # 본 파일
├── travel_planner.py        # CLI 진입점 (Main Script)
├── .env                     # API 키 (Git 제출 금지)
├── .env.example             # 키 없는 템플릿 (커밋 대상)
├── .gitignore               # .env, __pycache__, results/ 제외
├── requirements.txt         # 의존성 명세
├── README.md                # 설치/실행/보안 가이드
└── results/                 # 결과 저장 (자동 생성)
    ├── {DATE}_raw_data.json     # 원본 데이터 + errors 로그
    └── {DATE}_travel_plan.md    # 최종 마크다운 리포트
```

코드를 한 파일에 다 욱여넣지 말 것. 규모가 커지면 `weather.py`, `places.py`, `tour.py`, `llm.py`, `report.py` 등 모듈로 분리하는 것을 권장한다.

---

## 5. 실행 커맨드 (Commands)

```bash
# 가상환경
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 의존성
pip install -r requirements.txt

# 실행
python travel_planner.py --date "2026-07-15"

# 잘못된 날짜 → Usage 출력 후 sys.exit()
python travel_planner.py --date "2026-13-99"
```

---

## 6. 데이터 계약 (Data Contracts) ★중요

단계 간 인터페이스는 아래 스키마로 **고정**한다. 함수 시그니처를 임의로 바꾸지 말 것.

### 6.1 도시 선별 결과 (① → ②)
```json
{
  "recommended_city": "강릉",
  "area_code": 32,
  "weather": { "avg_temp_c": 25.4, "humidity_pct": 78, "source": "open-meteo-climate" },
  "score": 0.82
}
```

### 6.2 최종 raw_data.json (산출물)
```json
{
  "date": "2026-07-15",
  "city": { "name": "강릉", "area_code": 32, "weather": { } },
  "festivals": [ { "title": "", "eventplace": "", "start": "", "end": "" } ],
  "restaurants": [ { "name": "", "address": "", "category": "", "url": "", "x": "", "y": "" } ],
  "stays": [ { "name": "", "address": "", "tel": "", "url": "" } ],
  "errors": [ { "step": "", "type": "", "message": "" } ]
}
```

맛집 필수 필드: `name`, `address`, `category`, `url`, `x`/`y`(좌표). 빠뜨리지 말 것.

---

## 7. 규약 및 제약 (Conventions & Constraints)

1. **API 키 하드코딩 절대 금지.** 모든 키는 `.env` → `os.getenv()`로만 접근.
2. **TourAPI 클라이언트는 범용 함수로 작성.** `searchFestival`만 하드코딩하지 말고 엔드포인트·파라미터를 인자로 받게 설계 → 숙박(`searchStay`)을 함수 호출 한 줄로 추가할 수 있어야 한다.
3. **LLM은 리포트 생성 단계에서만 사용.** 도시 선별·날씨·축제·맛집은 결정론적 코드/실API로 처리.
4. **LLM 출력 검증.** 리포트는 마크다운 텍스트지만, 만약 중간에 구조화 JSON을 받게 한다면 파싱 실패 시 프롬프트 보정 후 **최대 1회 재시도**.
5. **진행 로그를 stdout에 단계별로 출력** (가이드 8.1 콘솔 스냅샷 형식 참고: `[1/N] ... ✔`).
6. **errors 배열은 죽지 않고 누적.** 부분 실패가 전체 파이프라인을 멈추지 않도록 한다 (8장 참조).

---

## 8. 예외 처리 매트릭스 (Error Handling)

| 시나리오 | 조치 원칙 |
| :--- | :--- |
| **키 누락** | 즉시 종료. `.env` 설정 지침을 명확히 출력 |
| **검색 결과 0건** | 정지하지 말 것. 빈 배열 `[]`로 두고 리포트에 "데이터 없음 (검색 결과 0건)" 마킹 |
| **API 인증 실패 (401/403)** | 해당 단계 바이패스, `errors`에 기록, 리포트 빌드로 직행 |
| **쿼터 초과 (429) / 타임아웃** | `errors` 기록 후 진행. 가능하면 짧은 backoff 1회 |
| **LLM JSON 파싱 실패** | 프롬프트 보정 후 **최대 1회 재시도**, 그래도 실패 시 `errors` 기록 |

`errors` 항목 스키마:
```json
{ "step": "place_search", "type": "AUTH_ERROR", "message": "HTTP 401 - Kakao/TourAPI 키 권한 점검" }
```

---

## 9. 환경변수 (Environment Variables)

```ini
# .env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
KAKAO_REST_API_KEY=xxxxxxxx
TOUR_API_KEY=xxxxxxxx        # 공공데이터포털 인증키
# Open-Meteo는 키 불필요
```

`.env.example`에는 위 키 이름만 두고 값은 비워서 커밋한다. `.env`는 반드시 `.gitignore`에 포함.

---

## 10. 후보 도시 & 지역코드 (TourAPI areaCode)

후보 도시 풀(MVP 고정). TourAPI `areaCode` 오퍼레이션을 매번 호출하지 말고 아래 상수표 사용:

| 도시 | areaCode | 비고 |
| :--- | :---: | :--- |
| 서울 | 1 | |
| 부산 | 6 | |
| 인천 | 2 | |
| 강릉 | 32 | 강원(시군구코드로 세분) |
| 속초 | 32 | 강원 |
| 춘천 | 32 | 강원 |
| 경주 | 35 | 경북 |
| 전주 | 37 | 전북 |
| 여수 | 38 | 전남 |
| 통영 | 36 | 경남 |
| 제주 | 39 | |

> ⚠️ 강원권(강릉/속초/춘천)은 areaCode가 같으므로 도시 단위로 좁히려면 `sigunguCode`까지 매핑해야 한다. 정확한 시군구 코드는 `areaCode2` 오퍼레이션으로 1회 조회해 확정할 것. 위 표의 코드는 키 발급 후 실제 응답으로 검증 필요.

---

## 11. 알려진 함정 (Gotchas)

- **TourAPI 키 인코딩:** 발급 시 URL 인코딩/디코딩 두 형태로 주어진다. `requests`의 `params=`에 넣을 땐 보통 **디코딩 키**를 쓰고 라이브러리가 인코딩하게 둔다. 401이 뜨면 이 부분을 먼저 의심.
- **TourAPI 엔드포인트 버전:** 구버전 `KorService`는 폐기 수순. 발급 시 포털이 주는 **최신 엔드포인트(`KorService1`/`KorService2` 등)** 를 사용. 응답은 기본 XML이며 `&_type=json`을 붙여야 JSON.
- **Open-Meteo 미래 날짜:** 일반 예보는 7~16일 한정. 먼 미래 날짜는 Climate/Historical 평년값 엔드포인트로 폴백. 입력 날짜의 (월·일) 기준 과거 N년 평균을 쓴다.
- **필수 공통 파라미터:** TourAPI는 `MobileOS=ETC`, `MobileApp=AppName`이 없으면 종종 빈 응답을 준다.

---

## 12. 완료 정의 (Definition of Done)

- [ ] `--date` 정상/오류 입력 모두 가이드대로 동작 (오류 시 Usage + `sys.exit()`)
- [ ] 날씨 기반 도시 선별이 결정론적으로 재현됨
- [ ] 축제·맛집 실데이터가 리포트에 반영됨
- [ ] 검색 0건 / 인증 실패 / 파싱 실패 시에도 파이프라인이 살아남고 `errors`에 기록됨
- [ ] `results/{DATE}_raw_data.json` 과 `{DATE}_travel_plan.md` 생성
- [ ] 리포트에 오전/오후/저녁 1일 동선 포함
- [ ] 키가 코드 어디에도 하드코딩되어 있지 않음
- [ ] README에 설치·실행·보안 가이드 포함

---

## 13. 심화 과제 (Bonus)

- **숙박 추천:** TourAPI `searchStay` 호출 추가 (동일 키 재사용). raw_data에 `stays[]` 채우고 리포트에 숙소 섹션 삽입. — 7장 규약 2번 덕분에 함수 호출 한 줄로 가능해야 함.
- **복수 도시 추천:** 상위 N개 도시를 순회(Fan-Out)하여 집산.
- **로컬 캐싱:** `results/{DATE}_raw_data.json`이 이미 있으면 외부 호출 생략하고 역직렬화로 리포트만 재생성 (멱등성).
