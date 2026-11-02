'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'dpv-progress';
const TOTAL = 23;

interface ProgressContextValue {
  visited: Set<string>;
  visitedList: string[];
  count: number;
  total: number;
  markVisited: (id: string) => void;
  reset: () => void;
  isVisited: (id: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readInitial(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
    return [];
  } catch {
    return [];
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [visitedList, setVisitedList] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVisitedList(readInitial());
    setMounted(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const markVisited = useCallback(
    (id: string) => {
      setVisitedList((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const reset = useCallback(() => {
    setVisitedList([]);
    persist([]);
  }, [persist]);

  const visited = useMemo(() => new Set(visitedList), [visitedList]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      visited,
      visitedList,
      count: visitedList.length,
      total: TOTAL,
      markVisited,
      reset,
      isVisited: (id) => visited.has(id)
    }),
    [visited, visitedList, markVisited, reset]
  );

  return (
    <ProgressContext.Provider value={value}>
      {/* Avoid hydration mismatches: children render with empty state on SSR */}
      <span data-progress-mounted={mounted ? '1' : '0'} hidden />
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within <ProgressProvider>');
  return ctx;
}
