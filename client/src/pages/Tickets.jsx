import { Check, Mail, Ticket as TicketIcon } from 'lucide-react';
import PageFrame from './PageFrame';

const ticketTypes = [
  { title: '单日探险票', price: '¥ 680', detail: '适合首次到访，包含一条观光路线' },
  { title: '家庭探索票', price: '¥ 1,680', detail: '两位成人与两位儿童，包含家庭探索线' },
  { title: '全岛通行证', price: '¥ 1,280', detail: '当日不限次乘坐园区观光车' },
];

export default function Tickets() {
  return (
    <PageFrame
      eyebrow="ADMISSION · 入园凭证"
      title="票务中心"
      intro="入园名额会根据当日安全等级动态调整。提交预约意向后，游客中心会通过邮件确认具体时段。"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {ticketTypes.map((ticket) => (
          <article
            key={ticket.title}
            className="border border-bone/10 bg-jungle-900/70 p-7 transition-colors hover:border-amber/50"
          >
            <TicketIcon className="h-8 w-8 text-amber" />
            <h2 className="mt-7 font-serif text-2xl font-bold text-bone">{ticket.title}</h2>
            <p className="mt-4 font-display text-3xl font-bold text-amber">{ticket.price}</p>
            <p className="mt-4 font-serif text-sm leading-relaxed text-bone/65">{ticket.detail}</p>
            <ul className="mt-6 space-y-3 border-t border-bone/10 pt-5 font-serif text-sm text-bone/70">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber" />
                全程安全讲解
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber" />
                游客中心服务
              </li>
            </ul>
          </article>
        ))}
      </div>
      <a
        href="mailto:tour@jurassic-world.isla?subject=预约探险意向"
        className="mt-10 inline-flex items-center gap-3 bg-amber px-7 py-4 font-serif font-bold tracking-widest text-jungle-950 transition-transform hover:scale-105"
      >
        <Mail className="h-5 w-5" />
        联系游客中心预约
      </a>
    </PageFrame>
  );
}
