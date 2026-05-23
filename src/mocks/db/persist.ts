const DB_PREFIX = "mockdb_";

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to persist DB data:", e);
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(DB_PREFIX + key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function flushKey(key: string, entry: { data: unknown; dirty: boolean }) {
  if (entry.dirty) {
    saveToStorage(key, entry.data);
    entry.dirty = false;
  }
}

type DirtyEntry = { data: unknown; dirty: boolean };

export function createPersisted<T extends object>(key: string, defaultValue: T): T {
  const stored = loadFromStorage<T>(key);
  const data: T = stored !== null ? stored : structuredClone(defaultValue);
  const entry: DirtyEntry = { data, dirty: false };
  let scheduled = false;

  if (stored === null) {
    saveToStorage(key, data);
  }

  return new Proxy(data, {
    set(target, prop, value) {
      (target as Record<string | symbol, unknown>)[prop] = value;
      if (!entry.dirty) {
        entry.dirty = true;
        if (!scheduled) {
          scheduled = true;
          queueMicrotask(() => {
            scheduled = false;
            flushKey(key, entry);
          });
        }
      }
      return true;
    },
    deleteProperty(target, prop) {
      const had = prop in target;
      delete (target as Record<string | symbol, unknown>)[prop];
      if (had && !entry.dirty) {
        entry.dirty = true;
        if (!scheduled) {
          scheduled = true;
          queueMicrotask(() => {
            scheduled = false;
            flushKey(key, entry);
          });
        }
      }
      return true;
    },
  });
}
