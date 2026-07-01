import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ArrowUp, Mic, Video } from 'lucide-react';
import type { Device } from '@/data/mockData';

interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationEntry {
  userText: string;
  streamContent: string;       // grows during streaming
  heading: string | null;      // set when stream done
  suggestions: string[];
  tags: string[];
  done: boolean;
}

const MANUAL_LABELS: Record<string, string> = {
  'ep-133': 'KO II MANUAL',
  'op-1f': 'OP-1 FIELD MANUAL',
  'tx-6': 'TX-6 MANUAL',
};

// Parse **KEYWORD** → orange bold; numbered/bullet lists
function renderContent(raw: string) {
  const lines = raw.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-3 my-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-4">
              <span className="text-[13px] text-gray-400 shrink-0 mt-0.5 w-4 text-right select-none">{idx + 1}</span>
              <span className="text-[14px] leading-relaxed text-gray-800">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    } else if (/^[-•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-•]\s*/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-2 my-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="text-gray-400 shrink-0 mt-1.5 text-[8px] select-none">●</span>
              <span className="text-[14px] leading-relaxed text-gray-800">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-[14px] leading-relaxed text-gray-800 my-2">
          {renderInline(line)}
        </p>
      );
      i++;
    }
  }
  return elements;
}

function renderInline(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-orange-500 font-bold not-italic">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

interface Props {
  device: Device;
  onBack: () => void;
}

export default function AiView({ device, onBack }: Props) {
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [apiMessages, setApiMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialSuggestion, setInitialSuggestion] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const manualLabel = MANUAL_LABELS[device.slug] ?? 'MANUAL';

  // Fetch initial suggestion
  useEffect(() => {
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], deviceSlug: device.slug }),
    })
      .then(r => r.json())
      .then(d => { if (d.suggestion) setInitialSuggestion(d.suggestion); })
      .catch(() => setInitialSuggestion('어떻게 시작하나요?'));
  }, [device.slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');
    setLoading(true);

    const userMsg: AiMessage = { role: 'user', content: trimmed };
    const updatedApiMsgs = [...apiMessages, userMsg];
    setApiMessages(updatedApiMsgs);

    // Add entry in streaming state
    const newEntry: ConversationEntry = {
      userText: trimmed,
      streamContent: '',
      heading: null,
      suggestions: [],
      tags: [],
      done: false,
    };
    setConversation(prev => [...prev, newEntry]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedApiMsgs, deviceSlug: device.slug }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalContent = '';

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
            const data = JSON.parse(raw);

            if (data.type === 'chunk') {
              finalContent += data.text;
              setConversation(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  streamContent: updated[updated.length - 1].streamContent + data.text,
                };
                return updated;
              });
            } else if (data.type === 'done') {
              const assistantMsg: AiMessage = {
                role: 'assistant',
                content: finalContent,
              };
              setApiMessages(prev => [...prev, assistantMsg]);
              setConversation(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  heading: data.heading ?? '답변',
                  suggestions: data.suggestions ?? [],
                  tags: data.tags ?? [],
                  done: true,
                };
                return updated;
              });
            } else if (data.type === 'error') {
              setConversation(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  streamContent: `오류: ${data.error}`,
                  heading: '오류',
                  done: true,
                };
                return updated;
              });
            }
          } catch {
            // ignore parse errors for partial lines
          }
        }
      }
    } catch (e) {
      setConversation(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          streamContent: '잠시 후 다시 시도해 주세요.',
          heading: '연결 오류',
          done: true,
        };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setConversation([]);
    setApiMessages([]);
    setInput('');
  };

  const isEmpty = conversation.length === 0;
  const lastSuggestions = conversation.length > 0
    ? conversation[conversation.length - 1].suggestions
    : [];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f5f4f2' }}>

      {/* ── Scrollable message area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 sm:px-10 pt-6 sm:pt-8 pb-4 max-w-2xl">

          {isEmpty ? (
            <div className="pt-16">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-8">
                {device.displayName} · AI 모드
              </p>
              <h2 className="text-[24px] sm:text-[28px] font-black text-gray-900 leading-tight tracking-tight mb-3">
                무엇이 궁금하신가요?
              </h2>
              <p className="text-[14px] text-gray-500 mb-10 leading-relaxed">
                {device.displayName}에 대해 무엇이든 물어보면<br />매뉴얼을 기반으로 정확히 안내드립니다.
              </p>
              {initialSuggestion && (
                <button
                  onClick={() => sendMessage(initialSuggestion)}
                  className="group flex items-center gap-3 border border-gray-300 rounded-xl px-5 py-3 text-left hover:border-orange-400 hover:bg-orange-50/40 transition-all duration-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-[13px] text-gray-700 group-hover:text-gray-900">
                    {initialSuggestion}
                  </span>
                  <span className="text-orange-400 text-[12px] ml-auto">→</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {conversation.map((entry, idx) => (
                <div key={idx}>
                  {/* User bubble */}
                  <div className="flex justify-end mb-6">
                    <div className="rounded-xl px-4 py-2.5 max-w-xs" style={{ backgroundColor: '#e5e3df' }}>
                      <p className="text-[14px] text-gray-800">{entry.userText}</p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="anim-step-enter">
                    {/* Manual label */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-medium">
                        FROM THE {manualLabel}
                      </span>
                    </div>

                    {/* Heading — appears when done */}
                    {entry.heading && (
                      <h2 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight mb-4">
                        {entry.heading}
                      </h2>
                    )}

                    {/* Streaming content */}
                    {entry.streamContent ? (
                      <div className="mb-5">
                        {renderContent(entry.streamContent)}
                        {/* Blinking cursor while streaming */}
                        {!entry.done && (
                          <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
                        )}
                      </div>
                    ) : (
                      /* Skeleton while waiting for first chunk */
                      <div className="space-y-3 animate-pulse mb-5">
                        <div className="h-4 bg-gray-200/70 rounded w-3/4" />
                        <div className="h-4 bg-gray-200/50 rounded w-full" />
                        <div className="h-4 bg-gray-200/50 rounded w-5/6" />
                      </div>
                    )}

                    {/* Tags — appear when done */}
                    {entry.done && entry.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium">
                          MANUAL
                        </span>
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[11px] text-gray-500 px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: '#e8e6e2' }}
                          >
                            § {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggestions — only after last response */}
                    {entry.done && idx === conversation.length - 1 && lastSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-7">
                        {lastSuggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => sendMessage(s)}
                            className="text-[12px] border border-gray-300 rounded-xl px-3.5 py-2 text-gray-600 hover:border-orange-400 hover:text-gray-800 hover:bg-orange-50/30 transition-all duration-150"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* ── Fixed input area ── */}
      <div className="shrink-0 px-4 sm:px-8 pb-5 pt-3" style={{ borderTop: '1px solid #e8e5e1' }}>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: '#ffffff', border: '1px solid #dedad5' }}
        >
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Message..."
            className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <ArrowUp className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="flex items-center justify-between px-1 mt-2.5">
          <button
            onClick={handleClear}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            clear
          </button>
          <p className="text-[11px] text-gray-400">
            <button onClick={onBack} className="text-orange-500 font-medium hover:underline">
              go pro
            </button>
            {' '}for unlimited questions, the full mastery curriculum, and the smartest model
          </p>
        </div>
      </div>
    </div>
  );
}
