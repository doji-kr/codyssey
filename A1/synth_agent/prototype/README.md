# Synth Agent v1 — 프로토타입

Teenage Engineering 기기를 위한 **인터랙티브 학습 가이드 웹앱** 프론트엔드 프로토타입.  
백엔드·AI·인증 없이 정적 Mock Data만으로 핵심 UI 흐름과 인터랙션을 검증한다.

---

## 개발 배경 & 목표

teenagemanual.com의 EP-133 K.O. II 인터랙티브 가이드를 레퍼런스로 삼아,  
기기 사진 위에 컨트롤을 오버레이하고 튜토리얼 스텝마다 관련 버튼을 하이라이트하는  
"기기 연동 학습 인터페이스"를 직접 구현한다.

핵심 가설:
- 기기 사진 + 버튼 하이라이트만으로 매뉴얼 없이 배울 수 있다
- 단계별 스텝 구조 + `{KEYWORD}` 강조가 학습 흐름을 크게 개선한다
- MVP는 Static Data만으로 충분히 흐름 검증이 가능하다

---

## 실행

```bash
cd prototype
npm install
npm run dev     # http://localhost:5173
```

---

## 기술 스택

| 역할 | 기술 | 선택 이유 |
|---|---|---|
| 프레임워크 | **React 19** + TypeScript | 컴포넌트 기반 상태 관리, 타입 안정성 |
| 번들러 | **Vite 6** | 빠른 HMR, `@` 경로 alias 지원 |
| 스타일 | **Tailwind CSS v4** (`@tailwindcss/vite`) | CSS 변수 기반 테마, inline 스타일과 혼용 |
| UI 기반 | **shadcn/ui** 패턴 (Radix UI + `cn()`) | headless 컴포넌트, 커스터마이징 용이 |
| 아이콘 | **lucide-react** | 경량, 일관된 선형 아이콘 세트 |
| 상태 관리 | React `useState` | 전역 store 불필요 — 로컬 prop drilling으로 충분 |
| 데이터 | `mockData.ts` (정적 TypeScript 객체) | 백엔드 없이 전체 UI 흐름 검증 |
| 좌표 분석 | **Python Pillow** | 기기 사진 픽셀 분석으로 버튼 위치 정밀 측정 |

---

## 화면 구조

```
┌─ Header: [EP-133 K.O. II ∨]   synth agent v1   [마스터리] [✦] ─┐
│                                                                    │
│  ┌─── DevicePanel (50%) ────┐  ┌── RightPanel (50%) ───────────┐  │
│  │  카테고리        기기명  │  │                                │  │
│  │                          │  │  ① HomeView                   │  │
│  │    실제 기기 사진         │  │     AI 모드 / 마스터리 카드   │  │
│  │                          │  │                                │  │
│  │  ██ 컨트롤 오버레이 ██   │  │  ② GuideListView              │  │
│  │  (hover → 이름·설명)     │  │     번호/자물쇠 · 제목 · 배지 │  │
│  │  (active → 주황 하이라이트)│  │     X분 · Y스텝 메타 표시    │  │
│  │                          │  │                                │  │
│  │  기기 이름               │  │  ③ TutorialView               │  │
│  │  컨트롤을 탭해 보세요    │  │     세그먼트 진행 바           │  │
│  └──────────────────────────┘  │     제목 + 본문 ({KEYWORD})   │  │
│                                 │     YOU SHOULD SEE/HEAR 박스  │  │
│                                 │     TIP 박스                  │  │
│                                 │     [뒤로] [알겠어요, 다음으로]│  │
│                                 └────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 상태 머신

```
home ──onStartMastery──▶ guides ──onSelectGuide──▶ tutorial
  ◀──────────onBack───────────────────────────onBack──┘
