import { useEffect, useState } from 'react';
import PageFrame from './PageFrame';

const dangerLabels = ['安全', '低风险', '可控', '警戒', '高危', '极高危'];

export default function Dinosaurs() {
  const [dinosaurs, setDinosaurs] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/dinosaurs', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('无法读取恐龙档案');
        return response.json();
      })
      .then((payload) => {
        setDinosaurs(payload.data ?? []);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <PageFrame
      eyebrow="SPECIES ARCHIVE · 恐龙档案"
      title="恐龙图鉴"
      intro="查看岛上已登记物种、生活区域与当前状态。所有档案均由园区健康监测中心实时维护。"
    >
      {status === 'loading' && (
        <p className="font-serif text-bone/60" role="status">
          正在读取档案...
        </p>
      )}
      {status === 'error' && (
        <div className="border border-red-300/30 bg-red-950/30 p-6 font-serif text-red-100">
          暂时无法连接档案服务，请稍后重试。
        </div>
      )}
      {status === 'ready' && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dinosaurs.map((dinosaur) => (
            <article
              key={dinosaur.id}
              className="border border-bone/10 bg-jungle-900/70 p-6 transition-colors hover:border-amber/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-bone">{dinosaur.name}</h2>
                  <p className="mt-1 font-display text-xs tracking-widest text-amber/80">
                    {dinosaur.latin}
                  </p>
                </div>
                <span className="border border-amber/30 px-2 py-1 font-serif text-xs text-amber">
                  {dangerLabels[dinosaur.dangerLevel] ?? '未知'}
                </span>
              </div>
              <p className="mt-5 font-serif text-sm leading-relaxed text-bone/65">
                {dinosaur.description}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-bone/10 pt-5 font-serif text-sm">
                <div>
                  <dt className="text-bone/40">生存年代</dt>
                  <dd className="mt-1 text-bone/80">{dinosaur.era}</dd>
                </div>
                <div>
                  <dt className="text-bone/40">当前状态</dt>
                  <dd className="mt-1 text-amber">{dinosaur.status}</dd>
                </div>
                <div>
                  <dt className="text-bone/40">活动区域</dt>
                  <dd className="mt-1 text-bone/80">{dinosaur.habitat}</dd>
                </div>
                <div>
                  <dt className="text-bone/40">体型</dt>
                  <dd className="mt-1 text-bone/80">
                    {dinosaur.length} · {dinosaur.weight}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
