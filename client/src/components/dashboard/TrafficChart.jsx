import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { BASE_OPTIONS, CHART_COLORS, formatWan } from './chartSetup';

// 每日入园流量趋势：客流折线 + 收入柱线双轴混合图
export default function TrafficChart({ trend }) {
  const data = useMemo(
    () => ({
      labels: trend.map((t) => t.date.slice(5)), // MM-DD
      datasets: [
        {
          type: 'line',
          label: '入园人数',
          data: trend.map((t) => t.visitors),
          borderColor: CHART_COLORS.amber,
          backgroundColor: CHART_COLORS.amberSoft,
          pointBackgroundColor: CHART_COLORS.amber,
          pointRadius: 3,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: '票务收入（元）',
          data: trend.map((t) => t.revenue),
          backgroundColor: CHART_COLORS.greenSoft,
          hoverBackgroundColor: CHART_COLORS.green,
          borderRadius: 3,
          maxBarThickness: 22,
          yAxisID: 'y1',
        },
      ],
    }),
    [trend],
  );

  const options = useMemo(
    () => ({
      ...BASE_OPTIONS,
      plugins: {
        ...BASE_OPTIONS.plugins,
        tooltip: {
          ...BASE_OPTIONS.plugins.tooltip,
          callbacks: {
            label: (ctx) =>
              ctx.dataset.yAxisID === 'y'
                ? ` 入园人数：${ctx.parsed.y.toLocaleString()} 人`
                : ` 票务收入：¥ ${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: BASE_OPTIONS.scales.x,
        y: {
          ...BASE_OPTIONS.scales.y,
          position: 'left',
          title: { display: true, text: '人数', color: CHART_COLORS.boneDim, font: { size: 10 } },
        },
        y1: {
          ...BASE_OPTIONS.scales.y,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: CHART_COLORS.boneDim,
            font: { size: 10 },
            callback: (v) => formatWan(v),
          },
          title: { display: true, text: '收入', color: CHART_COLORS.boneDim, font: { size: 10 } },
        },
      },
    }),
    [],
  );

  return (
    <section className="border border-bone/10 bg-jungle-900/70 p-6">
      <header className="mb-5 flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-bone">每日入园流量趋势</h3>
        <span className="font-display text-[10px] tracking-[0.3em] text-bone/30">DAILY TRAFFIC</span>
      </header>
      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
