import React, { createContext, useContext, useState, useCallback } from 'react';
import ThemedAlertModal from '../components/ThemedAlertModal';

const AlertContext = createContext({
  showAlert: () => {},
  hideAlert: () => {},
});

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error', // 'error' | 'warning' | 'info' | 'success'
    buttons: [],
    onClose: null,
  });

  const showAlert = useCallback(({
    title = '',
    message = '',
    type = 'error',
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
