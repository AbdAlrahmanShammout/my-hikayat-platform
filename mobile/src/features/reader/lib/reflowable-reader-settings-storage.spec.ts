import {
  loadReflowableReaderSettings,
  resetReflowableReaderSettings,
  saveReflowableReaderSettings,
} from './reflowable-reader-settings-storage';
import { DEFAULT_REFLOWABLE_READER_SETTINGS } from './reflowable-reader-settings';
import { deleteLocalValue } from '@/storage/local-storage';

jest.mock('@/storage/local-storage', () => {
  const memory = new Map<string, string>();
  return {
    readLocalValue: jest.fn(async (key: string) => memory.get(key) ?? null),
    writeLocalValue: jest.fn(async (key: string, value: string) => {
      memory.set(key, value);
    }),
    deleteLocalValue: jest.fn(async (key: string) => {
      memory.delete(key);
    }),
  };
});

describe('reflowableReaderSettingsStorage', () => {
  beforeEach(async () => {
    await deleteLocalValue('reader.reflowable.settings.v1');
  });

  it('returns defaults when nothing is stored', async () => {
    const actual = await loadReflowableReaderSettings();
    expect(actual).toEqual(DEFAULT_REFLOWABLE_READER_SETTINGS);
  });

  it('round-trips saved settings', async () => {
    const next = {
      ...DEFAULT_REFLOWABLE_READER_SETTINGS,
      fontScalePercent: 140,
      theme: 'dark' as const,
    };
    await saveReflowableReaderSettings(next);
    expect(await loadReflowableReaderSettings()).toEqual(next);
  });

  it('resets to defaults', async () => {
    await saveReflowableReaderSettings({
      ...DEFAULT_REFLOWABLE_READER_SETTINGS,
      marginPx: 32,
    });
    const actual = await resetReflowableReaderSettings();
    expect(actual).toEqual(DEFAULT_REFLOWABLE_READER_SETTINGS);
    expect(await loadReflowableReaderSettings()).toEqual(DEFAULT_REFLOWABLE_READER_SETTINGS);
  });
});
