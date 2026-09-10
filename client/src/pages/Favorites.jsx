import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, SearchX, Trash2, GitCompareArrows } from 'lucide-react';
import PageFrame from './PageFrame';
import { useFavorites } from '../state/FavoritesContext';
import { useCompare, COMPARE_MIN, COMPARE_MAX } from '../state/CompareContext';
import { useDinoMap, resolveDinosaurs } from '../hooks/useDinoMap';
import DinoCardGrid from '../components/dino/DinoCardGrid';
import DinoDetailModal from '../components/dino/DinoDetailModal';

export default function Favorites() {
  const { favoriteIds, clearFavorites } = useFavorites();
  const { compareIds } = useCompare();
  const { dinoMap, status } = useDinoMap();
  const [detailDino, setDetailDino] = useState(null);

  const { dinosaurs } = useMemo(
    () => resolveDinosaurs(dinoMap, favoriteIds),
    [dinoMap, favoriteIds],
  );

  const selectedInFavorites = dinosaurs.filter((dino) => compareIds.includes(dino.id));
  const canCompareHere = selectedInFavorites.length >= COMPARE_MIN;

  return (
    <PageFrame
      eyebrow="MY FAVORITES · 私人标本柜"
      title="我的收藏"
      intro="在这里集中查看你收藏的恐龙档案。收藏保存在本机并在所有页面之间同步；勾选两到三只还可以直接发起多维对比。"
    >
      {/* 操作行 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif text-sm tracking-widest text-bone/50">
          已收藏{' '}
          <span className="font-display text-xl font-bold text-red-400">{favoriteIds.length}</span>{' '}
          份档案
        </p>
        {favoriteIds.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center gap-2 border border-bone/25 px-4 py-2 font-serif text-sm tracking-widest text-bone/70 transition-colors hover:border-red-400/60 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              清空收藏
            </button>
          </div>
        )}
      </div>

      {status === 'loading' && (
        <p className="py-20 text-center font-serif text-bone/50" role="status">
          正在读取收藏档案...
        </p>
      )}

      {status === 'ready' && favoriteIds.length === 0 && (
        <div className="flex flex-col items-center gap-4 border border-dashed border-bone/15 py-20 text-center">
          <Heart className="h-10 w-10 text-bone/30" />
          <p className="font-serif text-bone/60">标本柜还是空的，去图鉴里收藏感兴趣的恐龙吧</p>
          <Link
            to="/dinosaurs"
            className="border border-amber/50 px-4 py-2 font-serif text-sm tracking-widest text-amber transition-colors hover:bg-amber hover:text-jungle-950"
          >
            前往恐龙图鉴
          </Link>
        </div>
      )}

      {/* 收藏的档案若被管理员注销，给出提示（localStorage 中可能残留旧 id） */}
      {status === 'ready' && favoriteIds.length > 0 && dinosaurs.length === 0 && (
        <div className="flex flex-col items-center gap-4 border border-red-400/25 bg-red-950/20 py-16 text-center">
          <SearchX className="h-9 w-9 text-red-300/60" />
          <p className="font-serif text-bone/70">收藏的档案已全部被注销，无法继续展示</p>
          <button
            type="button"
            onClick={clearFavorites}
            className="border border-red-400/50 px-4 py-2 font-serif text-sm tracking-widest text-red-300 transition-colors hover:bg-red-500 hover:text-bone"
          >
            清空失效收藏
          </button>
        </div>
      )}

      {status === 'ready' && dinosaurs.length > 0 && (
        <>
          <div className="animate-fade-up">
            <DinoCardGrid dinosaurs={dinosaurs} onOpen={setDetailDino} editable={false} />
          </div>

          {/* 收藏夹内快速发起对比 */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-bone/10 bg-jungle-900/60 p-5">
            <p className="font-serif text-sm text-bone/60">
              在卡片左下角勾选{' '}
              <span className="text-amber">
                {selectedInFavorites.length}/{COMPARE_MAX}
              </span>{' '}
              只恐龙，从体型、食性、时代、速度与危险等级进行对比（至少 {COMPARE_MIN} 只）。
            </p>
            {canCompareHere ? (
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 bg-amber px-6 py-2.5 font-serif text-sm font-bold tracking-widest text-jungle-950 transition-all hover:bg-amber-light hover:shadow-[0_0_28px_rgba(224,165,38,0.4)]"
              >
                <GitCompareArrows className="h-4 w-4" />
                对比已选 {selectedInFavorites.length} 只
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 bg-bone/15 px-6 py-2.5 font-serif text-sm tracking-widest text-bone/40"
              >
                <GitCompareArrows className="h-4 w-4" />
                至少选择 {COMPARE_MIN} 只
              </button>
            )}
          </div>
        </>
      )}

      {detailDino && (
        <DinoDetailModal
          dino={dinoMap.get(detailDino.id) ?? detailDino}
          onClose={() => setDetailDino(null)}
        />
      )}
    </PageFrame>
  );
}
