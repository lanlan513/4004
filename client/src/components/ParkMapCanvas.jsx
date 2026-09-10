import { useEffect, useRef } from 'react';

// 虚拟地图坐标系尺寸（与服务端 park 数据一致）
const MAP_W = 1000;
const MAP_H = 640;

// 岛屿轮廓（环绕各安全网格的不规则海岸线）
const ISLAND = [
  [40, 120], [180, 30], [420, 25], [640, 30], [880, 45], [970, 140],
  [990, 300], [985, 480], [900, 610], [640, 625], [380, 620], [140, 610],
  [30, 500], [15, 320],
];

const PALETTES = {
  day: {
    oceanTop: '#0d2f28',
    oceanBottom: '#071a15',
    island: '#173a2b',
    islandEdge: '#2a5c42',
    grid: 'rgba(233,227,208,0.06)',
    zoneFill: 'rgba(58,122,89,0.16)',
    label: 'rgba(233,227,208,0.9)',
    sublabel: 'rgba(233,227,208,0.5)',
    radar: 'rgba(224,165,38,0.10)',
  },
  night: {
    oceanTop: '#04100d',
    oceanBottom: '#020605',
    island: '#0b1d14',
    islandEdge: '#1a3c2b',
    grid: 'rgba(224,165,38,0.07)',
    zoneFill: 'rgba(224,165,38,0.05)',
    label: 'rgba(233,227,208,0.8)',
    sublabel: 'rgba(233,227,208,0.4)',
    radar: 'rgba(224,165,38,0.16)',
  },
};

const FENCE_COLORS = { on: '#34d399', off: '#8b938c', fault: '#f87171' };
// 每个追踪物种一种标记色：肉食为暖色，植食为冷色（导出供图例复用，保持单一数据源）
export const DINO_COLORS = {
  霸王龙: '#ef4444',
  迅猛龙: '#f59e0b',
  腕龙: '#34d399',
  三角龙: '#38bdf8',
  剑龙: '#a3e635',
};
const DEFAULT_DINO_COLOR = '#4ade80';

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// 平滑闭合曲线
function traceSmoothPath(ctx, points) {
  ctx.beginPath();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const first = mid(points[points.length - 1], points[0]);
  ctx.moveTo(first[0], first[1]);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[(i + 1) % points.length];
    const m = mid(p, next);
    ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  ctx.closePath();
}

function polygonCenter(polygon) {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of polygon) { sx += x; sy += y; }
  return [sx / polygon.length, sy / polygon.length];
}

