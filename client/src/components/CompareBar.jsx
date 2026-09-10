import { Link, useLocation } from 'react-router-dom';
import { GitCompareArrows, X, TriangleAlert } from 'lucide-react';
import { useCompare, COMPARE_MIN, COMPARE_MAX } from '../state/CompareContext';
import { useDinoMap, resolveDinosaurs } from '../hooks/useDinoMap';

// 全局悬浮对比篮：在任意页面勾选恐龙后从底部滑出
export default function CompareBar() {
  const { compareIds, removeCompare, clearCompare, canStart, notice } = useCompare();
  const { dinoMap } = useDinoMap();
  const { dinosaurs, missing } = resolveDinosaurs(dinoMap, compareIds);
  const location = useLocation();

  // 已在对比页时隐藏，避免与页面内的操作重复
  if (compareIds.length === 0 || location.pathname === '/compare') return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 border border-amber/30 bg-jungle-900/95 p-4 shadow-[0_-8px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(224,165,38,0.12)] backdrop-blur-md md:flex-row md:items-center">
        <div className="flex items-center gap-2 font-serif text-sm tracking-widest text-amber">
          <GitCompareArrows className="h-4 w-4" />
          对比篮（{compareIds.length}/{COMPARE_MAX}）
        </div>

        {/* 已选恐龙筹码 */}
        <ul className="flex flex-1 flex-wrap items-center gap-2">
          {dinosaurs.map((dino, index) => (
            <li
              key={dino.id}
              className="inline-flex items-center gap-2 border border-bone/20 bg-jungle-950/60 py-1 pl-3 pr-1.5 font-serif text-xs text-bone/85"
            >
              <span className="font-display text-[10px] text-amber/70">{index + 1}</span>
              {dino.name}
              <button
                type="button"
                aria-label={`移除 ${dino.name}`}
                onClick={() => removeCompare(dino.id)}
                className="text-bone/45 transition-colors hover:text-red-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {missing.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-2 border border-red-400/40 bg-red-950/30 py-1 pl-3 pr-1.5 font-serif text-xs text-red-200"
            >
              档案已注销 #{id}
              <button
                type="button"
                aria-label={`移除失效编号 ${id}`}
                onClick={() => removeCompare(id)}
                className="text-red-300/70 transition-colors hover:text-red-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        {notice && (
          <p className="inline-flex items-center gap-1.5 font-serif text-xs text-red-300">
            <TriangleAlert className="h-3.5 w-3.5" />
            {notice}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="border border-bone/25 px-3 py-2 font-serif text-xs tracking-widest text-bone/70 transition-colors hover:border-red-400/60 hover:text-red-300"
          >
            清空
          </button>
          {canStart ? (
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 bg-amber px-5 py-2 font-serif text-xs font-bold tracking-widest text-jungle-950 transition-all hover:bg-amber-light hover:shadow-[0_0_24px_rgba(224,165,38,0.4)]"
            >
              <GitCompareArrows className="h-4 w-4" />
              开始对比
            </Link>
          ) : (
            <span
              className="inline-flex cursor-not-allowed items-center gap-2 bg-bone/15 px-5 py-2 font-serif text-xs tracking-widest text-bone/40"
              title={`至少选择 ${COMPARE_MIN} 只恐龙`}
            >
              还需选择 {COMPARE_MIN - compareIds.length} 只
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
