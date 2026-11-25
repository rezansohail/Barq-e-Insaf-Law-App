import { Alert } from 'react-native';

/**
 * Universal confirmation dialog that routes to Barq-e-Insaf's themed alert modal.
 */
export const showConfirm = (title, message, onConfirm, { confirmText = 'Confirm', destructive = false } = {}) => {
  Alert.alert(title, message || '', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
};

/**
 * Universal information / alert popup that routes to Barq-e-Insaf's themed alert modal.
 */
export const showMessage = (title, message) => {
  Alert.alert(title, message || '', [{ text: 'OK' }]);
};

export default {
  showConfirm,
  showMessage,
};
