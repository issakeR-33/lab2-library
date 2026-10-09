export interface StorageBackend {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Обгортка над LocalStorage: зберігає, читає та видаляє дані застосунку у форматі JSON.
 * Усі ключі мають префікс, тому `clear` не чіпає чужі дані на тому ж домені.
 */
export class Storage {
  private readonly backend: StorageBackend;
  private readonly prefix: string;

  constructor(backend: StorageBackend = globalThis.localStorage, prefix = 'library-app:') {
    this.backend = backend;
    this.prefix = prefix;
  }

  save<T>(key: string, value: T): void {
    this.backend.setItem(this.prefix + key, JSON.stringify(value));
  }

  load<T>(key: string, fallback: T): T {
    const raw = this.backend.getItem(this.prefix + key);
    if (raw === null) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  remove(key: string): void {
    this.backend.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys: string[] = [];
    for (let i = 0; i < this.backend.length; i++) {
      const key = this.backend.key(i);
      if (key !== null && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => this.backend.removeItem(key));
  }
}
