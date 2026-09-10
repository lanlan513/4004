import express from 'express';
import cors from 'cors';
import {
  ASSET_STATUSES,
  CATEGORIES,
  DANGER_LABELS,
  DANGER_MAX,
  DANGER_MIN,
  DIETS,
  ERAS,
  HEALTH_STATUSES,
  SIZE_TIERS,
  SORTABLE_FIELDS,
  SPEED_MAX,
  SPEED_MIN,
} from './data/dinoConstants.js';
import { validateDino } from './data/dinoValidation.js';
import {
  createDino,
  findById,
  listAll,
  nextAssetCode,
  removeDino,
  updateDino,
} from './data/dinosaurStore.js';

const app = express();
// 端口优先级：环境变量 API_PORT（根目录 .env）> PORT > 默认 5000
const PORT = process.env.API_PORT || process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 统一成功 / 失败响应
const ok = (res, data, extra = {}) => res.json({ code: 0, message: 'success', data, ...extra });
const fail = (res, status, message, extra = {}) =>
  res.status(status).json({ code: status, message, data: null, ...extra });

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'jurassic-park-api',
    time: new Date().toISOString(),
  });
});

// 枚举选项（供前端筛选器与表单渲染）
app.get('/api/dinosaurs/meta', (_req, res) => {
  ok(res, {
    diets: DIETS,
    categories: CATEGORIES,
    eras: ERAS,
    healthStatuses: HEALTH_STATUSES,
    assetStatuses: ASSET_STATUSES,
    sizeTiers: SIZE_TIERS,
    dangerRange: { min: DANGER_MIN, max: DANGER_MAX },
    dangerLabels: DANGER_LABELS,
    speedRange: { min: SPEED_MIN, max: SPEED_MAX },
    nextCode: nextAssetCode(),
  });
});

// 解析正整数查询参数
function readIntQuery(value) {
  if (value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isInteger(num) ? num : undefined;
}

// 恐龙列表：多条件组合筛选 + 关键字搜索 + 危险等级排序
// 查询参数：search / diet / category / era / healthStatus / status / sizeTier
//          dangerMin / dangerMax / sortBy / order
app.get('/api/dinosaurs', (req, res) => {
  const {
    search = '',
    diet,
    category,
    era,
    healthStatus,
    status,
    sizeTier,
    sortBy = 'dangerLevel',
    order = 'desc',
  } = req.query;

  const dangerMin = readIntQuery(req.query.dangerMin);
  const dangerMax = readIntQuery(req.query.dangerMax);

  let rows = listAll();
  const total = rows.length;

  // 关键字搜索：中文名 / 拉丁学名 / 资产编号 / 栖息区域
  const keyword = String(search).trim().toLowerCase();
  if (keyword) {
    rows = rows.filter((d) =>
      [d.name, d.latin, d.code, d.habitat]
        .some((field) => String(field).toLowerCase().includes(keyword)),
    );
  }

  // 多条件组合筛选（等值匹配）
  const exactFilters = { diet, category, era, healthStatus, status, sizeTier };
  for (const [field, wanted] of Object.entries(exactFilters)) {
    if (wanted) rows = rows.filter((d) => d[field] === wanted);
  }

  // 危险系数区间
  if (dangerMin !== undefined) rows = rows.filter((d) => d.dangerLevel >= dangerMin);
  if (dangerMax !== undefined) rows = rows.filter((d) => d.dangerLevel <= dangerMax);

  // 排序（默认按危险系数降序）
  const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'dangerLevel';
  const direction = order === 'asc' ? 1 : -1;
  rows = [...rows].sort((a, b) => {
    if (a[field] < b[field]) return -1 * direction;
    if (a[field] > b[field]) return 1 * direction;
    return a.id - b.id;
  });

  res.json({
    code: 0,
    message: 'success',
    data: rows,
    total,
    filtered: rows.length,
  });
});

// 解析路径中的恐龙编号
function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// 新增恐龙档案
app.post('/api/dinosaurs', (req, res) => {
  const { ok: valid, data, errors } = validateDino(req.body);
  if (!valid) {
    return fail(res, 422, '档案校验未通过', { errors });
  }
  const created = createDino(data);
  res.status(201).json({ code: 0, message: '档案创建成功', data: created });
});

// 恐龙详情
app.get('/api/dinosaurs/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, '恐龙编号必须为正整数');

  const dino = findById(id);
  if (!dino) return fail(res, 404, `未找到编号为 ${id} 的恐龙档案`);

  ok(res, dino);
});

// 修改恐龙档案（支持部分字段更新）
app.put('/api/dinosaurs/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, '恐龙编号必须为正整数');

  const existing = findById(id);
  if (!existing) return fail(res, 404, `未找到编号为 ${id} 的恐龙档案`);

  const { ok: valid, data, errors } = validateDino(req.body, { partial: true });
  if (!valid) {
    return fail(res, 422, '档案校验未通过', { errors });
  }
  if (Object.keys(data).length === 0) {
    return fail(res, 400, '未提供任何需要更新的字段');
  }

  const updated = updateDino(id, data);
  res.json({ code: 0, message: '档案更新成功', data: updated });
});

// 删除恐龙档案
app.delete('/api/dinosaurs/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return fail(res, 400, '恐龙编号必须为正整数');

  const removed = removeDino(id);
  if (!removed) return fail(res, 404, `未找到编号为 ${id} 的恐龙档案`);

  ok(res, { id });
});

// 兜底 404
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

// 错误处理
app.use((err, _req, res, _next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

app.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────────┐
  │   侏罗纪公园 API 服务已启动                   │
  │   本地地址: http://localhost:${PORT}            │
  │   健康检查: http://localhost:${PORT}/api/health │
  │   资产接口: http://localhost:${PORT}/api/dinosaurs │
  └──────────────────────────────────────────────┘
  `);
});
