import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Database, Shield, ArrowRight } from 'lucide-react';
import PageFrame from './PageFrame';
import { useEmergency } from '../emergency/EmergencyContext';

export default function Admin() {
  const [stats, setStats] = useState({ service: '检查中', count: '--' });
  const { gridOn } = useEmergency();

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
      intro="园区运营概览。这里展示当前 API 服务、物种档案与防御体系的实时状态，应急调度请进入指挥中心。"
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
          <Shield className={`h-7 w-7 ${gridOn ? 'text-emerald-400' : 'animate-siren-blink text-red-500'}`} />
          <p className="mt-6 font-serif text-sm text-bone/50">电网状态</p>
          <p
            className={`mt-2 font-serif text-2xl font-bold ${
              gridOn ? 'text-emerald-300' : 'text-red-400'
            }`}
          >
            {gridOn ? '全岛在线' : '已切断'}
          </p>
        </article>
      </div>

      <Link
        to="/security"
        className="group mt-6 flex items-center justify-between border border-red-500/40 bg-red-950/20 px-6 py-5 transition-colors hover:border-red-500 hover:bg-red-950/40"
      >
        <span>
          <span className="block font-serif text-lg font-bold text-red-200">紧急预警与防御响应</span>
          <span className="mt-1 block font-serif text-sm text-bone/55">
            警报状态机 · 防御控制面板 · 实时安全指数仪表盘
          </span>
        </span>
        <ArrowRight className="h-6 w-6 text-red-300 transition-transform group-hover:translate-x-1" />
      </Link>
    </PageFrame>
  );
}
