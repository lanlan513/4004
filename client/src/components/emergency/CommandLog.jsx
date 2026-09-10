import { ScrollText } from 'lucide-react';
import { useEmergency } from '../../emergency/EmergencyContext';

const TONE_DOT = {
  info: 'bg-sky-400',
  warn: 'bg-amber',
  danger: 'bg-red-500',
  ok: 'bg-emerald-400',
};

// 指挥日志：状态机所有跃迁与防御动作的流水记录
export default function CommandLog() {
  const { logs } = useEmergency();

  return (
    <article className="border border-bone/10 bg-jungle-900/80 p-7">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-bone">
        <ScrollText className="h-5 w-5 text-amber" />
        指挥日志
      </h3>
      <ul className="mt-5 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 300 }}>
        {logs.map((log) => (
          <li key={log.id} className="flex items-start gap-3 font-serif text-sm">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[log.tone] || 'bg-bone/40'}`} />
            <span className="shrink-0 font-display text-xs tracking-widest text-bone/40">{log.t}</span>
            <span className={log.tone === 'danger' ? 'text-red-300' : 'text-bone/75'}>{log.text}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
