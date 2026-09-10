import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { BASE_OPTIONS, CHART_COLORS } from './chartSetup';

// 票务收入分布：普通票 vs VIP 票（环形图，中心显示总收入）
export default function RevenueChart({ revenueByType }) {
  const total = revenueByType.reduce((s, r) => s + r.revenue, 0);

  const data = useMemo(
    () => ({
      labels: revenueByType.map((r) => r.name),
      datasets: [
        {
          data: revenueByType.map((r) => r.revenue),
          backgroundColor: [CHART_COLORS.green, CHART_COLORS.amber],
          hoverBackgroundColor: ['#4a9470', '#f5c95c'],
          borderColor: '#07110d',
          borderWidth: 3,
        },
      ],
    }),
    [revenueByType],
  );

  const options = useMemo(
    () => ({
      ...BASE_OPTIONS,
      cutout: '62%',
      plugins: {
        ...BASE_OPTIONS.plugins,
        legend: { ...BASE_OPTIONS.plugins.legend, position: 'bottom' },
        tooltip: {
          ...BASE_OPTIONS.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
              const visitors = revenueByType[ctx.dataIndex]?.visitors ?? 0;
              return ` ¥ ${ctx.parsed.toLocaleString()}（${pct}%）· ${visitors.toLocaleString()} 人次`;
            },
          },
        },
      },
    }),
    [revenueByType, total],
  );

  // 中心文字插件
  const centerText = useMemo(
    () => ({
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const x = (chartArea.left + chartArea.right) / 2;
        const y = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = CHART_COLORS.boneDim;
        ctx.font = "11px 'Noto Serif SC', serif";
        ctx.fillText('周期总收入', x, y - 12);
        ctx.fillStyle = CHART_COLORS.amber;
        ctx.font = "bold 18px 'Noto Serif SC', serif";
        ctx.fillText(`¥ ${(total / 10000).toFixed(1)} 万`, x, y + 12);
        ctx.restore();
      },
    }),
    [total],
  );

  return (
    <section className="border border-bone/10 bg-jungle-900/70 p-6">
      <header className="mb-5 flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-bone">票务收入分布</h3>
        <span className="font-display text-[10px] tracking-[0.3em] text-bone/30">REVENUE MIX</span>
      </header>
      <div className="h-72">
        <Doughnut data={data} options={options} plugins={[centerText]} />
      </div>
    </section>
  );
}
