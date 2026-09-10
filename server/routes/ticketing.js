import { Router } from 'express';
import {
  TICKET_TYPES,
  ORDER_STATUS,
  createOrder,
  getOrder,
  markOrderPaid,
  isOrderExpired,
  getAvailability,
  getDashboard,
  isValidDateStr,
  todayStr,
} from '../data/ticketing.js';

const router = Router();

// 最远可预约未来 60 天
const MAX_ADVANCE_DAYS = 60;

function daysFromToday(dateStr) {
  const today = new Date(`${todayStr()}T00:00:00`);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target - today) / 86400000);
}

// ───────────────────────── 票种列表 ─────────────────────────
router.get('/tickets/types', (_req, res) => {
  res.json({ code: 0, message: 'success', data: Object.values(TICKET_TYPES) });
});

// ───────────────────────── 月度余票日历 ─────────────────────────
// GET /api/tickets/calendar?month=2026-09
router.get('/tickets/calendar', (req, res) => {
  const month = String(req.query.month || '');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ code: 400, message: 'month 参数格式应为 YYYY-MM', data: null });
  }

  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const today = todayStr();

  const days = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateStr = `${month}-${String(d).padStart(2, '0')}`;
    const offset = daysFromToday(dateStr);
    // 过去日期与超出预约窗口的日期不可订
    if (offset < 0 || offset > MAX_ADVANCE_DAYS) {
      days.push({ date: dateStr, status: 'closed', remaining: 0, vipRemaining: 0 });
      continue;
    }
    days.push(getAvailability(dateStr));
  }

  res.json({ code: 0, message: 'success', data: { month, today, days } });
});

// ───────────────────────── 创建订单 ─────────────────────────
// POST /api/orders  { ticketType, visitDate, quantity, visitor: { name, phone, email, idNumber } }
router.post('/orders', (req, res) => {
  const { ticketType, visitDate, quantity, visitor } = req.body || {};

  // 票种校验
  if (!TICKET_TYPES[ticketType]) {
    return res.status(400).json({ code: 400, message: '无效的票种', data: null });
  }

  // 日期校验：必须为未来 60 天内的有效日期
  if (!isValidDateStr(visitDate)) {
    return res.status(400).json({ code: 400, message: '游览日期格式无效', data: null });
  }
  const offset = daysFromToday(visitDate);
  if (offset < 0) {
    return res.status(400).json({ code: 400, message: '不能预约过去的日期', data: null });
  }
  if (offset > MAX_ADVANCE_DAYS) {
    return res.status(400).json({ code: 400, message: `最多提前 ${MAX_ADVANCE_DAYS} 天预约`, data: null });
  }

  // 数量校验
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 6) {
    return res.status(400).json({ code: 400, message: '单笔订单限购 1-6 张', data: null });
  }

  // 游客信息校验
  const v = visitor || {};
  const errors = {};
  if (typeof v.name !== 'string' || v.name.trim().length < 2) {
    errors.name = '请填写游客姓名（至少 2 个字符）';
  }
  if (!/^1[3-9]\d{9}$/.test(String(v.phone || ''))) {
    errors.phone = '请填写有效的 11 位手机号';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.email || ''))) {
    errors.email = '请填写有效的邮箱地址';
  }
  if (!/^\d{17}[\dXx]$/.test(String(v.idNumber || ''))) {
    errors.idNumber = '请填写有效的 18 位身份证号';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ code: 400, message: '游客信息校验未通过', data: { errors } });
  }

  // 余票校验
  const availability = getAvailability(visitDate);
  const remainingForType = ticketType === 'vip' ? availability.vipRemaining : availability.remaining;
  if (remainingForType < qty) {
    return res.status(409).json({
      code: 409,
      message: `该日期余票不足（仅剩 ${remainingForType} 张），请调整数量或更换日期`,
      data: { remaining: remainingForType },
    });
  }

  const order = createOrder({
    ticketType,
    visitDate,
    quantity: qty,
    visitor: {
      name: v.name.trim(),
      phone: String(v.phone),
      email: String(v.email),
      idNumber: String(v.idNumber).toUpperCase(),
    },
  });

  res.status(201).json({ code: 0, message: '订单创建成功，请在 15 分钟内完成支付', data: order });
});

// ───────────────────────── 订单查询 ─────────────────────────
router.get('/orders/:id', (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  }
  res.json({
    code: 0,
    message: 'success',
    data: { ...order, expired: isOrderExpired(order) },
  });
});

// ───────────────────────── 模拟支付 ─────────────────────────
// POST /api/orders/:id/pay  { method: 'wechat' | 'alipay' | 'unionpay' }
const PAYMENT_METHODS = ['wechat', 'alipay', 'unionpay'];

router.post('/orders/:id/pay', (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  }
  if (order.status === ORDER_STATUS.PAID) {
    return res.status(409).json({ code: 409, message: '订单已支付，请勿重复操作', data: order });
  }
  if (isOrderExpired(order)) {
    return res.status(410).json({ code: 410, message: '订单已超时关闭，请重新下单', data: null });
  }

  const method = String(req.body?.method || '');
  if (!PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({ code: 400, message: '无效的支付方式', data: null });
  }

  // 模拟支付通道：约 12% 概率通道繁忙失败，前端可重试
  if (Math.random() < 0.12) {
    return res.status(502).json({ code: 502, message: '支付通道繁忙，请稍后重试', data: null });
  }

  const paid = markOrderPaid(order.id, method);
  res.json({ code: 0, message: '支付成功', data: paid });
});

// ───────────────────────── 管理大盘 ─────────────────────────
// GET /api/admin/dashboard?days=14
router.get('/admin/dashboard', (req, res) => {
  const days = Math.min(30, Math.max(7, Number(req.query.days) || 14));
  res.json({ code: 0, message: 'success', data: getDashboard(days) });
});

export default router;
