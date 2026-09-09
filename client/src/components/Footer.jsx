import { MapPin, Phone, Mail, Youtube, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICE_LINKS = [
  { label: '门票预订', href: '/tickets' },
  { label: '观光路线', href: '/tours' },
  { label: '恐龙图鉴', href: '/dinosaurs' },
];
const ADMIN_LINKS = [{ label: '恐龙档案管理', href: '/admin' }];

function ClawMark({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
        <line x1="7" y1="26" x2="12" y2="6" />
        <line x1="16" y1="27" x2="17" y2="5" />
        <line x1="25" y1="26" x2="22" y2="6" />
      </g>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-amber/15 bg-jungle-950">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* 品牌区 */}
          <div>
            <div className="flex items-center gap-3">
              <ClawMark className="h-8 w-8 text-amber" />
              <span className="leading-none">
                <span className="block font-display text-lg font-bold tracking-[0.28em] text-bone">
                  JURASSIC
                </span>
                <span className="mt-1 block font-serif text-[10px] tracking-[0.42em] text-amber/80">
                  侏罗纪公园
                </span>
              </span>
            </div>
            <p className="mt-5 font-serif text-sm leading-relaxed text-bone/55">
              国际基因技术公司（InGen）运营，
              致力于复活史前生物并打造全球最震撼的生态观光目的地。
            </p>
            <div className="mt-6 flex gap-4">
              {[
                { Icon: Youtube, label: 'YouTube' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Twitter, label: 'Twitter' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href={`https://www.${label.toLowerCase()}.com/`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center border border-bone/20 text-bone/60 transition-all duration-300 hover:border-amber hover:text-amber"
                  aria-label={`访问 ${label}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 观光服务 */}
          <div>
            <h3 className="font-serif text-base font-bold tracking-[0.3em] text-amber">观光服务</h3>
            <ul className="mt-5 space-y-3">
              {SERVICE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-serif text-sm text-bone/60 transition-colors hover:text-amber"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 园区管理 */}
          <div>
            <h3 className="font-serif text-base font-bold tracking-[0.3em] text-amber">园区管理</h3>
            <ul className="mt-5 space-y-3">
              {ADMIN_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-serif text-sm text-bone/60 transition-colors hover:text-amber"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="font-serif text-base font-bold tracking-[0.3em] text-amber">联系我们</h3>
            <ul className="mt-5 space-y-4 font-serif text-sm text-bone/60">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber/80" />
                哥斯达黎加共和国 · 努布拉岛
                <br />
                侏罗纪世界游客中心
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-amber/80" />
                +506-8791-JURASSIC
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-amber/80" />
                tour@jurassic-world.isla
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权条 */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-bone/10 pt-7 md:flex-row">
          <p className="font-serif text-xs tracking-wider text-bone/40">
            © 2026 侏罗纪世界 · International Genetic Technologies, Inc. 版权所有
          </p>
          <p className="flex items-center gap-2 font-serif text-xs tracking-wider text-bone/40">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            如遇园区警报，请沿琥珀色指示灯前往最近的避难所
          </p>
        </div>
      </div>
    </footer>
  );
}
