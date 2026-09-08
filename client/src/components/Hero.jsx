import { Compass, Play, ChevronDown } from 'lucide-react';

// AI 生成的暗夜丛林恐龙背景图
const HERO_IMG = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=${encodeURIComponent(
  'Dark cinematic prehistoric jungle at night, giant Tyrannosaurus rex silhouette emerging from thick fog, dense giant ferns and ancient trees, distant erupting volcano with amber glow, moonlight rays through mist, deep emerald green and amber color palette, epic movie poster atmosphere, volumetric fog, highly detailed digital painting',
)}`;

const STATS = [
  { value: '12+', label: '复活恐龙物种' },
  { value: '6 大', label: '主题观光展区' },
  { value: '360°', label: '全岛防护电网' },
  { value: '98%', label: '游客满意度' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-jungle-950">
      {/* 恐龙背景图：缓慢推近 */}
      <img
        src={HERO_IMG}
        alt="夜雾中现身的霸王龙"
        className="absolute inset-0 h-full w-full animate-ken-burns object-cover"
      />

      {/* 暗色叠层：保证文字可读性 */}
      <div className="absolute inset-0 bg-gradient-to-r from-jungle-950 via-jungle-950/65 to-jungle-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-jungle-950 via-jungle-950/10 to-jungle-950/55" />

      {/* 漂移雾气 */}
      <div className="pointer-events-none absolute -bottom-10 -left-1/4 h-72 w-[150%] animate-fog bg-[radial-gradient(ellipse_at_center,rgba(190,210,195,0.14),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute top-1/4 -right-1/4 h-80 w-[150%] animate-fog-slow bg-[radial-gradient(ellipse_at_center,rgba(224,165,38,0.08),transparent_60%)] blur-3xl" />

      {/* 胶片颗粒 */}
      <div className="grain-overlay" />

      {/* 文案内容 */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-36 pt-28 lg:px-8">
        {/* 眉题 */}
        <p className="flex items-center gap-4 opacity-0 animate-fade-up">
          <span className="h-px w-12 bg-amber/70" />
          <span className="font-display text-xs tracking-[0.55em] text-amber md:text-sm">
            ISLA NUBLAR · 努布拉岛
          </span>
        </p>

        {/* 主标题 */}
        <h1 className="mt-6 font-serif text-6xl font-black leading-[1.05] text-bone text-glow opacity-0 animate-fade-up [animation-delay:150ms] md:text-8xl">
          侏罗纪
          <span className="text-amber">世界</span>
        </h1>
        <p className="mt-4 font-display text-xl tracking-[0.4em] text-bone/60 opacity-0 animate-fade-up [animation-delay:300ms] md:text-3xl">
          JURASSIC&nbsp;WORLD
        </p>

        {/* 副标题 */}
        <p className="mt-8 max-w-xl font-serif text-base leading-relaxed text-bone/70 opacity-0 animate-fade-up [animation-delay:450ms] md:text-lg">
          六千万年的沉睡，被一滴封存在琥珀中的蚊血唤醒。
          登上全地形观光车，穿越熔岩峡谷与蕨类密林——
          欢迎来到人类历史上最伟大的主题公园。
        </p>

        {/* 按钮组 */}
        <div className="mt-10 flex flex-wrap items-center gap-5 opacity-0 animate-fade-up [animation-delay:600ms]">
          <button
            type="button"
            className="group inline-flex animate-glow-pulse items-center gap-3 bg-amber px-8 py-4 font-serif text-base font-bold tracking-[0.25em] text-jungle-950 transition-transform duration-300 hover:scale-105"
          >
            <Compass className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
            开启探险
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-3 border border-bone/30 px-8 py-4 font-serif text-base tracking-[0.25em] text-bone/85 transition-all duration-300 hover:border-amber/70 hover:text-amber"
          >
            <Play className="h-5 w-5" />
            园区宣传片
          </button>
        </div>

        {/* 数据统计条 */}
        <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-8 border-t border-bone/15 pt-8 opacity-0 animate-fade-up [animation-delay:750ms] md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-bold text-amber md:text-4xl">{s.value}</dd>
              <dd className="mt-1 font-serif text-xs tracking-widest text-bone/55 md:text-sm">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-amber/70">
        <ChevronDown className="h-7 w-7 animate-bounce-slow" />
      </div>
    </section>
  );
}
