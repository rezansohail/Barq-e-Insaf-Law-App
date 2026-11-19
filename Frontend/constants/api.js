import axios from 'axios';
import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';
import { getToken } from './authStore';

const getDevHost = () => {
  // 1. In web browser, always use current browser location
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }

  // 2. On physical mobile devices running Expo Go, read the exact IP Metro bundle was loaded from
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }

  // 3. Attempt to read host from Expo dev config
  const hostUri = Constants.expoConfig?.hostUri 
    || Constants.manifest2?.extra?.expoGo?.debuggerHost
    || Constants.manifest?.debuggerHost
    || (Constants.experienceUrl ? Constants.experienceUrl.replace(/^[a-z]+:\/\//, '') : null);

  if (hostUri) {
    const extracted = hostUri.split(':')[0];
    if (extracted && extracted !== 'localhost' && extracted !== '127.0.0.1') {
      return extracted;
    }
  }

  // 4. Current active laptop Wi-Fi IP fallback
  return '10.40.236.161';
};

const host = getDevHost();
const BASE_URL = `http://${host}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic interceptor to ensure requests always use current active host and auth token
api.interceptors.request.use((config) => {
  const currentHost = getDevHost();
  if (currentHost && config.baseURL && !config.baseURL.includes(currentHost)) {
    config.baseURL = `http://${currentHost}:5000/api`;
  }
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { BASE_URL, getDevHost };
export default api;
