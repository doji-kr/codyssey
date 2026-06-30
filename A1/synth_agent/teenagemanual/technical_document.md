# Teenage Manual Clone 기술 문서

## 1. 서론

본 문서는 Teenage Manual 웹사이트를 복제하여 구축한 웹 애플리케이션의 기술적 아키텍처, 주요 기능 구현 방식, 그리고 프로젝트 재현을 위한 상세 가이드라인을 제공합니다. 이 프로젝트는 Teenage Engineering 기기 사용자들을 위한 인터랙티브 가이드 및 AI 어시스턴트 플랫폼을 목표로 하며, 미니멀한 디자인과 사용자 친화적인 인터페이스를 특징으로 합니다.

## 2. 프로젝트 개요

### 2.1. 목표

- Teenage Manual 웹사이트의 핵심 기능(기기별 가이드, AI 질의응답, 인터랙티브 다이어그램) 복제 및 개선.
- 확장 가능하고 유지보수하기 쉬운 웹 애플리케이션 아키텍처 구축.
- 상세한 기술 문서를 통해 프로젝트의 재현성 및 이해도 증진.

### 2.2. 기술 스택

본 프로젝트는 다음과 같은 기술 스택을 활용하여 개발되었습니다.

| 카테고리 | 기술 스택 | 설명 |
|---|---|---|
| **프론트엔드** | React 19 | 사용자 인터페이스 구축을 위한 JavaScript 라이브러리 |
| | Tailwind CSS 4 | 유틸리티 우선(utility-first) CSS 프레임워크로, 빠르고 일관된 스타일링 제공 |
| | Wouter | React를 위한 경량 라우터 라이브러리 |
| | shadcn/ui | Tailwind CSS 기반의 재사용 가능한 UI 컴포넌트 라이브러리 |
| | Streamdown | Markdown 콘텐츠 렌더링 라이브러리 |
| **백엔드** | Express 4 | Node.js 웹 애플리케이션 프레임워크 |
| | tRPC 11 | 타입스크립트 기반의 엔드투엔드 타입 안전성을 제공하는 RPC 프레임워크 |
| | Drizzle ORM | TypeScript ORM으로, SQL 쿼리 빌더 및 마이그레이션 도구 제공 |
| **데이터베이스** | MySQL / TiDB | 관계형 데이터베이스 |
| **인증** | Manus OAuth | 사용자 인증 및 권한 관리를 위한 OAuth 2.0 프로토콜 구현 |
| **AI** | Manus LLM API | AI 질의응답 기능 구현을 위한 대규모 언어 모델 API |

### 2.3. 주요 기능

1. **홈 랜딩 페이지**: 지원 기기 목록, 히어로 섹션, FAQ 아코디언, 미니멀한 흰 배경 레이아웃.
2. **기기별 상세 페이지**: 기기 이미지, 설명, 가이드 목록, 자주 묻는 질문 목록.
3. **인터랙티브 기기 다이어그램**: 기기 이미지 위에 버튼/컨트롤 오버레이, 클릭 시 해당 기능 설명 툴팁 표시.
4. **AI 질의응답 채팅 인터페이스**: 기기별 컨텍스트 기반 자연어 질문 입력 및 LLM 응답 (공식 매뉴얼 기반 답변 스타일).
5. **마스터리 트랙 페이지**: 단계별 학습 가이드 목록 및 각 스텝 상세 내용.
6. **개별 가이드 상세 페이지**: 제목, 단계별 설명, 관련 컨트롤 하이라이트 포함.
7. **사용자 인증**: 로그인/로그아웃 기능.
8. **Pro 구독 플랜 소개 페이지**: 구독 혜택 및 가격 정보.
9. **네비게이션**: 상단 바 (기기 선택 드롭다운, Ask AI, Mastery, Sign In 메뉴), 하단 푸터.

## 3. 프로젝트 폴더 구조

