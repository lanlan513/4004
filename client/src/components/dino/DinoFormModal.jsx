import { useEffect, useMemo, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  latin: '',
  era: '',
  category: '',
  diet: '',
  dangerLevel: 3,
  lengthM: '',
  weightT: '',
  speedKmh: '',
  healthStatus: '',
  status: '',
  habitat: '',
  description: '',
};

function numberFromDino(value) {
  return value === undefined || value === null ? '' : String(value);
}

// 由详情数据回填表单
export function formFromDino(dino) {
  return {
    name: dino.name ?? '',
    latin: dino.latin ?? '',
    era: dino.era ?? '',
    category: dino.category ?? '',
    diet: dino.diet ?? '',
    dangerLevel: dino.dangerLevel ?? 3,
    lengthM: numberFromDino(dino.lengthM),
    weightT: numberFromDino(dino.weightT),
    speedKmh: numberFromDino(dino.speedKmh),
    healthStatus: dino.healthStatus ?? '',
    status: dino.status ?? '',
    habitat: dino.habitat ?? '',
    description: dino.description ?? '',
  };
}

// 表单控件统一样式
const fieldClass =
  'w-full border border-bone/15 bg-jungle-950/60 px-3 py-2 font-serif text-sm text-bone placeholder:text-bone/30 transition-colors focus:border-amber/70 focus:outline-none';

