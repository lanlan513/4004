import { BadgeCheck } from 'lucide-react';

// 由订单号生成确定性的伪二维码图案（仅作取票凭证视觉展示）
function pseudoQrMatrix(seedText) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const size = 21;
  const cells = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      cells.push((h >>> 0) % 3 !== 0);
    }
  }
  // 三个角的定位框
  const finder = (cx, cy) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[(cy + y) * size + (cx + x)] = edge || core;
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return { size, cells };
}

export default function OrderSuccess({ order, ticketName, onRestart }) {
  const qr = pseudoQrMatrix(order.id);

  return (
    <div className="border border-amber/40 bg-jungle-900/70 p-8 text-center">
      <BadgeCheck className="mx-auto h-14 w-14 text-amber" />
      <h3 className="mt-5 font-serif text-2xl font-bold text-bone">支付成功，出票完成</h3>
      <p className="mt-2 font-serif text-sm text-bone/55">
        电子票凭证已发送至 {order.visitor.email}，入园时请出示下方取票码。
      </p>

      {/* 取票码 */}
      <div className="mx-auto mt-7 w-fit border border-bone/15 bg-bone p-4">
        <svg viewBox={`0 0 ${qr.size} ${qr.size}`} className="h-40 w-40" aria-label="取票码">
          {qr.cells.map((on, i) =>
            on ? (
              <rect
                key={i}
                x={i % qr.size}
                y={Math.floor(i / qr.size)}
                width="1"
                height="1"
                fill="#04090a"
              />
            ) : null,
          )}
        </svg>
      </div>

      <dl className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 border-t border-bone/10 pt-6 text-left font-serif text-sm">
        <dt className="text-bone/45">订单编号</dt>
        <dd className="text-right font-bold text-amber">{order.id}</dd>
        <dt className="text-bone/45">票种</dt>
        <dd className="text-right text-bone">{ticketName} × {order.quantity}</dd>
        <dt className="text-bone/45">游览日期</dt>
        <dd className="text-right text-bone">{order.visitDate}</dd>
        <dt className="text-bone/45">领队游客</dt>
        <dd className="text-right text-bone">{order.visitor.name}</dd>
        <dt className="text-bone/45">实付金额</dt>
        <dd className="text-right font-display text-lg font-bold text-amber">
          ¥ {order.amount.toLocaleString()}
        </dd>
      </dl>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 border border-amber/60 px-8 py-3 font-serif text-sm tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
      >
        再订一单
      </button>
    </div>
  );
}
