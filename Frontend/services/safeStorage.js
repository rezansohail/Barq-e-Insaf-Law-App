import { Platform } from 'react-native';

const inMemoryStore = new Map();

let nativeAsyncStorage = null;
try {
  nativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // Native module missing or running in web/non-native environment
}

export const safeStorage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.getItem === 'function') {
        const value = await nativeAsyncStorage.getItem(key);
        return value;
      }
    } catch (err) {
      // Silently fall back to in-memory store
    }
    return inMemoryStore.get(key) || null;
  },

  async setItem(key, value) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.setItem === 'function') {
        await nativeAsyncStorage.setItem(key, value);
        return;
      }
    } catch (err) {
      // Silently fall back to in-memory store
    }
    inMemoryStore.set(key, value);
  },

  async removeItem(key) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      if (nativeAsyncStorage && typeof nativeAsyncStorage.removeItem === 'function') {
        await nativeAsyncStorage.removeItem(key);
        return;
      }
    } catch (err) {
      // Silently fall back
    }
    inMemoryStore.delete(key);
  },
};

export default safeStorage;
