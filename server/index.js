import express from 'express';
import cors from 'cors';
import dinosaurs from './data/dinosaurs.js';

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'jurassic-park-api',
    time: new Date().toISOString(),
  });
});

// 恐龙列表
app.get('/api/dinosaurs', (_req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: dinosaurs,
    total: dinosaurs.length,
  });
});

// 恐龙详情
app.get('/api/dinosaurs/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      code: 400,
      message: '恐龙编号必须为正整数',
      data: null,
    });
  }

  const dino = dinosaurs.find((d) => d.id === id);

  if (!dino) {
    return res.status(404).json({
      code: 404,
      message: `未找到编号为 ${id} 的恐龙档案`,
      data: null,
    });
  }

  res.json({ code: 0, message: 'success', data: dino });
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
  └──────────────────────────────────────────────┘
  `);
});
