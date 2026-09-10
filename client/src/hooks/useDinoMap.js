import { useEffect, useMemo, useState } from 'react';
import { fetchDinosaurs } from '../api/dinosaurs';

// 按 id 列表批量获取恐龙档案：一次拉全量列表后本地索引，
// 收藏夹与对比页共用，避免逐只请求造成 N 次往返。
// 返回 { dinoMap, status, error, reload }
export function useDinoMap() {
  const [dinoMap, setDinoMap] = useState(() => new Map());
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  const reload = () => {
    const controller = new AbortController();
    setStatus('loading');
    fetchDinosaurs({}, controller.signal)
      .then((payload) => {
        const map = new Map((payload.data ?? []).map((dino) => [dino.id, dino]));
        setDinoMap(map);
        setError('');
        setStatus('ready');
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message);
          setStatus('error');
        }
      });
    return () => controller.abort();
  };

  useEffect(reload, []);

  return useMemo(() => ({ dinoMap, status, error, reload }), [dinoMap, status, error]);
}

// 依据 id 顺序解析出仍存在的档案，missing 为已被注销的 id
export function resolveDinosaurs(dinoMap, ids) {
  const dinosaurs = [];
  const missing = [];
  ids.forEach((id) => {
    const dino = dinoMap.get(id);
    if (dino) dinosaurs.push(dino);
    else missing.push(id);
  });
  return { dinosaurs, missing };
}
