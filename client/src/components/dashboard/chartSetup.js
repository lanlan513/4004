import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

// 全局注册一次，供所有图表组件复用
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

// 与全站暗夜丛林主题一致的图表配色
export const CHART_COLORS = {
  amber: '#e0a526',
  amberSoft: 'rgba(224, 165, 38, 0.25)',
  green: '#3a7a59',
  greenSoft: 'rgba(58, 122, 89, 0.55)',
  bone: '#e9e3d0',
  boneDim: 'rgba(233, 227, 208, 0.45)',
  grid: 'rgba(233, 227, 208, 0.08)',
  red: '#d95f4b',
};

export const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      labels: {
        color: CHART_COLORS.boneDim,
        font: { family: "'Noto Serif SC', serif", size: 11 },
        boxWidth: 14,
        boxHeight: 2,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(7, 17, 13, 0.95)',
      borderColor: 'rgba(224, 165, 38, 0.4)',
      borderWidth: 1,
      titleColor: CHART_COLORS.amber,
      bodyColor: CHART_COLORS.bone,
      padding: 12,
      titleFont: { family: "'Noto Serif SC', serif" },
      bodyFont: { family: "'Noto Serif SC', serif" },
    },
  },
  scales: {
    x: {
      ticks: { color: CHART_COLORS.boneDim, font: { size: 10 } },
      grid: { color: CHART_COLORS.grid },
    },
    y: {
      ticks: { color: CHART_COLORS.boneDim, font: { size: 10 } },
      grid: { color: CHART_COLORS.grid },
    },
  },
};

export function formatWan(n) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : String(n);
}
