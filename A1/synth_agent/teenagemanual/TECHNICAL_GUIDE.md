# Teenage Manual Clone - 완벽한 기술 문서

**프로젝트 개요:** 전자기기 사용 가이드 웹 애플리케이션. 사용자는 기기를 선택하고, 인터랙티브 다이어그램을 통해 각 컨트롤을 학습하며, AI 기반 Q&A로 질문에 답변받을 수 있습니다.

**기술 스택:**
- **프론트엔드:** React 19 + Tailwind CSS 4 + TypeScript
- **백엔드:** Express 4 + tRPC 11 + Node.js
- **데이터베이스:** MySQL/TiDB + Drizzle ORM
- **인증:** Manus OAuth
- **AI:** Manus LLM API (invokeLLM)

---

## 1. 프로젝트 구조

```
teenage-manual-clone/
├── client/                          # 프론트엔드 (React)
│   ├── public/                      # 정적 파일 (favicon, robots.txt만)
│   ├── src/
│   │   ├── pages/                   # 페이지 컴포넌트
│   │   │   ├── Home.tsx             # 홈 랜딩 페이지
│   │   │   ├── DeviceDetail.tsx     # 기기별 상세 페이지
│   │   │   ├── ChatPage.tsx         # AI 채팅 페이지
│   │   │   ├── MasteryPage.tsx      # 마스터리 트랙 페이지
│   │   │   ├── GuideDetail.tsx      # 개별 가이드 상세 페이지
│   │   │   ├── ProPage.tsx          # Pro 구독 페이지
│   │   │   └── NotFound.tsx         # 404 페이지
│   │   ├── components/              # 재사용 가능한 컴포넌트
│   │   │   ├── InteractiveDiagram.tsx   # 인터랙티브 기기 다이어그램
│   │   │   ├── AIChatBox.tsx            # AI 채팅 박스 (내장)
│   │   │   ├── DashboardLayout.tsx      # 대시보드 레이아웃
│   │   │   └── ui/                      # shadcn/ui 컴포넌트
│   │   ├── _core/hooks/
│   │   │   └── useAuth.ts           # 인증 상태 관리
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx     # 테마 관리
│   │   ├── lib/
│   │   │   ├── trpc.ts              # tRPC 클라이언트 설정
│   │   │   └── utils.ts             # 유틸리티 함수
│   │   ├── App.tsx                  # 라우팅 및 레이아웃
│   │   ├── main.tsx                 # 진입점
│   │   └── index.css                # 글로벌 스타일 (Tailwind)
│   └── index.html                   # HTML 템플릿
│
├── server/                          # 백엔드 (Express + tRPC)
│   ├── _core/                       # 핵심 인프라
│   │   ├── index.ts                 # Express 서버 진입점
│   │   ├── context.ts               # tRPC 컨텍스트 (인증)
│   │   ├── trpc.ts                  # tRPC 라우터 설정
│   │   ├── llm.ts                   # LLM API 통합 (invokeLLM)
│   │   ├── oauth.ts                 # OAuth 콜백 처리
│   │   ├── env.ts                   # 환경 변수
│   │   └── ...                      # 기타 핵심 파일
│   ├── db.ts                        # 데이터베이스 쿼리 헬퍼
│   ├── routers.ts                   # tRPC 라우터 정의
│   ├── storage.ts                   # S3 스토리지 헬퍼
│   ├── seed.ts                      # 샘플 데이터 시드
│   └── auth.logout.test.ts          # 테스트 예제
│
├── drizzle/                         # 데이터베이스 스키마
│   ├── schema.ts                    # 테이블 정의
│   ├── relations.ts                 # 테이블 관계
│   ├── migrations/                  # 마이그레이션 SQL
│   └── config.ts                    # Drizzle 설정
│
├── shared/                          # 공유 코드
│   ├── const.ts                     # 상수
│   └── types.ts                     # 공유 타입
│
├── references/                      # 통합 레퍼런스
│   ├── llm-integration.md           # LLM API 사용 가이드
│   ├── file-storage.md              # S3 스토리지 가이드
│   ├── manus-oauth.md               # OAuth 가이드
│   └── ...                          # 기타 통합 문서
│
├── package.json                     # 프로젝트 메타데이터
├── tsconfig.json                    # TypeScript 설정
├── vite.config.ts                   # Vite 설정
├── drizzle.config.ts                # Drizzle 설정
└── todo.md                          # 프로젝트 진행 상황
```

---

## 2. 데이터베이스 스키마

### 2.1 주요 테이블

