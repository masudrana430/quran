"use client";
import { useMemo, useSyncExternalStore } from "react";
const EVENT = "quran-local-change";
export function useLocalStore<T>(
  key: string,
  fallback: T,
): [T, (value: T) => boolean] {
  const initial = JSON.stringify(fallback);
  const snapshot = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener(EVENT, notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener(EVENT, notify);
      };
    },
    () => {
      try {
        return window.localStorage.getItem(key) ?? initial;
      } catch {
        return initial;
      }
    },
    () => initial,
  );
  const value = useMemo(() => {
    try {
      return JSON.parse(snapshot) as T;
    } catch {
      return fallback;
    }
  }, [snapshot, fallback]);
  return [
    value,
    (next) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event(EVENT));
        return true;
      } catch {
        return false;
      }
    },
  ];
}
export const BOOKMARKS = "quran:bookmarks:v1";
export const LEARNED = "quran:learned:v1";
export const LAST_READ = "quran:last-read:v1";
