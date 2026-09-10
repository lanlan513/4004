import { useEffect } from 'react';
import { ShieldAlert, Volume2, VolumeX, Undo2, Radio } from 'lucide-react';
import { useEmergency } from '../../emergency/EmergencyContext';

// 一级警报全屏覆盖层：红黑闪烁、警报音效、中央封锁指示
// 仅在全局状态机进入 CRITICAL 时挂载
export default function AlertOverlay() {
  const { muted, toggleMute, standDown } = useEmergency();

  // ESC 快捷键：确认警情并退出全屏（不影响现场处置）
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') standDown();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [standDown]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="一级警报：全岛封锁"
      className="fixed inset-0 z-[100] scanlines animate-emergency-flash"
    >
      {/* 顶部警戒斜纹 */}
      <div className="hazard-stripes absolute inset-x-0 top-0 h-2.5 opacity-90" />
      <div className="hazard-stripes absolute inset-x-0 bottom-0 h-2.5 opacity-90" />

      {/* 雷达三角警示图标 */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-10 flex h-36 w-36 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-red-400/70 animate-radar-ping" />
          <span
            className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-radar-ping"
            style={{ animationDelay: '1.2s' }}
          />
          <ShieldAlert className="h-24 w-24 animate-siren-blink text-red-100 drop-shadow-[0_0_22px_rgba(255,0,0,0.9)]" />
        </div>

        <p className="font-display text-sm tracking-[0.6em] text-red-200/90 md:text-base">
          CONTAINMENT BREACH · 912
        </p>
        <h1 className="mt-4 font-serif text-6xl font-black tracking-[0.15em] text-red-100 alert-glow animate-siren-blink md:text-9xl">
          一级警报
        </h1>
        <p className="mt-6 font-display text-xl tracking-[0.35em] text-red-200 md:text-3xl">
          全 岛 封 锁 · LOCKDOWN
        </p>
        <p className="mt-8 max-w-xl font-serif text-sm leading-relaxed text-red-100/80 md:text-base">
          探测到致命生物威胁。所有游客立即就近进入加固掩体，
          观光车辆原地锁闭。防御单位已收到交战指令，请勿开启任何电子门禁。
        </p>

        {/* 行动按钮 */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={standDown}
            className="inline-flex items-center gap-3 border-2 border-red-200 bg-red-950/60 px-8 py-4 font-serif text-sm font-bold tracking-[0.3em] text-red-100 backdrop-blur transition-all duration-300 hover:bg-red-200 hover:text-red-950"
          >
            <Undo2 className="h-5 w-5" />
            确认警情 · 解除全屏（ESC）
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex items-center gap-3 border-2 border-red-200/60 px-8 py-4 font-serif text-sm tracking-[0.3em] text-red-100/90 backdrop-blur transition-all duration-300 hover:border-red-100 hover:text-white"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 animate-siren-blink" />}
            {muted ? '恢复警报音' : '静音警报音'}
          </button>
        </div>

        <p className="mt-10 inline-flex items-center gap-2 font-display text-xs tracking-[0.4em] text-red-200/70">
          <Radio className="h-4 w-4 animate-siren-blink" />
          应急广播循环播发中 · 指挥热线 9-1-1
        </p>
      </div>
    </div>
  );
}
