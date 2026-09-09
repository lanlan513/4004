import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Ticket } from 'lucide-react';

const NAV_LINKS = [
  { label: '首页', href: '/' },
  { label: '恐龙图鉴', href: '/dinosaurs' },
  { label: '观光路线', href: '/tours' },
  { label: '票务中心', href: '/tickets' },
  { label: '管理后台', href: '/admin' },
];

// 爪痕 Logo
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || menuOpen
          ? 'border-b border-amber/15 bg-jungle-950/85 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <ClawMark className="h-8 w-8 text-amber transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
          <span className="leading-none">
            <span className="block font-display text-lg font-bold tracking-[0.28em] text-bone">
              JURASSIC
            </span>
            <span className="mt-1 block font-serif text-[10px] tracking-[0.42em] text-amber/80">
              侏罗纪公园
            </span>
          </span>
        </Link>

        {/* 桌面端导航 */}
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="group relative font-serif text-sm tracking-widest text-bone/75 transition-colors hover:text-amber"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-amber transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* 预约按钮 */}
        <Link
          to="/tickets"
          className="hidden items-center gap-2 border border-amber/60 px-5 py-2 font-serif text-sm tracking-widest text-amber transition-all duration-300 hover:bg-amber hover:text-jungle-950 hover:shadow-[0_0_24px_rgba(224,165,38,0.45)] md:inline-flex"
        >
          <Ticket className="h-4 w-4" />
          预约探险
        </Link>

        {/* 移动端菜单按钮 */}
        <button
          type="button"
          className="text-bone md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="切换菜单"
        >
          {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {/* 移动端下拉菜单 */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="space-y-1 px-6 pb-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block border-l-2 border-amber/30 py-3 pl-4 font-serif tracking-widest text-bone/80 transition-colors hover:border-amber hover:bg-jungle-800/60 hover:text-amber"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              to="/tickets"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 bg-amber px-5 py-3 font-serif tracking-widest text-jungle-950"
            >
              <Ticket className="h-4 w-4" />
              预约探险
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
