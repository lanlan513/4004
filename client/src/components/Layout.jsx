import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatTerminal from './ChatTerminal';

export default function Layout() {
  return (
    <div className="min-h-screen bg-jungle-950 font-sans text-bone">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* 全站悬浮的 AI 古生物专家终端 */}
      <ChatTerminal />
    </div>
  );
}
