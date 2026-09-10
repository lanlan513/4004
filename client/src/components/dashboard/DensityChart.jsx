import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { BASE_OPTIONS, CHART_COLORS } from './chartSetup';

// 密度配色：>85% 拥挤红色，60-85% 繁忙琥珀，其余舒适绿色
function densityColor(pct) {
  if (pct > 85) return CHART_COLORS.red;
  if (pct >= 60) return CHART_COLORS.amber;
  return CHART_COLORS.green;
}

// 各园区实时游客密度（横向条形图）
export default function DensityChart({ zones }) {
  const data = useMemo(
    () => ({
      labels: zones.map((z) => z.name),
      datasets: [
        {
          label: '当前密度（%）',
          data: zones.map((z) => z.density),
          backgroundColor: zones.map((z) => densityColor(z.density)),
          borderRadius: 3,
          maxBarThickness: 22,
        },
      ],
    }),
    [zones],
  );

  const options = useMemo(
    () => ({
      ...BASE_OPTIONS,
      indexAxis: 'y',
      plugins: {
        ...BASE_OPTIONS.plugins,
        legend: { display: false },
        tooltip: {
          ...BASE_OPTIONS.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const z = zones[ctx.dataIndex];
              return ` 在园 ${z.current.toLocaleString()} / 容量 ${z.capacity}（${z.density}%）`;
            },
          },
        },
      },
      scales: {
        ...BASE_OPTIONS.scales,
        x: {
          ...BASE_OPTIONS.scales.x,
          max: 100,
          ticks: { ...BASE_OPTIONS.scales.x.ticks, callback: (v) => `${v}%` },
        },
      },
    }),
    [zones],
  );

  return (
    <section className="border border-bone/10 bg-jungle-900/70 p-6">
      <header className="mb-5 flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-bone">各园区游客密度</h3>
        <span className="font-display text-[10px] tracking-[0.3em] text-bone/30">ZONE DENSITY</span>
      </header>
      <div className="h-72">
        <Bar data={data} options={options} />
      </div>
      <footer className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-bone/10 pt-3 font-serif text-[11px] text-bone/45">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full" style={{ background: CHART_COLORS.green }} />
          舒适 &lt;60%
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full" style={{ background: CHART_COLORS.amber }} />
          繁忙 60-85%
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full" style={{ background: CHART_COLORS.red }} />
          拥挤 &gt;85%
        </span>
      </footer>
    </section>
  );
}
