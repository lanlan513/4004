import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// 注销档案二次确认
export default function ConfirmDialog({ dino, busy, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, busy]);

  if (!dino) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-jungle-950/85 p-6 backdrop-blur-sm"
      onClick={() => !busy && onCancel()}
      role="alertdialog"
      aria-modal="true"
      aria-label="注销档案确认"
    >
      <div
        className="w-full max-w-md border border-red-500/40 bg-jungle-900 p-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="shrink-0 border border-red-500/40 p-2 text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-bone">注销恐龙资产档案？</h2>
            <p className="mt-2 font-serif text-sm leading-relaxed text-bone/65">
              即将注销{' '}
              <span className="text-amber">
                {dino.code} · {dino.name}
              </span>
              。该操作会从园区资产库中永久移除该档案，且无法撤销。
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="border border-bone/25 px-5 py-2 font-serif text-sm tracking-widest text-bone/70 transition-colors hover:border-bone/60 hover:text-bone disabled:opacity-40"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="bg-red-600 px-5 py-2 font-serif text-sm font-bold tracking-widest text-bone transition-colors hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? '注销中…' : '确认注销'}
          </button>
        </div>
      </div>
    </div>
  );
}
