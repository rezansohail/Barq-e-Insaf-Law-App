import { Alert, Platform } from 'react-native';

/**
 * Universal confirmation dialog that works on Web (window.confirm)
 * and Native (Alert.alert).
 */
export const showConfirm = (title, message, onConfirm, { confirmText = 'Confirm', destructive = false } = {}) => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    const confirmed = typeof window !== 'undefined' ? window.confirm(text) : true;
    if (confirmed && typeof onConfirm === 'function') {
      onConfirm();
    }
  } else {
    Alert.alert(title, message || '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
};

/**
 * Universal information / alert popup that works on Web (window.alert)
 * and Native (Alert.alert).
 */
export const showMessage = (title, message) => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined') {
      window.alert(text);
    }
  } else {
    Alert.alert(title, message || '', [{ text: 'OK' }]);
  }
};

export default {
  showConfirm,
  showMessage,
};
