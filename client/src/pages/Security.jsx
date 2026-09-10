import { ShieldAlert, Volume2, VolumeX, Users, Siren as SirenIcon } from 'lucide-react';
import PageFrame from './PageFrame';
import { useEmergency } from '../emergency/EmergencyContext';
import SecurityGauge from '../components/emergency/SecurityGauge';
import ZoneGrid from '../components/emergency/ZoneGrid';
import IncidentList from '../components/emergency/IncidentList';
import DefensePanel from '../components/emergency/DefensePanel';
import CommandLog from '../components/emergency/CommandLog';

export default function Security() {
  const { levelMeta, level, triggerCritical, muted, toggleMute, squads, incidents } = useEmergency();

  const standbyCount = squads.filter((q) => q.status === 'standby').length;

  return (
    <PageFrame
      eyebrow="EMERGENCY PROTOCOL · 912 · 应急指挥"
      title="紧急预警与防御响应"
      intro="全局警报状态机实时驱动园区防御体系。模拟突发事件将随机注入各展区，安全指数、分区危险等级与小队编制同步刷新；危急时刻可一键发布一级警报，进入全岛封锁。"
    >
      {/* —— 指令栏：触发一级警报 —— */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="scanlines relative overflow-hidden border border-red-500/50 bg-gradient-to-r from-red-950/70 via-jungle-900 to-jungle-900 p-7">
          <div className="hazard-stripes absolute inset-x-0 top-0 h-1.5 opacity-80" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-display text-xs tracking-[0.4em] text-red-300/80">
                CODE 912 · 最高级别防御预案
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-bone">封锁触发器</h2>
              <p className="mt-2 max-w-md font-serif text-sm leading-relaxed text-bone/60">
                点击后全局状态机立即跃迁至一级警报：全屏红黑闪烁、循环拉响警报音、
                全岛门禁锁闭。请仅在确认致命生物脱逃时使用。
              </p>
            </div>
            <button
              type="button"
              onClick={triggerCritical}
              disabled={level === 'CRITICAL'}
              className="group relative inline-flex shrink-0 items-center gap-3 border-2 border-red-500 bg-red-600/25 px-8 py-5 font-serif text-base font-black tracking-[0.25em] text-red-100 transition-all duration-300 hover:bg-red-600 hover:text-white hover:shadow-[0_0_44px_rgba(255,0,0,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SirenIcon className="h-6 w-6 animate-siren-blink group-hover:animate-spin" />
              触发一级警报
            </button>
          </div>
        </div>

        {/* 当前状态速览 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-bone/10 bg-jungle-900/80 p-5">
            <ShieldAlert className="h-6 w-6" style={{ color: levelMeta.color }} />
            <p className="mt-4 font-display text-[10px] tracking-[0.25em] text-bone/45">当前状态</p>
            <p className="mt-1 font-serif text-lg font-black" style={{ color: levelMeta.color }}>
              {levelMeta.label}
            </p>
          </div>
          <div className="border border-bone/10 bg-jungle-900/80 p-5">
            <Users className="h-6 w-6 text-sky-300" />
            <p className="mt-4 font-display text-[10px] tracking-[0.25em] text-bone/45">小队待命</p>
            <p className="mt-1 font-display text-2xl font-black text-sky-300">
              {standbyCount}
              <span className="text-sm text-bone/40">/{squads.length}</span>
            </p>
          </div>
          <div className="border border-bone/10 bg-jungle-900/80 p-5">
            <SirenIcon className="h-6 w-6 text-red-400" />
            <p className="mt-4 font-display text-[10px] tracking-[0.25em] text-bone/45">活跃事件</p>
            <p className="mt-1 font-display text-2xl font-black text-red-400">{incidents.length}</p>
          </div>
        </div>
      </div>

      {/* 静音开关条 */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-bone/10 bg-jungle-900/60 px-6 py-3">
        <p className="font-serif text-sm text-bone/60">
          警报音效由 Web Audio 实时合成，红色紧急及以上等级自动拉响。
        </p>
        <button
          type="button"
          onClick={toggleMute}
          className={`inline-flex items-center gap-2 border px-4 py-2 font-serif text-xs tracking-widest transition-colors ${
            muted
              ? 'border-bone/25 text-bone/55 hover:text-bone'
              : 'border-red-500/60 text-red-300 hover:bg-red-500/10'
          }`}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? '警报音已静音' : '警报音播放中'}
        </button>
      </div>

      {/* —— 仪表盘与分区 —— */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
        <SecurityGauge />
        <ZoneGrid />
      </div>

      {/* —— 事件流与防御控制 —— */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <IncidentList />
        <DefensePanel />
      </div>

      {/* —— 指挥日志 —— */}
      <div className="mt-5">
        <CommandLog />
      </div>
    </PageFrame>
  );
}
