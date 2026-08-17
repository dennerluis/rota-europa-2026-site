(() => {
  const KEY = 'rota_europa_state_v2';
  const DB_NAME = 'rota-europa-2026';
  const STORE = 'travel-state';

  const safeParse = (value) => {
    try { return value ? JSON.parse(value) : null; } catch { return null; }
  };

  const localRead = () => {
    try { return safeParse(localStorage.getItem(KEY)); } catch { return null; }
  };

  const localWrite = (value) => {
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {}
  };

  const openDatabase = () => new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB indisponível'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const databaseRead = async () => {
    try {
      const db = await openDatabase();
      return await new Promise((resolve, reject) => {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).get('current');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch { return null; }
  };

  const databaseWrite = async (value) => {
    try {
      const db = await openDatabase();
      await new Promise((resolve, reject) => {
        const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, 'current');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {}
  };

  const snapshot = (state) => ({
    activeDay: state.activeDay || 0,
    filter: state.filter || 'all',
    paid: Array.isArray(state.paid) ? state.paid : [],
    expenses: Array.isArray(state.expenses) ? state.expenses : [],
    checked: Array.isArray(state.checked) ? state.checked : [],
    savedAt: Date.now(),
  });

  const requestPersistentStorage = () => {
    try { navigator.storage?.persist?.(); } catch {}
  };

  window.RotaStorage = {
    load: localRead,
    save(state) {
      const value = snapshot(state);
      localWrite(value);
      databaseWrite(value);
      requestPersistentStorage();
      return value;
    },
    async restore() {
      const [local, database] = await Promise.all([Promise.resolve(localRead()), databaseRead()]);
      const latest = [local, database].filter(Boolean).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0] || null;
      if (latest) localWrite(latest);
      requestPersistentStorage();
      return latest;
    },
  };
})();
