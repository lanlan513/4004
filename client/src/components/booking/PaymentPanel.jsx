import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CreditCard, Loader2, QrCode, Smartphone } from 'lucide-react';

const PAY_METHODS = [
  { id: 'wechat', name: '微信支付', desc: '亿万用户的选择', icon: Smartphone },
  { id: 'alipay', name: '支付宝', desc: '扫码或余额支付', icon: QrCode },
  { id: 'unionpay', name: '银联云闪付', desc: '支持借记卡 / 信用卡', icon: CreditCard },
];

const PROCESSING_STEPS = ['正在连接支付网关…', '等待支付确认…', '正在核验交易结果…'];

// 模拟支付流：选择支付方式 → 模拟网关处理 → 调用后端支付接口（小概率通道繁忙可重试）
export default function PaymentPanel({ order, onPaid }) {
  const [method, setMethod] = useState('wechat');
  const [phase, setPhase] = useState('idle'); // idle | processing | failed
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState('');
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startPayment = () => {
    setPhase('processing');
    setError('');
    // 模拟网关处理节奏，约 2.4s 后真正请求后端
    PROCESSING_STEPS.forEach((text, i) => {
      timers.current.push(setTimeout(() => setStepText(text), i * 800));
    });
    timers.current.push(
      setTimeout(async () => {
        try {
          const res = await fetch(`/api/orders/${order.id}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.message || '支付失败');
          onPaid(body.data);
        } catch (err) {
          setError(err.message || '网络异常，请重试');
          setPhase('failed');
        }
      }, PROCESSING_STEPS.length * 800),
    );
  };

  return (
    <div className="border border-bone/10 bg-jungle-900/70 p-6">
      <h3 className="font-serif text-lg font-bold text-bone">选择支付方式</h3>

      <div className="mt-5 space-y-3">
        {PAY_METHODS.map(({ id, name, desc, icon: Icon }) => (
          <button
            key={id}
            type="button"
            disabled={phase === 'processing'}
            onClick={() => setMethod(id)}
            className={`flex w-full items-center gap-4 border px-5 py-4 text-left transition-colors ${
              method === id
                ? 'border-amber bg-amber/10'
                : 'border-bone/10 hover:border-amber/40 disabled:opacity-50'
            }`}
          >
            <Icon className={`h-6 w-6 ${method === id ? 'text-amber' : 'text-bone/40'}`} />
            <span className="flex-1">
              <span className={`block font-serif text-sm font-bold ${method === id ? 'text-amber' : 'text-bone'}`}>
                {name}
              </span>
              <span className="mt-0.5 block font-serif text-xs text-bone/40">{desc}</span>
            </span>
            <span
              className={`h-4 w-4 rounded-full border-4 ${
                method === id ? 'border-amber bg-amber/30' : 'border-bone/25'
              }`}
            />
          </button>
        ))}
      </div>

      {phase === 'failed' && (
        <p className="mt-4 flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-4 py-3 font-serif text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={startPayment}
        disabled={phase === 'processing'}
        className="mt-6 flex w-full items-center justify-center gap-3 bg-amber px-6 py-4 font-serif font-bold tracking-widest text-jungle-950 transition-all hover:shadow-[0_0_30px_rgba(224,165,38,0.4)] disabled:cursor-wait disabled:opacity-80"
      >
        {phase === 'processing' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {stepText}
          </>
        ) : (
          <>确认支付 ¥ {order.amount.toLocaleString()}</>
        )}
      </button>

      <p className="mt-3 text-center font-serif text-xs text-bone/35">
        本页面为模拟支付环境，不会发生真实扣款。订单保留 15 分钟。
      </p>
    </div>
  );
}
