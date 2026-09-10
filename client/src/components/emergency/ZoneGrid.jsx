import { MapPin, Zap, ZapOff } from 'lucide-react';
import { useEmergency } from '../../emergency/EmergencyContext';

function dangerTone(danger) {
  if (danger >= 72) return { bar: 'bg-red-600', text: 'text-red-400', label: '极度危险' };
  if (danger >= 50) return { bar: 'bg-amber', text: 'text-amber', label: '高危' };
  if (danger >= 28) return { bar: 'bg-sky-400', text: 'text-sky-300', label: '警戒' };
  return { bar: 'bg-emerald-400', text: 'text-emerald-300', label: '安全' };
}

// 园区危险等级网格：六个展区的实时危险值随事件与电网状态刷新
export default function ZoneGrid() {
  const { zones } = useEmergency();

  return (
    <article className="border border-bone/10 bg-jungle-900/80 p-7">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-bone">
        <MapPin className="h-5 w-5 text-amber" />
        分区危险等级
      </h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {zones.map((z) => {
          const tone = dangerTone(z.danger);
          return (
            <div
              key={z.id}
              className="border border-bone/10 bg-jungle-950/60 p-4 transition-colors hover:border-amber/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-[10px] tracking-[0.3em] text-bone/40">{z.code}</p>
                  <p className="mt-1 font-serif text-sm font-bold text-bone">{z.name}</p>
                </div>
                {z.powered ? (
                  <Zap className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <ZapOff className="h-4 w-4 shrink-0 animate-siren-blink text-red-500" />
                )}
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className={`font-display text-2xl font-black ${tone.text}`}>{z.danger}</span>
                <span className="font-serif text-[11px] tracking-widest text-bone/50">
                  {tone.label}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden bg-bone/10">
                <div
                  className={`h-full ${tone.bar}`}
                  style={{ width: `${z.danger}%`, transition: 'width 0.9s ease, background 0.6s ease' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
