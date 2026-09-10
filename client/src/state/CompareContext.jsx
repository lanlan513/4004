import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

// 对比选择：全局内存状态（不持久化），最多同时选择 3 只恐龙
export const COMPARE_MIN = 2;
export const COMPARE_MAX = 3;

function compareReducer(state, action) {
  switch (action.type) {
    case 'toggle':
      if (state.includes(action.id)) {
        return state.filter((id) => id !== action.id);
      }
      if (state.length >= COMPARE_MAX) return state;
      return [...state, action.id];
    case 'remove':
      return state.filter((id) => id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareIds, dispatch] = useReducer(compareReducer, []);

  const toggleCompare = useCallback((id) => dispatch({ type: 'toggle', id }), []);
  const removeCompare = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const clearCompare = useCallback(() => dispatch({ type: 'clear' }), []);

  // 达到上限时禁止继续勾选，组件据此给出提示或禁用复选框
  const atLimit = compareIds.length >= COMPARE_MAX;

  // 尝试加入第 4 只时触发一次瞬时提示（由 CompareBar 消费，2.6s 后自动消失）
  const [notice, setNotice] = useReducer((_, next) => (next ? { text: next, at: Date.now() } : null), null);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timer);
  }, [notice]);
  const guardedToggle = useCallback(
    (id) => {
      if (!compareIds.includes(id) && compareIds.length >= COMPARE_MAX) {
        setNotice(`最多同时对比 ${COMPARE_MAX} 只恐龙，请先取消一只`);
        return;
      }
      dispatch({ type: 'toggle', id });
    },
    [compareIds],
  );

  const value = useMemo(
    () => ({
      compareIds,
      compareIdSet: new Set(compareIds),
      isComparing: (id) => compareIds.includes(id),
      canStart: compareIds.length >= COMPARE_MIN,
      atLimit,
      notice: notice?.text ?? '',
      toggleCompare: guardedToggle,
      removeCompare,
      clearCompare,
    }),
    [compareIds, atLimit, notice, guardedToggle, removeCompare, clearCompare],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare 必须在 <CompareProvider> 内使用');
  return ctx;
}
