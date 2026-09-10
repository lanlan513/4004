import { ArrowUp, ArrowDown, Pencil, Eye } from 'lucide-react';
import { dangerMeta, DietBadge, HealthDot, formatWeight } from './dinoDisplay';
import FavoriteButton from './FavoriteButton';
import CompareCheckbox from './CompareCheckbox';

// 可排序表头
function SortableTh({ field, label, sortBy, order, onSort, className = '' }) {
  const active = sortBy === field;
  return (
    <th scope="col" className={`px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 font-serif text-xs font-normal tracking-widest transition-colors ${
          active ? 'text-amber' : 'text-bone/55 hover:text-bone'
        }`}
      >
        {label}
        {active && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

// 表格视图：表头点击即可排序（危险等级 / 体长 / 体重）
export default function DinoTable({ dinosaurs, sortBy, order, onSort, onOpen, onEdit }) {
  return (
    <div className="overflow-x-auto border border-bone/10 bg-jungle-900/60">
      <table className="w-full min-w-[1000px] border-collapse text-left">
        <thead className="border-b border-bone/15 bg-jungle-950/70">
          <tr>
            <th className="w-12 px-3 py-3" aria-label="加入对比">
              <span className="block text-center font-serif text-[10px] tracking-widest text-bone/40">
                对比
              </span>
            </th>
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">资产编号</th>
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">名称</th>
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">种类</th>
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">食性</th>
            <SortableTh
              field="dangerLevel"
              label="危险等级"
              sortBy={sortBy}
              order={order}
              onSort={onSort}
            />
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">体型</th>
            <SortableTh
              field="lengthM"
              label="体长(米)"
              sortBy={sortBy}
              order={order}
              onSort={onSort}
            />
            <SortableTh
              field="weightT"
              label="体重"
              sortBy={sortBy}
              order={order}
              onSort={onSort}
            />
            <SortableTh
              field="speedKmh"
              label="速度(km/h)"
              sortBy={sortBy}
              order={order}
              onSort={onSort}
            />
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">健康状态</th>
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">资产状态</th>
            <th className="px-4 py-3 font-serif text-xs tracking-widest text-bone/55">栖息区域</th>
            <th className="px-4 py-3 text-right font-serif text-xs tracking-widest text-bone/55">操作</th>
          </tr>
        </thead>
        <tbody>
          {dinosaurs.map((dino) => {
            const danger = dangerMeta(dino.dangerLevel);
            return (
              <tr
                key={dino.id}
                tabIndex={0}
                onClick={() => onOpen(dino)}
                className="cursor-pointer border-b border-bone/5 transition-colors last:border-0 hover:bg-amber/5 focus-visible:bg-amber/5 focus-visible:outline-none"
              >
                <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                  <span className="flex justify-center">
                    <CompareCheckbox dino={dino} />
                  </span>
                </td>
                <td className="px-4 py-3 font-display text-xs tracking-widest text-bone/45">
                  {dino.code}
                </td>
                <td className="px-4 py-3">
                  <span className="block font-serif text-sm font-bold text-bone">{dino.name}</span>
                  <span className="block font-display text-[10px] italic text-bone/40">{dino.latin}</span>
                </td>
                <td className="px-4 py-3 font-serif text-sm text-bone/75">{dino.category}</td>
                <td className="px-4 py-3">
                  <DietBadge diet={dino.diet} />
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex border px-2 py-0.5 font-serif text-xs ${danger.className}`}>
                    {danger.label} · {dino.dangerLevel}
                  </span>
                </td>
                <td className="px-4 py-3 font-serif text-sm text-bone/75">{dino.sizeTier}</td>
                <td className="px-4 py-3 font-serif text-sm text-bone/85">{dino.lengthM}</td>
                <td className="px-4 py-3 font-serif text-sm text-bone/75">
                  {formatWeight(dino.weightT)}
                </td>
                <td className="px-4 py-3 font-serif text-sm text-bone/85">{dino.speedKmh}</td>
                <td className="px-4 py-3">
                  <HealthDot status={dino.healthStatus} />
                </td>
                <td className="px-4 py-3 font-serif text-sm text-amber/90">{dino.status}</td>
                <td className="px-4 py-3 font-serif text-sm text-bone/70">{dino.habitat}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <span onClick={(event) => event.stopPropagation()}>
                      <FavoriteButton
                        dino={dino}
                        className="border border-bone/15 p-1.5 hover:border-red-400/60"
                      />
                    </span>
                    <button
                      type="button"
                      aria-label={`查看 ${dino.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(dino);
                      }}
                      className="border border-bone/15 p-1.5 text-bone/50 transition-colors hover:border-amber/60 hover:text-amber"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`修改 ${dino.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(dino);
                      }}
                      className="border border-bone/15 p-1.5 text-bone/50 transition-colors hover:border-amber/60 hover:text-amber"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
