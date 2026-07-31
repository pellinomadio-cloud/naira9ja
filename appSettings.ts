import { AppSettings, DEFAULT_APP_SETTINGS } from './types';

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
  } catch (e) {
    console.error('Failed to save app settings:', e);
  }
};