```

헤더 드롭다운으로 기기를 교체하면 → `home`으로 리셋

---

## 핵심 구현: 컨트롤 오버레이 시스템

EP-133 사진 위에 **퍼센트 기반 절대 위치** 오버레이를 얹는 방식.

```
컨테이너: style={{ width: 'min(260px, 55%)', aspectRatio: '388/530' }}
                                               ↑ 원본 이미지(388×530px) 비율 유지

각 컨트롤 오버레이:
  left:   positionX %   ← 컨테이너 전체 너비 대비 %
  top:    positionY %   ← 컨테이너 전체 높이 대비 %
  width:  width %
  height: height %
```

화면 크기가 바뀌어도 컨테이너가 비율을 유지하므로 오버레이 위치가 항상 정확하게 맞는다.

**좌표 측정 방법 (Python Pillow 픽셀 분석):**

1. `ep133.png` (388×530px) 로드
2. 주황색 픽셀 클러스터 → 노브·버튼 위치 1차 감지
3. 어두운 픽셀 행 스캔 → 버튼 경계 정밀 확인
4. 픽셀 좌표 → 퍼센트 변환 → `mockData.ts`에 반영
5. 브라우저 오버레이로 육안 검증 → 미세 조정 (스크린샷 피드백 반복)

**EP-133 물리 버튼 구조 반영:**

EP-133 K.O. II는 하나의 물리 버튼에 두 기능이 인쇄되어 있다.  
상단 라벨 = 기본 기능 / 하단 라벨 = SHIFT 조합 기능.  
SHIFT 조합 기능은 별도 오버레이 없이 설명 텍스트(`description`)에만 표기.

```
SOUND  (SHIFT → EDIT)       SAMPLE (SHIFT → CHOP)
MAIN   (SHIFT → COMMIT)     FX     (SHIFT → OUTPUT)
TEMPO  (SHIFT → LOOP)       ERASE  (SHIFT → SYSTEM)
                             TIMING (SHIFT → CORRECT)
```

오른쪽 열 실제 레이아웃:

```
Col A              Col B
SAMPLE             TIMING
FX                 ERASE
− (minus)          + (plus)
RECORD             PLAY
```

---

## 콘텐츠 시스템: `{KEYWORD}` 구문

튜토리얼 본문에서 컨트롤 이름을 강조하는 전용 구문.

```
"Hold {TEMPO} down and turn the orange {X 노브}."
         ↓ StepContent 컴포넌트 렌더링
"Hold <strong class='text-orange-500'>TEMPO</strong> down and..."
```

`relatedControls` 배열의 Control ID와 연동되어, 해당 컨트롤이 DevicePanel에서 주황 하이라이트된다.

---

## 데이터 모델 (`src/data/mockData.ts`)

```typescript
Device {
  id, slug, name, displayName, category, description
  controls: Control[]
  guides:   Guide[]
}

Control {
  id, name, description
  positionX, positionY   // 기기 이미지 내 위치 (%)
  width, height          // 오버레이 크기 (%)
}

Guide {
  id, slug, title, description
  isFree?: boolean          // 무료 공개 여부
  estimatedMinutes?: number // 예상 소요 시간
  steps: GuideStep[]
}

