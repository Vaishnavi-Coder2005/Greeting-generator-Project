/**
 * Tiny, failure-safe wrapper around the browser's localStorage.
 * Used so that returning visitors (same phone, same QR) get their
 * language and sender details pre-filled — no login required.
 *
 * Build flag VITE_NO_STORAGE=1 swaps in an in-memory store
 * (used only for the sandboxed online preview, where storage is blocked).
 */
const PREFIX = "qrm.";

interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const memory = new Map<string, string>();
const memoryStore: KV = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

function store(): KV {
  if (import.meta.env.VITE_NO_STORAGE === "1") return memoryStore;
  try {
    return window.localStorage;
  } catch {
    return memoryStore; // blocked (private mode / sandboxed iframe)
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = store().getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    if (value === undefined || value === null) store().removeItem(PREFIX + key);
    else store().setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — ignore */
  }
}
