import { Heart } from 'lucide-react';
import { useFavorites } from '../../state/FavoritesContext';

// 收藏按钮：所有页面共用同一个 FavoritesContext，状态自动保持一致
export default function FavoriteButton({ dino, className = '', withLabel = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(dino.id);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `取消收藏 ${dino.name}` : `收藏 ${dino.name}`}
      title={active ? '取消收藏' : '加入收藏'}
      onClick={(event) => {
        event.stopPropagation();
        toggleFavorite(dino.id);
      }}
      className={`inline-flex items-center gap-1.5 transition-all ${
        active ? 'text-red-400 hover:text-red-300' : 'text-bone/50 hover:text-red-300'
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} />
      {withLabel && (
        <span className="font-serif text-xs tracking-widest">{active ? '已收藏' : '收藏'}</span>
      )}
    </button>
  );
}
