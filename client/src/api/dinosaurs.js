// 恐龙资产模块的 API 封装

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    const error = new Error(payload?.message || '请求失败，请稍后重试');
    error.status = response.status;
    error.fieldErrors = payload?.errors;
    throw error;
  }
  return payload;
}

// 读取枚举选项
export function fetchDinoMeta(signal) {
  return request('/api/dinosaurs/meta', { signal });
}

// 列表查询：组合筛选参数会自动跳过空值
export function fetchDinosaurs(params = {}, signal) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/dinosaurs${suffix}`, { signal });
}

export function createDino(body) {
  return request('/api/dinosaurs', { method: 'POST', body: JSON.stringify(body) });
}

// 详情：供收藏夹 / 对比页按 id 取完整档案
export function fetchDinoById(id) {
  return request(`/api/dinosaurs/${id}`);
}

export function updateDino(id, body) {
  return request(`/api/dinosaurs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteDino(id) {
  return request(`/api/dinosaurs/${id}`, { method: 'DELETE' });
}