function Field({ label, required, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between font-serif text-xs tracking-widest text-bone/55">
        <span>
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </span>
        {hint && <span className="text-[10px] text-bone/35">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block font-serif text-xs text-red-400">{error}</span>}
    </label>
  );
}

// 新增 / 修改恐龙档案表单
export default function DinoFormModal({ mode, initial, meta, error, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(() => (initial ? formFromDino(initial) : EMPTY_FORM));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, saving]);

  // 服务端返回的字段错误并入本地提示
  useEffect(() => {
    if (error?.fieldErrors) setErrors((prev) => ({ ...prev, ...error.fieldErrors }));
  }, [error]);

  const isEdit = mode === 'edit';

  const selectOptions = useMemo(
    () => [
      { name: 'era', label: '生存年代', options: meta.eras },
      { name: 'category', label: '种类', options: meta.categories },
      { name: 'diet', label: '食性', options: meta.diets },
      { name: 'healthStatus', label: '健康状态', options: meta.healthStatuses },
      { name: 'status', label: '资产状态', options: meta.assetStatuses },
    ],
    [meta],
  );

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  // 提交前的轻量校验，最终以服务端校验为准
  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = '请填写至少 2 个字的名称';
    if (form.latin.trim().length < 2) next.latin = '请填写拉丁学名';
    for (const item of selectOptions) {
      if (!form[item.name]) next[item.name] = `请选择${item.label}`;
    }
    if (!(Number(form.lengthM) > 0)) next.lengthM = '体长需为大于 0 的数字';
    if (!(Number(form.weightT) > 0)) next.weightT = '体重需为大于 0 的数字';
    if (!(Number(form.speedKmh) > 0)) next.speedKmh = '速度需为大于 0 的数字';
    if (form.habitat.trim().length < 2) next.habitat = '请填写栖息区域';
    if (form.description.trim().length < 4) next.description = '请填写至少 4 个字的档案描述';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      dangerLevel: Number(form.dangerLevel),
      lengthM: Number(form.lengthM),
      weightT: Number(form.weightT),
      speedKmh: Number(form.speedKmh),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-jungle-950/85 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => !saving && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? `修改 ${initial?.name} 档案` : '新增恐龙档案'}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-amber/30 bg-jungle-900 shadow-[0_0_80px_rgba(224,165,38,0.15)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-bone/10 bg-jungle-900/95 p-6 backdrop-blur">
          <div>
            <p className="font-display text-[10px] tracking-[0.35em] text-amber/70">
              {isEdit ? `档案编号 ${initial.code}` : `新档案将编号为 ${meta.nextCode}`}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-bone">
              {isEdit ? `修改档案 · ${initial.name}` : '新增恐龙档案'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="关闭表单"
            className="border border-bone/15 p-2 text-bone/70 transition-colors hover:border-amber/50 hover:text-amber disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="中文名称" required error={errors.name}>
              <input
                className={fieldClass}
                value={form.name}
                maxLength={30}
                placeholder="例如：霸王龙"
                onChange={(e) => update('name', e.target.value)}
              />
            </Field>
            <Field label="拉丁学名" required error={errors.latin}>
              <input
                className={fieldClass}
                value={form.latin}
                maxLength={60}
                placeholder="例如：Tyrannosaurus rex"
                onChange={(e) => update('latin', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectOptions.slice(0, 3).map((item) => (
              <Field key={item.name} label={item.label} required error={errors[item.name]}>
                <select
                  className={fieldClass}
                  value={form[item.name]}
                  onChange={(e) => update(item.name, e.target.value)}
                >
                  <option value="">请选择</option>
                  {item.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="危险系数" required hint="1 安全 ~ 5 致命">
              <input
                type="range"
                min={meta.dangerRange?.min ?? 1}
                max={meta.dangerRange?.max ?? 5}
                step={1}
                value={form.dangerLevel}
                className="w-full accent-amber"
                onChange={(e) => update('dangerLevel', Number(e.target.value))}
              />
              <span className="mt-1 block text-center font-display text-xl font-bold text-amber">
                {form.dangerLevel}
              </span>
            </Field>
            <Field label="体长（米）" required error={errors.lengthM}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="60"
                className={fieldClass}
                value={form.lengthM}
                placeholder="例如：12.3"
                onChange={(e) => update('lengthM', e.target.value)}
              />
            </Field>
            <Field label="体重（吨）" required hint="1 吨 = 1000 千克" error={errors.weightT}>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="100"
                className={fieldClass}
                value={form.weightT}
                placeholder="例如：8.4"
                onChange={(e) => update('weightT', e.target.value)}
              />
            </Field>
            <Field
              label="速度（公里/小时）"
              required
              hint={`${meta.speedRange?.min ?? 0.1} ~ ${meta.speedRange?.max ?? 200}`}
              error={errors.speedKmh}
            >
              <input
                type="number"
                step="0.1"
                min={meta.speedRange?.min ?? 0.1}
                max={meta.speedRange?.max ?? 200}
                className={fieldClass}
                value={form.speedKmh}
                placeholder="例如：27"
                onChange={(e) => update('speedKmh', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="栖息区域" required error={errors.habitat}>
              <input
                className={fieldClass}
                value={form.habitat}
                maxLength={30}
                placeholder="例如：熔岩峡谷区"
                onChange={(e) => update('habitat', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {selectOptions.slice(3).map((item) => (
              <Field key={item.name} label={item.label} required error={errors[item.name]}>
                <select
                  className={fieldClass}
                  value={form[item.name]}
                  onChange={(e) => update(item.name, e.target.value)}
                >
                  <option value="">请选择</option>
                  {item.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>

          <Field label="档案描述" required error={errors.description}>
            <textarea
              rows={3}
              maxLength={500}
              className={`${fieldClass} resize-none`}
              value={form.description}
              placeholder="外形特征、习性与观光注意事项……"
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          {error && !error.fieldErrors && (
            <p className="flex items-center gap-2 border border-red-400/30 bg-red-950/40 px-3 py-2 font-serif text-sm text-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error.message}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-bone/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border border-bone/25 px-5 py-2 font-serif text-sm tracking-widest text-bone/70 transition-colors hover:border-bone/60 hover:text-bone disabled:opacity-40"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-amber px-6 py-2 font-serif text-sm font-bold tracking-widest text-jungle-950 transition-all hover:bg-amber-light disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? '提交中…' : isEdit ? '保存修改' : '建档入库'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
