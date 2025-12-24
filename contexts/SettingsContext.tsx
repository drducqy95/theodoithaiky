
import React, { createContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  theme: 'light',
  fontFamily: 'times',
  fontSize: 'small',
  background: '#f3f4f6', // default light gray
  backgroundImage: undefined,
};

interface SettingsContextType {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => { },
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