```
teenage-manual-clone/
├── client/                       # 프론트엔드 애플리케이션 (React)
│   ├── public/                   # 정적 파일 (favicon, robots.txt 등)
│   ├── src/                      # 프론트엔드 소스 코드
│   │   ├── _core/                # Manus 템플릿 코어 (인증 훅 등)
│   │   ├── components/           # 재사용 가능한 UI 컴포넌트 (shadcn/ui 포함)
│   │   │   ├── ui/               # shadcn/ui 컴포넌트
│   │   │   └── InteractiveDiagram.tsx # 인터랙티브 다이어그램 컴포넌트
│   │   ├── contexts/             # React Context API
│   │   ├── hooks/                # 커스텀 React 훅
│   │   ├── lib/trpc.ts           # tRPC 클라이언트 설정
│   │   ├── pages/                # 페이지 컴포넌트
│   │   │   ├── Home.tsx          # 홈 랜딩 페이지
│   │   │   ├── DeviceDetail.tsx  # 기기 상세 페이지
│   │   │   ├── ChatPage.tsx      # AI 채팅 페이지
│   │   │   ├── ProPage.tsx       # Pro 구독 페이지
│   │   │   └── NotFound.tsx      # 404 페이지
│   │   ├── App.tsx               # 메인 라우팅 및 앱 구조
│   │   ├── main.tsx              # React 앱 엔트리 포인트
│   │   └── index.css             # 전역 스타일 및 Tailwind CSS 설정
│   └── index.html                # HTML 템플릿
├── drizzle/                      # Drizzle ORM 관련 파일
│   ├── migrations/               # 데이터베이스 마이그레이션 파일
│   ├── schema.ts                 # 데이터베이스 스키마 정의
│   └── ...
├── server/                       # 백엔드 애플리케이션 (Express + tRPC)
│   ├── _core/                    # Manus 템플릿 코어 (LLM, OAuth, tRPC 설정 등)
│   ├── db.ts                     # 데이터베이스 쿼리 헬퍼 함수
│   ├── routers.ts                # tRPC 라우터 정의 (API 엔드포인트)
│   ├── seed-data.ts              # 샘플 데이터 시드 파일
│   └── ...
├── shared/                       # 프론트엔드/백엔드 공유 타입 및 상수
├── .manus-logs/                  # 개발 서버 로그
├── package.json                  # 프로젝트 의존성 및 스크립트
├── pnpm-lock.yaml                # pnpm 락 파일
├── tsconfig.json                 # TypeScript 설정
├── vite.config.ts                # Vite 설정
├── vitest.config.ts              # Vitest 설정
└── todo.md                       # 프로젝트 TODO 리스트
```

## 4. 컴포넌트 구성 및 데이터 흐름

### 4.1. 홈 랜딩 페이지 (`client/src/pages/Home.tsx`)

- **구성**: 히어로 섹션, 기기 목록, 
FAQ 아코디언, 푸터.
- **데이터 흐름**: `trpc.devices.list.useQuery()`를 통해 모든 기기 목록을 가져와 표시합니다. `useAuth()` 훅을 사용하여 사용자 인증 상태를 확인하고 로그인/로그아웃 버튼을 조건부 렌더링합니다. FAQ 데이터는 클라이언트 사이드에서 정적으로 정의됩니다.

### 4.2. 기기 상세 페이지 (`client/src/pages/DeviceDetail.tsx`)

- **구성**: 기기 이미지, 기기 설명, 가이드 목록 (탭), FAQ 목록 (탭), 푸터.
- **데이터 흐름**: URL 파라미터 `slug`를 사용하여 `trpc.devices.getBySlug.useQuery()`로 특정 기기 정보를 가져옵니다. 해당 기기의 `id`를 사용하여 `trpc.guides.listByDevice.useQuery()`와 `trpc.faqs.listByDevice.useQuery()`를 통해 가이드와 FAQ 목록을 가져옵니다. `InteractiveDiagram` 컴포넌트를 사용하여 기기 이미지를 표시하고 컨트롤 오버레이를 처리합니다.

### 4.3. AI 채팅 페이지 (`client/src/pages/ChatPage.tsx`)

