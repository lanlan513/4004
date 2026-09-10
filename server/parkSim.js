// 园区实时仿真：恐龙位置随机游走、电网状态与故障事件、环境遥测
import parkData from './data/park.js';

const TICK_MS = 2000;
const MAP_BOUNDS = { width: 1000, height: 640 };

// 射线法判断点是否在多边形内
function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

// 运行时状态
const fences = new Map(); // zoneId -> { status, voltage, current, updatedAt }
const dinosaurs = new Map(); // id -> 追踪个体（含位置与游走向量）
const events = []; // 最近事件日志（最多保留 30 条）
const environment = new Map(); // zoneId -> { temperature, humidity, visibility }

function pushEvent(type, message, zoneId = null) {
  events.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, message, zoneId, time: new Date().toISOString() });
  if (events.length > 30) events.pop();
}

function initState() {
  for (const zone of parkData.zones) {
    fences.set(zone.id, {
      status: 'on', // on | off | fault
      voltage: 10.2,
      current: 3.1,
      updatedAt: new Date().toISOString(),
    });
    environment.set(zone.id, {
      temperature: randomInRange(26, 31),
      humidity: randomInRange(70, 88),
      visibility: randomInRange(2.5, 8),
    });
  }
  for (const dino of parkData.trackedDinosaurs) {
    dinosaurs.set(dino.id, {
      ...dino,
      heading: randomInRange(0, Math.PI * 2),
      heartRate: Math.round(randomInRange(60, 110)),
    });
  }
  pushEvent('system', '园区 GIS 追踪系统上线，全部安全网格巡检完成');
}

// 单个恐龙游走一步：沿当前航向前进，越界则偏转航向
function moveDinosaur(dino) {
  const zone = parkData.zones.find((z) => z.id === dino.zoneId);
  if (!zone) return;

  // 电网断电或故障时个体活动加剧
  const fence = fences.get(dino.zoneId);
  const agitation = fence && fence.status !== 'on' ? 1.8 : 1;

  dino.heading += randomInRange(-0.6, 0.6);
  const step = dino.speed * agitation * (TICK_MS / 1000);
  const nextX = dino.x + Math.cos(dino.heading) * step;
  const nextY = dino.y + Math.sin(dino.heading) * step;

  if (
    pointInPolygon(nextX, nextY, zone.polygon) &&
    nextX > 20 && nextX < MAP_BOUNDS.width - 20 &&
    nextY > 20 && nextY < MAP_BOUNDS.height - 20
  ) {
    dino.x = Math.round(nextX * 10) / 10;
    dino.y = Math.round(nextY * 10) / 10;
  } else {
    // 撞墙：掉头并小幅随机
    dino.heading += Math.PI + randomInRange(-0.5, 0.5);
  }

  dino.heartRate = Math.max(
    48,
    Math.min(150, dino.heartRate + Math.round(randomInRange(-6, 6) * agitation)),
  );
}

function tick() {
  for (const dino of dinosaurs.values()) moveDinosaur(dino);

  for (const zone of parkData.zones) {
    // 环境遥测缓慢漂移
    const env = environment.get(zone.id);
    env.temperature = Math.round((env.temperature + randomInRange(-0.4, 0.4)) * 10) / 10;
    env.humidity = Math.round(Math.max(45, Math.min(98, env.humidity + randomInRange(-1.5, 1.5))));
    env.visibility = Math.round(Math.max(0.5, Math.min(10, env.visibility + randomInRange(-0.3, 0.3))) * 10) / 10;

    // 通电中的电网有小概率故障
    const fence = fences.get(zone.id);
    if (fence.status === 'on' && Math.random() < 0.02) {
      fence.status = 'fault';
      fence.voltage = Math.round(randomInRange(0.4, 2.2) * 10) / 10;
      fence.current = 0;
      fence.updatedAt = new Date().toISOString();
      pushEvent('fault', `${zone.name}（${zone.code}）电网故障，电压骤降`, zone.id);
    } else if (fence.status === 'on') {
      // 正常电压在 9.8~10.8kV 间波动
      fence.voltage = Math.round(randomInRange(9.8, 10.8) * 10) / 10;
      fence.current = Math.round(randomInRange(2.8, 3.6) * 10) / 10;
    }
  }
}

initState();
setInterval(tick, TICK_MS).unref();

function zoneDinoCount(zoneId) {
  let count = 0;
  for (const dino of dinosaurs.values()) if (dino.zoneId === zoneId) count += 1;
  return count;
}

export function getOverview() {
  return parkData.zones.map((zone) => ({
    id: zone.id,
    code: zone.code,
    name: zone.name,
    species: zone.species,
    dangerLevel: zone.dangerLevel,
    polygon: zone.polygon,
    fence: fences.get(zone.id),
    dinoCount: zoneDinoCount(zone.id),
  }));
}

export function getZoneDetail(zoneId) {
  const zone = parkData.zones.find((z) => z.id === zoneId);
  if (!zone) return null;
  return {
    ...zone,
    fence: fences.get(zone.id),
    environment: environment.get(zone.id),
    dinosaurs: [...dinosaurs.values()]
      .filter((d) => d.zoneId === zoneId)
      .map(({ id, name, species, x, y, heartRate }) => ({ id, name, species, x, y, heartRate })),
  };
}

export function getTracking() {
  return [...dinosaurs.values()].map(({ id, name, species, zoneId, x, y, heartRate }) => ({
    id, name, species, zoneId, x, y, heartRate,
  }));
}

export function getEvents() {
  return events;
}

// 电网操作：on 通电 / off 断电 / repair 修复故障
export function setFence(zoneId, action) {
  const zone = parkData.zones.find((z) => z.id === zoneId);
  const fence = fences.get(zoneId);
  if (!zone || !fence) return { error: 'not_found' };

  if (action === 'repair' && fence.status !== 'fault') {
    return { error: 'invalid_action', message: '仅故障状态可执行修复' };
  }
  if ((action === 'on' || action === 'off') && fence.status === 'fault') {
    return { error: 'invalid_action', message: '电网故障中，请先执行修复' };
  }

  if (action === 'on') {
    fence.status = 'on';
    fence.voltage = 10.2;
    fence.current = 3.1;
    pushEvent('fence', `${zone.name}（${zone.code}）电网已通电`, zoneId);
  } else if (action === 'off') {
    fence.status = 'off';
    fence.voltage = 0;
    fence.current = 0;
    pushEvent('fence', `${zone.name}（${zone.code}）电网已断电`, zoneId);
  } else if (action === 'repair') {
    fence.status = 'on';
    fence.voltage = 10.2;
    fence.current = 3.1;
    pushEvent('repair', `${zone.name}（${zone.code}）电网故障已修复并恢复供电`, zoneId);
  } else {
    return { error: 'invalid_action', message: '支持的操作：on / off / repair' };
  }

  fence.updatedAt = new Date().toISOString();
  return { fence };
}
