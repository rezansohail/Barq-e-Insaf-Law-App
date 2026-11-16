import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevHost = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }

  // Attempt to read the host IP from Expo's dev config
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

  // Fallback to the developer's laptop Wi-Fi IP for Expo Go on physical devices
  return '10.133.133.165';
};

const host = getDevHost();
const BASE_URL = `http://${host}:5000/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { BASE_URL };
export default api;
