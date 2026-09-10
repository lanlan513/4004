import { Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../../emergency/EmergencyContext';

const TONE = {
  info: { icon: Info, cls: 'border-sky-400/60 bg-jungle-900/95 text-sky-200' },
  warn: { icon: AlertTriangle, cls: 'border-amber/70 bg-jungle-900/95 text-amber' },
  danger: { icon: ShieldAlert, cls: 'border-red-500 bg-red-950/95 text-red-200' },
  ok: { icon: CheckCircle2, cls: 'border-emerald-400/60 bg-jungle-900/95 text-emerald-200' },
};

// 全局动作反馈轻提示
export default function Notices() {
  const { notices } = useEmergency();

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2">
      {notices.map((n) => {
        const tone = TONE[n.tone] || TONE.info;
        const Icon = tone.icon;
        return (
          <div
            key={n.id}
            className={`animate-fade-up flex items-center gap-2 border px-4 py-3 font-serif text-sm shadow-2xl backdrop-blur ${tone.cls}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {n.text}
          </div>
        );
      })}
    </div>
  );
}
