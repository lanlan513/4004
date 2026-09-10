import { useEffect, useRef, useState } from 'react';

// 快捷提问指令
const QUICK_PROMPTS = [
  '分析迅猛龙逃脱风险',
  '介绍三角龙习性',
  '霸王龙的咬合力有多强？',
  '公园停电时如何疏散游客？',
];

const STORAGE_KEY = 'jp-paleo-chat-history';
const WELCOME = {
  role: 'assistant',
  content:
    '【连接建立】INGEN 遗传工程公司 · 古生物顾问终端 v3.1\n\n我是 DR. PALEO，侏罗纪公园首席古生物学者。围场巡检刚结束，趁咖啡还热，有什么想问的？',
};

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) && list.length > 0 ? list : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

export default function ChatTerminal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  // 拉取终端自检信息（在线/离线模式）
  useEffect(() => {
    fetch('/api/chat/status')
      .then((r) => r.json())
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null));
  }, []);

  // 持久化历史记录
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      // 存储失败不影响对话
    }
  }, [messages]);

  // 自动滚动到底部
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // 卸载时中断未完成的流
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || streaming) return;

    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    const next = [...history, { role: 'user', content: question }];
    // 追加一条空的助手消息，等待流式填充
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-20) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          try {
            const payload = JSON.parse(trimmed.slice(5));
            if (payload.type === 'delta') {
              appendDelta(payload.content);
            } else if (payload.type === 'error') {
              appendDelta(`\n[系统告警] ${payload.message}`);
            }
          } catch {
            // 跳过不完整片段
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        appendDelta(`\n[通讯故障] 无法连接主控中心：${err.message}`);
      }
    } finally {
      setStreaming(false);
    }
  }

  // 向最后一条助手消息追加流式内容
  function appendDelta(content) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && last.role === 'assistant') {
        copy[copy.length - 1] = { ...last, content: last.content + content };
      }
      return copy;
    });
  }

  function clearHistory() {
    setMessages([WELCOME]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <>
      {/* 悬浮呼出按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '关闭古生物专家终端' : '打开古生物专家终端'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/60 bg-black/90 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:scale-105 hover:shadow-[0_0_32px_rgba(16,185,129,0.6)]"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M7 9l3 3-3 3M12 15h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* 悬浮终端窗口 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-lg border border-emerald-500/50 bg-black font-mono text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)] sm:w-[26rem]">
          {/* CRT 扫描线覆盖层 */}
          <div className="crt-overlay" aria-hidden="true" />

          {/* 标题栏 */}
          <div className="flex items-center justify-between border-b border-emerald-500/40 bg-emerald-950/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs tracking-widest">INGEN // 古生物顾问终端</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-600">
                {status ? (status.mode === 'llm' ? `AI 在线 · ${status.model}` : '离线演示模式') : '连接中…'}
              </span>
              <button
                type="button"
                onClick={clearHistory}
                title="清除历史记录"
                className="rounded border border-emerald-700 px-1.5 py-0.5 text-[10px] text-emerald-500 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                清空
              </button>
            </div>
          </div>

          {/* 消息区 */}
          <div ref={scrollRef} className="crt-scroll flex-1 space-y-3 overflow-y-auto px-3 py-3 text-[13px] leading-relaxed">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className="mb-0.5 text-[10px] text-emerald-700">
                  {m.role === 'user' ? 'VISITOR@JPARK' : 'DR.PALEO@INGEN'}
                </div>
                <div
                  className={`inline-block max-w-[90%] whitespace-pre-wrap rounded px-2.5 py-1.5 text-left ${
                    m.role === 'user'
                      ? 'bg-emerald-900/50 text-emerald-200'
                      : 'bg-black/60 text-emerald-400 terminal-glow'
                  }`}
                >
                  {m.content}
                  {/* 流式输出中的光标 */}
                  {streaming && i === messages.length - 1 && m.role === 'assistant' && (
                    <span className="terminal-cursor" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 快捷指令 */}
          <div className="flex flex-wrap gap-1.5 border-t border-emerald-500/30 px-3 py-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={streaming}
                onClick={() => send(q)}
                className="rounded border border-emerald-700/70 px-2 py-0.5 text-[11px] text-emerald-500 transition hover:border-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ▸ {q}
              </button>
            ))}
          </div>

          {/* 输入区 */}
          <form
            className="flex items-center gap-2 border-t border-emerald-500/40 bg-emerald-950/30 px-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <span className="text-emerald-500">&gt;</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="向首席古生物学者提问…"
              disabled={streaming}
              className="flex-1 bg-transparent text-[13px] text-emerald-300 placeholder-emerald-800 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="rounded border border-emerald-600 px-2.5 py-1 text-[11px] tracking-wider transition hover:bg-emerald-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {streaming ? '传输中' : '发送'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
