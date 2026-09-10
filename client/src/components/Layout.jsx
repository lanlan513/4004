import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CompareBar from './CompareBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-jungle-950 font-sans text-bone">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* 全局对比篮：任何页面勾选恐龙后从底部滑出 */}
      <CompareBar />
    </div>
  );
}
