'use strict';

// API 서버 주소. 같은 서버에서 서빙되면 '' (빈 문자열)로 두세요.
// 로컬 파일로 열 때는 배포 URL을 넣으세요.
const API_BASE = 'https://synth-agent.vercel.app';

// ── 장비 정보 ─────────────────────────────────────────────────────────────────

const DEVICES = {
  'ep-133': {
    name: 'EP-133 K.O. II',
    manual: 'KO II MANUAL',
    desc: '64MB 샘플러 + 비트 컴포저. 샘플링, 초핑, 시퀀싱, 완성된 트랙 제작까지 단계별로 익혀 보세요.',
  },
  'op-1f': {
    name: 'OP-1 Field',
    manual: 'OP-1 FIELD MANUAL',
    desc: '휴대용 신디사이저 + 4트랙 테이프 레코더. 합성 엔진부터 테이프 녹음까지 탐구해 보세요.',
  },
  'tx-6': {
    name: 'TX-6',
    manual: 'TX-6 MANUAL',
    desc: '포켓 사이즈 6채널 스테레오 믹서. 채널 밸런스, FX 센드, 마스터 출력을 알아보세요.',
  },
};

// ── 앱 상태 ───────────────────────────────────────────────────────────────────

const state = {
  device: 'ep-133',
  messages: [],   // OpenRouter API에 전달할 대화 히스토리
  loading: false,
};

// ── DOM 참조 ──────────────────────────────────────────────────────────────────

const $deviceSelect   = document.getElementById('device-select');
const $emptyState     = document.getElementById('empty-state');
const $emptyLabel     = document.getElementById('empty-device-label');
const $emptyDesc      = document.getElementById('empty-desc');
const $suggestionBtn  = document.getElementById('suggestion-btn');
const $suggestionText = document.getElementById('suggestion-text');
const $conversation   = document.getElementById('conversation');
const $scrollAnchor   = document.getElementById('scroll-anchor');
const $msgInput       = document.getElementById('msg-input');
const $sendBtn        = document.getElementById('send-btn');
const $clearBtn       = document.getElementById('clear-btn');

// ── 초기화 ────────────────────────────────────────────────────────────────────

function init() {
  updateEmptyState();
  fetchInitialSuggestion();

  $deviceSelect.addEventListener('change', onDeviceChange);
  $msgInput.addEventListener('input', onInputChange);
  $msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); trySend(); }
  });
  $sendBtn.addEventListener('click', trySend);
  $clearBtn.addEventListener('click', clearConversation);
  $suggestionBtn.addEventListener('click', () => {
    const text = $suggestionText.textContent;
    if (text) sendMessage(text);
  });
}

function onDeviceChange() {
  state.device = $deviceSelect.value;
  clearConversation();
  updateEmptyState();
  fetchInitialSuggestion();
}

function onInputChange() {
  $sendBtn.disabled = !$msgInput.value.trim() || state.loading;
}

function updateEmptyState() {
  const d = DEVICES[state.device];
  $emptyLabel.textContent = `${d.name} · AI 모드`;
  $emptyDesc.textContent = d.desc;
}

// ── 초기 추천 질문 ────────────────────────────────────────────────────────────

async function fetchInitialSuggestion() {
  $suggestionBtn.style.display = 'none';
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], deviceSlug: state.device }),
    });
    const data = await res.json();
    if (data.suggestion) {
      $suggestionText.textContent = data.suggestion;
      $suggestionBtn.style.display = 'flex';
    }
  } catch {
    $suggestionText.textContent = '어떻게 시작하나요?';
    $suggestionBtn.style.display = 'flex';
  }
}

// ── 메시지 전송 ───────────────────────────────────────────────────────────────

function trySend() {
  const text = $msgInput.value.trim();
  if (!text || state.loading) return;
  $msgInput.value = '';
  onInputChange();
  sendMessage(text);
}

async function sendMessage(text) {
  if (state.loading) return;

  state.loading = true;
  $sendBtn.disabled = true;
  showConversation();

  // 유저 버블
  appendUserBubble(text);

  // 대화 히스토리에 추가
  state.messages.push({ role: 'user', content: text });

  // AI 응답 엔트리 생성
  const entry = createAssistantEntry();
  scrollToBottom();

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: state.messages, deviceSlug: state.device }),
    });

    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        try {
          const evt = JSON.parse(raw);

          if (evt.type === 'chunk') {
            accumulated += evt.text;
            entry.updateContent(accumulated, false);
            scrollToBottom();

          } else if (evt.type === 'done') {
            state.messages.push({ role: 'assistant', content: accumulated });
            entry.updateContent(accumulated, true);
            entry.showMeta(evt.heading, evt.tags, evt.suggestions);
            scrollToBottom();

          } else if (evt.type === 'error') {
            entry.updateContent(`오류가 발생했습니다: ${evt.error}`, true);
            entry.showMeta('오류', [], []);
          }
        } catch { /* partial JSON, skip */ }
      }
    }
  } catch (e) {
    entry.updateContent('잠시 후 다시 시도해 주세요.', true);
    entry.showMeta('연결 오류', [], []);
  } finally {
    state.loading = false;
    onInputChange();
  }
}

// ── UI 헬퍼 ───────────────────────────────────────────────────────────────────

function showConversation() {
  $emptyState.style.display = 'none';
  $conversation.style.display = 'flex';
}