export default function ParkMapCanvas({ zones, dinos, mode, selectedZoneId, onSelectZone }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // 渲染循环读取的最新 props
  const stateRef = useRef({ zones, dinos, mode, selectedZoneId });
  // 恐龙平滑插值位置：id -> { x, y }
  const interpRef = useRef(new Map());
  const hoverRef = useRef(null);

  stateRef.current = { zones, dinos, mode, selectedZoneId };

  // 新定位到达时仅更新插值目标，渲染循环里做平滑逼近
  useEffect(() => {
    const interp = interpRef.current;
    for (const dino of dinos) {
      if (!interp.has(dino.id)) interp.set(dino.id, { x: dino.x, y: dino.y });
    }
  }, [dinos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    let scale = 1;

    const resize = () => {
      const width = container.clientWidth;
      const height = Math.round((width * MAP_H) / MAP_W);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      scale = (width * dpr) / MAP_W;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const draw = (now) => {
      const { zones: z, dinos: d, mode: m, selectedZoneId: sel } = stateRef.current;
      const palette = PALETTES[m] ?? PALETTES.night;
      ctx.save();
      ctx.scale(scale, scale);

      // 海洋背景
      const ocean = ctx.createLinearGradient(0, 0, 0, MAP_H);
      ocean.addColorStop(0, palette.oceanTop);
      ocean.addColorStop(1, palette.oceanBottom);
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, MAP_W, MAP_H);

      // 经纬网格
      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = 1;
      for (let x = 100; x < MAP_W; x += 100) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_H); ctx.stroke();
      }
      for (let y = 80; y < MAP_H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_W, y); ctx.stroke();
      }

      // 岛屿
      traceSmoothPath(ctx, ISLAND);
      ctx.fillStyle = palette.island;
      ctx.fill();
      ctx.strokeStyle = palette.islandEdge;
      ctx.lineWidth = 3;
      ctx.stroke();

      // 雷达扫描（以游客中心为圆心）
      const [rcx, rcy] = [512, 372];
      const sweep = (now / 2400) % (Math.PI * 2);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.arc(rcx, rcy, 300, sweep, sweep + 0.6);
      ctx.closePath();
      ctx.fillStyle = palette.radar;
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = palette.radar;
      ctx.lineWidth = 1;
      for (const r of [120, 220, 300]) {
        ctx.beginPath(); ctx.arc(rcx, rcy, r, 0, Math.PI * 2); ctx.stroke();
      }

      // 安全网格
      for (const zone of z) {
        const fenceColor = FENCE_COLORS[zone.fence?.status] ?? FENCE_COLORS.off;
        const isSelected = zone.id === sel;
        const isHover = zone.id === hoverRef.current;
        // 故障网格红色呼吸闪烁
        const blink = zone.fence?.status === 'fault' ? 0.55 + 0.45 * Math.sin(now / 180) : 1;

        ctx.beginPath();
        zone.polygon.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = isSelected || isHover ? 'rgba(224,165,38,0.14)' : palette.zoneFill;
        ctx.fill();

        ctx.save();
        ctx.globalAlpha = blink;
        ctx.strokeStyle = isSelected ? '#e0a526' : fenceColor;
        ctx.lineWidth = isSelected ? 3 : 2;
        if (zone.fence?.status === 'off') ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.restore();

        // 网格标签
        const [cx, cy] = polygonCenter(zone.polygon);
        ctx.textAlign = 'center';
        ctx.fillStyle = palette.label;
        ctx.font = '600 15px "Noto Serif SC", serif';
        ctx.fillText(zone.name, cx, cy - 6);
        ctx.fillStyle = palette.sublabel;
        ctx.font = '10px Cinzel, serif';
        ctx.fillText(`${zone.code} · 电网${zone.fence?.status === 'on' ? '通电' : zone.fence?.status === 'fault' ? '故障' : '断电'}`, cx, cy + 12);

        // 电网状态指示灯
        ctx.save();
        ctx.globalAlpha = blink;
        ctx.fillStyle = fenceColor;
        ctx.beginPath();
        ctx.arc(cx, cy - 26, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 恐龙实时定位（平滑插值）
      const interp = interpRef.current;
      for (const dino of d) {
        const pos = interp.get(dino.id);
        if (!pos) continue;
        pos.x += (dino.x - pos.x) * 0.06;
        pos.y += (dino.y - pos.y) * 0.06;

        const color = DINO_COLORS[dino.species] ?? DEFAULT_DINO_COLOR;
        // 脉冲光环
        const pulse = (now / 900 + dino.id.charCodeAt(0)) % 1;
        ctx.save();
        ctx.globalAlpha = 1 - pulse;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 定位标记（菱形）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - 6);
        ctx.lineTo(pos.x + 5, pos.y);
        ctx.lineTo(pos.x, pos.y + 6);
        ctx.lineTo(pos.x - 5, pos.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(4,9,10,0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = palette.label;
        ctx.font = '10px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${dino.name} · ${dino.species}`, pos.x, pos.y - 12);
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // 将点击坐标换算回虚拟地图坐标并做多边形命中检测
  const locateZone = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * MAP_W;
    const y = ((event.clientY - rect.top) / rect.height) * MAP_H;
    const { zones: z } = stateRef.current;
    return z.find((zone) => pointInPolygon(x, y, zone.polygon)) ?? null;
  };

  const handleClick = (event) => {
    const zone = locateZone(event);
    onSelectZone(zone ? zone.id : null);
  };

  const handleMove = (event) => {
    const zone = locateZone(event);
    hoverRef.current = zone ? zone.id : null;
    canvasRef.current.style.cursor = zone ? 'pointer' : 'default';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="block w-full"
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => { hoverRef.current = null; }}
        role="img"
        aria-label="侏罗纪公园 GIS 交互地图"
      />
    </div>
  );
}
