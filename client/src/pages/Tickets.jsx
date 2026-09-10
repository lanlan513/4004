import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, Loader2 } from 'lucide-react';
import PageFrame from './PageFrame';
import BookingCalendar from '../components/booking/BookingCalendar';
import TicketTypeSelector from '../components/booking/TicketTypeSelector';
import VisitorForm, { validateVisitor } from '../components/booking/VisitorForm';
import PaymentPanel from '../components/booking/PaymentPanel';
import OrderSuccess from '../components/booking/OrderSuccess';

const STEPS = ['选择日期票种', '游客信息', '支付', '完成'];

function StepIndicator({ current }) {
  return (
    <ol className="mb-10 flex flex-wrap items-center gap-y-3">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <li key={label} className="flex items-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border font-display text-sm font-bold ${
                active
                  ? 'border-amber bg-amber text-jungle-950'
                  : done
                    ? 'border-amber/60 text-amber'
                    : 'border-bone/25 text-bone/40'
              }`}
            >
              {num}
            </span>
            <span
              className={`ml-2 font-serif text-sm tracking-wider ${
                active ? 'text-amber' : done ? 'text-bone/70' : 'text-bone/35'
              }`}
            >
              {label}
            </span>
            {num < STEPS.length && <span className="mx-4 h-px w-8 bg-bone/15 md:w-14" />}
          </li>
        );
      })}
    </ol>
  );
}

// 订单摘要侧栏（步骤 1-3 通用）
function OrderSummary({ ticketTypes, ticketType, quantity, visitDate }) {
  const type = ticketTypes.find((t) => t.id === ticketType);
  const total = (type?.price || 0) * quantity;
  return (
    <aside className="h-fit border border-bone/10 bg-jungle-900/70 p-6 lg:sticky lg:top-28">
      <h3 className="flex items-center gap-2 font-serif text-base font-bold text-bone">
        <CalendarDays className="h-4 w-4 text-amber" />
        订单摘要
      </h3>
      <dl className="mt-5 space-y-3 font-serif text-sm">
        <div className="flex justify-between">
          <dt className="text-bone/45">游览日期</dt>
          <dd className={visitDate ? 'text-bone' : 'text-bone/30'}>{visitDate || '待选择'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-bone/45">票种</dt>
          <dd className="text-bone">{type?.name || '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-bone/45">数量</dt>
          <dd className="text-bone">{quantity} 张</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-bone/45">单价</dt>
          <dd className="text-bone">¥ {(type?.price || 0).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="mt-5 flex items-baseline justify-between border-t border-bone/10 pt-4">
        <span className="font-serif text-sm text-bone/45">应付总额</span>
        <span className="font-display text-3xl font-bold text-amber">¥ {total.toLocaleString()}</span>
      </div>
    </aside>
  );
}

export default function Tickets() {
  const [step, setStep] = useState(1);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketType, setTicketType] = useState('standard');
  const [quantity, setQuantity] = useState(2);
  const [visitDate, setVisitDate] = useState('');
  const [visitor, setVisitor] = useState({ name: '', phone: '', email: '', idNumber: '' });
  // 安全协议勾选状态的唯一来源：复选框显示、提交按钮禁用与 validateVisitor 校验都读取它
  const [agreed, setAgreed] = useState(false);
  const [order, setOrder] = useState(null);
  const [paidOrder, setPaidOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [serverErrors, setServerErrors] = useState(null);

  useEffect(() => {
    fetch('/api/tickets/types')
      .then((res) => res.json())
      .then((body) => setTicketTypes(body.data || []))
      .catch(() => setTicketTypes([]));
  }, []);

  const selectedType = useMemo(
    () => ticketTypes.find((t) => t.id === ticketType),
    [ticketTypes, ticketType],
  );

  // 步骤 2 → 3：创建订单
  const submitOrder = async () => {
    const errors = validateVisitor(visitor, agreed);
    if (Object.keys(errors).length > 0) {
      setFormError(errors.__agreed || '请检查并补全游客信息');
      setServerErrors(errors);
      return;
    }
    setFormError('');
    setServerErrors(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketType,
          visitDate,
          quantity,
          visitor: {
            name: visitor.name,
            phone: visitor.phone,
            email: visitor.email,
            idNumber: visitor.idNumber,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        // 服务端字段级错误回显；余票不足则提示返回第一步改期
        if (body.data?.errors) setServerErrors(body.data.errors);
        setFormError(body.message || '订单创建失败，请重试');
        return;
      }
      setOrder(body.data);
      setStep(3);
    } catch {
      setFormError('网络异常，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setStep(1);
    setOrder(null);
    setPaidOrder(null);
    setVisitDate('');
    setVisitor({ name: '', phone: '', email: '', idNumber: '' });
    setAgreed(false);
    setFormError('');
    setServerErrors(null);
  };

  return (
    <PageFrame
      eyebrow="ADMISSION · 在线预订"
      title="门票预订"
      intro="选择入园日期与票种，填写游客信息后即可在线锁定名额。每日入园名额有限，VIP 探险票含夜间 Safari 专场，售完即止。"
    >
      <StepIndicator current={step} />

      {step === 4 && paidOrder ? (
        <OrderSuccess order={paidOrder} ticketName={selectedType?.name || ''} onRestart={restart} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            {step === 1 && (
              <div className="space-y-6">
                <BookingCalendar selectedDate={visitDate} onSelect={setVisitDate} ticketType={ticketType} />
                <TicketTypeSelector
                  types={ticketTypes}
                  selected={ticketType}
                  onSelect={setTicketType}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
                <button
                  type="button"
                  disabled={!visitDate}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-amber px-8 py-4 font-serif font-bold tracking-widest text-jungle-950 transition-all hover:shadow-[0_0_30px_rgba(224,165,38,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  下一步：填写游客信息
                  <ArrowRight className="h-4 w-4" />
                </button>
                {!visitDate && (
                  <p className="font-serif text-xs text-bone/40">请先在日历中选择入园日期</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <VisitorForm
                  value={visitor}
                  onChange={setVisitor}
                  agreed={agreed}
                  onAgreeChange={setAgreed}
                  serverErrors={serverErrors}
                />
                {formError && (
                  <p className="flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-4 py-3 font-serif text-sm text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {formError}
                  </p>
                )}
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 border border-bone/25 px-8 py-4 font-serif tracking-widest text-bone/70 transition-colors hover:border-amber hover:text-amber"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={submitOrder}
                    disabled={submitting || !agreed}
                    className="flex items-center gap-2 bg-amber px-8 py-4 font-serif font-bold tracking-widest text-jungle-950 transition-all hover:shadow-[0_0_30px_rgba(224,165,38,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        正在锁定名额…
                      </>
                    ) : (
                      <>
                        提交订单并去支付
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                {!agreed && (
                  <p className="font-serif text-xs text-bone/40">
                    勾选同意《安全协议》后即可提交订单
                  </p>
                )}
              </div>
            )}

            {step === 3 && order && (
              <PaymentPanel
                order={order}
                onPaid={(paid) => {
                  setPaidOrder(paid);
                  setStep(4);
                }}
              />
            )}
          </div>

          <OrderSummary
            ticketTypes={ticketTypes}
            ticketType={ticketType}
            quantity={quantity}
            visitDate={visitDate}
          />
        </div>
      )}
    </PageFrame>
  );
}
