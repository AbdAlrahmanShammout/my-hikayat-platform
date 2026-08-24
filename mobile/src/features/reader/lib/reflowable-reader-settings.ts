export type ReflowableReaderTheme = 'light' | 'dark';

export type ReflowableReaderSettings = {
  readonly fontScalePercent: number;
  readonly lineHeight: number;
  readonly marginPx: number;
  readonly theme: ReflowableReaderTheme;
};

export const DEFAULT_REFLOWABLE_READER_SETTINGS: ReflowableReaderSettings = {
  fontScalePercent: 110,
  lineHeight: 1.55,
  marginPx: 18,
  theme: 'light',
};

const FONT_MIN = 90;
const FONT_MAX = 160;
const FONT_STEP = 10;
const LINE_MIN = 1.2;
const LINE_MAX = 2;
const LINE_STEP = 0.1;
const MARGIN_MIN = 8;
const MARGIN_MAX = 36;
const MARGIN_STEP = 4;

/**
 * Increases reflowable font scale within allowed bounds.
 */
export function increaseFontScale(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    fontScalePercent: Math.min(FONT_MAX, settings.fontScalePercent + FONT_STEP),
  };
}

/**
 * Decreases reflowable font scale within allowed bounds.
 */
export function decreaseFontScale(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    fontScalePercent: Math.max(FONT_MIN, settings.fontScalePercent - FONT_STEP),
  };
}

/**
 * Increases reflowable line height within allowed bounds.
 */
export function increaseLineHeight(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    lineHeight: Number(Math.min(LINE_MAX, settings.lineHeight + LINE_STEP).toFixed(2)),
  };
}

/**
 * Decreases reflowable line height within allowed bounds.
 */
export function decreaseLineHeight(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    lineHeight: Number(Math.max(LINE_MIN, settings.lineHeight - LINE_STEP).toFixed(2)),
  };
}

/**
 * Increases reflowable page margin within allowed bounds.
 */
export function increaseMargin(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    marginPx: Math.min(MARGIN_MAX, settings.marginPx + MARGIN_STEP),
  };
}

/**
 * Decreases reflowable page margin within allowed bounds.
 */
export function decreaseMargin(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    marginPx: Math.max(MARGIN_MIN, settings.marginPx - MARGIN_STEP),
  };
}

/**
 * Toggles reflowable light/dark theme.
 */
export function toggleReaderTheme(settings: ReflowableReaderSettings): ReflowableReaderSettings {
  return {
    ...settings,
    theme: settings.theme === 'light' ? 'dark' : 'light',
  };
}