#### `devices` - 지원 기기 (9종)
```sql
CREATE TABLE devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(64) UNIQUE NOT NULL,          -- URL 친화적 ID (e.g., "iphone-15")
  name VARCHAR(255) NOT NULL,                -- 기기 이름 (e.g., "iPhone 15")
  displayName VARCHAR(255) NOT NULL,        -- 표시 이름 (e.g., "iPhone 15")
  category VARCHAR(100) NOT NULL,           -- 카테고리 (e.g., "Smartphone")
  description TEXT,                         -- 기기 설명
  diagramImageUrl VARCHAR(500),             -- 기기 다이어그램 이미지 URL
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `guides` - 학습 가이드
```sql
CREATE TABLE guides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT NOT NULL,
  slug VARCHAR(128) NOT NULL,               -- URL 친화적 ID (e.g., "getting-started")
  title VARCHAR(255) NOT NULL,              -- 가이드 제목
  description TEXT,                        -- 가이드 설명
  category VARCHAR(100),                   -- 카테고리 (e.g., "Mastery", "FAQ")
  isFree BOOLEAN DEFAULT TRUE,              -- Pro 구독 필요 여부
  sortOrder INT DEFAULT 0,                  -- 정렬 순서
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES devices(id),
  UNIQUE KEY unique_device_guide (deviceId, slug)
);
```

#### `guideSteps` - 가이드 단계별 설명
```sql
CREATE TABLE guideSteps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guideId INT NOT NULL,
  stepNumber INT NOT NULL,                  -- 단계 번호
  title VARCHAR(255) NOT NULL,              -- 단계 제목
  description TEXT NOT NULL,                -- 단계 설명
  tips TEXT,                                -- 팁 (JSON 배열)
  relatedControls TEXT,                     -- 관련 컨트롤 ID (JSON 배열)
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guideId) REFERENCES guides(id) ON DELETE CASCADE
);
```

#### `deviceControls` - 기기 컨트롤 (인터랙티브 다이어그램)
```sql
CREATE TABLE deviceControls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT NOT NULL,
  name VARCHAR(255) NOT NULL,               -- 컨트롤 이름 (e.g., "Power Button")
  description TEXT NOT NULL,                -- 컨트롤 설명
  positionX FLOAT NOT NULL,                 -- 다이어그램 상 X 위치 (%)
  positionY FLOAT NOT NULL,                 -- 다이어그램 상 Y 위치 (%)
  width FLOAT NOT NULL,                     -- 컨트롤 너비 (%)
  height FLOAT NOT NULL,                    -- 컨트롤 높이 (%)
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
);
```

#### `faqs` - 자주 묻는 질문
```sql
CREATE TABLE faqs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT NOT NULL,
  question VARCHAR(500) NOT NULL,          -- 질문
  answer TEXT NOT NULL,                    -- 답변
  relatedControls TEXT,                    -- 관련 컨트롤 ID (JSON 배열)
  sortOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
);
```

#### `chatMessages` - AI 채팅 이력
```sql
CREATE TABLE chatMessages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,                               -- 사용자 ID (NULL = 비로그인)
  deviceId INT NOT NULL,
  question TEXT NOT NULL,                  -- 사용자 질문
  answer TEXT NOT NULL,                    -- AI 응답
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
);
```

#### `users` - 사용자 (Manus OAuth)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,      -- Manus OAuth ID
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  subscriptionTier ENUM('free', 'pro') DEFAULT 'free',  -- 구독 플랜
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. tRPC API 명세

### 3.1 라우터 구조

모든 API는 `/api/trpc` 경로 하에서 제공됩니다. tRPC는 타입 안전한 RPC를 제공하므로, 클라이언트와 서버 간 계약이 자동으로 동기화됩니다.

### 3.2 주요 프로시저

#### `devices` 라우터
```typescript
// 모든 기기 조회
devices.list() → Device[]

// 기기 슬러그로 조회
devices.getBySlug({ slug: string }) → Device | null

// 기기 ID로 조회
devices.getById({ id: number }) → Device | null
```

#### `guides` 라우터
```typescript
// 기기별 가이드 조회
guides.listByDevice({ deviceId: number }) → Guide[]

// 가이드 슬러그로 조회
guides.getBySlug({ deviceId: number, slug: string }) → Guide | null

// 가이드 ID로 조회
guides.getById({ id: number }) → Guide | null

