# PUPDATE — 영문 반려견 뉴스 자동 수집·번역·아카이빙

> RSS(iHeartDogs) → AI 번역·요약 → AI 썸네일 → NocoDB  
> n8n on Synology NAS · OpenRouter(Gemini 2.5) · NocoDB

---

## 팀 구성 및 역할

| 이름 | 역할 | 담당 작업 |
|------|------|-----------|
| 외진 | 기획 | 주제 선정 및 콘텐츠 방향, 요구사항 정리 |
| 수향 | 기획 | 주제 필터링 기준(키워드·태그) 정의, 큐레이션 정책 |
| 정현 | 기획 | 에러 처리·중복 방지 정책 설계, 검수 시나리오 |
| 도일 | 프로그래밍 | n8n 워크플로 구현, API 연동(OpenRouter·NocoDB), 디버깅, 결과 웹페이지 제작 |

---

## 프로젝트 개요

**반복 업무** — 매일 영문 반려견 뉴스를 확인 → 주제에 맞는 기사를 골라 → 한국어로 요약 → 출처·발행일과 함께 정리해 보관하는 작업을 n8n으로 완전 자동화했다.

### 도구 선정

**n8n** (자체 호스팅)
- 운영 중인 Synology NAS에 셀프호스팅 → 실행 비용 0, 데이터 자체 보관
- HTTP·Code 노드로 OpenRouter·NocoDB 등 임의 API를 자유롭게 연동
- 스케줄 트리거·재시도·실행 로그 기본 내장 → 안정적 무인 자동화에 유리

**NocoDB** (저장소)
- 노션형 협업 데이터베이스, 자체 호스팅
- 제목·요약·링크·발행일·썸네일을 각 컬럼(속성)에 저장

---

## 워크플로우 흐름

```
Schedule → RSS 수집 → 주제 필터 → 중복 제거 → AI 번역·요약 → Parse → AI 썸네일 → NocoDB 업로드
```

| 단계 | 노드 | 역할 |
|------|------|------|
| 00 | Schedule Trigger | 매 23시간마다 자동 실행 |
| 01 | iHeartDogs RSS | 영문 반려견 뉴스 수집 (title·link·contentSnippet·guid·발행일) |
| 02 | Filter Topic (IF) | 키워드 매칭으로 주제 일치 기사만 통과 |
| 03 | Remove Duplicates | guid 기준 이미 처리한 기사 폐기 (중복 저장 방지) |
| 04 | OpenClaw AI Processing | 한국어 제목·3줄 이내 요약·태그 생성 (기사당 1회) |
| 05 | Parse JSON Backup | 응답 파싱 + 원문 링크·발행일 결합 |
| 06 | Get Thumbnail | AI 썸네일 이미지 생성 (Gemini 2.5 Flash Image) |
| 07 | Upload Thumbnail | NocoDB 스토리지 업로드 |
| 08 | Create Record NocoDB | 제목·요약·링크·발행일·썸네일을 각 속성에 저장 |

---

## 주제 필터링 기준

RSS로 들어온 모든 기사를 처리하지 않고, **반려견 보호자에게 실질적으로 유용한 주제**만 통과시킨다.  
기사 `title`·`contentSnippet`에 아래 키워드가 하나라도 포함되면 "주제 일치"로 판정한다(대소문자 무시).

**통과 키워드 (영문 — 원문 기준)**

`dog` `puppy` `breed` `training` `behavior` `health` `vet` `nutrition` `food` `adoption` `rescue` `safety` `recall`

**분류 태그 (한국어 — 저장 기준)**

`건강` `훈련` `행동` `영양` `입양·구조` `견종` `안전·리콜`

**선택 이유**
- **유용성 우선** — 건강·훈련·안전처럼 보호자가 바로 활용할 수 있는 정보를 중심으로 큐레이션한다.
- **노이즈 제거** — 단순 가십·홍보성 글, 주제와 무관한 기사를 배제해 아카이브 품질을 유지한다.
- **비용 절감** — 주제에 맞는 기사만 AI 번역·이미지 단계로 보내므로 불필요한 API 호출이 줄어든다.

---

## 에러 처리 정책

| 위험 / 요구사항 | 방어 위치 | 메커니즘 |
|----------------|-----------|----------|
| 사람 개입 없는 자동 완료 | Schedule Trigger | 매 23시간 자동 실행 |
| 뉴스 미수집 시 처리 | RSS → 이후 전체 | 수집 0건이면 빈 배열 → 하류 미실행으로 안전 종료 |
| 주제 외 기사 유입 | Filter Topic (IF) | 키워드 불일치 기사 폐기 |
| 중복 저장 방지 | Remove Duplicates | `dedupeValue = guid \|\| link` |
| 요약 1건당 1회 | 번역 LLM | 루프 미사용. 1 아이템 = 1 호출 |
| 재시도 최대 2회 | 번역 LLM | `retryOnFail` + Max Tries 3 (최초 1 + 재시도 2) |
| LLM 출력 형식 깨짐 | 번역 → Parse | `response_format: json_object` 강제 + try/catch |
| 개별 기사 처리 실패 격리 | Parse JSON | 실패 건 null 반환 후 필터 → 나머지 정상 진행 |
| 빈 값으로 저장 깨짐 | Create Record | `JSON.stringify(... ?? null)`로 유효 JSON 보장 |
| 이미지 누락 응답 | Extract Image | 이미지 없으면 `continue`로 스킵 |
| API 비용 폭주 | Filter·Dedup (AI 앞단) | 필터·중복제거를 AI 단계 앞에 배치 |

