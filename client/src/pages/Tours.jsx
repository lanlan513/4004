import { Map, Route, ShieldCheck } from 'lucide-react';
import PageFrame from './PageFrame';

const tours = [
  {
    title: '熔岩峡谷线',
    duration: '约 90 分钟',
    description: '沿火山边缘进入霸王龙展区，适合第一次登岛的游客。',
    icon: Map,
  },
  {
    title: '密林追踪线',
    duration: '约 120 分钟',
    description: '穿越蕨类密林与迅猛龙围场，全程配备专业向导。',
    icon: Route,
  },
  {
    title: '家庭探索线',
    duration: '约 60 分钟',
    description: '途经湖滨草原和温和植食恐龙区，节奏舒缓，适合亲子同行。',
    icon: ShieldCheck,
  },
];

export default function Tours() {
  return (
    <PageFrame
      eyebrow="ISLAND ROUTES · 岛屿路线"
      title="观光路线"
      intro="选择适合你的探险节奏。所有路线均由中央调度台根据天气、电网与动物状态动态开放。"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {tours.map(({ title, duration, description, icon: Icon }) => (
          <article
            key={title}
            className="border border-bone/10 bg-jungle-900/70 p-7 transition-colors hover:border-amber/50"
          >
            <Icon className="h-8 w-8 text-amber" />
            <h2 className="mt-7 font-serif text-2xl font-bold text-bone">{title}</h2>
            <p className="mt-2 font-display text-xs tracking-widest text-amber/80">{duration}</p>
            <p className="mt-5 font-serif text-sm leading-relaxed text-bone/65">{description}</p>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
