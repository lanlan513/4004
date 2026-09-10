// 票务与运营数据（内存仓库，后续可替换为数据库）
// 历史经营数据通过确定性伪随机生成：同一日期每次重启后得到相同数据，便于演示与测试。

// ───────────────────────────── 票种定义 ─────────────────────────────
export const TICKET_TYPES = {
  standard: {
    id: 'standard',
    name: '普通探险票',
    nameEn: 'STANDARD PASS',
    price: 680,
    perks: ['一条自选观光路线', '全程安全讲解', '游客中心服务', '园区观光车（单次）'],
  },
  vip: {
    id: 'vip',
    name: 'VIP 探险票',
    nameEn: 'VIP EXPEDITION',
    price: 1880,
    perks: ['全部观光路线不限次', '迅猛龙围场近距离观测', '专属向导与优先通道', '琥珀餐厅双人下午茶', '夜间 Safari 专场'],
  },
};

// 每日配额
export const DAILY_QUOTA = 3000; // 全园每日最大接待量
export const VIP_DAILY_QUOTA = 300; // VIP 每日限量

// ───────────────────────────── 园区定义 ─────────────────────────────
export const ZONES = [
  { id: 'gate', name: '主入口广场', capacity: 600 },
  { id: 'trex', name: '霸王龙围场', capacity: 400 },
  { id: 'raptor', name: '迅猛龙研究区', capacity: 300 },
  { id: 'aviary', name: '翼龙穹顶', capacity: 350 },
  { id: 'lagoon', name: '沧龙泻湖', capacity: 380 },
  { id: 'plains', name: '草食龙草原', capacity: 500 },
];

// ─────────────────────── 确定性伪随机工具 ───────────────────────
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 以日期字符串为种子，保证同一天的数据恒定
function rngFor(dateStr, salt = '') {
  return mulberry32(hashString(`${dateStr}::${salt}`));
}