**정책 선택 이유**
- **중복키로 guid 선택** — 원문 link는 트래킹 파라미터로 변형될 수 있어, 기사 고유 식별자인 guid가 더 안정적이다. (없을 때만 link 폴백)
- **요약 1회 원칙** — 같은 기사를 여러 번 요약하면 비용이 비례해 늘고 결과가 흔들린다. 1 기사 = 1 호출로 비용과 일관성을 동시에 확보.
- **재시도 2회 상한** — 일시적 오류(429/5xx)는 자동 복구하되, 무한 재시도로 인한 비용·지연 폭주를 막기 위해 상한을 둔다.
- **실패 격리** — 여러 건 중 1건이 깨져도 전체가 멈추지 않도록 try/catch로 격리(graceful degradation).

---

## 산출물 목록

```
B2/
├── 01_Workflow/
│   ├── n8n_workflow.json      # n8n 워크플로우 내보내기 파일
│   ├── synthwire.html         # 워크플로우 구조 시각화 페이지
│   └── workflow_structure.png # 워크플로우 스크린샷
├── 02_DB/
│   ├── db_address.txt         # NocoDB 접속 주소
│   ├── db_nocodb.png          # NocoDB 데이터베이스 스크린샷
│   └── result_screenshot.png  # 실행 결과 스크린샷
├── 03_README/
│   └── README.pdf             # 기획서 PDF
├── 04_Final_Output/
│   └── synthwire.html         # 최종 제출 결과 웹페이지 (Readme·Flow·Feed·Docs·Security 탭 포함)
└── security_check/
    ├── security_check.md      # 보안 및 제약 사항 점검 보고서 (Markdown)
    └── security_check.html    # 보안 및 제약 사항 점검 보고서 (HTML)
```

---

## 보안 및 제약 사항 점검

> 상세 보고서: `security_check/security_check.md` · `security_check/security_check.html`  
> synthwire.html **Security 탭**에서도 확인 가능

### 도구 명시

| 항목 | 요구사항 | 실제 사용 | 판정 |
|------|---------|-----------|------|
| 자동화 툴 | Make / Zapier / n8n 중 선택 후 명시 | **n8n** (Synology NAS 셀프호스팅) | ✓ |
| 생성형 AI | OpenAI API 또는 이에 준하는 모델 | OpenRouter → `google/gemini-2.5-flash-lite` (번역·요약)<br>OpenRouter → `google/gemini-2.5-flash-image` (썸네일) | ✓ |
| 저장 도구 | 노션 권장, 다른 도구 사용 시 명시 | **NocoDB** (자체 호스팅, 명시됨) | ✓ |

### 금지 사항

| 항목 | 확인 내용 | 판정 |
|------|-----------|------|
| RSS 피드 없는 사이트 크롤링 금지 | `n8n-nodes-base.rssFeedRead` 노드로 `iheartdogs.com/feed` 공식 RSS만 사용 | ✓ |
| 무한 루프 트리거 금지 | Schedule Trigger 23시간 간격, Limit 노드로 6건 상한, 자기 호출 없음 | ✓ |

### 보안

| 항목 | 판정 | 비고 |
|------|------|------|
| API 키·토큰 파일 내 미노출 | ✓ PASS | n8n_workflow.json에는 내부 참조 ID만 존재, 실제 토큰 본문 없음 |
| token 필드 하드코딩 없음 | ✓ PASS | synthwire.html `token: ''` — 사용자 입력 후 localStorage 저장 |
| 스크린샷 마스킹 | ⚠ 육안 확인 필요 | PNG 3종(workflow_structure, db_nocodb, result_screenshot) 직접 확인 필요 |
| 내부 서버 주소 노출 | ⚠ 낮음 | `nocodb.doji.synology.me` — 공개 저장소 업로드 시 마스킹 권고 |

---

## 요구사항 충족 현황

| 요구사항 | 충족 | 구현 |
|---------|------|------|
| RSS 자동 수집 + 매일 트리거 | ✓ | Schedule Trigger + iHeartDogs RSS |
| 주제 일치 기사 선택 + 제목·링크·본문 추출 | ✓ | 주제 필터(IF) + Limit + RSS 필드 |
| AI로 3줄 이내 요약 | ✓ | 번역 LLM (summary_kr, 3문장 이내) |
| DB에 제목·요약·링크·발행일 각 속성 저장 | ✓ | NocoDB · title_kr·summary_kr·source_url·pub_date |
| 무인 자동 완료 + 오류 처리 | ✓ | 에러 처리 정책 참고 |
| 중복 방지 키 1개 이상 | ✓ | Remove Duplicates · guid |
| 요약 1건당 1회 / 재시도 ≤ 2 | ✓ | 루프 없음 · retryOnFail Max Tries 3 |
