import { Check, Crown, Minus, Plus, Ticket } from 'lucide-react';

const TYPE_ICONS = { standard: Ticket, vip: Crown };

// 票种切换卡片（普通探险票 / VIP 探险票）+ 数量步进器
export default function TicketTypeSelector({ types, selected, onSelect, quantity, onQuantityChange }) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {types.map((t) => {
          const Icon = TYPE_ICONS[t.id] || Ticket;
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={`relative border p-6 text-left transition-all ${
                active
                  ? 'border-amber bg-amber/10 shadow-[0_0_30px_rgba(224,165,38,0.15)]'
                  : 'border-bone/10 bg-jungle-900/70 hover:border-amber/40'
              }`}
            >
              {t.id === 'vip' && (
                <span className="absolute right-4 top-4 bg-amber px-2 py-0.5 font-serif text-[10px] font-bold tracking-widest text-jungle-950">
                  限量
                </span>
              )}
              <Icon className={`h-7 w-7 ${active ? 'text-amber' : 'text-bone/50'}`} />
              <p className="mt-4 font-display text-[10px] tracking-[0.35em] text-bone/40">{t.nameEn}</p>
              <h3 className={`mt-1 font-serif text-xl font-bold ${active ? 'text-amber' : 'text-bone'}`}>
                {t.name}
              </h3>
              <p className="mt-2 font-display text-2xl font-bold text-bone">
                ¥ {t.price.toLocaleString()}
                <span className="ml-1 font-serif text-xs font-normal text-bone/40">/ 人</span>
              </p>
              <ul className="mt-4 space-y-2 border-t border-bone/10 pt-4">
                {t.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 font-serif text-xs text-bone/60">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-amber' : 'text-bone/30'}`} />
                    {perk}
                  </li>
                ))}
              </ul>
              <span
                className={`absolute bottom-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border ${
                  active ? 'border-amber bg-amber text-jungle-950' : 'border-bone/30 text-transparent'
                }`}
              >
                <Check className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>

      {/* 数量步进器 */}
      <div className="mt-5 flex items-center justify-between border border-bone/10 bg-jungle-900/70 px-6 py-4">
        <div>
          <p className="font-serif text-sm font-bold text-bone">购票数量</p>
          <p className="mt-0.5 font-serif text-xs text-bone/40">单笔订单限购 6 张</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="border border-bone/20 p-2 text-bone/70 transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="减少数量"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-display text-2xl font-bold text-amber">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(6, quantity + 1))}
            disabled={quantity >= 6}
            className="border border-bone/20 p-2 text-bone/70 transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="增加数量"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
