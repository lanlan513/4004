import { useEffect, useState } from 'react';
import { Activity, Database, Shield } from 'lucide-react';
import PageFrame from './PageFrame';

export default function Admin() {
  const [stats, setStats] = useState({ service: '检查中', count: '--' });

  useEffect(() => {
    Promise.all([fetch('/api/health'), fetch('/api/dinosaurs')])
      .then(async ([healthResponse, dinosaursResponse]) => {
        if (!healthResponse.ok || !dinosaursResponse.ok) throw new Error('service unavailable');
        const health = await healthResponse.json();
        const dinosaurs = await dinosaursResponse.json();
        setStats({ service: health.status === 'ok' ? '运行正常' : '异常', count: dinosaurs.total });
      })
      .catch(() => setStats({ service: '连接异常', count: '--' }));
  }, []);

  return (
    <PageFrame
      eyebrow="CONTROL CENTER · 管理入口"
      title="管理后台"
      intro="园区运营概览。这里展示当前 API 服务与物种档案的只读状态，实际调度仍需在内网控制台完成。"
    >
      <div className="grid gap-5 md:grid-cols-3">
        <article className="border border-bone/10 bg-jungle-900/70 p-6">
          <Activity className="h-7 w-7 text-amber" />
          <p className="mt-6 font-serif text-sm text-bone/50">API 服务</p>
          <p className="mt-2 font-serif text-2xl font-bold text-bone">{stats.service}</p>
        </article>
        <article className="border border-bone/10 bg-jungle-900/70 p-6">
          <Database className="h-7 w-7 text-amber" />
          <p className="mt-6 font-serif text-sm text-bone/50">已登记物种</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber">{stats.count}</p>
        </article>
        <article className="border border-bone/10 bg-jungle-900/70 p-6">
          <Shield className="h-7 w-7 text-amber" />
          <p className="mt-6 font-serif text-sm text-bone/50">电网状态</p>
          <p className="mt-2 font-serif text-2xl font-bold text-bone">全岛在线</p>
        </article>
      </div>
    </PageFrame>
  );
}
