export interface Control {
  id: string;
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export interface GuideStep {
  id: string;
  stepNumber: number;
  title: string;
  content: string;          // {KEYWORD} → bold orange
  youShouldSeeHear?: string;
  tips?: string;
  relatedControls: string[];
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string;
  isFree?: boolean;
  estimatedMinutes?: number;
  steps: GuideStep[];
}

export interface Device {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
  bgColor: string;
  controls: Control[];
  guides: Guide[];
}

export const devices: Device[] = [
  {
    id: '1',
    slug: 'ep-133',
    name: 'EP-133',
    displayName: 'K.O. II',
    category: '샘플러',
    description:
      '64MB 샘플러 + 비트 컴포저. 샘플링, 초핑, 시퀀싱, 완성된 트랙 제작까지 단계별로 익혀 보세요.',
    bgColor: '#1c1c1e',
    controls: [
      // ── 왼쪽 스트립 ──────────────────────────────────
      { id: 'volume',   name: 'VOLUME',         description: '마스터 출력 볼륨 노브',                                         positionX:  3, positionY: 44, width: 13, height: 13 },
      { id: 'keys',     name: 'KEYS',            description: 'KEYS 모드: 패드를 음계 키보드로 전환',                           positionX:  4, positionY: 57, width: 10, height:  9 },
      { id: 'fader-b',  name: 'FADER',           description: 'FADER 모드: 왼쪽 슬라이더로 벨로시티 제어',                     positionX:  4, positionY: 68, width: 10, height:  8 },
      { id: 'fader-sl', name: 'FADER 슬라이더',  description: '벨로시티 또는 레벨 슬라이더',                                   positionX:  7, positionY: 73, width:  5, height: 15 },
      { id: 'shift',    name: 'SHIFT',           description: '보조 기능 전환 — 다른 버튼과 함께 누르면 보조 기능 활성화',       positionX:  4, positionY: 89, width: 10, height:  8 },
      // ── 상단 버튼 행 (단일 물리 버튼 / 아래 인쇄 라벨 = SHIFT 기능) ─
      { id: 'sound',   name: 'SOUND',   description: '사운드 브라우저 열기. SHIFT+SOUND = EDIT (Envelope·Trim 편집)',           positionX: 18, positionY: 44, width:  9, height:  7 },
      { id: 'main',    name: 'MAIN',    description: '메인 패턴 뷰로 이동. SHIFT+MAIN = COMMIT (패턴을 Song 트랙에 확정)',       positionX: 32, positionY: 44, width:  9, height:  7 },
      { id: 'tempo-b', name: 'TEMPO',   description: '누른 채 X 노브를 돌리면 BPM 설정. SHIFT+TEMPO = LOOP (루프 구간 설정)',   positionX: 46, positionY: 44, width:  9, height:  7 },
      // ── BPM / 메트로놈 노브 ───────────────────────────
      { id: 'knob-x', name: 'X 노브 (BPM)',   description: 'TEMPO를 누른 채 돌리면 BPM 설정. 단독 조작 시 파라미터 X 변경',    positionX: 70, positionY: 44, width: 14, height: 16 },
      { id: 'knob-y', name: 'Y 노브 (SWING)', description: 'TEMPO를 누른 채 돌리면 스윙 양 조절. 단독 조작 시 파라미터 Y 변경', positionX: 86, positionY: 44, width: 11, height: 16 },
      // ── 그룹 패드 A/B/C/D ────────────────────────────
      { id: 'pad-a', name: '그룹 A', description: '그룹 A 패드 (샘플 슬롯 1-12): 탭하면 그룹 전환', positionX: 15, positionY: 57, width: 12, height: 10 },
      { id: 'pad-b', name: '그룹 B', description: '그룹 B 패드 (샘플 슬롯 13-24)',                  positionX: 15, positionY: 67, width: 12, height:  9 },
      { id: 'pad-c', name: '그룹 C', description: '그룹 C 패드 (샘플 슬롯 25-36)',                  positionX: 15, positionY: 76, width: 12, height:  9 },
      { id: 'pad-d', name: '그룹 D', description: '그룹 D 패드 (샘플 슬롯 37-48)',                  positionX: 15, positionY: 85, width: 12, height: 10 },
      // ── 숫자 패드 1열: 7, 4, 1, * ────────────────────
      { id: 'p7',    name: '패드 7', description: '숫자 패드 7 — 현재 그룹의 7번 슬롯 트리거', positionX: 31, positionY: 57, width: 10, height: 10 },
      { id: 'p4',    name: '패드 4', description: '숫자 패드 4',                               positionX: 31, positionY: 67, width: 10, height:  9 },
      { id: 'p1',    name: '패드 1', description: '숫자 패드 1',                               positionX: 31, positionY: 76, width: 10, height:  9 },
      { id: 'pstar', name: '패드 *', description: '숫자 패드 *',                               positionX: 31, positionY: 85, width: 10, height:  9 },
      // ── 숫자 패드 2열: 8, 5, 2, 0 ────────────────────
      { id: 'p8', name: '패드 8', description: '숫자 패드 8', positionX: 45, positionY: 57, width: 10, height: 10 },
      { id: 'p5', name: '패드 5', description: '숫자 패드 5', positionX: 45, positionY: 67, width: 10, height:  9 },
      { id: 'p2', name: '패드 2', description: '숫자 패드 2', positionX: 45, positionY: 76, width: 10, height:  9 },
      { id: 'p0', name: '패드 0', description: '숫자 패드 0', positionX: 45, positionY: 85, width: 10, height:  9 },
      // ── 숫자 패드 3열: 9, 6, 3 (+ 삭제 — ENTER와 중복) ───
      { id: 'p9', name: '패드 9', description: '숫자 패드 9', positionX: 59, positionY: 57, width:  9, height: 10 },
      { id: 'p6', name: '패드 6', description: '숫자 패드 6', positionX: 59, positionY: 67, width:  9, height:  9 },
      { id: 'p3', name: '패드 3', description: '숫자 패드 3', positionX: 59, positionY: 76, width:  9, height:  9 },
      // ── ENTER ────────────────────────────────────────
      { id: 'enter', name: 'ENTER', description: '선택 확인 / 이름 입력 완료', positionX: 56, positionY: 86, width: 13, height: 10 },
      // ── 오른쪽 A열: SAMPLE → FX → − → RECORD ─────────
      { id: 'sample',    name: 'SAMPLE', description: '누른 채 패드를 탭하면 해당 슬롯에 샘플 녹음 시작. SHIFT+SAMPLE = CHOP (슬라이스 편집)', positionX: 72, positionY: 57, width: 11, height:  9 },
      { id: 'fx',        name: 'FX',     description: 'FX 이펙트 모드 진입 (딜레이·리버브·디스토션 등). SHIFT+FX = OUTPUT (출력 믹스)',        positionX: 72, positionY: 66, width: 11, height:  8 },
      { id: 'minus-btn', name: '−',      description: '파라미터 감소',                                                                          positionX: 72, positionY: 75, width: 11, height:  7 },
      // ── 오른쪽 B열: TIMING → ERASE → + → PLAY ────────
      { id: 'timing',    name: 'TIMING', description: 'Note Repeat 및 타이밍 설정 모드. SHIFT+TIMING = CORRECT (퀀타이즈 그리드 맞춤)',         positionX: 85, positionY: 57, width: 12, height:  9 },
      { id: 'erase',     name: 'ERASE',  description: '스텝 또는 패턴 삭제. SHIFT+ERASE = SYSTEM (시스템 설정)',                                positionX: 85, positionY: 66, width: 12, height:  8 },
      { id: 'plus-btn',  name: '+',      description: '파라미터 증가',                                                                          positionX: 85, positionY: 75, width: 12, height:  7 },
      // ── 하단 행 ──────────────────────────────────────
      { id: 'record', name: 'RECORD', description: '라이브 녹음 시작 — 연주가 시퀀서에 실시간으로 기록됩니다', positionX: 71, positionY: 85, width: 13, height: 11 },
      { id: 'play',   name: 'PLAY',   description: '시퀀스 재생 시작 / 정지',                                  positionX: 84, positionY: 85, width: 14, height: 11 },
    ],
    guides: [
      {
        id: 'g1',
        slug: 'getting-started',
        title: '첫 시작',
        description: '전원 켜기부터 첫 샘플 녹음까지 — 침묵에서 소리까지 5분이면 됩니다.',
        isFree: true,
        estimatedMinutes: 5,
        steps: [
          {
            id: 's1',
            stepNumber: 1,
            title: '전원 켜기',
            content:
              '상단 우측 모서리의 {POWER} 스위치를 패드에 불이 들어올 때까지 꾹 누르세요. 약 2초 후 기기가 부팅됩니다.',
            youShouldSeeHear:
              '16개 패드가 왼쪽 위에서 오른쪽 아래 방향으로 주황색으로 순차 점등되고, 화면에 마지막으로 사용한 BPM이 표시됩니다.',
            relatedControls: [],
          },
          {
            id: 's2',
            stepNumber: 2,
            title: '템포 맞추기',
            content:
              '{TEMPO} 버튼을 누른 채로 큰 주황색 노브를 돌려 화면에 90 BPM이 표시될 때까지 조절하세요. {TEMPO}에서 손을 떼면 값이 저장됩니다.',
            youShouldSeeHear:
              'TEMPO를 누르고 있는 동안 화면의 BPM 숫자가 노브 방향에 따라 오르내립니다. 숫자가 바뀌지 않는다면 TEMPO를 누른 채 노브를 돌리고 있는지 확인하세요.',
            tips:
              '90 BPM은 자연스럽게 고개가 끄덕여지는 템포입니다. 그루브감을 느끼기에도, 연주 실수를 줄이기에도 딱 좋습니다. 언제든 다시 조절할 수 있으니 지금은 편하게 정하세요.',
            relatedControls: ['knob-x', 'tempo-b'],
          },
          {
            id: 's3',
            stepNumber: 3,
            title: '첫 번째 샘플 녹음',
            content:
              '{SAMPLE}을 누른 채 패드 1을 탭하세요. 내장 마이크에 대고 말하거나 손뼉을 쳐 보세요. {SAMPLE}에서 손을 떼면 녹음이 멈춥니다.',
            youShouldSeeHear:
              '녹음 중에는 패드가 빨간색으로 깜빡입니다. SAMPLE을 놓으면 패드가 주황색으로 켜지며 샘플이 저장됐음을 알려줍니다.',
            tips:
              '2초 이내의 짧은 소리가 가장 잘 어울립니다. 처음엔 긴 녹음보다 짧고 강렬한 한 방이 훨씬 효과적입니다.',
            relatedControls: ['sample', 'p1'],
          },
        ],
      },
      {
        id: 'g2',
        slug: 'first-beat',
        title: '첫 번째 비트 만들기',
        description: '스텝 시퀀서로 킥·스네어를 배치하고 루프 패턴을 완성합니다.',
        estimatedMinutes: 6,
        steps: [
          {
            id: 's4',
            stepNumber: 1,
            title: '스텝 녹음 모드 진입',
            content:
              '{PLAY}를 눌러 트랜스포트를 시작한 뒤, 곧바로 {SAMPLE}을 눌러 스텝 녹음 모드로 진입하세요. 이제 패드는 16분음표 그리드 위치를 나타냅니다.',
            youShouldSeeHear:
              '커서 불빛이 패드를 왼쪽에서 오른쪽으로 훑으며 현재 플레이헤드 위치를 보여줍니다.',
            relatedControls: ['play', 'sample'],
          },
          {
            id: 's5',
            stepNumber: 2,
            title: '킥 배치',
            content:
              '패드 1과 패드 9를 탭해 비트 1, 3에 킥을 넣으세요. 불이 켜진 패드가 활성화된 스텝입니다. 다시 탭하면 끌 수 있습니다.',
            tips:
              '처음엔 적게 넣는 게 좋습니다. 4개짜리 패턴이 16개짜리보다 훨씬 강력하게 들립니다.',
            relatedControls: ['p1', 'p9'],
          },
          {
            id: 's6',
            stepNumber: 3,
            title: '들으면서 조정하기',
            content:
              '{PLAY}를 다시 눌러 스텝 녹음 모드를 종료하고 패턴이 루프되는 걸 들어 보세요. 필요하다면 {VOLUME}을 조절하세요.',
            youShouldSeeHear:
              '패턴이 계속 반복됩니다. 커서가 현재 재생 중인 스텝을 따라 움직입니다.',
            relatedControls: ['play', 'volume'],
          },
        ],
      },
      {
        id: 'g3',
        slug: 'lofi-beat',
        title: '로파이 비트 만들기',
        description: '− / + 로 드럼 샘플을 고르고, 85 BPM 로파이 그루브를 라이브 녹음으로 완성합니다.',
        estimatedMinutes: 8,
        steps: [
          {
            id: 's10',
            stepNumber: 1,
            title: '핵심 버튼 한눈에 보기',
            content:
              'K.O. II의 버튼은 세 구역으로 나뉩니다. 상단의 {SOUND} · {MAIN} · {TEMPO}는 모드 전환 버튼, 오른쪽의 {SAMPLE} · {FX} · {ERASE}는 기능 버튼입니다. {SHIFT}를 다른 버튼과 함께 누르면 버튼 아래에 인쇄된 보조 기능이 실행됩니다.',
            youShouldSeeHear:
              '버튼을 하나씩 눌러보면 화면 표시가 바뀝니다. 소리가 나지 않아도 됩니다. 지금은 위치를 눈으로 익히는 것이 목표입니다.',
            tips:
              'SHIFT는 키보드의 Shift 키와 같습니다. 단독으로는 아무 일도 일어나지 않지만, 다른 버튼과 조합하면 새로운 기능이 열립니다. SOUND+SHIFT = EDIT, TEMPO+SHIFT = LOOP 식으로 기억해 두세요.',
            relatedControls: ['sound', 'main', 'tempo-b', 'shift', 'sample', 'fx', 'erase'],
          },
          {
            id: 's11',
            stepNumber: 2,
            title: '그룹 A 선택하기',
            content:
              '왼쪽에 있는 주황색 {그룹 A} 패드를 탭하세요. 그룹 A가 활성화되면 패드 1~9가 그룹 A의 샘플 슬롯을 가리킵니다. {패드 1}을 탭해 현재 어떤 소리가 들어있는지 확인해 보세요.',
            youShouldSeeHear:
              '그룹 A 패드에 불이 켜지고, 패드 1을 누르면 해당 슬롯의 소리가 납니다. 기본값으로 킥 드럼이 들어있는 경우가 많습니다.',
            relatedControls: ['pad-a', 'p1'],
          },
          {
            id: 's12',
            stepNumber: 3,
            title: '− / + 로 킥 샘플 바꾸기',
            content:
              '{SOUND} 버튼을 누른 채 {패드 1}을 탭하면 사운드 브라우저가 열립니다. {−} 또는 {+} 버튼을 눌러 샘플을 스크롤하세요. 마음에 드는 킥 드럼 소리가 나오면 {ENTER}를 눌러 확정합니다.',
            youShouldSeeHear:
              '화면에 샘플 이름이 표시되고, − / + 를 누를 때마다 소리가 미리 재생됩니다. "KICK", "BD", "808" 등의 단어가 붙은 이름을 찾아보세요.',
            tips:
              '로파이 비트에는 너무 깔끔한 킥보다 약간 눌린 느낌의 묵직한 소리가 잘 어울립니다. 샘플 이름에 "VINYL", "CRUSHED", "TAPE"가 붙어 있다면 꼭 들어보세요.',
            relatedControls: ['sound', 'p1', 'minus-btn', 'plus-btn', 'enter'],
          },
          {
            id: 's13',
            stepNumber: 4,
            title: '스네어와 하이햇 고르기',
            content:
              '같은 방법으로 {패드 2}에는 스네어(SD · SNARE), {패드 3}에는 하이햇(HH · HAT) 샘플을 넣으세요. {SOUND}를 누른 채 해당 패드를 탭하고, {−} / {+}로 스크롤한 뒤 {ENTER}로 확정합니다.',
            youShouldSeeHear:
              '패드 2에서 스네어, 패드 3에서 하이햇 소리가 납니다. 세 패드를 번갈아 치면서 드럼 킷이 자연스럽게 어울리는지 귀로 확인하세요.',
            tips:
              '서로 다른 시대의 샘플을 섞으면 재미있는 텍스처가 생깁니다. 60년대 빈티지 킥 + 90년대 샘플러 스네어 조합이 로파이 특유의 온기를 만들어냅니다.',
            relatedControls: ['sound', 'p2', 'p3', 'minus-btn', 'plus-btn', 'enter'],
          },
          {
            id: 's14',
            stepNumber: 5,
            title: '템포 85 BPM으로 맞추기',
            content:
              '{TEMPO} 버튼을 누른 채 주황색 {X 노브}를 돌려 화면에 85가 표시될 때까지 조절하세요. 85 BPM은 자연스럽게 고개가 끄덕여지는 로파이 히합의 황금 템포입니다.',
            youShouldSeeHear:
              'TEMPO를 누른 동안 화면 숫자가 실시간으로 바뀝니다. 85 근처에서 손을 떼면 설정이 저장됩니다.',
            tips:
              '80~95 BPM이 로파이 히합의 전통적인 영역입니다. 더 나른하고 졸린 느낌을 원한다면 75 BPM도 시도해 보세요.',
            relatedControls: ['tempo-b', 'knob-x'],
          },
          {
            id: 's15',
            stepNumber: 6,
            title: '라이브 녹음으로 비트 찍기',
            content:
              '{RECORD}를 누르면 바로 녹음이 시작됩니다. {패드 1}(킥)을 1·3박, {패드 2}(스네어)를 2·4박, {패드 3}(하이햇)을 8분음표 리듬으로 두드려 보세요. 한 바퀴(16스텝)가 끝나면 자동으로 루프됩니다.',
            youShouldSeeHear:
              '녹음 중에는 RECORD 버튼이 빨간색으로 깜빡입니다. 패드를 탭할 때마다 해당 스텝에 불이 들어오며 기록됩니다.',
            tips:
              '처음엔 한 악기씩 녹음해도 됩니다. 킥만 먼저 찍고, RECORD를 다시 눌러 스네어를 덧입히고, 마지막에 하이햇을 추가하는 방식으로 레이어를 쌓아가세요.',
            relatedControls: ['record', 'p1', 'p2', 'p3'],
          },
          {
            id: 's16',
            stepNumber: 7,
            title: '재생하고 다듬기',
            content:
              '{PLAY}를 눌러 방금 녹음한 패턴을 들어보세요. 잘못 찍힌 스텝이 있다면 {ERASE}를 누른 채 해당 패드를 탭해 지울 수 있습니다. {VOLUME}을 조절해 원하는 레벨로 맞추세요.',
            youShouldSeeHear:
              '패턴이 반복 재생되며 현재 재생 중인 스텝이 패드에 표시됩니다. 귀에 즐겁게 들리면 성공입니다.',
            tips:
              '완벽하지 않아도 됩니다. 약간의 타이밍 흔들림이 오히려 로파이 특유의 인간적인 그루브를 만들어냅니다. 너무 정확한 비트는 오히려 차갑게 들릴 수 있습니다.',
            relatedControls: ['play', 'erase', 'volume'],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    slug: 'op-1f',
    name: 'OP-1F',
    displayName: 'OP–1 Field',
    category: '신디사이저',
    description:
      'FM 라디오, 무선 오디오, 8시간 배터리를 갖춘 휴대용 신디사이저 + 4트랙 테이프 레코더.',
    bgColor: '#f0ede8',
    controls: [
      {
        id: 'keys',
        name: '키보드',
        description: '애프터터치 지원 25건반 벨로시티 감응 키보드',
        positionX: 5,
        positionY: 65,
        width: 90,
        height: 28,
      },
      {
        id: 'green-knob',
        name: '초록 노브',
        description: '어택 또는 첫 번째 신디 파라미터 조절',
        positionX: 8,
        positionY: 18,
        width: 13,
        height: 20,
      },
      {
        id: 'blue-knob',
        name: '파란 노브',
        description: '필터 컷오프 또는 두 번째 신디 파라미터 조절',
        positionX: 28,
        positionY: 18,
        width: 13,
        height: 20,
      },
      {
        id: 'record-btn',
        name: 'REC',
        description: '테이프 트랙 녹음 준비 상태(암)로 전환',
        positionX: 68,
        positionY: 42,
        width: 12,
        height: 14,
      },
      {
        id: 'play-btn',
        name: 'PLAY',
        description: '현재 테이프 트랙 재생',
        positionX: 82,
        positionY: 42,
        width: 12,
        height: 14,
      },
    ],
    guides: [
      {
        id: 'g3',
        slug: 'first-sound',
        title: '첫 번째 사운드',
        description: '신디 엔진을 선택하고 첫 패치를 만들어 봅니다.',
        steps: [
          {
            id: 's8',
            stepNumber: 1,
            title: '신디 엔진 선택',
            content:
              '{SYN} 버튼을 누르세요. 엔코더를 돌려 엔진을 탐색합니다. 화면에는 이름과 파형이 표시됩니다. 엔코더를 눌러 로드하세요.',
            youShouldSeeHear:
              '화면이 엔진 뷰로 전환되며 컬러 파라미터 바가 나타납니다.',
            relatedControls: [],
          },
          {
            id: 's9',
            stepNumber: 2,
            title: '노트 연주',
            content:
              '{키보드}의 아무 건반이나 눌러 보세요. 선택한 엔진의 소리가 납니다.',
            tips: '중간 옥타브부터 시작하세요. 위아래로 이동할 여지가 가장 넓습니다.',
            relatedControls: ['keys'],
          },
          {
            id: 's10',
            stepNumber: 3,
            title: '사운드 조형',
            content:
              '{초록 노브}를 돌려 어택이나 쉐이프를 바꿔보세요. 건반을 누른 채 {파란 노브}를 돌리면 필터 컷오프가 스윕됩니다.',
            youShouldSeeHear:
              '노브를 돌릴 때 화면의 컬러 바가 실시간으로 움직이며 파라미터 변화를 확인시켜 줍니다.',
            tips: 'Shift를 누른 채 노브를 돌리면 보조 파라미터에 접근할 수 있습니다.',
            relatedControls: ['green-knob', 'blue-knob'],
          },
        ],
      },
      {
        id: 'g4',
        slug: 'tape-recording',
        title: '테이프 녹음',
        description: '4트랙 테이프에 연주를 녹음합니다.',
        steps: [
          {
            id: 's11',
            stepNumber: 1,
            title: '트랙 선택',
            content:
              'Tape 버튼을 누르세요. 좌/우 화살표로 트랙 1–4를 선택합니다. 트랙 1부터 시작하는 걸 권장합니다.',
            relatedControls: [],
          },
          {
            id: 's12',
            stepNumber: 2,
            title: '암 & 녹음',
            content:
              '{REC}를 눌러 트랙을 암 상태로 만드세요 — 버튼이 빨간색으로 켜집니다. 그런 다음 {PLAY}를 눌러 녹음을 시작하고 키보드로 연주하세요.',
            youShouldSeeHear:
              '테이프 화면에 빨간 녹음 표시등이 깜빡이고, 파형이 실시간으로 그려집니다.',
            relatedControls: ['record-btn', 'play-btn'],
          },
          {
            id: 's13',
            stepNumber: 3,
            title: '재생해서 듣기',
            content:
              '{REC}를 다시 눌러 녹음을 멈추고, {PLAY}를 눌러 처음부터 들어 보세요.',
            relatedControls: ['record-btn', 'play-btn'],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    slug: 'tx-6',
    name: 'TX–6',
    displayName: 'TX–6',
    category: '믹서',
    description:
      '내장 이펙트와 24비트 녹음을 갖춘 포켓 사이즈 6채널 스테레오 믹서.',
    bgColor: '#14143a',
    controls: [
      {
        id: 'fader-1',
        name: 'CH 1',
        description: '채널 1 볼륨 페이더',
        positionX: 6,
        positionY: 18,
        width: 10,
        height: 62,
      },
      {
        id: 'fader-2',
        name: 'CH 2',
        description: '채널 2 볼륨 페이더',
        positionX: 20,
        positionY: 18,
        width: 10,
        height: 62,
      },
      {
        id: 'fader-3',
        name: 'CH 3',
        description: '채널 3 볼륨 페이더',
        positionX: 34,
        positionY: 18,
        width: 10,
        height: 62,
      },
      {
        id: 'master',
        name: 'MASTER',
        description: '마스터 출력 볼륨 페이더',
        positionX: 72,
        positionY: 18,
        width: 12,
        height: 62,
      },
      {
        id: 'fx-knob',
        name: 'FX',
        description: '리버브/딜레이 센드량 조절',
        positionX: 86,
        positionY: 28,
        width: 12,
        height: 18,
      },
    ],
    guides: [
      {
        id: 'g5',
        slug: 'first-mix',
        title: '첫 번째 믹스',
        description: '소스를 연결하고 라이브 믹스를 잡아 봅니다.',
        steps: [
          {
            id: 's14',
            stepNumber: 1,
            title: '소스 연결',
            content:
              '오디오 소스를 채널 1–6의 USB-C 포트 또는 후면 3.5mm 입력에 연결하세요.',
            youShouldSeeHear:
              '신호가 들어오면 채널 LED에 불이 들어옵니다. 초록은 적정 레벨, 황색은 살짝 과도한 상태입니다.',
            relatedControls: [],
          },
          {
            id: 's15',
            stepNumber: 2,
            title: '채널 밸런스 잡기',
            content:
              '헤드폰으로 모니터링하면서 {CH 1}, {CH 2}, {CH 3} 페이더를 올리세요. 피크가 황색 존에 머물도록 맞추고 빨간색은 피하세요.',
            tips: '소스에서 가장 큰 소리가 날 때를 기준으로 레벨을 잡으세요. 나중에 클리핑이 생기는 걸 막을 수 있습니다.',
            relatedControls: ['fader-1', 'fader-2', 'fader-3'],
          },
          {
            id: 's16',
            stepNumber: 3,
            title: '마스터 출력 설정',
            content:
              '{MASTER} 페이더를 원하는 출력 레벨까지 올리세요.',
            relatedControls: ['master'],
          },
          {
            id: 's17',
            stepNumber: 4,
            title: '리버브 추가',
            content:
              '{FX} 노브를 시계 방향으로 돌려 리버브를 믹스에 더하세요. 조금씩 올리다가 공간감이 충분하다 싶으면 멈추세요.',
            tips: '적을수록 좋습니다. 살짝 뿌린 리버브가 믹스 전체를 자연스럽게 묶어 주는 반면, 너무 많으면 소리가 뭉갭니다.',
            relatedControls: ['fx-knob'],
          },
        ],
      },
    ],
  },
];