// ───────────────────────────── 日期工具 ─────────────────────────────
export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function isValidDateStr(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00`).getTime());
}

// ─────────────────────── 历史经营数据（种子生成） ───────────────────────
// 周末与节假日客流更高，整体带增长趋势与随机波动
function seededDailyStats(dateStr) {
  const rng = rngFor(dateStr, 'daily');
  const date = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const base = isWeekend ? 2350 : 1650;
  const visitors = Math.round(base + rng() * 700 - 200);

  const vipRatio = 0.08 + rng() * 0.07; // VIP 占比 8% ~ 15%
  const vipCount = Math.round(visitors * vipRatio);
  const standardCount = visitors - vipCount;
  const revenue = vipCount * TICKET_TYPES.vip.price + standardCount * TICKET_TYPES.standard.price;

  // 园区热度权重 + 当日扰动，归一化后分配到各园区
  const zoneWeights = ZONES.map((z) => {
    const popularity = { trex: 1.0, raptor: 0.85, lagoon: 0.8, aviary: 0.7, plains: 0.65, gate: 0.55 }[z.id];
    return popularity * (0.75 + rng() * 0.5);
  });
  const weightSum = zoneWeights.reduce((a, b) => a + b, 0);
  const zones = ZONES.map((z, i) => ({
    zoneId: z.id,
    visitors: Math.round((visitors * zoneWeights[i]) / weightSum),
  }));

  return { date: dateStr, visitors, revenue, standardCount, vipCount, zones };
}

const dailyCache = new Map();
export function getDailyStats(dateStr) {
  if (!dailyCache.has(dateStr)) {
    dailyCache.set(dateStr, seededDailyStats(dateStr));
  }
  return dailyCache.get(dateStr);
}

// ───────────────────────────── 运行时订单 ─────────────────────────────
// 真实下单的订单保存在内存中，会占用对应日期的余票并计入大盘统计
const orders = new Map();
let orderSeq = 0;

export const ORDER_STATUS = {
  PENDING: 'pending_payment',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

// 待支付订单 15 分钟超时
export const ORDER_EXPIRE_MS = 15 * 60 * 1000;

export function createOrder({ ticketType, visitDate, quantity, visitor }) {
  orderSeq += 1;
  const now = new Date();
  const id = `JP${toDateStr(now).replaceAll('-', '')}${String(orderSeq).padStart(4, '0')}`;
  const order = {
    id,
    ticketType,
    visitDate,
    quantity,
    visitor,
    amount: TICKET_TYPES[ticketType].price * quantity,
    status: ORDER_STATUS.PENDING,
    paymentMethod: null,
    createdAt: now.toISOString(),
    paidAt: null,
    expiresAt: new Date(now.getTime() + ORDER_EXPIRE_MS).toISOString(),
  };
  orders.set(id, order);
  return order;
}

export function getOrder(id) {
  return orders.get(id) || null;
}

// 支付成功，返回更新后的订单；订单状态非法时抛出错误
export function markOrderPaid(id, method) {
  const order = orders.get(id);
  if (!order) return null;
  order.status = ORDER_STATUS.PAID;
  order.paymentMethod = method;
  order.paidAt = new Date().toISOString();
  return order;
}

export function isOrderExpired(order) {
  return order.status === ORDER_STATUS.PENDING && Date.now() > new Date(order.expiresAt).getTime();
}

// 指定日期已被运行时订单占用的票数（待支付未超时 + 已支付）
export function runtimeBookedCount(visitDate, ticketType = null) {
  let count = 0;
  for (const o of orders.values()) {
    if (o.visitDate !== visitDate) continue;
    if (ticketType && o.ticketType !== ticketType) continue;
    if (o.status === ORDER_STATUS.PAID || (o.status === ORDER_STATUS.PENDING && !isOrderExpired(o))) {
      count += o.quantity;
    }
  }
  return count;
}

// ───────────────────────────── 余票查询 ─────────────────────────────
// 未来日期的“已被预订量”同样由种子生成（模拟提前购票），越临近的日期订得越多
function seededBooked(dateStr) {
  const rng = rngFor(dateStr, 'booking');
  const today = new Date(`${todayStr()}T00:00:00`);
  const target = new Date(`${dateStr}T00:00:00`);
  const daysAhead = Math.round((target - today) / 86400000);
  const urgency = Math.max(0, 1 - daysAhead / 45); // 越近订得越满
  const total = Math.round(DAILY_QUOTA * (0.15 + urgency * 0.55) * (0.7 + rng() * 0.6));
  const vip = Math.round(VIP_DAILY_QUOTA * (0.1 + urgency * 0.5) * (0.6 + rng() * 0.7));
  return {
    total: Math.min(total, DAILY_QUOTA),
    vip: Math.min(vip, VIP_DAILY_QUOTA),
  };
}

export function getAvailability(dateStr) {
  const seeded = seededBooked(dateStr);
  const runtimeTotal = runtimeBookedCount(dateStr);
  const runtimeVip = runtimeBookedCount(dateStr, 'vip');
  const remaining = Math.max(0, DAILY_QUOTA - seeded.total - runtimeTotal);
  const vipRemaining = Math.max(0, VIP_DAILY_QUOTA - seeded.vip - runtimeVip);
  return {
    date: dateStr,
    quota: DAILY_QUOTA,
    vipQuota: VIP_DAILY_QUOTA,
    remaining,
    vipRemaining,
    status: remaining <= 0 ? 'soldout' : 'open',
  };
}

// ───────────────────────────── 大盘统计 ─────────────────────────────
export function getDashboard(days = 14) {
  const today = todayStr();
  const trend = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(`${today}T00:00:00`);
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d);
    const seeded = getDailyStats(dateStr);

    // 今日数据叠加运行时真实订单：收入计今日成交票款，入园人数仅计当日游览订单
    let visitors = seeded.visitors;
    let revenue = seeded.revenue;
    let vipCount = seeded.vipCount;
    let standardCount = seeded.standardCount;
    if (dateStr === today) {
      for (const o of orders.values()) {
        if (o.status !== ORDER_STATUS.PAID) continue;
        revenue += o.amount;
        if (o.visitDate === today) {
          visitors += o.quantity;
          if (o.ticketType === 'vip') vipCount += o.quantity;
          else standardCount += o.quantity;
        }
      }
    }
    trend.push({ date: dateStr, visitors, revenue, vipCount, standardCount });
  }

  const todayStats = trend[trend.length - 1];
  const totalRevenue = trend.reduce((s, t) => s + t.revenue, 0);
  const totalVisitors = trend.reduce((s, t) => s + t.visitors, 0);

  // 收入分布（整个统计周期）
  const revenueByType = [
    {
      type: 'standard',
      name: TICKET_TYPES.standard.name,
      revenue: trend.reduce((s, t) => s + t.standardCount * TICKET_TYPES.standard.price, 0),
      visitors: trend.reduce((s, t) => s + t.standardCount, 0),
    },
    {
      type: 'vip',
      name: TICKET_TYPES.vip.name,
      revenue: trend.reduce((s, t) => s + t.vipCount * TICKET_TYPES.vip.price, 0),
      visitors: trend.reduce((s, t) => s + t.vipCount, 0),
    },
  ];

  // 今日各园区游客密度（当前在园 ≈ 全日客流的 40%~85%，随时间推移入园增多）
  const hour = new Date().getHours();
  const inParkRatio = Math.min(0.85, 0.4 + Math.max(0, hour - 8) * 0.055);
  const todaySeeded = getDailyStats(today);
  const zoneDensity = ZONES.map((z) => {
    const seededZone = todaySeeded.zones.find((x) => x.zoneId === z.id);
    const current = Math.round((seededZone?.visitors || 0) * inParkRatio);
    return {
      zoneId: z.id,
      name: z.name,
      capacity: z.capacity,
      current,
      density: Math.min(100, Math.round((current / z.capacity) * 100)),
    };
  });

  // 最近订单：运行时真实订单优先，不足时用种子数据补齐
  const recentOrders = [...orders.values()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map((o) => ({
      id: o.id,
      ticketType: o.ticketType,
      ticketName: TICKET_TYPES[o.ticketType].name,
      visitDate: o.visitDate,
      quantity: o.quantity,
      amount: o.amount,
      status: o.status,
      visitorName: o.visitor.name,
      createdAt: o.createdAt,
    }));

  if (recentOrders.length < 8) {
    const rng = rngFor(today, 'recent-orders');
    const surnames = ['林', '陈', '王', '李', '张', '周', '吴', '郑'];
    const given = ['伟', '芳', '娜', '敏', '静', '磊', '洋', '杰'];
    for (let i = recentOrders.length; i < 8; i += 1) {
      const type = rng() > 0.82 ? 'vip' : 'standard';
      const qty = 1 + Math.floor(rng() * 4);
      const hoursAgo = Math.floor(rng() * 10);
      const created = new Date(Date.now() - hoursAgo * 3600000 - Math.floor(rng() * 3600000));
      recentOrders.push({
        id: `JP${today.replaceAll('-', '')}S${String(100 + i)}`,
        ticketType: type,
        ticketName: TICKET_TYPES[type].name,
        visitDate: today,
        quantity: qty,
        amount: TICKET_TYPES[type].price * qty,
        status: 'paid',
        visitorName: `${surnames[Math.floor(rng() * surnames.length)]}${given[Math.floor(rng() * given.length)]}`,
        createdAt: created.toISOString(),
      });
    }
    recentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return {
    kpis: {
      todayVisitors: todayStats.visitors,
      todayRevenue: todayStats.revenue,
      totalVisitors,
      totalRevenue,
      occupancyRate: Math.round((todayStats.visitors / DAILY_QUOTA) * 100),
      vipRatio: Math.round((todayStats.vipCount / Math.max(1, todayStats.visitors)) * 100),
    },
    trafficTrend: trend,
    revenueByType,
    zoneDensity,
    recentOrders: recentOrders.slice(0, 8),
  };
}
