import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ReaderSettings } from '@/types';
import { db } from '@/services/database';
import { DEFAULT_SETTINGS } from '@/constants';

interface SettingsContextType {
  settings: ReaderSettings;
  updateSettings: (updates: Partial<ReaderSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = (await db.get('settings', 'reader')) as ReaderSettings | undefined;
      if (stored) {
        setSettings(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<ReaderSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      await db.put('settings', newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await db.put('settings', DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  return <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
