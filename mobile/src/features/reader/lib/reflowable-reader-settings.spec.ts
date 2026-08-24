import {
  decreaseFontScale,
  decreaseLineHeight,
  decreaseMargin,
  DEFAULT_REFLOWABLE_READER_SETTINGS,
  increaseFontScale,
  increaseLineHeight,
  increaseMargin,
  toggleReaderTheme,
} from '@/features/reader/lib/reflowable-reader-settings';

describe('reflowableReaderSettings', () => {
  it('clamps font scale at the upper bound', () => {
    let settings = DEFAULT_REFLOWABLE_READER_SETTINGS;
    for (let index = 0; index < 20; index += 1) {
      settings = increaseFontScale(settings);
    }
    expect(settings.fontScalePercent).toBe(160);
  });

  it('toggles theme between light and dark', () => {
    const dark = toggleReaderTheme(DEFAULT_REFLOWABLE_READER_SETTINGS);
    expect(dark.theme).toBe('dark');
    expect(toggleReaderTheme(dark).theme).toBe('light');
  });

  it('adjusts line height and margin within bounds', () => {
    const taller = increaseLineHeight(DEFAULT_REFLOWABLE_READER_SETTINGS);
    const roomier = increaseMargin(taller);
    expect(taller.lineHeight).toBeGreaterThan(DEFAULT_REFLOWABLE_READER_SETTINGS.lineHeight);
    expect(roomier.marginPx).toBeGreaterThan(DEFAULT_REFLOWABLE_READER_SETTINGS.marginPx);
    expect(decreaseFontScale(roomier).fontScalePercent).toBeLessThan(roomier.fontScalePercent);
    expect(decreaseLineHeight(roomier).lineHeight).toBeLessThan(roomier.lineHeight);
    expect(decreaseMargin(roomier).marginPx).toBeLessThan(roomier.marginPx);
  });
});
