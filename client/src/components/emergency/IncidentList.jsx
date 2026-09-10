import { Siren, Crosshair, Lock, Radio } from 'lucide-react';
import { useEmergency, SEVERITY_META } from '../../emergency/EmergencyContext';

// 突发事件列表：展示模拟上报的事件，可派遣常规 / 武装小队处置
export default function IncidentList() {
  const { incidents, squads, dispatchSquad, authorized } = useEmergency();

  const activeCount = incidents.filter((i) => i.status === 'active').length;
  const busyCount = incidents.filter((i) => i.status === 'responding').length;

  return (
    <article className="flex h-full flex-col border border-bone/10 bg-jungle-900/80 p-7">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-bone">
          <Siren className="h-5 w-5 text-red-400" />
          突发事件流
        </h3>
        <span className="font-display text-[10px] tracking-[0.3em] text-bone/50">
          待处置 {activeCount} · 处置中 {busyCount}
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
          <Radio className="h-10 w-10 text-emerald-400/70" />
          <p className="mt-4 font-serif text-sm text-bone/55">各频段静籁，暂无突发事件上报</p>
          <p className="mt-1 font-serif text-xs text-bone/35">模拟事件将随时机注入，请保持监听</p>
        </div>
      ) : (
        <ul className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 460 }}>
          {incidents.map((inc) => {
            const sev = SEVERITY_META[inc.severity] || SEVERITY_META[1];
            const responding = inc.status === 'responding';
            const squad = squads.find((q) => q.id === inc.squadId);

            return (
              <li
                key={inc.id}
                className={`border p-4 ${
                  inc.severity === 4
                    ? 'border-red-500/60 bg-red-950/30'
                    : 'border-bone/10 bg-jungle-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 font-display text-[10px] tracking-widest ${sev.cls}`}>
                        危险 {inc.severity} · {sev.label}
                      </span>
                      {inc.escape && (
                        <span className="bg-red-600 px-2 py-0.5 font-display text-[10px] tracking-widest text-white">
                          生物脱逃
                        </span>
                      )}
                      {inc.gridFault && (
                        <span className="bg-amber/20 px-2 py-0.5 font-display text-[10px] tracking-widest text-amber">
                          电网故障
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-serif text-sm font-bold text-bone">{inc.type}</p>
                    <p className="mt-0.5 font-serif text-xs text-bone/50">
                      {inc.zone} · {new Date(inc.at).toLocaleTimeString('zh-CN', { hour12: false })}
                    </p>
                  </div>
                </div>

                {responding ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between font-display text-[10px] tracking-[0.25em] text-amber/90">
                      <span>{squad?.name || '安全小队'}处置中</span>
                      <span>{Math.min(100, Math.round(inc.progress))}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-bone/10">
                      <div
                        className="h-full bg-amber transition-all duration-700"
                        style={{ width: `${inc.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => dispatchSquad(inc.id, false)}
                      className="inline-flex items-center justify-center gap-1.5 border border-sky-400/50 bg-sky-400/10 px-3 py-2 font-serif text-xs tracking-widest text-sky-300 transition-colors hover:bg-sky-400/20"
                    >
                      <Crosshair className="h-3.5 w-3.5" />
                      派遣安全小队
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatchSquad(inc.id, true)}
                      className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 font-serif text-xs tracking-widest transition-colors ${
                        authorized
                          ? 'border-red-500/60 bg-red-500/15 text-red-300 hover:bg-red-500/25'
                          : 'border-bone/15 bg-bone/5 text-bone/40 hover:text-bone/70'
                      }`}
                    >
                      {authorized ? <Crosshair className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      武装战术小组
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
