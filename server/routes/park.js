// 园区 GIS 地图与实时追踪 API
import { Router } from 'express';
import { getOverview, getZoneDetail, getTracking, getEvents, setFence } from '../parkSim.js';

const router = Router();

// 园区总览：全部安全网格 + 电网状态 + 在区恐龙数
router.get('/overview', (_req, res) => {
  res.json({ code: 0, message: 'success', data: getOverview() });
});

// 实时追踪：全部恐龙定位
router.get('/tracking', (_req, res) => {
  res.json({ code: 0, message: 'success', data: getTracking() });
});

// 最近事件日志
router.get('/events', (_req, res) => {
  res.json({ code: 0, message: 'success', data: getEvents() });
});

// 单个网格的局部监控数据
router.get('/zones/:id', (req, res) => {
  const detail = getZoneDetail(req.params.id);
  if (!detail) {
    return res.status(404).json({ code: 404, message: `未找到网格 ${req.params.id}`, data: null });
  }
  res.json({ code: 0, message: 'success', data: detail });
});

// 电网开关 / 故障修复
router.post('/zones/:id/fence', (req, res) => {
  const { action } = req.body ?? {};
  const result = setFence(req.params.id, action);
  if (result.error === 'not_found') {
    return res.status(404).json({ code: 404, message: `未找到网格 ${req.params.id}`, data: null });
  }
  if (result.error) {
    return res.status(400).json({ code: 400, message: result.message, data: null });
  }
  res.json({ code: 0, message: 'success', data: result.fence });
});

export default router;
