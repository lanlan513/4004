// 恐龙资产域常量：枚举、选项与字段约束

// 危险系数（1-5）
export const DANGER_MIN = 1;
export const DANGER_MAX = 5;
export const DANGER_LABELS = {
  1: '低危',
  2: '警戒',
  3: '高危',
  4: '极危',
  5: '致命',
};

// 食性
export const DIETS = ['肉食', '植食', '杂食'];

// 健康状态（园区健康监测中心维护）
export const HEALTH_STATUSES = ['健康', '观察', '治疗中', '隔离'];

// 资产状态（展区调度状态）
export const ASSET_STATUSES = ['展区开放', '轮换休整', '医疗观察', '隔离检疫', '离岛'];

// 种类（恐龙分类大类，供“种类”筛选）
export const CATEGORIES = [
  '兽脚类',
  '蜥脚类',
  '角龙类',
  '剑龙类',
  '甲龙类',
  '鸟脚类',
  '肿头龙类',
  '翼龙类',
];

// 生存年代
export const ERAS = [
  '三叠纪晚期',
  '侏罗纪早期',
  '侏罗纪晚期',
  '白垩纪早期',
  '白垩纪晚期',
];

// 体型分档（依据体长 lengthM，单位：米）
export const SIZE_TIERS = ['小型', '中型', '大型', '巨型'];

export function sizeTierOf(lengthM) {
  if (!(lengthM >= 3)) return '小型';
  if (lengthM < 9) return '中型';
  if (lengthM < 20) return '大型';
  return '巨型';
}

// 资产编号前缀
export const ASSET_PREFIX = 'DN';

// 列表接口允许的排序字段
export const SORTABLE_FIELDS = ['dangerLevel', 'lengthM', 'weightT', 'speedKmh', 'name', 'id'];

// 奔跑 / 飞行速度范围（公里/小时），供入参校验
export const SPEED_MIN = 0.1;
export const SPEED_MAX = 200;
