// 大盘 KPI 卡片
export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <article className="border border-bone/10 bg-jungle-900/70 p-6 transition-colors hover:border-amber/40">
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6 text-amber" />
        {sub && (
          <span className="font-serif text-[10px] tracking-widest text-bone/35">{sub}</span>
        )}
      </div>
      <p className="mt-5 font-serif text-xs tracking-widest text-bone/45">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-bone">{value}</p>
    </article>
  );
}