// 가이드 단계 조회
guides.getSteps({ guideId: number }) → GuideStep[]
```

#### `faqs` 라우터
```typescript
// 기기별 FAQ 조회
faqs.listByDevice({ deviceId: number }) → FAQ[]
```

#### `controls` 라우터
```typescript
// 기기별 컨트롤 조회
controls.listByDevice({ deviceId: number }) → DeviceControl[]

// 컨트롤 ID로 조회
controls.getById({ id: number }) → DeviceControl | null
```

#### `chat` 라우터
```typescript
// AI에 질문 (기기별 컨텍스트 기반)
chat.ask({
  deviceId: number,
  question: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>
}) → { answer: string, deviceName: string }

// 채팅 이력 조회
chat.getHistory({ deviceId: number }) → ChatMessage[]
```

#### `subscription` 라우터 (보호됨)
```typescript
// 사용자 구독 상태 조회 (로그인 필수)
subscription.getStatus() → { tier: 'free' | 'pro', isPro: boolean }
```

#### `auth` 라우터
```typescript
// 현재 사용자 정보 조회
auth.me() → User | null

// 로그아웃
auth.logout() → { success: boolean }
```

---

## 4. 페이지별 구현 상세

### 4.1 홈 페이지 (`/`)

**목적:** 애플리케이션 소개 및 기기 목록 표시

**주요 요소:**
- 히어로 섹션: 제목, 부제, CTA 버튼
- 기기 카드 그리드: 9종 기기 목록 (클릭 시 기기 상세 페이지로 이동)
- FAQ 아코디언: 자주 묻는 질문 (기기별 아님, 일반적)
- 푸터: 회사 정보, 링크

**데이터 흐름:**
```
1. Home 컴포넌트 마운트
2. trpc.devices.list() 호출 → 모든 기기 조회
3. 기기 카드 렌더링
4. 사용자가 기기 클릭 → /:slug 라우트로 이동
```

**주요 코드:**
```tsx
const { data: devices = [] } = trpc.devices.list.useQuery();
// 기기 카드 렌더링
devices.map(device => (
  <Link href={`/${device.slug}`}>
    <Card>{device.displayName}</Card>
  </Link>
))
```

### 4.2 기기 상세 페이지 (`/:slug`)

**목적:** 특정 기기의 모든 정보 표시

**주요 요소:**
- 기기 정보 헤더: 기기 이름, 설명, 카테고리
- 기기 이미지 또는 다이어그램
- 탭 네비게이션:
  - Overview: 기기 설명 및 주요 기능
  - Guides: 학습 가이드 목록
  - FAQ: 자주 묻는 질문
- 상단 네비게이션: 기기 선택 드롭다운, Ask AI, Mastery, Sign In

**데이터 흐름:**
```
1. DeviceDetail 컴포넌트 마운트
2. URL 파라미터에서 slug 추출
3. trpc.devices.getBySlug({ slug }) 호출
4. trpc.guides.listByDevice({ deviceId }) 호출
5. trpc.faqs.listByDevice({ deviceId }) 호출
6. 탭별 콘텐츠 렌더링
```

### 4.3 AI 채팅 페이지 (`/:slug/ask`)

**목적:** 기기별 AI 질의응답 인터페이스

**주요 요소:**
- 채팅 박스 (AIChatBox 컴포넌트)
- 메시지 히스토리 표시
- 입력 필드 및 전송 버튼
- 로딩 상태 및 에러 처리

**데이터 흐름:**
```
1. ChatPage 컴포넌트 마운트
2. URL 파라미터에서 deviceId 추출
3. trpc.chat.getHistory({ deviceId }) 호출 → 이전 채팅 로드
4. 사용자가 질문 입력 및 전송
5. trpc.chat.ask({ deviceId, question, conversationHistory }) 호출
6. AI 응답 표시
7. 응답을 conversationHistory에 추가
```

**AI 컨텍스트:**
```
시스템 프롬프트:
"You are an expert guide for the [Device Name] ([Display Name]), a [Category].
[Device Description]

Available controls and features:
[Control List]

