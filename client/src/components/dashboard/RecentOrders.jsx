const STATUS_MAP = {
  paid: { label: '已支付', cls: 'border-amber/50 text-amber' },
  pending_payment: { label: '待支付', cls: 'border-bone/30 text-bone/60' },
  cancelled: { label: '已取消', cls: 'border-red-500/40 text-red-400' },
};

function formatTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

// 最近订单流水表
export default function RecentOrders({ orders }) {
  return (
    <section className="border border-bone/10 bg-jungle-900/70 p-6">
      <header className="mb-5 flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-bone">最近订单</h3>
        <span className="font-display text-[10px] tracking-[0.3em] text-bone/30">RECENT ORDERS</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] font-serif text-sm">
          <thead>
            <tr className="border-b border-bone/10 text-left text-xs tracking-widest text-bone/40">
              <th className="pb-3 pr-4 font-normal">订单号</th>
              <th className="pb-3 pr-4 font-normal">游客</th>
              <th className="pb-3 pr-4 font-normal">票种</th>
              <th className="pb-3 pr-4 font-normal">数量</th>
              <th className="pb-3 pr-4 font-normal">金额</th>
              <th className="pb-3 pr-4 font-normal">下单时间</th>
              <th className="pb-3 font-normal">状态</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const status = STATUS_MAP[o.status] || STATUS_MAP.pending_payment;
              return (
                <tr key={o.id} className="border-b border-bone/5 text-bone/75 transition-colors hover:bg-jungle-800/50">
                  <td className="py-3 pr-4 font-display text-xs tracking-wider text-bone/50">{o.id}</td>
                  <td className="py-3 pr-4">{o.visitorName}</td>
                  <td className="py-3 pr-4">{o.ticketName}</td>
                  <td className="py-3 pr-4">{o.quantity}</td>
                  <td className="py-3 pr-4 text-amber">¥ {o.amount.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-bone/50">{formatTime(o.createdAt)}</td>
                  <td className="py-3">
                    <span className={`inline-block border px-2 py-0.5 text-xs ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