- **구성**: 기기 정보 헤더, 채팅 메시지 목록, 메시지 입력 폼.
- **데이터 흐름**: `trpc.devices.getBySlug.useQuery()`로 현재 기기 정보를 가져와 채팅 컨텍스트로 활용합니다. 사용자가 메시지를 입력하면 `trpc.chat.ask.useMutation()`을 호출하여 LLM에 질문을 전송하고 응답을 받습니다. 이전 대화 기록도 함께 전송하여 컨텍스트를 유지합니다. `Streamdown` 컴포넌트를 사용하여 LLM의 Markdown 응답을 렌더링합니다.

### 4.4. Pro 구독 페이지 (`client/src/pages/ProPage.tsx`)

- **구성**: Pro 구독 플랜 소개, 가격 정보, 혜택 목록, FAQ, CTA 버튼, 푸터.
- **데이터 흐름**: 정적 콘텐츠로 구성되며, `trpc.subscription.getStatus.useQuery()`를 통해 사용자 구독 상태를 확인하여 UI를 업데이트할 수 있습니다 (현재는 미구현).

### 4.5. 인터랙티브 기기 다이어그램 (`client/src/components/InteractiveDiagram.tsx`)

- **구성**: 기기 이미지, 이미지 위에 오버레이된 투명한 버튼/영역, 툴팁.
- **구현 방식**: `imageUrl` prop으로 기기 이미지를 받습니다. `controls` prop은 `ControlPoint` 객체 배열을 받으며, 각 객체는 `id`, `name`, `description`, `positionX`, `positionY`, `width`, `height`를 포함합니다. 이 `positionX`, `positionY`, `width`, `height` 값은 이미지 대비 백분율로, 각 컨트롤의 위치와 크기를 정의합니다. SVG `rect` 요소를 사용하여 컨트롤 영역을 시각적으로 표시하고, `Tooltip` 컴포넌트를 사용하여 컨트롤 이름과 설명을 툴팁으로 보여줍니다. `onControlClick` 콜백을 통해 컨트롤 클릭 이벤트를 처리할 수 있습니다.

## 5. AI 채팅 인터페이스 및 LLM 연동

### 5.1. 컨텍스트 관리

AI 채팅 인터페이스는 기기별 컨텍스트를 기반으로 답변을 생성합니다. `server/routers.ts`의 `chat.ask` tRPC 프로시저에서 다음 정보를 활용하여 LLM 시스템 프롬프트를 구성합니다.

- **기기 정보**: `device.name`, `device.displayName`, `device.category`, `device.description`
- **기기 컨트롤 정보**: `deviceControls` 테이블에서 가져온 각 컨트롤의 `name`과 `description` 목록
- **대화 기록**: 이전 사용자 질문과 AI 응답을 `conversationHistory` 배열로 LLM에 전달하여 대화의 흐름을 유지합니다.

### 5.2. LLM 연동 방식

`server/_core/llm.ts`에 정의된 `invokeLLM` 함수를 사용하여 Manus LLM API와 통신합니다. 이 함수는 `systemPrompt`와 `messages` 배열을 받아 LLM에 전달하고, 응답을 파싱하여 반환합니다. LLM 응답은 Markdown 형식으로 제공되며, 프론트엔드에서는 `Streamdown` 컴포넌트를 사용하여 이를 HTML로 렌더링합니다.

## 6. 사용자 인증 및 구독 플랜

### 6.1. 사용자 인증

Manus OAuth를 통해 사용자 인증을 처리합니다. `client/src/_core/hooks/useAuth.ts` 훅을 사용하여 현재 로그인한 사용자 정보 (`user`, `isAuthenticated`)를 가져올 수 있습니다. 로그인하지 않은 사용자는 `getLoginUrl()` 함수를 통해 Manus OAuth 로그인 페이지로 리다이렉트됩니다. 로그아웃은 `trpc.auth.logout.useMutation()`을 통해 세션 쿠키를 삭제하여 처리합니다.

### 6.2. 구독 플랜

`users` 테이블에 `subscriptionTier` 필드를 추가하여 사용자의 구독 상태(`free` 또는 `pro`)를 관리합니다. `trpc.subscription.getStatus.useQuery()`를 통해 현재 사용자의 구독 티어를 조회할 수 있습니다. Pro 구독 플랜 페이지 (`client/src/pages/ProPage.tsx`)는 Pro 구독의 혜택과 가격 정보를 사용자에게 제공합니다. 실제 구독 결제 및 상태 변경 로직은 현재 구현되지 않았습니다.

