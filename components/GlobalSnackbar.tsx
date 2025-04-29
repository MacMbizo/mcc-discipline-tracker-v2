import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';

interface SnackbarContextType {
  showSnackbar: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = (msg: string, dur?: number) => {
    setMessage(msg);
    setDuration(dur || 3000);
    setVisible(true);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={duration}
        style={{ position: 'absolute', bottom: 0 }}
        action={{ label: 'OK', onPress: () => setVisible(false) }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
