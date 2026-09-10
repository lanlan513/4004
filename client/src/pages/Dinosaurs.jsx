import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, SearchX } from 'lucide-react';
import PageFrame from './PageFrame';
import {
  createDino,
  deleteDino,
  fetchDinoMeta,
  fetchDinosaurs,
  updateDino,
} from '../api/dinosaurs';
import DinoFilterBar from '../components/dino/DinoFilterBar';
import DinoCardGrid from '../components/dino/DinoCardGrid';
import DinoTable from '../components/dino/DinoTable';
import DinoDetailModal from '../components/dino/DinoDetailModal';
import DinoFormModal from '../components/dino/DinoFormModal';
import ConfirmDialog from '../components/dino/ConfirmDialog';

const EMPTY_FILTERS = {
  search: '',
  category: '',
  diet: '',
  sizeTier: '',
  healthStatus: '',
  status: '',
  era: '',
  dangerMin: '',
  dangerMax: '',
};

const EMPTY_META = {
  diets: [],
  categories: [],
  eras: [],
  healthStatuses: [],
  assetStatuses: [],
  sizeTiers: [],
  dangerRange: { min: 1, max: 5 },
  dangerLabels: {},
  nextCode: '',
};

export default function Dinosaurs() {
  const [meta, setMeta] = useState(EMPTY_META);
  const [dinosaurs, setDinosaurs] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');

  const [view, setView] = useState('card'); // card | table
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('dangerLevel');
  const [order, setOrder] = useState('desc');

  // 弹窗状态：detail | form-create | form-edit | confirm
  const [detailDino, setDetailDino] = useState(null);
  const [formState, setFormState] = useState({ mode: null, dino: null });
  const [confirmDino, setConfirmDino] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState('');

  // 拉取枚举选项（仅一次）
  useEffect(() => {
    const controller = new AbortController();
    fetchDinoMeta(controller.signal)
      .then((payload) => setMeta(payload.data))
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('枚举选项加载失败:', error);
      });
    return () => controller.abort();
  }, []);

  // 搜索输入 300ms 防抖；筛选/排序变化立即生效
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // 组装查询参数
  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      category: filters.category,
      diet: filters.diet,
      sizeTier: filters.sizeTier,
      healthStatus: filters.healthStatus,
      status: filters.status,
      era: filters.era,
      dangerMin: filters.dangerMin,
      dangerMax: filters.dangerMax,
      sortBy,
      order,
    }),
    [debouncedSearch, filters, sortBy, order],
  );

  // 拉取列表
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    fetchDinosaurs(queryParams, controller.signal)
      .then((payload) => {
        setDinosaurs(payload.data ?? []);
        setTotal(payload.total ?? 0);
        setLoadError('');
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setLoadError(error.message);
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [queryParams]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleReset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  // 表头排序：同字段再次点击切换升降序，换字段默认降序
  const handleSort = useCallback(
    (field) => {
      if (field === sortBy) {
        setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
      } else {
        setSortBy(field);
        setOrder('desc');
      }
    },
    [sortBy],
  );

  // 列表本地更新（CRUD 成功后用最新数据刷新，保证排序/筛选一致）
  const refresh = useCallback(async () => {
    try {
      const payload = await fetchDinosaurs(queryParams);
      setDinosaurs(payload.data ?? []);
      setTotal(payload.total ?? 0);
    } catch (error) {
      setActionError(error.message);
    }
  }, [queryParams]);

  const handleFormSubmit = useCallback(
    async (values) => {
      setSaving(true);
      setFormError(null);
      try {
        if (formState.mode === 'create') {
          await createDino(values);
        } else {
          await updateDino(formState.dino.id, values);
        }
        setFormState({ mode: null, dino: null });
        setDetailDino(null);
        await refresh();
        // 新增记录可能不在当前筛选结果中，刷新 meta 以更新下一个编号
        fetchDinoMeta().then((payload) => setMeta(payload.data)).catch(() => {});
      } catch (error) {
        setFormError(error);
      } finally {
        setSaving(false);
      }
    },
    [formState, refresh],
  );

  const handleDelete = useCallback(async () => {
    if (!confirmDino) return;
    setSaving(true);
    setActionError('');
    try {
      await deleteDino(confirmDino.id);
      setConfirmDino(null);
      setDetailDino(null);
      await refresh();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  }, [confirmDino, refresh]);

  // 若表单/详情中的恐龙正好在当前列表中，同步最新数据
  useEffect(() => {
    if (!detailDino) return;
    const fresh = dinosaurs.find((d) => d.id === detailDino.id);
    if (fresh && fresh.updatedAt !== detailDino.updatedAt) setDetailDino(fresh);
  }, [dinosaurs, detailDino]);

  const barFilters = useMemo(() => ({ ...filters, options: meta }), [filters, meta]);

  return (
    <PageFrame
      eyebrow="SPECIES ARCHIVE · 资产与百科"
      title="恐龙资产图鉴"
      intro="园区全部恐龙资产的百科档案库：支持多条件组合筛选、关键字搜索与危险等级排序，管理人员可随时新增或修订档案。"
    >
      {/* 操作行 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif text-sm tracking-widest text-bone/50">
          资产库总量 <span className="font-display text-xl font-bold text-amber">{total}</span> 份
        </p>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setFormState({ mode: 'create', dino: null });
          }}
          className="inline-flex items-center gap-2 bg-amber px-5 py-2.5 font-serif text-sm font-bold tracking-widest text-jungle-950 transition-all hover:bg-amber-light hover:shadow-[0_0_28px_rgba(224,165,38,0.4)]"
        >
          <Plus className="h-4 w-4" />
          新增恐龙
        </button>
      </div>

      {/* 筛选工具栏 */}
      <DinoFilterBar
        filters={barFilters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        sortBy={sortBy}
        order={order}
        onSortFieldChange={(field) => {
          setSortBy(field);
          setOrder('desc');
        }}
        onToggleOrder={() => setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
        view={view}
        onViewChange={setView}
        resultCount={dinosaurs.length}
      />

      {actionError && (
        <div className="mt-4 border border-red-400/30 bg-red-950/40 px-4 py-3 font-serif text-sm text-red-200">
          {actionError}
        </div>
      )}

      <div className="mt-6">
        {status === 'error' && (
          <div className="border border-red-300/30 bg-red-950/30 p-8 text-center font-serif text-red-100">
            暂时无法连接档案服务：{loadError}。请稍后重试。
          </div>
        )}

        {status === 'loading' && (
          <p className="py-20 text-center font-serif text-bone/50" role="status">
            正在读取档案...
          </p>
        )}

        {status === 'ready' && dinosaurs.length === 0 && (
          <div className="flex flex-col items-center gap-4 border border-dashed border-bone/15 py-20 text-center">
            <SearchX className="h-10 w-10 text-bone/30" />
            <p className="font-serif text-bone/60">没有符合条件的恐龙档案</p>
            <button
              type="button"
              onClick={handleReset}
              className="border border-amber/50 px-4 py-2 font-serif text-sm tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
            >
              清除全部筛选
            </button>
          </div>
        )}

        {status === 'ready' && dinosaurs.length > 0 && (
          <div className="animate-fade-up">
            {view === 'card' ? (
              <DinoCardGrid
                dinosaurs={dinosaurs}
                onOpen={setDetailDino}
                onEdit={(dino) => {
                  setFormError(null);
                  setFormState({ mode: 'edit', dino });
                }}
              />
            ) : (
              <DinoTable
                dinosaurs={dinosaurs}
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
                onOpen={setDetailDino}
                onEdit={(dino) => {
                  setFormError(null);
                  setFormState({ mode: 'edit', dino });
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {detailDino && (
        <DinoDetailModal
          dino={dinosaurs.find((d) => d.id === detailDino.id) ?? detailDino}
          onClose={() => setDetailDino(null)}
          onEdit={(dino) => {
            setFormError(null);
            setFormState({ mode: 'edit', dino });
          }}
          onDelete={setConfirmDino}
        />
      )}

      {/* 新增 / 修改表单 */}
      {formState.mode && (
        <DinoFormModal
          mode={formState.mode}
          initial={formState.dino}
          meta={meta}
          error={formError}
          saving={saving}
          onClose={() => !saving && setFormState({ mode: null, dino: null })}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* 删除确认 */}
      <ConfirmDialog
        dino={confirmDino}
        busy={saving}
        onCancel={() => setConfirmDino(null)}
        onConfirm={handleDelete}
      />
    </PageFrame>
  );
}
