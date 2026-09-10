import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Siren from './siren';
import { FALLBACK_ZONES, localRandomIncident, localEscapeIncident } from './fallbackData';

// 全局警报状态机的五个离散状态，严格按危险程度单向升级 / 逐级解除
export const LEVELS = {
  NORMAL: {
    key: 'NORMAL',
    code: 'SAFE',
    label: '安全',
    color: '#3fb96b',
    text: 'text-emerald-300',
    ring: 'stroke-emerald-400',
    chip: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300',
    desc: '园区运营正常，各展区防护设施运转良好。',
  },
  BLUE: {
    key: 'BLUE',
    code: 'BLUE ALERT',
    label: '蓝色警戒',
    color: '#58a6ff',
    text: 'text-sky-300',
    ring: 'stroke-sky-400',
    chip: 'border-sky-400/50 bg-sky-400/10 text-sky-300',
    desc: '监测到轻微异常，巡逻单位请保持关注。',
  },
  ORANGE: {
    key: 'ORANGE',
    code: 'ORANGE ALERT',
    label: '橙色危险',
    color: '#e0a526',
    text: 'text-amber',
    ring: 'stroke-amber',
    chip: 'border-amber/60 bg-amber/10 text-amber',
    desc: '发生危险事件，防御小队立即进入待命状态。',
  },
  RED: {
    key: 'RED',
    code: 'RED ALERT',
    label: '红色紧急',
    color: '#ff4848',
    text: 'text-red-400',
    ring: 'stroke-red-500',
    chip: 'border-red-500/60 bg-red-500/10 text-red-400',
    desc: '严重安全威胁，游客疏散程序已启动。',
  },
  CRITICAL: {
    key: 'CRITICAL',
    code: 'CRITICAL · 912',
    label: '一级警报',
    color: '#ff1e1e',
    text: 'text-red-500',
    ring: 'stroke-red-600',
    chip: 'border-red-500 bg-red-600/20 text-red-300',
    desc: '致命生物威胁，全岛进入封锁状态。',
  },
};

export const SEVERITY_META = {
  1: { label: '低', cls: 'bg-emerald-500/20 text-emerald-300' },
  2: { label: '中', cls: 'bg-sky-500/20 text-sky-300' },
  3: { label: '高', cls: 'bg-amber/20 text-amber' },
  4: { label: '致命', cls: 'bg-red-600/30 text-red-300' },
};

const TICK_MS = 2500;
const MAX_ACTIVE = 6;
const LOG_LIMIT = 32;
const AUTH_TTL_TICKS = 36; // 36 × 2.5s = 90 秒授权时长

const SQUADS_SEED = [
  { id: 'ALPHA', name: '阿尔法安全小队', status: 'standby', elite: false, cooldown: 0, incidentId: null },
  { id: 'BRAVO', name: '布拉沃安全小队', status: 'standby', elite: false, cooldown: 0, incidentId: null },
  { id: 'CHARLIE', name: '查理安全小队', status: 'standby', elite: false, cooldown: 0, incidentId: null },
  { id: 'TANGO', name: '探戈武装战术小组', status: 'standby', elite: true, cooldown: 0, incidentId: null },
];

const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

function nowTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false });
}

function makeLog(text, tone = 'info') {
  return { id: uid('log'), t: nowTime(), text, tone };
}

// 依据电网、事件、派遣情况推导全局警报等级
function deriveLevel(s) {
  if (s.manualOverride) return 'CRITICAL';
  if (s.incidents.some((i) => i.severity === 4 && !i.acknowledged)) return 'CRITICAL';

  const maxSev = s.incidents.reduce((m, i) => Math.max(m, i.severity), 0);
  if (maxSev >= 4) return 'RED';
  if (!s.gridOn) return 'RED'; // 电网失去防护等同于红色紧急
  if (maxSev === 3) return 'ORANGE';
  if (maxSev === 2) return 'BLUE';
  return 'NORMAL';
}

