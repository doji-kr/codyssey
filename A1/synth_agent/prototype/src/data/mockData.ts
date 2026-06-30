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
      {
        id: 'pads',
        name: '샘플 패드',
        description: 'A/B/C/D 그룹 × 3열로 구성된 16개 패드. 샘플 트리거 및 스텝 시퀀싱에 사용',
        positionX: 13,
        positionY: 59,
        width: 46,
        height: 35,
      },
      {
        id: 'knob-a',
        name: 'X 노브 (BPM)',
        description: 'TEMPO 버튼을 누른 채 이 주황 노브를 돌려 BPM을 설정합니다',
        positionX: 63,
        positionY: 42,
        width: 18,
        height: 16,
      },
      {
        id: 'knob-b',
        name: 'VOLUME',
        description: '마스터 출력 볼륨 — 왼쪽 상단의 흰색 노브',
        positionX: 4,
        positionY: 44,
        width: 15,
        height: 13,
      },
      {
        id: 'sample-btn',
        name: 'SAMPLE',
        description: '누른 채 패드를 탭하면 해당 슬롯에 샘플을 녹음합니다',
        positionX: 60,
        positionY: 59,
        width: 19,
        height: 7,
      },
      {
        id: 'play-btn',
        name: 'PLAY',
        description: '시퀀스 재생 시작 / 정지',
        positionX: 80,
        positionY: 88,
        width: 18,
        height: 7,
      },
      {
        id: 'record-btn',
        name: 'RECORD',
        description: '라이브 녹음 시작 — 탭하면 연주가 시퀀서에 기록됩니다',
        positionX: 61,
        positionY: 88,
        width: 18,
        height: 7,
      },
      {
        id: 'tempo-btn',
        name: 'TEMPO 버튼',
        description: '이 버튼을 누른 채 X 노브를 돌리면 BPM이 변경됩니다',
        positionX: 49,
        positionY: 44,
        width: 13,
        height: 5,
      },
    ],
    guides: [
      {
        id: 'g1',
        slug: 'getting-started',
        title: '첫 시작',
        description: 'K.O. II의 전원을 켜고 첫 소리를 만들어 봅니다.',
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
            relatedControls: ['knob-a', 'tempo-btn'],
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
            relatedControls: ['sample-btn', 'pads'],
          },
        ],
      },
      {
        id: 'g2',
        slug: 'first-beat',
        title: '첫 번째 비트 만들기',
        description: '스텝 시퀀서로 루프 패턴을 처음부터 만들어 봅니다.',
        steps: [
          {
            id: 's4',
            stepNumber: 1,
            title: '스텝 녹음 모드 진입',
            content:
              '{PLAY}를 눌러 트랜스포트를 시작한 뒤, 곧바로 {SAMPLE}을 눌러 스텝 녹음 모드로 진입하세요. 이제 패드는 16분음표 그리드 위치를 나타냅니다.',
            youShouldSeeHear:
              '커서 불빛이 패드를 왼쪽에서 오른쪽으로 훑으며 현재 플레이헤드 위치를 보여줍니다.',
            relatedControls: ['play-btn', 'sample-btn'],
          },
          {
            id: 's5',
            stepNumber: 2,
            title: '킥 배치',
            content:
              '패드 1과 패드 9를 탭해 비트 1, 3에 킥을 넣으세요. 불이 켜진 패드가 활성화된 스텝입니다. 다시 탭하면 끌 수 있습니다.',
            tips:
              '처음엔 적게 넣는 게 좋습니다. 4개짜리 패턴이 16개짜리보다 훨씬 강력하게 들립니다.',
            relatedControls: ['pads'],
          },
          {
            id: 's6',
            stepNumber: 3,
            title: '들으면서 조정하기',
            content:
              '{PLAY}를 다시 눌러 스텝 녹음 모드를 종료하고 패턴이 루프되는 걸 들어 보세요. 필요하다면 {VOLUME}을 조절하세요.',
            youShouldSeeHear:
              '패턴이 계속 반복됩니다. 커서가 현재 재생 중인 스텝을 따라 움직입니다.',
            relatedControls: ['play-btn', 'knob-b'],
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
