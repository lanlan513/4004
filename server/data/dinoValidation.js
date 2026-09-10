// 恐龙档案入参校验
import {
  ASSET_STATUSES,
  CATEGORIES,
  DANGER_MAX,
  DANGER_MIN,
  DIETS,
  ERAS,
  HEALTH_STATUSES,
  SPEED_MAX,
  SPEED_MIN,
} from './dinoConstants.js';

const NAME_MIN = 2;
const NAME_MAX = 30;
const LATIN_MAX = 60;
const HABITAT_MAX = 30;
const DESCRIPTION_MAX = 500;

function toTrimmedString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

// 校验数值：返回 { value, error }
function readNumber(value, field, label, { min, max }) {
  const num = typeof value === 'string' ? Number(value.trim()) : Number(value);
  if (value === '' || value === null || value === undefined || Number.isNaN(num)) {
    return { error: `${label}必须为数字` };
  }
  if (num < min || num > max) {
    return { error: `${label}必须在 ${min} ~ ${max} 之间` };
  }
  return { value: Number(num.toFixed(3)) };
}

function readEnum(value, allowed, field, label) {
  const text = toTrimmedString(value);
  if (!allowed.includes(text)) {
    return { error: `${label}必须为：${allowed.join('、')}` };
  }
  return { value: text };
}

/**
 * 校验请求体。partial=true 时仅校验提交的字段（用于 PUT 修改）。
 * 返回 { ok, data, errors }
 */
export function validateDino(body, { partial = false } = {}) {
  const errors = {};
  const source = body && typeof body === 'object' ? body : {};
  const out = {};

  const requireText = (field, label, { min = 1, max = 100 } = {}) => {
    if (!(field in source)) {
      if (!partial) errors[field] = `${label}不能为空`;
      return;
    }
    const text = toTrimmedString(source[field]);
    if (!text) {
      errors[field] = `${label}不能为空`;
    } else if (text.length < min) {
      errors[field] = `${label}至少 ${min} 个字符`;
    } else if (text.length > max) {
      errors[field] = `${label}不能超过 ${max} 个字符`;
    } else {
      out[field] = text;
    }
  };

  requireText('name', '名称', { min: NAME_MIN, max: NAME_MAX });
  requireText('latin', '拉丁学名', { min: 2, max: LATIN_MAX });
  requireText('habitat', '栖息区域', { min: 2, max: HABITAT_MAX });
  requireText('description', '档案描述', { min: 4, max: DESCRIPTION_MAX });

  const enumFields = [
    ['era', '生存年代', ERAS],
    ['category', '种类', CATEGORIES],
    ['diet', '食性', DIETS],
    ['healthStatus', '健康状态', HEALTH_STATUSES],
    ['status', '资产状态', ASSET_STATUSES],
  ];
  for (const [field, label, allowed] of enumFields) {
    if (!(field in source)) {
      if (!partial) errors[field] = `${label}不能为空`;
      continue;
    }
    const result = readEnum(source[field], allowed, field, label);
    if (result.error) errors[field] = result.error;
    else out[field] = result.value;
  }

  // 危险系数 1-5
  if ('dangerLevel' in source || !partial) {
    const result = readNumber(source.dangerLevel, 'dangerLevel', '危险系数', {
      min: DANGER_MIN,
      max: DANGER_MAX,
    });
    if (result.error) errors.dangerLevel = result.error;
    else out.dangerLevel = result.value;
  }

  // 体长（米）
  if ('lengthM' in source || !partial) {
    const result = readNumber(source.lengthM, 'lengthM', '体长', { min: 0.1, max: 60 });
    if (result.error) errors.lengthM = result.error;
    else out.lengthM = result.value;
  }

  // 体重（吨）
  if ('weightT' in source || !partial) {
    const result = readNumber(source.weightT, 'weightT', '体重', { min: 0.001, max: 100 });
    if (result.error) errors.weightT = result.error;
    else out.weightT = result.value;
  }

  // 奔跑 / 飞行速度（公里/小时）
  if ('speedKmh' in source || !partial) {
    const result = readNumber(source.speedKmh, 'speedKmh', '速度', {
      min: SPEED_MIN,
      max: SPEED_MAX,
    });
    if (result.error) errors.speedKmh = result.error;
    else out.speedKmh = result.value;
  }

  return { ok: Object.keys(errors).length === 0, data: out, errors };
}
