import { useCallback, useEffect, useState } from 'react';

import {
  decreaseFontScale,
  decreaseLineHeight,
  decreaseMargin,
  DEFAULT_REFLOWABLE_READER_SETTINGS,
  increaseFontScale,
  increaseLineHeight,
  increaseMargin,
  toggleReaderTheme,
  type ReflowableReaderSettings,
} from '@/features/reader/lib/reflowable-reader-settings';
import {
  loadReflowableReaderSettings,
  resetReflowableReaderSettings,
  saveReflowableReaderSettings,
} from '@/features/reader/lib/reflowable-reader-settings-storage';

export type UsePersistedReflowableReaderSettingsResult = {
  readonly settings: ReflowableReaderSettings;
  readonly isLoading: boolean;
  readonly applySettings: (next: ReflowableReaderSettings) => void;
  readonly increaseFont: () => void;
  readonly decreaseFont: () => void;
  readonly increaseLine: () => void;
  readonly decreaseLine: () => void;
  readonly increasePageMargin: () => void;
  readonly decreasePageMargin: () => void;
  readonly toggleTheme: () => void;
  readonly resetToDefaults: () => Promise<void>;
};

/**
 * Loads and persists device-local reflowable reading preferences.
 */
export function usePersistedReflowableReaderSettings(): UsePersistedReflowableReaderSettingsResult {
  const [settings, setSettings] = useState<ReflowableReaderSettings>(
    DEFAULT_REFLOWABLE_READER_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    void loadReflowableReaderSettings().then((loaded) => {
      if (isCancelled) {
        return;
      }
      setSettings(loaded);
      setIsLoading(false);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const applySettings = useCallback((next: ReflowableReaderSettings): void => {
    setSettings(next);
    void saveReflowableReaderSettings(next);
  }, []);

  const increaseFont = useCallback((): void => {
    applySettings(increaseFontScale(settings));
  }, [applySettings, settings]);

  const decreaseFont = useCallback((): void => {
    applySettings(decreaseFontScale(settings));
  }, [applySettings, settings]);

  const increaseLine = useCallback((): void => {
    applySettings(increaseLineHeight(settings));
  }, [applySettings, settings]);

  const decreaseLine = useCallback((): void => {
    applySettings(decreaseLineHeight(settings));
  }, [applySettings, settings]);

  const increasePageMargin = useCallback((): void => {
    applySettings(increaseMargin(settings));
  }, [applySettings, settings]);

  const decreasePageMargin = useCallback((): void => {
    applySettings(decreaseMargin(settings));
  }, [applySettings, settings]);

  const toggleTheme = useCallback((): void => {
    applySettings(toggleReaderTheme(settings));
  }, [applySettings, settings]);

  const resetToDefaults = useCallback(async (): Promise<void> => {
    const defaults = await resetReflowableReaderSettings();
    setSettings(defaults);
  }, []);

  return {
    settings,
    isLoading,
    applySettings,
    increaseFont,
    decreaseFont,
    increaseLine,
    decreaseLine,
    increasePageMargin,
    decreasePageMargin,
    toggleTheme,
    resetToDefaults,
  };
}
