import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Moon, Sun, Zap, ZapOff, Wrench, Camera, Thermometer, Droplets,
  Eye, HeartPulse, AlertTriangle, Radio, X,
} from 'lucide-react';
import PageFrame from './PageFrame';
import ParkMapCanvas from '../components/ParkMapCanvas';

const FENCE_LABEL = { on: '通电', off: '断电', fault: '故障' };
const FENCE_STYLE = {
  on: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  off: 'border-bone/20 bg-bone/5 text-bone/50',
  fault: 'border-red-400/50 bg-red-500/10 text-red-300',
};
const EVENT_STYLE = {
  fault: 'text-red-300',
  fence: 'text-amber',
  repair: 'text-emerald-300',
  system: 'text-bone/60',
};

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? '请求失败');
  }
  return response.json();
}

// 开关按钮
function FenceSwitch({ zone, busy, onToggle }) {
  const isOn = zone.fence.status === 'on';
  const isFault = zone.fence.status === 'fault';
  return (
    <button
      type="button"
      disabled={busy || isFault}
      onClick={() => onToggle(zone.id, isOn ? 'off' : 'on')}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 disabled:cursor-not-allowed ${
        isFault
          ? 'border-red-400/40 bg-red-500/20'
          : isOn
            ? 'border-emerald-400/50 bg-emerald-400/30'
            : 'border-bone/20 bg-jungle-800'
      }`}
      aria-label={`${zone.name}电网开关`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300 ${
          isFault ? 'left-0.5 bg-red-400' : isOn ? 'left-6 bg-emerald-300' : 'left-0.5 bg-bone/40'
        }`}
      />
    </button>
  );
}

