# PUPDATE — 보안 및 제약 사항 점검 보고서

**점검 일시:** 2026-06-27  
**점검 대상:** B2/ 전체 파일  
**점검자:** Claude (claude-sonnet-4-6)

---

## 1. 도구 사용 명시 점검

| 항목 | 요구사항 | 실제 사용 | 판정 |
|------|---------|-----------|------|
| 자동화 툴 | Make / Zapier / n8n 중 선택 후 명시 | **n8n** (Synology NAS 셀프호스팅) | ✅ PASS |
| 생성형 AI | OpenAI API 또는 이에 준하는 모델 | **OpenRouter → google/gemini-2.5-flash-lite** (번역·요약)<br>**OpenRouter → google/gemini-2.5-flash-image** (썸네일 생성) | ✅ PASS (준하는 모델, 명시됨) |
| 저장 도구 | 노션 권장, 다른 도구 사용 시 명시 | **NocoDB** (자체 호스팅) — synthwire.html 내 명시 | ✅ PASS (명시됨) |

---

## 2. 금지 사항 점검

### 2-1. RSS 피드 없는 사이트 크롤링 금지

| 확인 항목 | 내용 | 판정 |
|-----------|------|------|
| 수집 대상 사이트 | iHeartDogs.com | — |
| RSS 피드 URL | `https://iheartdogs.com/feed` | — |
| n8n 노드 타입 | `n8n-nodes-base.rssFeedRead` (공식 RSS 리더 노드) | ✅ PASS |
| 강제 크롤링 여부 | 없음 — 정식 RSS 피드만 사용 | ✅ PASS |

### 2-2. 무한 루프 트리거 금지

| 확인 항목 | 내용 | 판정 |
|-----------|------|------|
| 트리거 타입 | `n8n-nodes-base.scheduleTrigger` | — |
| 실행 간격 | 매 **23시간** 1회 (`hoursInterval: 23`) | ✅ PASS |
| 자기 호출·재귀 트리거 | 없음 | ✅ PASS |
| Limit 노드 | 최대 6건으로 처리 건수 상한 설정 | ✅ PASS (비용 제어) |
| AI 노드 배치 구간 | Filter → Dedup 이후에 AI 노드 배치 → 불필요한 API 호출 차단 | ✅ PASS |

---

## 3. 보안 점검

### 3-1. API 키/토큰 파일 내 하드코딩 여부

| 대상 | 확인 결과 | 판정 |
|------|-----------|------|
| OpenRouter Bearer 토큰 | 파일 내 문자열 없음. n8n_workflow.json에는 크레덴셜 참조 ID(`ZfbgUSqjFdg8Rcs2`)만 존재 — 실제 키 값 아님 | ✅ PASS |
| NocoDB xc-token | 파일 내 문자열 없음. 참조 ID(`gYg9fE3GIN2lS9zu`)만 존재 | ✅ PASS |
| synthwire.html token 필드 | `token: ''` (빈 값) — 사용자가 UI에서 입력 후 localStorage에 저장, 파일에 잔류 없음 | ✅ PASS |
| db_address.txt | 파일 내용 없음 (빈 파일) | ✅ PASS |

> **n8n 크레덴셜 참조 ID**는 n8n 내부 식별자로, export된 워크플로우 JSON에 실제 토큰 본문은 포함되지 않는다.

### 3-2. 문서·스크린샷 내 API 키/토큰 노출 및 마스킹

| 파일 | 확인 내용 | 판정 |
|------|-----------|------|
| `01_Workflow/workflow_structure.png` | 워크플로우 구조 스크린샷. 텍스트 파일 검색상 토큰 패턴 없음. **육안 확인 권고** | ⚠️ 수동 확인 필요 |
| `02_DB/db_nocodb.png` | NocoDB 화면 스크린샷. **육안 확인 권고** (설정 화면에 토큰 노출 여부) | ⚠️ 수동 확인 필요 |
| `02_DB/result_screenshot.png` | 실행 결과 스크린샷. **육안 확인 권고** | ⚠️ 수동 확인 필요 |
| HTML·JSON 텍스트 파일 | 토큰 패턴 문자열 없음 | ✅ PASS |

### 3-3. 기타 민감 정보 노출 현황

| 항목 | 노출 위치 | 위험도 | 비고 |
|------|-----------|--------|------|
| 내부 서버 주소 `nocodb.doji.synology.me` | n8n_workflow.json, synthwire.html (양 파일) | 🟡 낮음 | 서버가 외부 공개 상태인 경우 공격 표면이 될 수 있음 |
| NocoDB 테이블 ID `mlv0w2jirotd672` | n8n_workflow.json, synthwire.html (양 파일) | 🟡 낮음 | 토큰 없이는 접근 불가. 공개 저장소 업로드 시 환경변수화 권고 |

---

## 4. 종합 판정

| 구분 | 판정 |
|------|------|
| 도구 명시 | ✅ 충족 |
| AI 모델 명시 | ✅ 충족 (OpenRouter 경유 Gemini 2.5) |
| 저장 도구 명시 | ✅ 충족 (NocoDB 명시) |
| RSS 피드 기반 수집 | ✅ 충족 |
| 무한 루프 없음 | ✅ 충족 |
| API 키/토큰 파일 미노출 | ✅ 충족 |
| 스크린샷 마스킹 | ⚠️ 육안 재확인 필요 |

---

## 5. 권장 조치

1. **스크린샷 3종 육안 확인** — `workflow_structure.png`, `db_nocodb.png`, `result_screenshot.png`에서 토큰·API 키가 화면에 노출되지 않았는지 직접 확인 후 필요 시 마스킹 처리.
2. **공개 저장소 업로드 전** — synthwire.html의 `baseUrl`, `tableId` 하드코딩 값을 빈 값으로 교체하거나 `.gitignore`로 제외 검토.
3. **n8n_workflow.json 공유 시** — 파일 자체에 토큰은 없지만, 내부 서버 주소가 포함되어 있으므로 공개 공유 시 URL 라인을 마스킹하는 것을 권고.
