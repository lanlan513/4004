import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Ticket, Heart } from 'lucide-react';
import { useFavorites } from '../state/FavoritesContext';

const NAV_LINKS = [
  { label: '首页', href: '/' },
  { label: '恐龙图鉴', href: '/dinosaurs' },
  { label: '观光路线', href: '/tours' },
  { label: '票务中心', href: '/tickets' },
  { label: '管理后台', href: '/admin' },
];

const navLinkClass = ({ isActive }) =>
  `group relative font-serif text-sm tracking-widest transition-colors ${
    isActive ? 'text-amber' : 'text-bone/75 hover:text-amber'
  }`;

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
  const { favoriteIds } = useFavorites();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 路由切换后收起移动端菜单
  useEffect(() => setMenuOpen(false), [location.pathname]);

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
        <Link to="/" className="group flex items-center gap-3">
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
        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink to={link.href} end={link.href === '/'} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px bg-amber transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
          {/* 我的收藏：带数量徽标 */}
          <li>
            <NavLink to="/favorites" className={navLinkClass} title="我的收藏">
              {({ isActive }) => (
                <span className="relative inline-flex items-center gap-1.5">
                  <Heart
                    className={`h-4 w-4 ${
                      isActive || favoriteIds.length > 0 ? 'fill-current' : ''
                    }`}
                  />
                  收藏
                  {favoriteIds.length > 0 && (
                    <span className="absolute -right-2.5 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 font-display text-[9px] font-bold leading-none text-jungle-950">
                      {favoriteIds.length}
                    </span>
                  )}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-amber transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
              )}
            </NavLink>
          </li>
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
          menuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="space-y-1 px-6 pb-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  `block border-l-2 py-3 pl-4 font-serif tracking-widest transition-colors ${
                    isActive
                      ? 'border-amber bg-jungle-800/60 text-amber'
                      : 'border-amber/30 text-bone/80 hover:border-amber hover:bg-jungle-800/60 hover:text-amber'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `flex items-center justify-between border-l-2 py-3 pl-4 pr-3 font-serif tracking-widest transition-colors ${
                  isActive
                    ? 'border-amber bg-jungle-800/60 text-amber'
                    : 'border-amber/30 text-bone/80 hover:border-amber hover:bg-jungle-800/60 hover:text-amber'
                }`
              }
            >
              <span className="inline-flex items-center gap-2">
                <Heart className={`h-4 w-4 ${favoriteIds.length > 0 ? 'fill-current' : ''}`} />
                我的收藏
              </span>
              {favoriteIds.length > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1.5 font-display text-[10px] font-bold text-jungle-950">
                  {favoriteIds.length}
                </span>
              )}
            </NavLink>
          </li>
          <li className="pt-2">
            <Link
              to="/tickets"
              className="flex w-full items-center justify-center gap-2 bg-amber px-5 py-3 font-serif text-sm tracking-widest text-jungle-950"
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
