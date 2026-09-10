// 应急指挥模块的本地同构数据：后端不可达时用于离线兜底，保证系统基础可用

export const FALLBACK_ZONES = [
  { id: 'z1', code: 'P-01', name: '霸王龙展区' },
  { id: 'z2', code: 'P-02', name: '迅猛龙围场' },
  { id: 'z3', code: 'P-03', name: '湖滨草原区' },
  { id: 'z4', code: 'VC-1', name: '游客中心' },
  { id: 'z5', code: 'LB-2', name: '基因实验室' },
  { id: 'z6', code: 'GR-0', name: '中央电网与滨海码头' },
];

const FALLBACK_TEMPLATES = [
  { type: '围栏震动报警', severity: 2 },
  { type: '生物异常躁动', severity: 2 },
  { type: '门禁异常开启', severity: 3 },
  { type: '监控摄像头离线', severity: 2 },
  { type: '未知生物信号', severity: 3 },
  { type: '游客越界警告', severity: 2 },
  { type: '台风红色预警', severity: 3 },
  { type: '围场声波封锁失效', severity: 3 },
  { type: '电网跳闸', severity: 3, gridFault: true },
  { type: '主电网负载异常', severity: 3, gridFault: true },
  { type: '探测到脱逃信号', severity: 4, escape: true },
  { type: '目击脱逃恐龙', severity: 4, escape: true },
];

export function localRandomIncident() {
  const zone = FALLBACK_ZONES[Math.floor(Math.random() * FALLBACK_ZONES.length)];
  const template = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
  return {
    id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
    zoneId: zone.id,
    zone: zone.name,
    ...template,
  };
}

// 电网离线时，优先投送脱逃类事件（呼应“断电→封锁失效”的世界观）
export function localEscapeIncident() {
  const zone = FALLBACK_ZONES[Math.floor(Math.random() * 4)];
  const template = FALLBACK_TEMPLATES.filter((t) => t.escape)[
    Math.floor(Math.random() * 2)
  ];
  return {
    id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
    zoneId: zone.id,
    zone: zone.name,
    ...template,
  };
}
