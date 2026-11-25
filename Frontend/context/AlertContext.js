import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import ThemedAlertModal from '../components/ThemedAlertModal';

let globalAlertDispatcher = null;

// Intercept Alert.alert globally so native/web white popup boxes are replaced with ThemedAlertModal
if (!Alert.__originalAlert) {
  Alert.__originalAlert = Alert.alert;
  Alert.alert = (title, message, buttons, options) => {
    if (globalAlertDispatcher) {
      const titleStr = typeof title === 'string' ? title : String(title || '');
      const type =
        /error|fail|invalid|required|missing|decline|revok/i.test(titleStr)
          ? 'error'
          : /success|confirm|booked|approved|sent|verified|attach|download/i.test(titleStr)
          ? 'success'
          : /warn|caution|notice|limit/i.test(titleStr)
          ? 'warning'
          : 'info';

      globalAlertDispatcher({
        title: titleStr,
        message: typeof message === 'string' ? message : message ? String(message) : '',
        type,
        buttons: Array.isArray(buttons) && buttons.length > 0 ? buttons : [{ text: 'OK' }],
        onClose: options?.onDismiss || null,
      });
    } else {
      Alert.__originalAlert(title, message, buttons, options);
    }
  };
}

const AlertContext = createContext({
  showAlert: () => {},
  hideAlert: () => {},
});

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'error' | 'warning' | 'info' | 'success'
    buttons: [{ text: 'OK' }],
    onClose: null,
  });

  const showAlert = useCallback(({
    title = '',
    message = '',
    type = 'info',
    buttons = [{ text: 'OK' }],
    onClose = null,
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
      onClose,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => {
      if (prev.onClose) prev.onClose();
      return { ...prev, visible: false };
    });
  }, []);

  useEffect(() => {
    globalAlertDispatcher = showAlert;
    return () => {
      globalAlertDispatcher = null;
    };
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <ThemedAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useThemedAlert = () => useContext(AlertContext);
