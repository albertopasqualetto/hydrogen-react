import AsyncStorage from '@react-native-async-storage/async-storage';

// Factory function for localStorage/sessionStorage
function createStorage(prefix: string): Storage {
  return {
    setItem(key: string, value: string): void {
      AsyncStorage.setItem(`${prefix}_${key}`, value);
    },

    getItem(key: string): string | null {
      let result: string | null = null;
      AsyncStorage.getItem(`${prefix}_${key}`).then(value => {
        result = value;
      });
      return result;
    },

    removeItem(key: string): void {
      AsyncStorage.removeItem(`${prefix}_${key}`);
    },

    clear(): void {
      AsyncStorage.getAllKeys().then((keys) => {
        const filteredKeys = keys.filter((k) => k.startsWith(`${prefix}_`));
        AsyncStorage.multiRemove(filteredKeys);
      });
    },

    get length(): number {
      // Not accurate; for compatibility only
      console.warn(`[${prefix}] .length is a stub. Always returns 0!.`);
      return 0;
    },

    key(n: number): string | null {
      let result: string | null = null;
      AsyncStorage.getAllKeys().then((keys) => {
        const filtered = keys.filter((k) => k.startsWith(`${prefix}_`));
        const clean = filtered.map((k) => k.replace(`${prefix}_`, ""));
        result = clean[n] ?? null;
      });
      return result;
    },
  };
}

// Ensure globalThis.window exists
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {};
}

// Assign polyfills
globalThis.window.localStorage = createStorage("local");
// globalThis.window.sessionStorage = createStorage("session");