export type SaveBlob = Record<string, unknown>;

const STORAGE_KEY = 'arcstick-save-v1';

export class SaveSystem {
  static load<T extends SaveBlob>(fallback: T): T {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      return { ...fallback, ...JSON.parse(raw) } as T;
    } catch {
      return fallback;
    }
  }

  static save(data: SaveBlob): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}