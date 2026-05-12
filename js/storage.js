/**
 * storage.js
 * Handles saving and loading all app state to/from localStorage.
 * Images are stored as base64 strings.
 */

const STORAGE_KEY = 'photoboard_v1';

const Storage = {
  save(albums, meta) {
    try {
      const data = { albums, meta, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage can throw if storage quota is exceeded (too many/large images)
      console.warn('Photo Board: No se pudo guardar en localStorage.', e.message);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Photo Board: No se pudo leer desde localStorage.', e);
      return null;
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
