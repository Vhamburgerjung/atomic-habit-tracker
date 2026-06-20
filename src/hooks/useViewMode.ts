import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type ViewMode = "full" | "compact" | "week";

const STORAGE_KEY = "atomic.viewMode";
const DEFAULT_MODE: ViewMode = "full";

function isViewMode(value: string | null): value is ViewMode {
  return value === "full" || value === "compact" || value === "week";
}

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_MODE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (isViewMode(stored)) setViewModeState(stored);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setViewMode = useCallback((next: ViewMode) => {
    setViewModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  return { viewMode, setViewMode, isHydrated };
}
