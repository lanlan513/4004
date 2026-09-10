import { Gauge } from 'lucide-react';
import { useEmergency } from '../../emergency/EmergencyContext';

// 实时安全指数圆环仪表：指数随模拟突发事件动态平滑刷新
export default function SecurityGauge() {
  const { safetyIndex, levelMeta } = useEmergency();

  const radius = 84;
  const circ = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, safetyIndex));
  const dash = (value / 100) * circ;

  // 指数越低，圆弧越接近红色；颜色随全局警报等级联动
  const arcColor = levelMeta.color;

  return (
    <article className="scanlines relative overflow-hidden border border-bone/10 bg-jungle-900/80 p-7">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-bone">
          <Gauge className="h-5 w-5 text-amber" />
          实时安全指数
        </h3>
        <span className="inline-flex items-center gap-2 font-display text-[10px] tracking-[0.3em] text-bone/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-56 w-56">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="rgba(233,227,208,0.08)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={arcColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{
                transition: 'stroke-dasharray 0.9s ease, stroke 0.6s ease',
                filter: `drop-shadow(0 0 10px ${arcColor})`,
              }}
            />
            {/* 刻度 */}
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i / 40) * 360;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="6"
                  x2="100"
                  y2={i % 5 === 0 ? '14' : '10'}
                  stroke="rgba(233,227,208,0.25)"
                  strokeWidth="1"
                  transform={`rotate(${angle} 100 100)`}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display text-6xl font-black leading-none"
              style={{ color: arcColor, textShadow: `0 0 24px ${arcColor}66` }}
            >
              {Math.round(value)}
            </span>
            <span className="mt-2 font-display text-[10px] tracking-[0.35em] text-bone/50">
              SAFETY INDEX
            </span>
          </div>
        </div>

        <div className={`mt-6 border px-5 py-2 font-display text-sm tracking-[0.35em] ${levelMeta.chip}`}>
          {levelMeta.code} · {levelMeta.label}
        </div>
        <p className="mt-3 text-center font-serif text-xs leading-relaxed text-bone/55">
          {levelMeta.desc}
        </p>
        {level === 'NORMAL' && (
          <p className="mt-1 font-serif text-[11px] text-bone/40">指数越高园区越安全</p>
        )}
      </div>
    </article>
  );
}