export default function ParkMap() {
  const [mode, setMode] = useState('night');
  const [zones, setZones] = useState([]);
  const [dinos, setDinos] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [zoneDetail, setZoneDetail] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [busyZone, setBusyZone] = useState(null);
  const [actionError, setActionError] = useState(null);
  const selectedRef = useRef(null);
  selectedRef.current = selectedZoneId;

  // 总览 + 实时定位 + 事件轮询
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [overview, tracking, log] = await Promise.all([
          fetchJson('/api/park/overview'),
          fetchJson('/api/park/tracking'),
          fetchJson('/api/park/events'),
        ]);
        if (cancelled) return;
        setZones(overview.data ?? []);
        setDinos(tracking.data ?? []);
        setEvents(log.data ?? []);
        setLoadError(false);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    };
    load();
    const timer = setInterval(load, 2000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  // 选中网格的局部监控数据轮询
  useEffect(() => {
    if (!selectedZoneId) { setZoneDetail(null); return undefined; }
    let cancelled = false;
    const load = async () => {
      try {
        const payload = await fetchJson(`/api/park/zones/${selectedZoneId}`);
        if (!cancelled) setZoneDetail(payload.data);
      } catch {
        if (!cancelled) setZoneDetail(null);
      }
    };
    load();
    const timer = setInterval(load, 3000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [selectedZoneId]);

  // 电网操作
  const handleFence = useCallback(async (zoneId, action) => {
    setBusyZone(zoneId);
    setActionError(null);
    try {
      await fetchJson(`/api/park/zones/${zoneId}/fence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const overview = await fetchJson('/api/park/overview');
      setZones(overview.data ?? []);
      const log = await fetchJson('/api/park/events');
      setEvents(log.data ?? []);
      if (selectedRef.current === zoneId) {
        const detail = await fetchJson(`/api/park/zones/${zoneId}`);
        setZoneDetail(detail.data);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyZone(null);
    }
  }, []);

  const faultCount = zones.filter((z) => z.fence?.status === 'fault').length;
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <PageFrame
      eyebrow="GIS TRACKING · 园区监控"
      title="园区交互地图"
      intro="努布拉岛全景安全网格。点击地图上的网格查看局部监控数据，右侧面板可切换昼夜模式并控制各区域电网。"
    >
      {loadError && (
        <div className="mb-6 border border-red-300/30 bg-red-950/30 p-4 font-serif text-sm text-red-100" role="alert">
          暂时无法连接园区追踪服务，正在自动重试...
        </div>
      )}
      {faultCount > 0 && (
        <div className="mb-6 flex items-center gap-3 border border-red-400/40 bg-red-500/10 p-4 font-serif text-sm text-red-200" role="alert">
          <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
          警报：{faultCount} 个安全网格电网故障，请立即派遣维修队处理。
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* 地图主体 */}
        <div className="relative border border-bone/10 bg-jungle-900/70">
          <div className="flex items-center justify-between border-b border-bone/10 px-5 py-3">
            <p className="flex items-center gap-2 font-display text-xs tracking-[0.3em] text-amber">
              <Radio className="h-4 w-4 animate-pulse" />
              ISLA NUBLAR · LIVE
            </p>
            <p className="font-serif text-xs text-bone/50">
              {mode === 'night' ? '夜间模式' : '昼间模式'} · 追踪目标 {dinos.length} 个
            </p>
          </div>
          <ParkMapCanvas
            zones={zones}
            dinos={dinos}
            mode={mode}
            selectedZoneId={selectedZoneId}
            onSelectZone={(id) => setSelectedZoneId(id === selectedZoneId ? null : id)}
          />
          {/* 图例 */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-bone/10 px-5 py-3 font-serif text-xs text-bone/60">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />电网通电</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-bone/40" />电网断电</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />电网故障</span>
            <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rotate-45 bg-red-500" />肉食恐龙</span>
            <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rotate-45 bg-emerald-400" />植食恐龙</span>
          </div>
        </div>

        {/* 控制面板 */}
        <aside className="space-y-6">
          {/* 昼夜模式 */}
          <div className="border border-bone/10 bg-jungle-900/70 p-5">
            <h2 className="font-serif text-sm font-bold tracking-[0.3em] text-amber">显示模式</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { key: 'day', label: '昼间', Icon: Sun },
                { key: 'night', label: '夜间', Icon: Moon },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`flex items-center justify-center gap-2 border px-3 py-2.5 font-serif text-sm tracking-widest transition-all duration-300 ${
                    mode === key
                      ? 'border-amber bg-amber/15 text-amber shadow-[0_0_18px_rgba(224,165,38,0.25)]'
                      : 'border-bone/15 text-bone/60 hover:border-amber/40 hover:text-amber'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 电网控制 */}
          <div className="border border-bone/10 bg-jungle-900/70 p-5">
            <h2 className="flex items-center gap-2 font-serif text-sm font-bold tracking-[0.3em] text-amber">
              <Zap className="h-4 w-4" />
              电网控制
            </h2>
            {actionError && (
              <p className="mt-3 border border-red-300/30 bg-red-950/30 px-3 py-2 font-serif text-xs text-red-200">
                {actionError}
              </p>
            )}
            <ul className="mt-4 space-y-3">
              {zones.map((zone) => (
                <li key={zone.id} className="border border-bone/10 bg-jungle-950/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="min-w-0 text-left"
                    >
                      <p className="truncate font-serif text-sm text-bone transition-colors hover:text-amber">
                        {zone.name}
                      </p>
                      <p className="mt-0.5 font-display text-[10px] tracking-widest text-bone/40">
                        {zone.code} · 在区 {zone.dinoCount} 只
                      </p>
                    </button>
                    {zone.fence.status === 'fault' ? (
                      <button
                        type="button"
                        disabled={busyZone === zone.id}
                        onClick={() => handleFence(zone.id, 'repair')}
                        className="flex shrink-0 items-center gap-1.5 border border-red-400/50 bg-red-500/10 px-2.5 py-1.5 font-serif text-xs text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        修复
                      </button>
                    ) : (
                      <FenceSwitch zone={zone} busy={busyZone === zone.id} onToggle={handleFence} />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`inline-block border px-2 py-0.5 font-serif text-[11px] ${FENCE_STYLE[zone.fence.status]}`}>
                      {FENCE_LABEL[zone.fence.status]}
                    </span>
                    <span className="font-serif text-[11px] text-bone/40">
                      {zone.fence.voltage} kV · {zone.fence.current} A
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 事件日志 */}
          <div className="border border-bone/10 bg-jungle-900/70 p-5">
            <h2 className="font-serif text-sm font-bold tracking-[0.3em] text-amber">事件日志</h2>
            <ul className="mt-4 max-h-56 space-y-2.5 overflow-y-auto pr-1">
              {events.map((event) => (
                <li key={event.id} className="border-l-2 border-bone/15 pl-3">
                  <p className={`font-serif text-xs leading-relaxed ${EVENT_STYLE[event.type] ?? 'text-bone/70'}`}>
                    {event.message}
                  </p>
                  <p className="mt-0.5 font-display text-[10px] tracking-wider text-bone/30">
                    {new Date(event.time).toLocaleTimeString('zh-CN')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* 局部监控面板 */}
      {selectedZone && (
        <section className="mt-6 border border-amber/30 bg-jungle-900/80">
          <div className="flex items-center justify-between border-b border-bone/10 px-6 py-4">
            <h2 className="font-serif text-lg font-bold text-bone">
              {selectedZone.name}
              <span className="ml-3 font-display text-xs tracking-[0.3em] text-amber/80">
                {selectedZone.code} · 局部监控
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setSelectedZoneId(null)}
              className="text-bone/50 transition-colors hover:text-amber"
              aria-label="关闭监控面板"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!zoneDetail ? (
            <p className="p-6 font-serif text-sm text-bone/50" role="status">正在读取监控数据...</p>
          ) : (
            <div className="grid gap-6 p-6 md:grid-cols-3">
              {/* 电网与环境 */}
              <div>
                <h3 className="flex items-center gap-2 font-serif text-sm font-bold text-amber">
                  {zoneDetail.fence.status === 'off' ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  电网状态
                </h3>
                <dl className="mt-3 space-y-2 font-serif text-sm">
                  <div className="flex justify-between">
                    <dt className="text-bone/45">运行状态</dt>
                    <dd className={FENCE_STYLE[zoneDetail.fence.status].split(' ').pop()}>{FENCE_LABEL[zoneDetail.fence.status]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-bone/45">电压</dt>
                    <dd className="text-bone/85">{zoneDetail.fence.voltage} kV</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-bone/45">电流</dt>
                    <dd className="text-bone/85">{zoneDetail.fence.current} A</dd>
                  </div>
                </dl>
                <h3 className="mt-6 flex items-center gap-2 font-serif text-sm font-bold text-amber">
                  <Thermometer className="h-4 w-4" />
                  环境遥测
                </h3>
                <dl className="mt-3 space-y-2 font-serif text-sm">
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-bone/45"><Thermometer className="h-3.5 w-3.5" />温度</dt>
                    <dd className="text-bone/85">{zoneDetail.environment.temperature} ℃</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-bone/45"><Droplets className="h-3.5 w-3.5" />湿度</dt>
                    <dd className="text-bone/85">{zoneDetail.environment.humidity} %</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-bone/45"><Eye className="h-3.5 w-3.5" />能见度</dt>
                    <dd className="text-bone/85">{zoneDetail.environment.visibility} km</dd>
                  </div>
                </dl>
              </div>

              {/* 监控探头 */}
              <div>
                <h3 className="flex items-center gap-2 font-serif text-sm font-bold text-amber">
                  <Camera className="h-4 w-4" />
                  监控探头
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {zoneDetail.cameras.map((cam) => (
                    <li key={cam.id} className="flex items-center justify-between border border-bone/10 bg-jungle-950/60 px-3 py-2">
                      <span className="font-serif text-sm text-bone/80">
                        {cam.name}
                        <span className="ml-2 font-display text-[10px] tracking-widest text-bone/35">{cam.id}</span>
                      </span>
                      <span className={`flex items-center gap-1.5 font-serif text-xs ${cam.status === 'online' ? 'text-emerald-300' : 'text-red-300'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cam.status === 'online' ? 'bg-emerald-400' : 'animate-pulse bg-red-400'}`} />
                        {cam.status === 'online' ? '在线' : '离线'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 在区恐龙 */}
              <div>
                <h3 className="flex items-center gap-2 font-serif text-sm font-bold text-amber">
                  <HeartPulse className="h-4 w-4" />
                  在区恐龙（{zoneDetail.dinosaurs.length}）
                </h3>
                {zoneDetail.dinosaurs.length === 0 ? (
                  <p className="mt-3 font-serif text-sm text-bone/45">当前网格无追踪目标。</p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {zoneDetail.dinosaurs.map((dino) => (
                      <li key={dino.id} className="border border-bone/10 bg-jungle-950/60 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm text-bone/85">{dino.name} · {dino.species}</span>
                          <span className="font-display text-[10px] tracking-widest text-bone/35">{dino.id}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 font-serif text-xs text-bone/50">
                          <HeartPulse className="h-3 w-3 text-red-300" />
                          心率 {dino.heartRate} bpm · 坐标 ({Math.round(dino.x)}, {Math.round(dino.y)})
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </PageFrame>
  );
}
