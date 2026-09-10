import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dinosaurs from './pages/Dinosaurs';
import Tours from './pages/Tours';
import Tickets from './pages/Tickets';
import ParkMap from './pages/ParkMap';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout 承载全站共享的导航栏与底部信息栏 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dinosaurs" element={<Dinosaurs />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/map" element={<ParkMap />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
