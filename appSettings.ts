import { useState, useEffect } from 'react';
import { AppSettings, DEFAULT_APP_SETTINGS } from './types';
import { subscribeToAppSettings } from './firestoreService';

export const getAppSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem('naira9ja_app_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_APP_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load app settings:', e);
  }
  return DEFAULT_APP_SETTINGS;
};

export const saveAppSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem('naira9ja_app_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('naira9ja_app_settings_updated'));
  } catch (e) {
    console.warn('Notice saving app settings:', e);
  }
};

export const useAppSettings = (): AppSettings => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getAppSettings());
    };

    window.addEventListener('naira9ja_app_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const unsub = subscribeToAppSettings((firestoreSettings) => {
      if (firestoreSettings) {
        setSettings({ ...DEFAULT_APP_SETTINGS, ...firestoreSettings });
      }
    });

    return () => {
      window.removeEventListener('naira9ja_app_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (unsub) unsub();
    };
  }, []);

  return settings;
};

