import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Banknote,
  Crown,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import PageFrame from './PageFrame';
import StatCard from '../components/dashboard/StatCard';
import TrafficChart from '../components/dashboard/TrafficChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import DensityChart from '../components/dashboard/DensityChart';
import RecentOrders from '../components/dashboard/RecentOrders';

const RANGES = [
  { days: 7, label: '近 7 天' },
  { days: 14, label: '近 14 天' },
  { days: 30, label: '近 30 天' },
];

export default function Admin() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async (rangeDays) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/dashboard?days=${rangeDays}`);
      if (!res.ok) throw new Error('dashboard unavailable');
      const body = await res.json();
      setData(body.data);
      setUpdatedAt(new Date());
    } catch {
      setError('大盘数据加载失败，请确认 API 服务已启动后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
    // 每 60 秒自动刷新一次大盘数据
    const timer = setInterval(() => load(days), 60000);
    return () => clearInterval(timer);
  }, [days, load]);

  return (
    <PageFrame
      eyebrow="CONTROL CENTER · 经营大盘"
      title="运营数据大盘"
      intro="面向管理层的园区经营视图：每日入园流量、票务收入结构与各园区实时密度一览，数据每 60 秒自动刷新。"
    >
      {/* 工具栏：统计周期切换 + 刷新 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex border border-bone/15">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`px-5 py-2.5 font-serif text-sm tracking-wider transition-colors ${
                days === r.days
                  ? 'bg-amber font-bold text-jungle-950'
                  : 'text-bone/60 hover:text-amber'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {updatedAt && (
            <span className="font-serif text-xs text-bone/35">
              更新于 {updatedAt.toLocaleTimeString('zh-CN')}
            </span>
          )}
          <button
            type="button"
            onClick={() => load(days)}
            disabled={loading}
            className="flex items-center gap-2 border border-bone/20 px-4 py-2 font-serif text-sm text-bone/70 transition-colors hover:border-amber hover:text-amber disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex h-72 items-center justify-center text-amber">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 border border-red-500/30 bg-red-500/5">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="font-serif text-sm text-red-400">{error}</p>
        </div>
      ) : data ? (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          {/* KPI 卡片 */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="今日入园人数"
              value={data.kpis.todayVisitors.toLocaleString()}
              sub={`满载率 ${data.kpis.occupancyRate}%`}
            />
            <StatCard
              icon={Banknote}
              label="今日票务收入"
              value={`¥ ${data.kpis.todayRevenue.toLocaleString()}`}
              sub="含在线预订"
            />
            <StatCard
              icon={Activity}
              label={`周期累计客流（${days} 天）`}
              value={data.kpis.totalVisitors.toLocaleString()}
              sub={`总收入 ¥ ${(data.kpis.totalRevenue / 10000).toFixed(1)} 万`}
            />
            <StatCard
              icon={Crown}
              label="今日 VIP 占比"
              value={`${data.kpis.vipRatio}%`}
              sub="VIP 探险票"
            />
          </div>

          {/* 流量趋势（全宽） */}
          <TrafficChart trend={data.trafficTrend} />

          {/* 收入分布 + 园区密度 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart revenueByType={data.revenueByType} />
            <DensityChart zones={data.zoneDensity} />
          </div>

          {/* 最近订单 */}
          <RecentOrders orders={data.recentOrders} />
        </div>
      ) : null}
    </PageFrame>
  );
}