## 7. 프로젝트 재현 가이드

본 프로젝트를 로컬 환경에서 재현하거나 배포하기 위한 단계별 가이드입니다.

### 7.1. 환경 설정

1. **Node.js 및 pnpm 설치**: 프로젝트는 Node.js (v18 이상 권장)와 pnpm 패키지 매니저를 사용합니다.
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```
2. **MySQL/TiDB 데이터베이스 설정**: 로컬 또는 클라우드에 MySQL 호환 데이터베이스를 설정하고, 연결 문자열을 확보합니다.

### 7.2. 프로젝트 설치 및 실행

1. **프로젝트 클론**: 본 프로젝트의 소스 코드를 클론합니다.
   ```bash
   git clone <repository-url>
   cd teenage-manual-clone
   ```
2. **의존성 설치**: pnpm을 사용하여 프로젝트 의존성을 설치합니다.
   ```bash
   pnpm install
   ```
3. **환경 변수 설정**: `.env` 파일을 생성하고 다음 환경 변수를 설정합니다. `DATABASE_URL`은 MySQL/TiDB 연결 문자열로 대체해야 합니다.
   ```
   DATABASE_URL="mysql://user:password@host:port/database"
   JWT_SECRET="your_jwt_secret_key"
   VITE_APP_ID="your_manus_app_id"
   OAUTH_SERVER_URL="https://api.manus.im"
   VITE_OAUTH_PORTAL_URL="https://login.manus.im"
   OWNER_OPEN_ID="your_owner_open_id"
   OWNER_NAME="Your Name"
   BUILT_IN_FORGE_API_URL="https://api.manus.im"
   BUILT_IN_FORGE_API_KEY="your_manus_api_key"
   VITE_FRONTEND_FORGE_API_KEY="your_manus_frontend_api_key"
   VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
   ```
   `JWT_SECRET`, `VITE_APP_ID`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_KEY`는 Manus 플랫폼에서 발급받거나 임의의 안전한 값으로 설정해야 합니다.

4. **데이터베이스 마이그레이션**: Drizzle ORM을 사용하여 데이터베이스 스키마를 적용합니다.
   ```bash
   pnpm drizzle-kit generate
   # 생성된 SQL 파일을 확인하고 필요시 수정
   pnpm drizzle-kit migrate # 또는 webdev_execute_sql 툴 사용
   ```
   `webdev_execute_sql` 툴을 사용하여 SQL을 직접 실행하는 경우, `drizzle/0001_slippery_iron_patriot.sql` 파일의 내용을 복사하여 실행합니다.

5. **샘플 데이터 시드**: `server/seed.ts`에 정의된 샘플 데이터를 데이터베이스에 삽입합니다.
   ```bash
   node --loader tsx server/seed.ts
   ```
   **참고**: `seed.ts` 파일은 TypeScript로 작성되었으므로 `node --loader tsx`를 사용하여 실행합니다.

6. **개발 서버 실행**: 프론트엔드 및 백엔드 개발 서버를 동시에 실행합니다.
   ```bash
   pnpm dev
   ```
   브라우저에서 `http://localhost:3000` (또는 콘솔에 표시되는 URL)에 접속하여 애플리케이션을 확인할 수 있습니다.

### 7.3. 배포 가이드

본 프로젝트는 Manus 플랫폼에 최적화되어 있습니다. `webdev_save_checkpoint`를 통해 프로젝트 상태를 저장한 후, Manus Management UI에서 'Publish' 버튼을 클릭하여 배포할 수 있습니다. 필요한 환경 변수는 Manus 플랫폼에서 자동으로 관리됩니다.

## 8. 결론

본 문서는 Teenage Manual Clone 프로젝트의 전반적인 기술 구조와 구현 세부 사항을 다루었습니다. 이 문서를 통해 프로젝트의 이해를 돕고, 향후 기능 확장 및 유지보수에 기여할 수 있기를 바랍니다.

## 9. 참고 자료

- [Teenage Manual Original Website](https://www.teenagemanual.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Manus Platform Documentation](https://docs.manus.im)
