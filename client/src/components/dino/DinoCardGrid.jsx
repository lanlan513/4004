import { MapPin, Pencil } from 'lucide-react';
import { DangerBadge, DangerPips, DietBadge, HealthDot, formatWeight } from './dinoDisplay';
import FavoriteButton from './FavoriteButton';
import CompareCheckbox from './CompareCheckbox';

// 卡片图鉴：悬停高亮 + 点击查看详情
export default function DinoCardGrid({ dinosaurs, onOpen, onEdit, editable = true }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {dinosaurs.map((dino) => (
        <article
          key={dino.id}
          tabIndex={0}
          role="button"
          aria-label={`查看 ${dino.name} 详情`}
          onClick={() => onOpen(dino)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen(dino);
            }
          }}
          className="group relative flex cursor-pointer flex-col border border-bone/10 bg-jungle-900/70 p-6 outline-none transition-all duration-300 hover:-translate-y-1 hover:border-amber/60 hover:shadow-[0_18px_50px_rgba(0,0,0,0.55),0_0_32px_rgba(224,165,38,0.12)] focus-visible:border-amber/60"
        >
          {/* 悬停时左侧琥珀高亮条 */}
          <span className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-amber transition-transform duration-300 group-hover:scale-y-100" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[10px] tracking-[0.3em] text-bone/40">{dino.code}</p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-bone transition-colors group-hover:text-amber-light">
                {dino.name}
              </h2>
              <p className="mt-0.5 font-display text-xs italic tracking-widest text-amber/70">
                {dino.latin}
              </p>
            </div>
            <DangerBadge level={dino.dangerLevel} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DietBadge diet={dino.diet} />
            <span className="border border-bone/20 px-2 py-0.5 font-serif text-xs text-bone/70">
              {dino.category}
            </span>
            <span className="border border-bone/20 px-2 py-0.5 font-serif text-xs text-bone/70">
              {dino.sizeTier}
            </span>
          </div>

          <p className="mt-4 line-clamp-2 font-serif text-sm leading-relaxed text-bone/60">
            {dino.description}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-bone/10 pt-4 font-serif text-xs">
            <div>
              <dt className="text-bone/40">生存年代</dt>
              <dd className="mt-0.5 text-bone/85">{dino.era}</dd>
            </div>
            <div>
              <dt className="text-bone/40">体型</dt>
              <dd className="mt-0.5 text-bone/85">
                {dino.lengthM} 米 · {formatWeight(dino.weightT)}
              </dd>
            </div>
            <div>
              <dt className="text-bone/40">健康状态</dt>
              <dd className="mt-1">
                <HealthDot status={dino.healthStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-bone/40">危险系数</dt>
              <dd className="mt-1.5">
                <DangerPips level={dino.dangerLevel} />
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-bone/10 pt-4">
            <span className="inline-flex items-center gap-1.5 font-serif text-xs text-bone/50">
              <MapPin className="h-3.5 w-3.5" />
              {dino.habitat}
            </span>
            {/* 收藏 / 对比 / 修改：均阻止冒泡，避免触发卡片点击 */}
            <div className="flex items-center gap-1.5">
              <label className="inline-flex cursor-pointer items-center gap-1 border border-bone/15 py-1.5 pl-1.5 pr-2 font-serif text-[10px] tracking-widest text-bone/55 transition-colors hover:border-amber/60 hover:text-amber">
                <CompareCheckbox dino={dino} />
                对比
              </label>
              <FavoriteButton
                dino={dino}
                className="border border-bone/15 p-1.5 hover:border-red-400/60"
              />
              {editable && (
                <button
                  type="button"
                  aria-label={`修改 ${dino.name} 档案`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(dino);
                  }}
                  className="border border-bone/15 p-1.5 text-bone/50 opacity-0 transition-all hover:border-amber/60 hover:text-amber group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
