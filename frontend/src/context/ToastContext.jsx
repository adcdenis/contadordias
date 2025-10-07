import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext({ showToast: () => {} });

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => setVisible(false), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 bg-opacity-80 text-white px-4 py-2 rounded shadow">
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);