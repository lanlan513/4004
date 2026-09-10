import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AlertOverlay from './components/emergency/AlertOverlay';
import Notices from './components/emergency/Notices';
import { EmergencyProvider, useEmergency } from './emergency/EmergencyContext';
import Home from './pages/Home';
import Dinosaurs from './pages/Dinosaurs';
import Tours from './pages/Tours';
import Tickets from './pages/Tickets';
import Admin from './pages/Admin';
import Security from './pages/Security';
import NotFound from './pages/NotFound';

// 全局警报层：仅在状态机进入 CRITICAL 时全屏接管
function EmergencyLayer() {
  const { level } = useEmergency();
  return (
    <>
      {level === 'CRITICAL' && <AlertOverlay />}
      <Notices />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <EmergencyProvider>
        <EmergencyLayer />
        <Routes>
          {/* Layout 承载全站共享的导航栏与底部信息栏 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dinosaurs" element={<Dinosaurs />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/security" element={<Security />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </EmergencyProvider>
    </BrowserRouter>
  );
}
