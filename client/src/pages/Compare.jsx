import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompareArrows,
  Ruler,
  Drumstick,
  Clock,
  Gauge,
  ShieldAlert,
  X,
  Crown,
  ArrowLeft,
  TriangleAlert,
} from 'lucide-react';
import PageFrame from './PageFrame';
import { useCompare, COMPARE_MIN, COMPARE_MAX } from '../state/CompareContext';
import { useDinoMap, resolveDinosaurs } from '../hooks/useDinoMap';
import { buildComparison } from '../data/compareData';
import { DietBadge, DangerBadge } from '../components/dino/dinoDisplay';
import FavoriteButton from '../components/dino/FavoriteButton';

// 维度 key → 图标，仅用于行首装饰；取值与排序全部来自 COMPARE_FIELDS
const ROW_ICONS = {
  size: Ruler,
  diet: Drumstick,
  era: Clock,
  speed: Gauge,
  danger: ShieldAlert,
};

export default function Compare() {
  const { compareIds, removeCompare, clearCompare } = useCompare();
  const { dinoMap, status, error } = useDinoMap();

  const { dinosaurs, missing } = useMemo(
    () => resolveDinosaurs(dinoMap, compareIds),
    [dinoMap, compareIds],
  );

  // 统一数据结构：页面不感知任何具体恐龙，只遍历 rows / cells 渲染
  const comparison = useMemo(
    () => (dinosaurs.length >= COMPARE_MIN ? buildComparison(dinosaurs) : null),
    [dinosaurs],
  );

  const dinoNameById = (id) => dinoMap.get(id)?.name ?? `#${id}`;

  return (
    <PageFrame
      eyebrow="SPECIES SHOWDOWN · 多维对比"
      title="恐龙对比台"
      intro="同时选择两到三只恐龙，从体型、食性、时代、速度与危险等级等维度横向比较。每一行的领先项由统一的数据规则自动标注。"
    >
      {status === 'loading' && (
        <p className="py-20 text-center font-serif text-bone/50" role="status">
          正在调取档案...
        </p>
      )}

      {status === 'error' && (
        <div className="border border-red-300/30 bg-red-950/30 p-8 text-center font-serif text-red-100">
          暂时无法连接档案服务：{error}
        </div>
      )}

      {status === 'ready' && compareIds.length === 0 && (
        <div className="flex flex-col items-center gap-4 border border-dashed border-bone/15 py-20 text-center">
          <GitCompareArrows className="h-10 w-10 text-bone/30" />
          <p className="font-serif text-bone/60">
            还没有选择对比对象，去图鉴卡片或表格中勾选 {COMPARE_MIN}~{COMPARE_MAX} 只恐龙吧
          </p>
          <Link
            to="/dinosaurs"
            className="border border-amber/50 px-4 py-2 font-serif text-sm tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
          >
            前往恐龙图鉴
          </Link>
        </div>
      )}

      {status === 'ready' && compareIds.length > 0 && dinosaurs.length < COMPARE_MIN && (
        <div className="flex flex-col items-center gap-4 border border-dashed border-amber/30 bg-amber/5 py-16 text-center">
          <GitCompareArrows className="h-9 w-9 text-amber/70" />
          <p className="font-serif text-bone/70">
            至少需要 {COMPARE_MIN} 只恐龙才能对比，当前只有 {dinosaurs.length} 只有效档案
          </p>
          <Link
            to="/dinosaurs"
            className="inline-flex items-center gap-2 border border-amber/50 px-4 py-2 font-serif text-sm tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
          >
            <ArrowLeft className="h-4 w-4" />
            继续选择
          </Link>
        </div>
      )}

      {status === 'ready' && comparison && (
        <div className="space-y-6">
          {/* 失效档案提示 */}
          {missing.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border border-red-400/30 bg-red-950/30 px-4 py-3">
              <p className="inline-flex items-center gap-2 font-serif text-sm text-red-200">
                <TriangleAlert className="h-4 w-4" />
                {missing.map((id) => `#${id}`).join('、')} 已被注销，已自动从对比中忽略
              </p>
              <button
                type="button"
                onClick={clearCompare}
                className="border border-red-400/40 px-3 py-1 font-serif text-xs tracking-widest text-red-200 transition-colors hover:bg-red-500 hover:text-bone"
              >
                清空失效选择
              </button>
            </div>
          )}

          {/* 结论摘要：由 buildComparison 的 summary 自动生成 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-serif text-xs tracking-widest text-bone/45">维度领先：</span>
            {comparison.summary.map((item) =>
              item.dinoIds.map((id) => (
                <span
                  key={`${item.key}-${id}`}
                  className="inline-flex items-center gap-1.5 border border-amber/40 bg-amber/10 px-2.5 py-1 font-serif text-xs text-amber"
                >
                  <Crown className="h-3 w-3" />
                  {dinoNameById(id)} · {item.label}
                </span>
              )),
            )}
            <button
              type="button"
              onClick={clearCompare}
              className="ml-auto border border-bone/25 px-3 py-1.5 font-serif text-xs tracking-widest text-bone/60 transition-colors hover:border-red-400/60 hover:text-red-300"
            >
              清空对比
            </button>
          </div>

          {/* 对比表：列 = 恐龙，行 = 维度，全部由统一配置驱动 */}
          <div className="overflow-x-auto border border-bone/10 bg-jungle-900/60">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-bone/15">
                  <th className="w-36 px-5 py-4 text-left font-serif text-xs tracking-widest text-bone/45">
                    对比维度
                  </th>
                  {comparison.columns.map(({ id, dino }) => (
                    <th key={id} className="px-4 py-4 text-left align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-[10px] tracking-[0.3em] text-bone/40">
                            {dino.code}
                          </p>
                          <p className="mt-1 font-serif text-xl font-black text-bone">{dino.name}</p>
                          <p className="mt-0.5 font-display text-[11px] italic tracking-wider text-amber/70">
                            {dino.latin}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <DietBadge diet={dino.diet} />
                            <DangerBadge level={dino.dangerLevel} />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCompare(id)}
                          aria-label={`将 ${dino.name} 移出对比`}
                          className="shrink-0 border border-bone/15 p-1 text-bone/50 transition-colors hover:border-red-400/60 hover:text-red-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => {
                  const RowIcon = ROW_ICONS[row.icon] ?? Ruler;
                  return (
                    <tr key={row.key} className="border-b border-bone/5 last:border-0">
                      <th
                        scope="row"
                        className="px-5 py-5 text-left font-serif text-sm font-normal tracking-widest text-bone/55"
                      >
                        <span className="inline-flex items-center gap-2">
                          <RowIcon className="h-4 w-4 text-amber/80" />
                          {row.label}
                        </span>
                      </th>
                      {row.cells.map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-4 py-5 align-top transition-colors ${
                            cell.isBest ? 'bg-amber/10' : ''
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-serif text-sm ${
                                cell.isBest ? 'font-bold text-amber' : 'text-bone/85'
                              }`}
                            >
                              {cell.text}
                            </span>
                            {cell.isBest && (
                              <Crown className="h-3.5 w-3.5 text-amber" aria-label="该维度领先" />
                            )}
                          </div>
                          {cell.sub && (
                            <p className="mt-1 font-serif text-xs text-bone/50">{cell.sub}</p>
                          )}
                          {/* 危险等级：复用统一的点数可视化 */}
                          {row.key === 'danger' && cell.pips && (
                            <p className="mt-2">
                              <DangerPipsInline level={cell.pips} highlight={cell.isBest} />
                            </p>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* 收藏操作行：与状态管理联动，返回图鉴/收藏夹后状态保持一致 */}
                <tr className="border-t border-bone/10 bg-jungle-950/40">
                  <th
                    scope="row"
                    className="px-5 py-4 text-left font-serif text-xs tracking-widest text-bone/45"
                  >
                    操作
                  </th>
                  {comparison.columns.map(({ id, dino }) => (
                    <td key={id} className="px-4 py-4">
                      <FavoriteButton
                        dino={dino}
                        withLabel
                        className="border border-bone/25 px-4 py-2 hover:border-red-400/60"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="font-serif text-xs leading-relaxed text-bone/40">
            说明：食性为类别维度，无数值高低，故不标注领先；其余维度在存在差异时自动高亮领先项，
            并列第一会同时高亮。对比选择最多 {COMPARE_MAX} 只，可在任意图鉴页面调整。
          </p>
        </div>
      )}
    </PageFrame>
  );
}

// 局部小组件：避免在文件顶部新增过多依赖
function DangerPipsInline({ level, highlight }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`危险系数 ${level} / 5`}>
      {[1, 2, 3, 4, 5].map((point) => (
        <span
          key={point}
          className={`h-1.5 w-5 ${
            point <= level ? (highlight ? 'bg-amber' : 'bg-red-500/80') : 'bg-bone/15'
          }`}
        />
      ))}
    </span>
  );
}
