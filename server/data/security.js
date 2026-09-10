// 园区安全展区与突发事件模板（内存数据，供应急指挥模块模拟调度）

export const zones = [
  { id: 'z1', code: 'P-01', name: '霸王龙展区' },
  { id: 'z2', code: 'P-02', name: '迅猛龙围场' },
  { id: 'z3', code: 'P-03', name: '湖滨草原区' },
  { id: 'z4', code: 'VC-1', name: '游客中心' },
  { id: 'z5', code: 'LB-2', name: '基因实验室' },
  { id: 'z6', code: 'GR-0', name: '中央电网与滨海码头' },
];

// severity: 1-4，数值越高越危险；escape 为脱逃类事件，直接触发一级警报
export const incidentTemplates = [
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

// 随机生成一起突发事件（带服务端时间戳，客户端拉取失败时使用本地同构数据兜底）
export function randomIncident() {
  const zone = zones[Math.floor(Math.random() * zones.length)];
  const template = incidentTemplates[Math.floor(Math.random() * incidentTemplates.length)];

  return {
    id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    at: new Date().toISOString(),
    zoneId: zone.id,
    zone: zone.name,
    ...template,
  };
}
