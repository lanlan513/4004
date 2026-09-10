import { Search, RotateCcw, LayoutGrid, Table2, ArrowDownWideNarrow } from 'lucide-react';

// 下拉筛选器统一样式
const selectClass =
  'border border-bone/15 bg-jungle-950/70 px-3 py-2 font-serif text-sm text-bone transition-colors focus:border-amber/70 focus:outline-none';

function SelectFilter({ label, value, onChange, options, ariaLabel }) {
  return (
    <select
      aria-label={ariaLabel ?? label}
      className={selectClass}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}（全部）</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// 多条件组合筛选 + 搜索 + 危险等级排序 + 视图切换
export default function DinoFilterBar({
  filters,
  onFilterChange,
  onReset,
  sortBy,
  order,
  onSortFieldChange,
  onToggleOrder,
  view,
  onViewChange,
  resultCount,
}) {
  const activeCount = Object.values(filters).filter((value) => value !== '').length;

  return (
    <div className="space-y-4 border border-bone/10 bg-jungle-900/60 p-4 md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* 搜索框 */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/40" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
            placeholder="搜索名称 / 拉丁学名 / 编号 / 区域…"
            aria-label="搜索恐龙档案"
            className="w-full border border-bone/15 bg-jungle-950/70 py-2 pl-10 pr-3 font-serif text-sm text-bone placeholder:text-bone/30 transition-colors focus:border-amber/70 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 排序 */}
          <label className="inline-flex items-center gap-2">
            <ArrowDownWideNarrow className="h-4 w-4 text-bone/45" aria-hidden />
            <select
              aria-label="排序字段"
              className={selectClass}
              value={sortBy}
              onChange={(event) => onSortFieldChange(event.target.value)}
            >
              <option value="dangerLevel">危险等级</option>
              <option value="lengthM">体长</option>
              <option value="weightT">体重</option>
              <option value="speedKmh">速度</option>
              <option value="name">名称</option>
            </select>
          </label>
          <button
            type="button"
            onClick={onToggleOrder}
            aria-label={order === 'desc' ? '当前降序，点击切换为升序' : '当前升序，点击切换为降序'}
            className="border border-bone/15 px-3 py-2 font-serif text-sm text-bone/80 transition-colors hover:border-amber/60 hover:text-amber"
          >
            {order === 'desc' ? '降序 ↓' : '升序 ↑'}
          </button>

          {/* 视图切换 */}
          <div className="flex border border-bone/15">
            <button
              type="button"
              onClick={() => onViewChange('card')}
              aria-pressed={view === 'card'}
              aria-label="切换到卡片图鉴视图"
              className={`p-2 transition-colors ${
                view === 'card' ? 'bg-amber text-jungle-950' : 'text-bone/60 hover:text-amber'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('table')}
              aria-pressed={view === 'table'}
              aria-label="切换到表格视图"
              className={`p-2 transition-colors ${
                view === 'table' ? 'bg-amber text-jungle-950' : 'text-bone/60 hover:text-amber'
              }`}
            >
              <Table2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 组合筛选行 */}
      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter
          label="种类"
          ariaLabel="按种类筛选"
          value={filters.category}
          onChange={(v) => onFilterChange('category', v)}
          options={filters.options.categories}
        />
        <SelectFilter
          label="食性"
          ariaLabel="按食性筛选"
          value={filters.diet}
          onChange={(v) => onFilterChange('diet', v)}
          options={filters.options.diets}
        />
        <SelectFilter
          label="体型"
          ariaLabel="按体型筛选"
          value={filters.sizeTier}
          onChange={(v) => onFilterChange('sizeTier', v)}
          options={filters.options.sizeTiers}
        />
        <SelectFilter
          label="健康状态"
          ariaLabel="按健康状态筛选"
          value={filters.healthStatus}
          onChange={(v) => onFilterChange('healthStatus', v)}
          options={filters.options.healthStatuses}
        />
        <SelectFilter
          label="资产状态"
          ariaLabel="按资产状态筛选"
          value={filters.status}
          onChange={(v) => onFilterChange('status', v)}
          options={filters.options.assetStatuses}
        />
        <SelectFilter
          label="生存年代"
          ariaLabel="按生存年代筛选"
          value={filters.era}
          onChange={(v) => onFilterChange('era', v)}
          options={filters.options.eras}
        />

        {/* 危险等级下限 */}
        <label className="inline-flex items-center gap-2">
          <span className="font-serif text-xs tracking-widest text-bone/45">危险系数</span>
          <select
            aria-label="危险系数下限"
            className={selectClass}
            value={filters.dangerMin}
            onChange={(event) => onFilterChange('dangerMin', event.target.value)}
          >
            <option value="">不限</option>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                ≥ {level}
              </option>
            ))}
          </select>
          <span className="font-serif text-xs text-bone/40">至</span>
          <select
            aria-label="危险系数上限"
            className={selectClass}
            value={filters.dangerMax}
            onChange={(event) => onFilterChange('dangerMax', event.target.value)}
          >
            <option value="">不限</option>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                ≤ {level}
              </option>
            ))}
          </select>
        </label>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 border border-bone/20 px-3 py-2 font-serif text-xs tracking-widest text-bone/60 transition-colors hover:border-red-400/60 hover:text-red-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            清除筛选（{activeCount}）
          </button>
        )}

        <span className="ml-auto font-serif text-xs tracking-widest text-bone/45">
          命中 <span className="text-amber">{resultCount}</span> 份档案
        </span>
      </div>
    </div>
  );
}
