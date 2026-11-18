import React, { createContext, useContext, useState } from 'react';
import LanguageModal from '../components/LanguageModal';

const LanguageModalContext = createContext({
  openLanguageModal: () => {},
  closeLanguageModal: () => {},
  isLanguageModalOpen: false,
});

export function LanguageModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LanguageModalContext.Provider
      value={{
        openLanguageModal: () => setIsOpen(true),
        closeLanguageModal: () => setIsOpen(false),
        isLanguageModalOpen: isOpen,
      }}
    >
      {children}
      <LanguageModal visible={isOpen} onClose={() => setIsOpen(false)} />
    </LanguageModalContext.Provider>
  );
}

export const useLanguageModal = () => useContext(LanguageModalContext);
export default LanguageModalContext;
