# Synth Agent v1 – Prototype

Teenage Engineering 기기 학습 가이드 웹앱의 **프론트엔드 프로토타입**.  
백엔드·AI·인증 없이 static mock data만으로 핵심 UI 흐름을 검증한다.

---

## 실행

```bash
cd prototype
npm install
npm run dev     # http://localhost:5173
```

---

## 화면 구조

```
┌─ Header: [EP-133 K.O. II ∨]   synth agent v1   [마스터리] [✦] ─┐
│                                                                   │
│  ┌── DevicePanel (50%) ────┐  ┌── RightPanel (50%) ────────────┐ │
│  │  [카테고리]   [기기명]   │  │                                 │ │
│  │                         │  │  ① HomeView                    │ │
│  │    실제 기기 사진 /      │  │     "무엇을 배우고 싶으신가요?" │ │
│  │    SVG 일러스트           │  │     AI 모드 카드 · 마스터리 카드│ │
│  │                         │  │                                 │ │
│  │  [컨트롤 오버레이 버튼]  │  │  ② GuideListView               │ │
│  │  (hover → 이름/설명)    │  │     "트랙을 선택하세요."        │ │
│  │  (tutorial step →       │  │     가이드 카드 목록            │ │
│  │   해당 컨트롤 주황 하이라이트) │  │                                 │ │
│  │                         │  │  ③ TutorialView                │ │
│  │  [기기 이름]             │  │     STEP X / Y + 세그먼트 바   │ │
│  │  [컨트롤을 탭해 보세요]  │  │     제목 + 본문({KEYWORD} 강조) │ │
│  │                         │  │     YOU SHOULD SEE/HEAR 박스   │ │
│  └─────────────────────────┘  │     ◆ TIP 박스                 │ │
│                                │     [뒤로]  [알겠어요, 다음으로 →] │ │
│                                └─────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## 상태 머신

```
home  ──onStartMastery──▶  guides  ──onSelectGuide──▶  tutorial
  ◀──────────onBack───────────────────────────onBack──────┘
```

---

## 핵심 상호작용

| 동작 | 결과 |
|---|---|
| 헤더 기기 드롭다운 | 기기 교체 + 홈 화면으로 리셋 |
| 마스터리 카드 클릭 | GuideListView로 전환 |
| 가이드 카드 선택 | TutorialView로 전환, 스텝 0 초기화 |
| 세그먼트 진행 바 클릭 | 해당 스텝으로 점프 |
| "알겠어요, 다음으로" | 다음 스텝 + relatedControls 하이라이트 |
| DevicePanel 컨트롤 클릭 | 해당 컨트롤 단독 하이라이트 (토글) |
| DevicePanel 컨트롤 호버 | 하단 오버레이에 이름·설명 표시 |

---

## 기술 스택

| 역할 | 기술 |
|---|---|
| 프레임워크 | React 19 + TypeScript |
| 번들러 | Vite 6 |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) |
| UI 컴포넌트 | shadcn/ui 패턴 (Radix UI 기반, `cn()` 유틸) |
| 아이콘 | lucide-react |
| 상태 관리 | React `useState` (로컬, 전역 store 없음) |
| 데이터 | `src/data/mockData.ts` — 정적 TypeScript 객체 |
| 기기 이미지 | EP-133: 실제 사진 (`public/ep133.png`) / OP-1F, TX-6: inline SVG |

---

## 파일 구조

```
prototype/
├── public/
│   └── ep133.png              # K.O. II 실제 기기 사진
├── index.html
├── vite.config.ts             # Vite + Tailwind v4 + @ alias
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx                # 루트 레이아웃 + view 상태 머신
    ├── index.css              # Tailwind import + CSS 변수 테마
    ├── lib/
    │   └── utils.ts           # cn() — clsx + tailwind-merge
    ├── data/
    │   └── mockData.ts        # 기기·가이드·컨트롤 정적 데이터 (한글)
    └── components/
        ├── Header.tsx          # 상단 바: 기기 선택 드롭다운 + 브랜드 + 네비
        ├── DevicePanel.tsx     # 왼쪽 50%: 기기 이미지 + 컨트롤 오버레이
        ├── DeviceIllustration.tsx  # 기기별 이미지/SVG 렌더링
        ├── HomeView.tsx        # 오른쪽: 홈 — 경로 선택 화면
        ├── GuideListView.tsx   # 오른쪽: 가이드 목록
        ├── TutorialView.tsx    # 오른쪽: 스텝별 튜토리얼
        └── ui/                 # shadcn/ui 컴포넌트
            ├── badge.tsx
            ├── button.tsx
            ├── card.tsx
            ├── scroll-area.tsx
            ├── separator.tsx
            └── tooltip.tsx