Provide clear, concise answers grounded in the official manual. 
When referencing controls, be specific about their location and function.
Always cite which section or control you're referring to.
Keep answers practical and actionable."
```

### 4.4 마스터리 트랙 페이지 (`/:slug/mastery`)

**목적:** 기기 학습을 위한 단계별 가이드 제시

**주요 요소:**
- 마스터리 트랙 카드 그리드: 각 가이드를 카드로 표시
- 카드 정보: 제목, 설명, Pro 배지 (필요시)
- 클릭 시 가이드 상세 페이지로 이동

**데이터 흐름:**
```
1. MasteryPage 컴포넌트 마운트
2. URL 파라미터에서 deviceId 추출
3. trpc.guides.listByDevice({ deviceId }) 호출
4. 가이드를 "Mastery" 카테고리와 기타로 분류
5. 카드 그리드 렌더링
6. 사용자가 카드 클릭 → /:slug/guides/:guideSlug로 이동
```

### 4.5 개별 가이드 상세 페이지 (`/:slug/guides/:guideSlug`)

**목적:** 특정 가이드의 단계별 설명 및 인터랙티브 다이어그램

**주요 요소:**
- 가이드 제목 및 설명
- 인터랙티브 기기 다이어그램 (컨트롤 오버레이 포함)
- 단계별 설명 섹션
- 각 단계에서 관련 컨트롤 하이라이트
- 팁 및 주의사항

**데이터 흐름:**
```
1. GuideDetail 컴포넌트 마운트
2. URL 파라미터에서 deviceId, guideSlug 추출
3. trpc.devices.getById({ deviceId }) 호출
4. trpc.guides.getBySlug({ deviceId, slug: guideSlug }) 호출
5. trpc.guides.getSteps({ guideId }) 호출
6. trpc.controls.listByDevice({ deviceId }) 호출
7. 사용자가 단계 선택 → 해당 단계의 relatedControls를 추출
8. InteractiveDiagram에 highlightedControls 전달
9. 다이어그램에서 관련 컨트롤 하이라이트 표시
```

**인터랙티브 다이어그램 상세:**
```tsx
interface InteractiveDiagramProps {
  imageUrl: string;                    // 기기 이미지 URL
  controls: ControlPoint[];            // 모든 컨트롤 포인트
  deviceName: string;
  onControlClick?: (controlId: string) => void;
  highlightedControls?: string[];      // 하이라이트할 컨트롤 ID 배열
}

