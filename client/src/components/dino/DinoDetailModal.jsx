import { useEffect } from 'react';
import { X, Pencil, Trash2, MapPin, Clock, Dna, Ruler, Weight } from 'lucide-react';
import { DangerBadge, DangerPips, DietBadge, HealthDot, formatWeight } from './dinoDisplay';

// 恐龙详情弹窗：点击遮罩或按 Esc 关闭
export default function DinoDetailModal({ dino, onClose, onEdit, onDelete }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!dino) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-jungle-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${dino.name} 档案详情`}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-amber/30 bg-jungle-900 shadow-[0_0_80px_rgba(224,165,38,0.15)] animate-fade-up"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-bone/10 bg-jungle-900/95 p-6 backdrop-blur">
          <div>
            <p className="font-display text-[10px] tracking-[0.35em] text-amber/70">{dino.code}</p>
            <h2 className="mt-1 font-serif text-3xl font-black text-bone">{dino.name}</h2>
            <p className="mt-1 font-display text-xs italic tracking-widest text-bone/50">{dino.latin}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭详情"
            className="shrink-0 border border-bone/15 p-2 text-bone/70 transition-colors hover:border-amber/50 hover:text-amber"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 主体 */}
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <DangerBadge level={dino.dangerLevel} />
            <DietBadge diet={dino.diet} />
            <span className="inline-flex items-center border border-bone/20 px-2 py-0.5 font-serif text-xs text-bone/80">
              {dino.category}
            </span>
            <span className="inline-flex items-center border border-bone/20 px-2 py-0.5 font-serif text-xs text-bone/80">
              {dino.sizeTier}
            </span>
          </div>

          <p className="font-serif text-sm leading-relaxed text-bone/75">{dino.description}</p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-bone/10 pt-6 font-serif text-sm">
            <DetailItem icon={<Clock className="h-4 w-4" />} label="生存年代" value={dino.era} />
            <DetailItem icon={<Dna className="h-4 w-4" />} label="种类" value={dino.category} />
            <DetailItem icon={<Ruler className="h-4 w-4" />} label="体长" value={`${dino.lengthM} 米`} />
            <DetailItem icon={<Weight className="h-4 w-4" />} label="体重" value={formatWeight(dino.weightT)} />
            <DetailItem icon={<MapPin className="h-4 w-4" />} label="栖息区域" value={dino.habitat} />
            <DetailItem label="资产状态" value={dino.status} />
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 pt-6">
            <div className="space-y-2">
              <HealthDot status={dino.healthStatus} />
              <DangerPips level={dino.dangerLevel} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onEdit(dino)}
                className="inline-flex items-center gap-2 border border-amber/60 px-4 py-2 font-serif text-sm tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
              >
                <Pencil className="h-4 w-4" />
                修改
              </button>
              <button
                type="button"
                onClick={() => onDelete(dino)}
                className="inline-flex items-center gap-2 border border-red-500/50 px-4 py-2 font-serif text-sm tracking-widest text-red-300 transition-colors hover:bg-red-500 hover:text-bone"
              >
                <Trash2 className="h-4 w-4" />
                注销
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-bone/45">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-bone/90">{value}</dd>
    </div>
  );
}
