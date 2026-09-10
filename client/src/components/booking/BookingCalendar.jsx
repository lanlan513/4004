import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

function monthStrOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// 入园日期选择日历：按月拉取余票，过去/超窗日期置灰，售罄高亮
export default function BookingCalendar({ selectedDate, onSelect }) {
  const todayMonth = useMemo(() => monthStrOf(new Date()), []);
  const [month, setMonth] = useState(todayMonth);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/tickets/calendar?month=${month}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('calendar unavailable');
        return res.json();
      })
      .then((body) => {
        if (!cancelled) setCalendar(body.data);
      })
      .catch(() => {
        if (!cancelled) setError('余票日历加载失败，请稍后重试');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  // 仅允许查看当月起的 3 个月
  const canNavigate = (delta) => {
    const [y, m] = todayMonth.split('-').map(Number);
    const [cy, cm] = month.split('-').map(Number);
    const diff = (cy - y) * 12 + (cm - m);
    const next = diff + delta;
    return next >= 0 && next <= 2;
  };

  const shiftMonth = (delta) => {
    if (!canNavigate(delta)) return;
    const [y, m] = month.split('-').map(Number);
    setMonth(monthStrOf(new Date(y, m - 1 + delta, 1)));
  };

  const dayMap = useMemo(() => {
    const map = new Map();
    calendar?.days.forEach((d) => map.set(d.date, d));
    return map;
  }, [calendar]);

  // 月历网格：前置空白对齐星期
  const grid = useMemo(() => {
    if (!calendar) return [];
    const [y, m] = month.split('-').map(Number);
    const firstWeekday = new Date(y, m - 1, 1).getDay();
    const cells = Array.from({ length: firstWeekday }, () => null);
    calendar.days.forEach((d) => cells.push(d));
    return cells;
  }, [calendar, month]);

  return (
    <div className="border border-bone/10 bg-jungle-900/70 p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canNavigate(-1)}
          className="border border-bone/15 p-2 text-bone/70 transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="上一月"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-serif text-lg font-bold tracking-widest text-bone">
          {month.split('-')[0]} 年 {Number(month.split('-')[1])} 月
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canNavigate(1)}
          className="border border-bone/15 p-2 text-bone/70 transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="下一月"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center font-serif text-xs tracking-widest text-bone/40">
        {WEEK_LABELS.map((w) => (
          <span key={w} className="py-1">{w}</span>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-amber">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center font-serif text-sm text-red-400">{error}</div>
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((day, idx) => {
            if (!day) return <span key={`empty-${idx}`} />;
            const dayNum = Number(day.date.slice(-2));
            const closed = day.status === 'closed';
            const soldout = day.status === 'soldout';
            const selected = selectedDate === day.date;
            const isToday = calendar.today === day.date;
            return (
              <button
                key={day.date}
                type="button"
                disabled={closed || soldout}
                onClick={() => onSelect(day.date)}
                className={`flex min-h-[3.4rem] flex-col items-center justify-center border px-1 py-1.5 font-serif transition-all ${
                  selected
                    ? 'border-amber bg-amber/15 text-amber'
                    : closed
                      ? 'border-transparent text-bone/20'
                      : soldout
                        ? 'border-transparent text-bone/25 line-through'
                        : 'border-bone/10 text-bone/80 hover:border-amber/60 hover:text-amber'
                }`}
              >
                <span className={`text-sm ${isToday ? 'font-bold underline decoration-amber underline-offset-4' : ''}`}>
                  {dayNum}
                </span>
                {!closed && (
                  <span className={`mt-0.5 text-[10px] leading-none ${soldout ? 'text-red-400/70 no-underline' : 'text-bone/40'}`}>
                    {soldout ? '售罄' : `余 ${day.remaining}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4 border-t border-bone/10 pt-3 font-serif text-xs leading-relaxed text-bone/40">
        每日全园限量 3,000 人，VIP 探险票每日限量 300 张。最多可提前 60 天预约。
      </p>
    </div>
  );
}
