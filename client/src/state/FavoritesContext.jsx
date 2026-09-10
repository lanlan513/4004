import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

// 收藏状态：以恐龙 id 集合的形式持久化在 localStorage
const STORAGE_KEY = 'jurassic:favorite-dino-ids';

function readStoredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id) => Number.isInteger(id) && id > 0))];
  } catch {
    return [];
  }
}

// 单一状态源：所有变更都经过 reducer，便于测试与扩展（如分组、备注）
function favoritesReducer(state, action) {
  switch (action.type) {
    case 'toggle':
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id];
    case 'add':
      return state.includes(action.id) ? state : [...state, action.id];
    case 'remove':
      return state.filter((id) => id !== action.id);
    case 'clear':
      return [];
    case 'replace':
      return action.ids;
    default:
      return state;
  }
}

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, dispatch] = useReducer(favoritesReducer, undefined, readStoredIds);

  // 状态变更后统一写回 localStorage，刷新与重开浏览器后保持一致
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // 隐私模式等场景下写入失败不影响内存中的收藏功能
    }
  }, [favoriteIds]);

  // 跨标签页同步：A 页收藏后，B 页的图鉴/收藏夹立即更新
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) dispatch({ type: 'replace', ids: readStoredIds() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleFavorite = useCallback((id) => dispatch({ type: 'toggle', id }), []);
  const addFavorite = useCallback((id) => dispatch({ type: 'add', id }), []);
  const removeFavorite = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const clearFavorites = useCallback(() => dispatch({ type: 'clear' }), []);

  const value = useMemo(
    () => ({
      favoriteIds,
      favoriteIdSet: new Set(favoriteIds),
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite,
      addFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favoriteIds, toggleFavorite, addFavorite, removeFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites 必须在 <FavoritesProvider> 内使用');
  return ctx;
}