// 렌더링 로직:
// 1. 기기 이미지 표시
// 2. SVG 오버레이로 컨트롤 위치 표시
// 3. hoveredControl 또는 highlightedControls에 포함된 컨트롤 강조
// 4. 클릭 시 onControlClick 콜백 실행
// 5. 범례에서 하이라이트된 컨트롤 시각적 강조
```

### 4.6 Pro 구독 페이지 (`/pro`)

**목적:** Pro 구독 플랜 소개 및 업그레이드 유도

**주요 요소:**
- Pro 플랜 소개
- 기능 비교 테이블 (Free vs Pro)
- 구독 버튼
- FAQ 섹션

---

## 5. 인터랙티브 다이어그램 시스템

### 5.1 컴포넌트 구조

```tsx
// InteractiveDiagram.tsx
export function InteractiveDiagram({
  imageUrl,
  controls,
  deviceName,
  onControlClick,
  highlightedControls = [],
}: InteractiveDiagramProps) {
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

  return (
    <div className="relative inline-block w-full">
      {/* 기기 이미지 */}
      <img src={imageUrl} alt={deviceName} />

      {/* SVG 오버레이: 컨트롤 박스 표시 */}
      <svg className="absolute inset-0 w-full h-full">
        {controls.map(control => (
          hoveredControl === control.id || highlightedControls.includes(control.id)
            ? <rect x={control.positionX}% y={control.positionY}% ... />
            : null
        ))}
      </svg>

      {/* 클릭 가능한 버튼 오버레이 */}
      <div className="absolute inset-0">
        {controls.map(control => (
          <button
            key={control.id}
            style={{
              left: `${control.positionX}%`,
              top: `${control.positionY}%`,
              width: `${control.width}%`,
              height: `${control.height}%`,
            }}
            onMouseEnter={() => setHoveredControl(control.id)}
            onMouseLeave={() => setHoveredControl(null)}
            onClick={() => onControlClick?.(control.id)}
          >
            <Tooltip>{control.name}: {control.description}</Tooltip>
          </button>
        ))}
      </div>

      {/* 범례 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {controls.map(control => (
          <button
            key={control.id}
            className={highlightedControls.includes(control.id) ? "highlighted" : ""}
            onClick={() => {
              setHoveredControl(control.id);
              onControlClick?.(control.id);
              setTimeout(() => setHoveredControl(null), 2000);
            }}
          >
            {control.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 5.2 위치 지정 (좌표 시스템)

- 모든 위치는 **백분율(%)** 로 지정됩니다.
- `positionX`, `positionY`: 컨트롤의 중심 좌표
- `width`, `height`: 컨트롤의 크기
- 예: 전원 버튼이 이미지 우상단에 있으면 `positionX: 85, positionY: 10, width: 5, height: 5`

### 5.3 상호작용 흐름

```
1. 사용자가 다이어그램의 컨트롤 버튼 위에 마우스 오버
   → hoveredControl 상태 변경
   → SVG 박스 강조 표시
   → 툴팁 표시

2. 사용자가 컨트롤 버튼 클릭
   → onControlClick 콜백 실행
   → GuideDetail에서 해당 단계로 스크롤
   → 단계 설명 업데이트

3. GuideDetail에서 단계 선택
   → relatedControls 추출
   → InteractiveDiagram에 highlightedControls 전달
   → 다이어그램에서 관련 컨트롤 자동 강조
```

---

## 6. AI 채팅 시스템

### 6.1 LLM 통합 (invokeLLM)

```typescript
// server/routers.ts
import { invokeLLM } from "./_core/llm";

chat: router({
  ask: publicProcedure
    .input(z.object({
      deviceId: z.number(),
      question: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. 기기 정보 조회
      const device = await db.getDeviceById(input.deviceId);

      // 2. 기기 컨트롤 목록 조회
      const controls = await db.getDeviceControlsByDeviceId(input.deviceId);
      const controlsList = controls
        .map(c => `${c.name}: ${c.description}`)
        .join('\n');

      // 3. 시스템 프롬프트 구성 (기기별 컨텍스트)
      const systemPrompt = `You are an expert guide for the ${device.name}...`;

      // 4. 메시지 배열 구성
      const messages = [
        ...(input.conversationHistory || []),
        { role: 'user' as const, content: input.question }
      ];

      // 5. LLM 호출
      const llmResponse = await invokeLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      });

      // 6. 응답 추출
      const response = typeof llmResponse.choices[0]?.message.content === 'string'
        ? llmResponse.choices[0].message.content
        : '';

      // 7. 채팅 이력 저장
      await db.saveChatMessage(
        ctx.user?.id || null,
        input.deviceId,
        input.question,
        response
      );

      return { answer: response, deviceName: device.name };
    }),
}),
```

### 6.2 클라이언트 사용 예

```tsx
// ChatPage.tsx
const { data: chatHistory = [] } = trpc.chat.getHistory.useQuery(
  { deviceId },
  { enabled: !!deviceId }
);

const askMutation = trpc.chat.ask.useMutation({
  onSuccess: (data) => {
    // 응답 표시
    setMessages([...messages, { role: 'assistant', content: data.answer }]);
  },
  onError: (error) => {
    // 에러 처리
    toast.error('Failed to get response');
  },
});

const handleSubmit = (question: string) => {
  askMutation.mutate({
    deviceId,
    question,
    conversationHistory: messages,
  });
};
```

---

## 7. 사용자 인증 및 구독

### 7.1 인증 흐름

```
1. 사용자가 "Sign In" 클릭
   → getLoginUrl() 호출 (Manus OAuth 포털로 리다이렉트)

2. 사용자가 Manus 계정으로 로그인
   → OAuth 콜백 (/api/oauth/callback)
   → 세션 쿠키 설정

3. 각 요청마다 ctx.user 자동 주입
   → protectedProcedure에서 인증 확인
   → 비인증 사용자는 에러 반환

4. 로그아웃
   → auth.logout() 호출
   → 세션 쿠키 삭제
```

### 7.2 구독 상태 확인

```tsx
// Pro 기능이 필요한 경우
const { data: subscription } = trpc.subscription.getStatus.useQuery(
  undefined,
  { enabled: !!user }  // 로그인한 경우만 쿼리
);

if (!user) {
  return <Button onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>;
}

if (!subscription?.isPro && guide.isFree === false) {
  return <ProUpgradePrompt />;
}
```

---

## 8. 데이터 시드 및 초기화

### 8.1 샘플 데이터 추가

```typescript
// server/seed.ts
import { getDb } from './db';
import { devices, guides, guideSteps, deviceControls, faqs } from '../drizzle/schema';

async function seed() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // 1. 기기 추가
  const deviceResult = await db.insert(devices).values({
    slug: 'iphone-15',
    name: 'iPhone 15',
    displayName: 'iPhone 15',
    category: 'Smartphone',
    description: 'Apple iPhone 15 with advanced features...',
    diagramImageUrl: 'https://...',
  });

  // 2. 가이드 추가
  const guideResult = await db.insert(guides).values({
    deviceId: deviceResult[0].insertId,
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of your iPhone 15',
    category: 'Mastery',
    isFree: true,
  });

  // ... 계속 추가
}

seed().catch(console.error);
```

**실행:**
```bash
cd /home/ubuntu/teenage-manual-clone
node --loader tsx server/seed.ts
```

---

## 9. 배포 및 환경 설정

### 9.1 환경 변수

```bash
# .env (로컬 개발용, 커밋하지 않음)
DATABASE_URL=mysql://user:password@localhost:3306/teenage_manual
JWT_SECRET=your-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
```

### 9.2 빌드 및 시작

```bash
# 개발 서버
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 프로덕션 시작
pnpm run start

# 타입 체크
pnpm run check

# 테스트
pnpm run test
```

---

## 10. 성능 최적화

### 10.1 프론트엔드 최적화

- **코드 분할:** 페이지별 동적 임포트
- **이미지 최적화:** 기기 다이어그램 이미지 압축
- **캐싱:** tRPC 쿼리 캐싱 (React Query)
- **번들 크기:** Tailwind CSS 프루닝

### 10.2 백엔드 최적화

- **데이터베이스 인덱싱:** slug, deviceId 인덱스
- **쿼리 최적화:** N+1 문제 방지
- **LLM 캐싱:** 동일 질문에 대한 응답 캐싱 (선택사항)

---

## 11. 테스트

### 11.1 유닛 테스트

```typescript
// server/auth.logout.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('auth.logout', () => {
  it('clears the session cookie and reports success', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
```

**실행:**
```bash
pnpm run test
```

### 11.2 통합 테스트

- Ask AI 페이지에서 실제 질문 제출
- 기기 선택 및 페이지 네비게이션
- 로그인/로그아웃 흐름
- Pro 기능 접근 제어

---

## 12. 문제 해결

### 12.1 LLM 오류

**문제:** `invokeLLM is not exported from './_core/llm'`

**해결:**
```bash
# 1. 서버 재시작
pnpm run dev

# 2. 또는 캐시 삭제
rm -rf node_modules/.vite
pnpm run dev
```

### 12.2 데이터베이스 연결 오류

**문제:** `Database not available`

**해결:**
```bash
# 1. DATABASE_URL 확인
echo $DATABASE_URL

# 2. 데이터베이스 마이그레이션 재실행
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 12.3 인증 오류

**문제:** `ctx.user is undefined`

**해결:**
```typescript
// protectedProcedure 사용 확인
const result = protectedProcedure.query(({ ctx }) => {
  // ctx.user는 항상 존재 (보호됨)
  return ctx.user;
});
```

---

## 13. 프로젝트 복제 및 재현 가이드

### 13.1 처음부터 시작

```bash
# 1. 프로젝트 초기화
pnpm create vite teenage-manual-clone --template react-ts
cd teenage-manual-clone

# 2. 의존성 설치
pnpm install

# 3. 이 가이드의 모든 파일 복사
# - drizzle/schema.ts
# - server/routers.ts
# - server/db.ts
# - client/src/pages/*.tsx
# - client/src/components/*.tsx

# 4. 데이터베이스 마이그레이션
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 5. 샘플 데이터 시드
node --loader tsx server/seed.ts

# 6. 개발 서버 시작
pnpm run dev
```

### 13.2 환경 설정

```bash
# 1. Manus 계정 생성 및 OAuth 앱 등록
# https://manus.im → 개발자 설정

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 수정

# 3. 데이터베이스 설정
# MySQL/TiDB 인스턴스 생성
# DATABASE_URL 설정

# 4. LLM API 키 설정
# Manus Forge API 키 발급
# BUILT_IN_FORGE_API_KEY 설정
```

---

## 14. 추가 리소스

- **Manus OAuth 문서:** `references/manus-oauth.md`
- **LLM 통합 문서:** `references/llm-integration.md`
- **파일 스토리지 문서:** `references/file-storage.md`
- **tRPC 공식 문서:** https://trpc.io
- **Drizzle ORM 문서:** https://orm.drizzle.team
- **Tailwind CSS 문서:** https://tailwindcss.com

---

## 15. 라이선스 및 기여

이 프로젝트는 Teenage Manual 웹사이트의 완전한 복제본입니다. 모든 코드는 MIT 라이선스 하에 제공됩니다.

**기여 방법:**
1. 이 저장소를 포크합니다.
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`).
5. Pull Request를 생성합니다.

---

**마지막 업데이트:** 2026년 6월 30일
**프로젝트 버전:** 1.0.0
