import { Check } from 'lucide-react';
import { useCompare } from '../../state/CompareContext';

// 对比选择复选框：勾选进入全局对比篮，最多 3 只。
// 达到上限后仍允许点击尝试，由 context 统一给出提示，避免“点了没反应”。
export default function CompareCheckbox({ dino, className = '' }) {
  const { isComparing, toggleCompare, atLimit } = useCompare();
  const checked = isComparing(dino.id);
  const blocked = !checked && atLimit;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `取消对比 ${dino.name}` : `将 ${dino.name} 加入对比`}
      title={checked ? '取消对比' : blocked ? '最多同时对比 3 只' : '加入对比'}
      onClick={(event) => {
        event.stopPropagation();
        toggleCompare(dino.id);
      }}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center border transition-all ${
        checked
          ? 'border-amber bg-amber text-jungle-950'
          : blocked
            ? 'cursor-not-allowed border-bone/20 bg-jungle-950/60 text-transparent opacity-40'
            : 'border-bone/40 bg-jungle-950/60 text-transparent hover:border-amber/70'
      } ${className}`}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
}