// 重算各展区危险值（0~100）
function recomputeZones(s) {
  s.zones = s.zones.map((z) => {
    let danger = 4 + (z.baseDanger || 8);
    for (const inc of s.incidents) {
      if (inc.zoneId !== z.id) continue;
      danger += inc.status === 'responding' ? inc.severity * 5 : inc.severity * 9;
    }
    if (!s.gridOn) danger += 20;
    danger = Math.max(0, Math.min(100, Math.round(danger)));
    return { ...z, danger, powered: s.gridOn };
  });
}

function recomputeSafety(s) {
  let penalty = 0;
  for (const inc of s.incidents) {
    penalty += inc.status === 'responding' ? inc.severity * 3 : inc.severity * 7;
  }
  if (!s.gridOn) penalty += 16;
  const target = Math.max(6, Math.min(99, 100 - penalty));
  // 指数平滑 + 微小噪声，让仪表盘指针产生真实的抖动感
  const noise = (Math.random() - 0.5) * 1.2;
  s.safetyIndex = Math.round((s.safetyIndex + (target - s.safetyIndex) * 0.38 + noise) * 10) / 10;
}

function buildInitialState() {
  const zones = FALLBACK_ZONES.map((z) => ({
    ...z,
    danger: 4 + Math.floor(Math.random() * 10),
    baseDanger: 4 + Math.floor(Math.random() * 8),
    powered: true,
  }));
  return {
    manualOverride: false,
    safetyIndex: 94,
    zones,
    incidents: [],
    gridOn: true,
    squads: clone(SQUADS_SEED),
    authorized: false,
    authTtl: 0,
    muted: false,
    logs: [makeLog('应急指挥系统上线，全局警报状态机进入 SAFE 模式', 'ok')],
    notices: [],
  };
}

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [state, setState] = useState(buildInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const sirenRef = useRef(null);
  if (sirenRef.current === null && typeof window !== 'undefined') {
    sirenRef.current = new Siren();
  }

  const pushNotice = useCallback((text, tone = 'info') => {
    const notice = { id: uid('ntc'), text, tone };
    setState((s) => ({ ...s, notices: [...s.notices, notice].slice(-4) }));
    window.setTimeout(() => {
      setState((s) => ({ ...s, notices: s.notices.filter((n) => n.id !== notice.id) }));
    }, 2800);
  }, []);

  // —— 纯函数式的一个模拟节拍 ——
  const step = useCallback(() => {
    setState((prev) => {
      const s = clone(prev);
      const newLogs = [];

      // 派遣中的事件推进处置进度，完成后归队整备
      const resolvedSquadIds = [];
      s.incidents = s.incidents.filter((inc) => {
        if (inc.status === 'responding') {
          inc.progress += 6 + Math.random() * 5;
          if (inc.progress >= 100) {
            resolvedSquadIds.push({ squadId: inc.squadId, type: inc.type, zone: inc.zone });
            return false;
          }
        } else if (inc.severity <= 2 && Math.random() < 0.06) {
          // 低级异常有小概率被现场巡逻自行消解
          newLogs.push(makeLog(`${inc.zone}「${inc.type}」经现场排查后解除`, 'ok'));
          return false;
        }
        return true;
      });

      for (const item of resolvedSquadIds) {
        const squad = s.squads.find((q) => q.id === item.squadId);
        if (squad) {
          squad.status = 'cooldown';
          squad.cooldown = 3;
          squad.incidentId = null;
        }
        newLogs.push(
          makeLog(`${item.zone}「${item.type}」已由 ${item.squadId} 小队处置完毕`, 'ok'),
        );
      }

      // 小队整备倒计时
      s.squads.forEach((q) => {
        if (q.status === 'cooldown') {
          q.cooldown -= 1;
          if (q.cooldown <= 0) q.status = 'standby';
        }
      });

      // 授权倒计时
      if (s.authorized) {
        s.authTtl -= 1;
        if (s.authTtl <= 0) {
          s.authorized = false;
          newLogs.push(makeLog('指挥授权已超时，高级防御指令重新锁定', 'warn'));
        }
      }

      recomputeZones(s);
      recomputeSafety(s);
      s.level = deriveLevel(s);
      if (newLogs.length) s.logs = [...newLogs.reverse(), ...s.logs].slice(0, LOG_LIMIT);
      return s;
    });
  }, []);

  // —— 随机突发事件：优先取后端模拟接口，离线时本地兜底 ——
  const spawnIncident = useCallback(async () => {
    const s = stateRef.current;
    if (s.incidents.length >= MAX_ACTIVE) return;

    const chance = s.gridOn ? 0.17 : 0.45;
    if (Math.random() > chance) return;

    let inc;
    try {
      const res = await fetch('/api/security/incidents/random');
      if (!res.ok) throw new Error('bad status');
      const json = await res.json();
      inc = json.data;
    } catch {
      inc = localRandomIncident();
    }
    // 电网离线时封锁失效，脱逃事件概率显著上升
    if (!s.gridOn && Math.random() < 0.5) inc = localEscapeIncident();

    inc = {
      ...inc,
      status: 'active',
      progress: 0,
      squadId: null,
      acknowledged: false,
    };

    setState((prev) => {
      if (prev.incidents.length >= MAX_ACTIVE) return prev;
      const next = clone(prev);
      next.incidents = [inc, ...next.incidents].slice(0, MAX_ACTIVE);
      recomputeZones(next);
      recomputeSafety(next);
      next.level = deriveLevel(next);
      const tone = inc.severity === 4 ? 'danger' : inc.severity === 3 ? 'warn' : 'info';
      next.logs = [
        makeLog(`${inc.zone} 上报突发事件：${inc.type}（危险等级 ${inc.severity}）`, tone),
        ...next.logs,
      ].slice(0, LOG_LIMIT);
      return next;
    });
  }, []);

  // 模拟主循环
  useEffect(() => {
    const timer = window.setInterval(() => {
      step();
      spawnIncident();
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [step, spawnIncident]);

  // —— 警报状态机动作 ——
  const triggerCritical = useCallback(() => {
    setState((s) => {
      if (s.manualOverride) return s;
      const next = { ...s, manualOverride: true, level: 'CRITICAL' };
      next.logs = [makeLog('主管手动触发一级警报，全岛进入封锁预案', 'danger'), ...s.logs].slice(
        0,
        LOG_LIMIT,
      );
      return next;
    });
    pushNotice('一级警报已发布，全岛封锁程序启动', 'danger');
  }, [pushNotice]);

  const standDown = useCallback(() => {
    setState((s) => {
      const next = clone(s);
      next.manualOverride = false;
      // 确认所有致命事件（不再弹全屏），但仍保留为红色紧急直到处置完毕
      next.incidents = next.incidents.map((i) =>
        i.severity === 4 ? { ...i, acknowledged: true } : i,
      );
      next.level = deriveLevel(next);
      next.logs = [makeLog('主管确认警情，一级警报解除，转入红色紧急处置', 'warn'), ...s.logs].slice(
        0,
        LOG_LIMIT,
      );
      return next;
    });
    pushNotice('一级警报已解除，现场处置继续进行', 'ok');
  }, [pushNotice]);

  const toggleMute = useCallback(() => {
    setState((s) => ({ ...s, muted: !s.muted }));
  }, []);

  // —— 防御控制面板动作 ——
  const cutGrid = useCallback(() => {
    setState((s) => {
      if (!s.gridOn) return s;
      const next = clone(s);
      next.gridOn = false;
      recomputeZones(next);
      recomputeSafety(next);
      next.level = deriveLevel(next);
      next.logs = [
        makeLog('执行 11-C 号预案：全岛高压电网已切断', 'danger'),
        ...s.logs,
      ].slice(0, LOG_LIMIT);
      return next;
    });
    pushNotice('全岛电网已切断，封锁围栏失去电力', 'danger');
  }, [pushNotice]);

  const restoreGrid = useCallback(() => {
    if (!stateRef.current.authorized) {
      pushNotice('恢复电网需要指挥解密授权', 'warn');
      return false;
    }
    setState((s) => {
      const next = clone(s);
      next.gridOn = true;
      recomputeZones(next);
      recomputeSafety(next);
      next.level = deriveLevel(next);
      next.logs = [makeLog('指挥授权确认，全岛高压电网恢复供电', 'ok'), ...s.logs].slice(
        0,
        LOG_LIMIT,
      );
      return next;
    });
    pushNotice('电网恢复供电，各围场封锁重新生效', 'ok');
    return true;
  }, [pushNotice]);

  const dispatchSquad = useCallback(
    (incidentId, elite = false) => {
      const s = stateRef.current;
      if (elite && !s.authorized) {
        pushNotice('武装战术小组需通过指挥解密授权后才能调动', 'warn');
        return false;
      }
      const incident = s.incidents.find((i) => i.id === incidentId);
      if (!incident || incident.status === 'responding') return false;

      const squad = s.squads.find((q) => q.elite === elite && q.status === 'standby');
      if (!squad) {
        pushNotice(elite ? '武装战术小组正在执行任务' : '常规安全小队全部出勤中，请等待整备', 'warn');
        return false;
      }

      setState((prev) => {
        const next = clone(prev);
        const inc = next.incidents.find((i) => i.id === incidentId);
        const q = next.squads.find((x) => x.id === squad.id);
        if (!inc || !q || inc.status === 'responding' || q.status !== 'standby') return prev;
        inc.status = 'responding';
        inc.squadId = q.id;
        inc.progress = 1;
        q.status = 'responding';
        q.incidentId = inc.id;
        next.level = deriveLevel(next);
        next.logs = [
          makeLog(`${q.name} 已出动，前往${inc.zone}处置「${inc.type}」`, elite ? 'danger' : 'warn'),
          ...prev.logs,
        ].slice(0, LOG_LIMIT);
        return next;
      });
      pushNotice(`${squad.name} 出动，ETA 90 秒`, 'ok');
      return true;
    },
    [pushNotice],
  );

  const grantAuthorization = useCallback(() => {
    setState((s) => {
      const next = {
        ...s,
        authorized: true,
        authTtl: AUTH_TTL_TICKS,
      };
      next.logs = [makeLog('指挥解密通过：高级防御指令已解锁（90 秒）', 'ok'), ...s.logs].slice(
        0,
        LOG_LIMIT,
      );
      return next;
    });
    pushNotice('指挥授权成功，高级指令通道开放', 'ok');
  }, [pushNotice]);

  const lockAuthorization = useCallback(() => {
    setState((s) => ({ ...s, authorized: false, authTtl: 0 }));
  }, []);

  // 同步展区数据：后端可用时拉取权威展区名单（危险值仍由本地模拟）
  useEffect(() => {
    let cancelled = false;
    fetch('/api/security/zones')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !Array.isArray(json.data)) return;
        setState((s) => ({
          ...s,
          zones: json.data.map((z, i) => ({
            ...z,
            baseDanger: s.zones[i]?.baseDanger ?? 6,
            danger: s.zones[i]?.danger ?? 8,
            powered: s.gridOn,
          })),
        }));
      })
      .catch(() => {
        /* 接口不可达时沿用本地展区兜底数据 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const level = state.level || deriveLevel(state);

  // 红色及以上等级自动拉响警报器（可静音）
  useEffect(() => {
    const siren = sirenRef.current;
    const audible = !state.muted && (level === 'RED' || level === 'CRITICAL');
    if (audible) {
      siren.start();
      // 浏览器自动播放限制：首次点击页面时补一次恢复
      const retry = () => {
        if (!stateRef.current.muted && ['RED', 'CRITICAL'].includes(stateRef.current.level)) {
          siren.start();
        }
      };
      window.addEventListener('pointerdown', retry, { once: true });
      return () => window.removeEventListener('pointerdown', retry);
    }
    siren.stop();
    return undefined;
  }, [level, state.muted]);

  useEffect(() => () => sirenRef.current?.stop(), []);

  const value = useMemo(
    () => ({
      ...state,
      level,
      levelMeta: LEVELS[level],
      tickMs: TICK_MS,
      triggerCritical,
      standDown,
      toggleMute,
      cutGrid,
      restoreGrid,
      dispatchSquad,
      grantAuthorization,
      lockAuthorization,
      pushNotice,
    }),
    [
      state,
      level,
      triggerCritical,
      standDown,
      toggleMute,
      cutGrid,
      restoreGrid,
      dispatchSquad,
      grantAuthorization,
      lockAuthorization,
      pushNotice,
    ],
  );

  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency 必须在 EmergencyProvider 内使用');
  return ctx;
}