```

---

## 데이터 모델

```typescript
Device {
  id, slug, name, displayName, category, description
  bgColor     // SVG 기기용 배경색
  controls: Control[]
  guides:   Guide[]
}

Control {
  id, name, description
  positionX, positionY  // 기기 이미지 내 위치 (%)
  width, height          // 오버레이 크기 (%)
}

Guide {
  id, slug, title, description
  steps: GuideStep[]
}

GuideStep {
  id, stepNumber, title
  content: string         // {KEYWORD} 구문 → bold orange 렌더링
  youShouldSeeHear?: string
  tips?: string
  relatedControls: string[]  // Control.id 배열 → DevicePanel 하이라이트
}
```

### content `{KEYWORD}` 구문

```
"Hold {TEMPO} down and turn the orange knob."
         ↓ 렌더링
"Hold <strong class='text-orange-500'>TEMPO</strong> down and turn the orange knob."
```

---

## 레퍼런스 디자인

- teenagemanual.com 기반 50/50 스플릿 레이아웃
- 왼쪽: 따뜻한 회색 배경 (`#e5e1da`) + 기기 사진/SVG
- 오른쪽: 따뜻한 오프화이트 (`#f5f4f2`) + 콘텐츠
- 메인 액센트 컬러: `#f04e00` (오렌지-레드)

---

## TODO

### 🔲 다음 작업: 이미지 ↔ 버튼 정밀 매핑

EP-133 실제 사진 위 컨트롤 오버레이의 위치·크기를 실제 버튼/노브와 정확히 일치시킨다.

- [ ] EP-133 사진(388×530px) 위 각 컨트롤의 정확한 `positionX/Y/width/height` 측정
  - `pads` — 4×3 패드 그리드 (A/B/C/D 그룹 포함)
  - `knob-a` (X 노브, BPM) — 주황색 대형 노브
  - `knob-b` (VOLUME) — 왼쪽 흰색 노브
  - `sample-btn` — 오렌지 SAMPLE 버튼
  - `play-btn`, `record-btn` — 하단 우측
  - `tempo-btn` — TEMPO 텍스트 버튼
- [ ] 오버레이 시각적 검증 도구 추가 (dev 모드에서 좌표 그리드 표시)
- [ ] OP-1F, TX-6도 실제 이미지로 교체 후 동일하게 매핑
- [ ] 컨트롤 클릭 시 확대 툴팁 (이름 + 상세 설명) 개선

### 🔲 그 다음 작업: 매뉴얼 기반 콘텐츠 확장

`manuals/ep133_manual_os_2-0.pdf` (258페이지)를 참조해 핵심 기능 가이드를 추가한다.

- [ ] 매뉴얼에서 주요 워크플로 추출
  - 샘플링 (10장) → `SAMPLE`, `CHOP`, `TIMING` 시퀀스
  - 패턴 시퀀싱 (9장) → 라이브 녹음 / 스텝 시퀀서
  - FX (11장) → Punch-in FX 2.0, 딜레이/리버브/디스토션
  - Song Mode (8.3장) → 패턴을 트랙으로 배열
- [ ] 각 워크플로를 GuideStep 배열로 변환 (한글, `{KEYWORD}` 구문 포함)
- [ ] `youShouldSeeHear` · `tips` 필드 기반으로 매뉴얼 원문 검증
- [ ] OP-1F, TX-6 매뉴얼도 추가 후 동일하게 적용

### 🔲 이후 작업 (추후 구현)

- AI 채팅 연동 ("이 스텝에서 막혔나요?" 버튼 활성화)
- 백엔드 API 연동 (mock data → tRPC)
- 인증 + Pro 구독 (가이드별 `isFree` 처리)