GuideStep {
  id, stepNumber, title
  content: string              // {KEYWORD} 구문 포함 본문
  youShouldSeeHear?: string    // "이렇게 들려야 합니다" 안내
  tips?: string                // 추가 팁
  relatedControls: string[]    // Control.id 배열 → DevicePanel 하이라이트
}
```

---

## 현재 데이터 현황

### EP-133 K.O. II (컨트롤 1:1 정밀 매핑 완료)

**컨트롤 30개:**

```
왼쪽 스트립:  volume, keys, fader-b, fader-sl, shift
상단 버튼:    sound, main, tempo-b
노브:         knob-x (BPM), knob-y (SWING)
그룹 패드:    pad-a, pad-b, pad-c, pad-d
패드 1열:     p7, p4, p1, pstar(*)
패드 2열:     p8, p5, p2, p0
패드 3열:     p9, p6, p3
엔터:         enter
오른쪽 A열:   sample, fx, minus-btn, record
오른쪽 B열:   timing, erase, plus-btn, play
```

**가이드 3개 (전체 한글):**

| 가이드 | 제목 | 스텝 | 무료 |
|---|---|---|---|
| g1 | 첫 시작 | 3스텝 · 5분 | 무료 |
| g2 | 첫 번째 비트 만들기 | 3스텝 · 6분 | PRO |
| g3 | 로파이 비트 만들기 | 7스텝 · 8분 | PRO |

---

## 파일 구조

```
prototype/
├── public/
│   └── ep133.png                  # K.O. II 실제 기기 사진 (388×530px)
├── index.html
├── vite.config.ts                  # Vite + Tailwind v4 + @ alias
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx                     # 루트 레이아웃 + view 상태 머신
    ├── index.css                   # Tailwind import + CSS 변수 테마
    ├── lib/
    │   └── utils.ts                # cn() — clsx + tailwind-merge
    ├── data/
    │   └── mockData.ts             # 기기·가이드·컨트롤 정적 데이터 (한글)
    └── components/
        ├── Header.tsx              # 상단 바: 기기 선택 드롭다운 + 네비
        ├── DevicePanel.tsx         # 왼쪽 50%: 기기 이미지 + 컨트롤 오버레이
        ├── DeviceIllustration.tsx  # 기기별 이미지/SVG 분기 렌더링
        ├── HomeView.tsx            # 홈: AI 모드 / 마스터리 경로 선택
        ├── GuideListView.tsx       # 가이드 목록 (teenagemanual 스타일)
        ├── TutorialView.tsx        # 스텝별 튜토리얼 + {KEYWORD} 렌더러
        └── ui/                     # shadcn/ui 기반 기본 컴포넌트
            ├── badge.tsx
            ├── button.tsx
            ├── card.tsx
            ├── scroll-area.tsx
            ├── separator.tsx
            └── tooltip.tsx
```

---

## 디자인 레퍼런스 (teenagemanual.com)

| 영역 | 색상 |
|---|---|
| DevicePanel 배경 | `#e5e1da` (따뜻한 회색) |
| RightPanel 배경 | `#f5f4f2` (오프화이트) |
| 카드 테두리 | `#dedad5` |
| 메인 액센트 | `#f04e00` (오렌지-레드) |

GuideListView: 첫 번째 가이드 → 주황 번호 배지 + `무료` 아웃라인 배지.  
이후 가이드 → 자물쇠 아이콘 + `PRO` 아웃라인 배지. 카드 간 경계선 공유, 위아래만 둥근 모서리.

TutorialView: 상단 세그먼트 진행 바 클릭으로 스텝 점프 가능.

---

## TODO

### 매뉴얼 기반 콘텐츠 확장

`manuals/ep133_manual_os_2-0.pdf` (258페이지)를 참조해 가이드를 추가한다.

- [ ] 샘플링 워크플로 (10장) → SAMPLE / CHOP / TIMING 컨트롤 활용 가이드
- [ ] 패턴 시퀀싱 (9장) → 라이브 녹음 / 스텝 시퀀서 가이드
- [ ] FX (11장) → Punch-in FX 2.0, 딜레이·리버브·디스토션
- [ ] Song Mode (8.3장) → COMMIT 버튼으로 패턴 배열

### 기기 확장

- [ ] OP-1F 실제 이미지 교체 및 컨트롤 1:1 매핑
- [ ] TX-6 실제 이미지 교체 및 컨트롤 1:1 매핑

### 기능 확장

- [ ] AI 채팅 연동 ("이 스텝에서 막혔나요?" 버튼 활성화)
- [ ] 백엔드 API 연동 (mockData → tRPC)
- [ ] 인증 + Pro 구독 플로우 (`isFree` 게이팅 실제 처리)
