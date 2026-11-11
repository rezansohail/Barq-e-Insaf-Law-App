import { Platform } from 'react-native';

const STORAGE_KEY = 'barqeinsaf_session_auth';

let memorySession = null;

export const saveSession = (data) => {
  memorySession = { ...data };
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }
  }
};

export const getSession = () => {
  if (memorySession) return memorySession;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        memorySession = JSON.parse(stored);
        return memorySession;
      }
    } catch (e) {
      console.warn('Could not read session from localStorage:', e);
    }
  }

  return null;
};

export const getCurrentLawyerId = () => {
  const session = getSession();
  if (session && session.user && session.user.id) {
    return session.user.id;
  }
  if (session && session.id) {
    return session.id;
  }
  return 6;
};

export const getCurrentLawyerUser = () => {
  const session = getSession();
  return session?.user || null;
};

export const getToken = () => {
  const session = getSession();
  return session?.token || null;
};

export const clearSession = () => {
  memorySession = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear localStorage session:', e);
    }
  }
};