function clearConversation() {
  state.messages = [];
  state.loading = false;
  $conversation.innerHTML = '';
  $conversation.style.display = 'none';
  $emptyState.style.display = 'block';
  onInputChange();
}

function appendUserBubble(text) {
  const wrap = document.createElement('div');
  wrap.className = 'user-bubble-wrap';
  const bubble = document.createElement('div');
  bubble.className = 'user-bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);

  // entry div로 감싸기 (나중에 AI 응답과 같은 엔트리에 묶임)
  const entry = document.createElement('div');
  entry.className = 'entry';
  entry.appendChild(wrap);
  $conversation.appendChild(entry);
  return entry;
}

function createAssistantEntry() {
  // 마지막 .entry에 AI 응답 추가
  const lastEntry = $conversation.lastElementChild;

  const aiWrap = document.createElement('div');
  aiWrap.className = 'ai-response';

  // Manual label
  const label = document.createElement('div');
  label.className = 'manual-label';
  label.innerHTML = `<span class="manual-dot"></span><span class="manual-text">FROM THE ${DEVICES[state.device].manual}</span>`;
  aiWrap.appendChild(label);

  // Heading placeholder (hidden until done)
  const headingEl = document.createElement('h2');
  headingEl.className = 'response-heading';
  headingEl.style.display = 'none';
  aiWrap.appendChild(headingEl);

  // Content area — starts as skeleton
  const bodyEl = document.createElement('div');
  bodyEl.className = 'response-body';
  bodyEl.innerHTML = `
    <div class="skeleton">
      <div class="skeleton-line" style="width:70%"></div>
      <div class="skeleton-line" style="width:100%"></div>
      <div class="skeleton-line" style="width:85%"></div>
    </div>`;
  aiWrap.appendChild(bodyEl);

  // Tags + suggestions placeholders
  const metaEl = document.createElement('div');
  metaEl.style.display = 'none';
  aiWrap.appendChild(metaEl);

  lastEntry.appendChild(aiWrap);

  let contentDone = false;

  return {
    updateContent(text, done) {
      if (contentDone) return;
      bodyEl.innerHTML = '';
      renderContentInto(bodyEl, text);
      if (!done) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        bodyEl.appendChild(cursor);
      } else {
        contentDone = true;
      }
    },
    showMeta(heading, tags, suggestions) {
      // heading
      if (heading && heading !== '답변') {
        headingEl.textContent = heading;
        headingEl.style.display = 'block';
      }
      // tags
      if (tags && tags.length) {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'tags-row';
        const lbl = document.createElement('span');
        lbl.className = 'tags-label';
        lbl.textContent = 'MANUAL';
        tagsRow.appendChild(lbl);
        tags.forEach(tag => {
          const t = document.createElement('span');
          t.className = 'tag';
          t.textContent = `§ ${tag}`;
          tagsRow.appendChild(t);
        });
        metaEl.appendChild(tagsRow);
      }
      // suggestions
      if (suggestions && suggestions.length) {
        const row = document.createElement('div');
        row.className = 'suggestions-row';
        suggestions.forEach(s => {
          const btn = document.createElement('button');
          btn.className = 'suggestion-chip';
          btn.textContent = s;
          btn.addEventListener('click', () => sendMessage(s));
          row.appendChild(btn);
        });
        metaEl.appendChild(row);
      }
      metaEl.style.display = 'block';
    },
  };
}

// ── 마크다운 파싱 (XSS-safe DOM 방식) ────────────────────────────────────────

function renderContentInto(container, raw) {
  const lines = raw.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    if (/^\d+\.\s/.test(line)) {
      // 번호 목록
      const ol = document.createElement('ol');
      let n = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const li = document.createElement('li');
        const numSpan = document.createElement('span');
        numSpan.className = 'num';
        numSpan.textContent = String(n++);
        const text = document.createElement('span');
        appendInline(text, lines[i].trim().replace(/^\d+\.\s*/, ''));
        li.appendChild(numSpan);
        li.appendChild(text);
        ol.appendChild(li);
        i++;
      }
      container.appendChild(ol);

    } else if (/^[-•]\s/.test(line)) {
      // 불릿 목록
      const ul = document.createElement('ul');
      while (i < lines.length && /^[-•]\s/.test(lines[i].trim())) {
        const li = document.createElement('li');
        const bullet = document.createElement('span');
        bullet.className = 'bullet';
        bullet.textContent = '●';
        const text = document.createElement('span');
        appendInline(text, lines[i].trim().replace(/^[-•]\s*/, ''));
        li.appendChild(bullet);
        li.appendChild(text);
        ul.appendChild(li);
        i++;
      }
      container.appendChild(ul);

    } else {
      const p = document.createElement('p');
      appendInline(p, line);
      container.appendChild(p);
      i++;
    }
  }
}

function appendInline(el, text) {
  // **KEYWORD** → <em class="keyword">
  const parts = text.split(/\*\*(.+?)\*\*/g);
  parts.forEach((part, idx) => {
    if (idx % 2 === 1) {
      const em = document.createElement('em');
      em.className = 'keyword';
      em.textContent = part;
      el.appendChild(em);
    } else if (part) {
      el.appendChild(document.createTextNode(part));
    }
  });
}

function scrollToBottom() {
  $scrollAnchor.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ── 시작 ──────────────────────────────────────────────────────────────────────

init();
