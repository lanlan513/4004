import { useState } from 'react';
import {
  Power,
  Zap,
  ZapOff,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { useEmergency } from '../../emergency/EmergencyContext';
import { generateCipherChallenge, normalizeAnswer } from '../../emergency/cipher';

const SQUAD_STATUS_META = {
  standby: { label: '待命', cls: 'text-emerald-300' },
  responding: { label: '处置中', cls: 'text-amber' },
  cooldown: { label: '整备中', cls: 'text-sky-300' },
};

export default function DefensePanel() {
  const {
    gridOn,
    squads,
    authorized,
    authTtl,
    tickMs,
    cutGrid,
    restoreGrid,
    grantAuthorization,
    lockAuthorization,
  } = useEmergency();

  const [challenge, setChallenge] = useState(generateCipherChallenge);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const ttlSeconds = Math.ceil((authTtl * tickMs) / 1000);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (normalizeAnswer(answer) === challenge.answer) {
      setAnswer('');
      setAttempts(0);
      setError('');
      setChallenge(generateCipherChallenge());
      grantAuthorization();
      return;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setAnswer('');
    if (nextAttempts >= 3) {
      setError('连续 3 次验证失败，密文已轮换，请重新解码');
      setAttempts(0);
      setChallenge(generateCipherChallenge());
    } else {
      setError(`解码错误，还剩 ${3 - nextAttempts} 次机会`);
    }
  };

  return (
    <article className="flex h-full flex-col border border-bone/10 bg-jungle-900/80 p-7">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-bone">
        <ShieldCheck className="h-5 w-5 text-amber" />
        防御控制面板
      </h3>

      {/* —— 电网控制 —— */}
      <div
        className={`mt-6 border p-5 ${
          gridOn ? 'border-emerald-400/30 bg-emerald-950/20' : 'border-red-500/50 bg-red-950/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-[10px] tracking-[0.3em] text-bone/50">
              PERIMETER GRID · 360° 高压电网
            </p>
            <p
              className={`mt-1 flex items-center gap-2 font-serif text-xl font-black ${
                gridOn ? 'text-emerald-300' : 'text-red-400 animate-siren-blink'
              }`}
            >
              {gridOn ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
              {gridOn ? '电网在线' : '电网已切断'}
            </p>
          </div>
          <span
            className={`h-3 w-3 rounded-full ${
              gridOn ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-red-600'
            }`}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={cutGrid}
            disabled={!gridOn}
            className="inline-flex items-center justify-center gap-2 border border-red-500/70 bg-red-600/20 px-4 py-3 font-serif text-sm font-bold tracking-widest text-red-300 transition-all hover:bg-red-600/40 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Power className="h-4 w-4" />
            一键切断
          </button>
          <button
            type="button"
            onClick={restoreGrid}
            disabled={gridOn}
            className={`inline-flex items-center justify-center gap-2 border px-4 py-3 font-serif text-sm font-bold tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
              authorized
                ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                : 'border-bone/20 bg-bone/5 text-bone/45 hover:text-bone/70'
            }`}
          >
            {authorized ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            恢复供电
          </button>
        </div>
        {!gridOn && !authorized && (
          <p className="mt-3 font-serif text-xs leading-relaxed text-amber/80">
            电网处于断开状态。恢复供电属于高级防御指令，须先通过下方指挥解密。
          </p>
        )}
      </div>

      {/* —— 安全小队编制 —— */}
      <div className="mt-6">
        <p className="font-display text-[10px] tracking-[0.3em] text-bone/50">
          SECURITY DETAIL · 安全小队
        </p>
        <ul className="mt-3 space-y-2">
          {squads.map((q) => {
            const meta = SQUAD_STATUS_META[q.status];
            return (
              <li
                key={q.id}
                className="flex items-center justify-between border border-bone/10 bg-jungle-950/60 px-4 py-2.5"
              >
                <span className="flex items-center gap-2 font-serif text-sm text-bone/85">
                  {q.elite && <Lock className="h-3 w-3 text-red-400" />}
                  {q.name}
                </span>
                <span className={`font-display text-xs tracking-[0.25em] ${meta.cls}`}>
                  {q.status === 'cooldown' ? `整备 ${q.cooldown}` : meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* —— 简易解密授权 —— */}
      <div className="mt-6 border border-amber/30 bg-amber/5 p-5">
        {authorized ? (
          <div>
            <p className="flex items-center gap-2 font-serif text-base font-bold text-emerald-300">
              <Unlock className="h-5 w-5" />
              指挥通道已解锁
            </p>
            <p className="mt-2 flex items-center gap-1.5 font-display text-sm tracking-widest text-amber">
              <Timer className="h-4 w-4" />
              授权剩余 {ttlSeconds} 秒
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden bg-bone/10">
              <div
                className="h-full bg-amber transition-all duration-1000"
                style={{ width: `${Math.min(100, (authTtl / 36) * 100)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={lockAuthorization}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-bone/25 px-4 py-2.5 font-serif text-xs tracking-widest text-bone/70 transition-colors hover:border-red-400/60 hover:text-red-300"
            >
              <Lock className="h-4 w-4" />
              立即锁定高级指令
            </button>
          </div>
        ) : (
          <form onSubmit={handleUnlock}>
            <p className="flex items-center gap-2 font-serif text-base font-bold text-amber">
              <KeyRound className="h-5 w-5" />
              指挥解密授权
            </p>
            <p className="mt-2 font-serif text-xs leading-relaxed text-bone/60">
              截获指挥密文，按凯撒位移量还原明文（字母向后退 {challenge.shift} 位）。
              解锁后可恢复电网、调动武装战术小组。
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 border border-amber/40 bg-jungle-950/80 px-4 py-3 text-center">
                <span className="font-display text-2xl font-black tracking-[0.35em] text-amber">
                  {challenge.cipher}
                </span>
                <span className="ml-2 font-display text-xs tracking-widest text-bone/45">
                  -{challenge.shift}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="输入明文（限字母数字）"
                maxLength={8}
                className="min-w-0 flex-1 border border-bone/20 bg-jungle-950/80 px-3 py-2.5 font-display uppercase tracking-[0.25em] text-bone placeholder:normal-case placeholder:tracking-normal placeholder:font-serif placeholder:text-bone/35 focus:border-amber focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 border border-amber/70 bg-amber/15 px-5 py-2.5 font-serif text-sm font-bold tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
              >
                解锁
              </button>
            </div>
            {error && <p className="mt-2 font-serif text-xs text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </article>
  );
}
