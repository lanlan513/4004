// 恐龙档案的展示辅助：危险等级、健康状态等徽章

// 危险系数（1-5）对应的标签与配色
const DANGER_STYLES = {
  1: { label: '低危', className: 'border-jungle-400/50 text-emerald-300 bg-emerald-950/40' },
  2: { label: '警戒', className: 'border-lime-500/40 text-lime-300 bg-lime-950/40' },
  3: { label: '高危', className: 'border-amber/50 text-amber bg-amber/10' },
  4: { label: '极危', className: 'border-orange-500/50 text-orange-300 bg-orange-950/40' },
  5: { label: '致命', className: 'border-red-500/60 text-red-300 bg-red-950/50' },
};

export function dangerMeta(level) {
  return DANGER_STYLES[level] ?? { label: '未知', className: 'border-bone/30 text-bone/60' };
}

// 危险点数（用 5 个方块可视化）
export function DangerPips({ level, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`危险系数 ${level} / 5`}>
      {[1, 2, 3, 4, 5].map((point) => (
        <span
          key={point}
          className={`h-1.5 w-4 ${point <= level ? 'bg-red-500/80' : 'bg-bone/15'}`}
        />
      ))}
    </span>
  );
}

export function DangerBadge({ level }) {
  const meta = dangerMeta(level);
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 font-serif text-xs ${meta.className}`}>
      {meta.label} · {level}
    </span>
  );
}

// 食性配色
const DIET_STYLES = {
  肉食: 'border-red-400/40 text-red-300',
  植食: 'border-emerald-400/40 text-emerald-300',
  杂食: 'border-amber/40 text-amber',
};

export function DietBadge({ diet }) {
  return (
    <span
      className={`inline-flex items-center border bg-jungle-950/50 px-2 py-0.5 font-serif text-xs ${
        DIET_STYLES[diet] ?? 'border-bone/30 text-bone/70'
      }`}
    >
      {diet}
    </span>
  );
}

// 健康状态点颜色
const HEALTH_DOT = {
  健康: 'bg-emerald-400',
  观察: 'bg-amber',
  治疗中: 'bg-orange-400',
  隔离: 'bg-red-500',
};

export function HealthDot({ status }) {
  return (
    <span className="inline-flex items-center gap-2 font-serif text-sm text-bone/80">
      <span className={`h-2 w-2 rounded-full ${HEALTH_DOT[status] ?? 'bg-bone/40'}`} />
      {status}
    </span>
  );
}

// 体型展示：分档标签 + 体长/体重
export function sizeLabel(dino) {
  return `${dino.sizeTier} · ${dino.lengthM} 米`;
}

export function formatWeight(weightT) {
  return weightT < 0.1 ? `${Math.round(weightT * 1000)} 千克` : `${weightT} 吨`;
}
