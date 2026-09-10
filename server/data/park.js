// 园区 GIS 静态数据：安全网格（多边形）、监控探头、追踪恐龙
// 坐标系为 1000 x 640 的虚拟地图平面，前端 Canvas 按容器尺寸等比缩放

// 安全网格分区（多边形顶点按顺时针排列）
const zones = [
  {
    id: 'trex',
    code: 'SEC-01',
    name: '熔岩峡谷区',
    species: '霸王龙',
    dangerLevel: 5,
    polygon: [
      [70, 90],
      [360, 60],
      [430, 210],
      [300, 300],
      [90, 260],
    ],
    cameras: [
      { id: 'CAM-01A', name: '峡谷北瞭望塔', status: 'online' },
      { id: 'CAM-01B', name: '投喂平台云台', status: 'online' },
      { id: 'CAM-01C', name: '峡谷栈道枪机', status: 'offline' },
    ],
  },
  {
    id: 'raptor',
    code: 'SEC-02',
    name: '密林围场',
    species: '迅猛龙',
    dangerLevel: 4,
    polygon: [
      [470, 70],
      [880, 80],
      [925, 240],
      [700, 305],
      [480, 225],
    ],
    cameras: [
      { id: 'CAM-02A', name: '围场东门球机', status: 'online' },
      { id: 'CAM-02B', name: '密林红外阵列', status: 'online' },
      { id: 'CAM-02C', name: '观测地道探头', status: 'online' },
    ],
  },
  {
    id: 'fern',
    code: 'SEC-03',
    name: '蕨类平原',
    species: '三角龙 / 剑龙',
    dangerLevel: 2,
    polygon: [
      [60, 330],
      [320, 355],
      [345, 555],
      [130, 585],
      [40, 460],
    ],
    cameras: [
      { id: 'CAM-03A', name: '平原西侧杆塔', status: 'online' },
      { id: 'CAM-03B', name: '兽医站云台', status: 'online' },
    ],
  },
  {
    id: 'lake',
    code: 'SEC-04',
    name: '湖滨草原区',
    species: '腕龙',
    dangerLevel: 1,
    polygon: [
      [700, 360],
      [945, 320],
      [965, 545],
      [720, 580],
      [680, 445],
    ],
    cameras: [
      { id: 'CAM-04A', name: '湖岸观景平台', status: 'online' },
      { id: 'CAM-04B', name: '草原热成像塔', status: 'online' },
    ],
  },
  {
    id: 'visitor',
    code: 'SEC-00',
    name: '游客中心',
    species: '无（安全区）',
    dangerLevel: 0,
    polygon: [
      [390, 305],
      [640, 305],
      [660, 440],
      [365, 440],
    ],
    cameras: [
      { id: 'CAM-00A', name: '主广场全景', status: 'online' },
      { id: 'CAM-00B', name: '检票闸机阵列', status: 'online' },
      { id: 'CAM-00C', name: '避难所通道', status: 'online' },
    ],
  },
];

// 实时追踪恐龙（初始位置，仿真循环会持续更新）
const trackedDinosaurs = [
  { id: 'T-01', dinosaurId: 1, name: 'Rexy', species: '霸王龙', zoneId: 'trex', x: 240, y: 170, speed: 5.2 },
  { id: 'R-01', dinosaurId: 2, name: 'Blue', species: '迅猛龙', zoneId: 'raptor', x: 640, y: 160, speed: 9.5 },
  { id: 'R-02', dinosaurId: 2, name: 'Delta', species: '迅猛龙', zoneId: 'raptor', x: 720, y: 200, speed: 9.0 },
  { id: 'R-03', dinosaurId: 2, name: 'Echo', species: '迅猛龙', zoneId: 'raptor', x: 580, y: 130, speed: 8.6 },
  { id: 'B-01', dinosaurId: 3, name: '长歌', species: '腕龙', zoneId: 'lake', x: 810, y: 450, speed: 2.4 },
  { id: 'B-02', dinosaurId: 3, name: '云梯', species: '腕龙', zoneId: 'lake', x: 870, y: 500, speed: 2.1 },
  { id: 'K-01', dinosaurId: 4, name: '盾山', species: '三角龙', zoneId: 'fern', x: 190, y: 460, speed: 3.0 },
  { id: 'S-01', dinosaurId: 5, name: '板岩', species: '剑龙', zoneId: 'fern', x: 250, y: 500, speed: 2.6 },
];

export default { zones, trackedDinosaurs };
