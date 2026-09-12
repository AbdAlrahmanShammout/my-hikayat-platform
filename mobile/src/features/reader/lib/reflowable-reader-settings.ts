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

export type FontSizePresetId = 's' | 'm' | 'l';
export type LineSpacingPresetId = 'compact' | 'normal' | 'relaxed';
export type MarginPresetId = 'narrow' | 'normal' | 'wide';

export const FONT_SIZE_PRESET_VALUES: Record<FontSizePresetId, number> = {
  s: 100,
  m: 110,
  l: 130,
};

export const LINE_SPACING_PRESET_VALUES: Record<LineSpacingPresetId, number> = {
  compact: 1.3,
  normal: 1.55,
  relaxed: 1.8,
};

export const MARGIN_PRESET_VALUES: Record<MarginPresetId, number> = {
  narrow: 12,
  normal: 18,
  wide: 32,
};

/**
 * Maps Figma font size chips onto persisted fontScalePercent values.
 */
export function applyFontSizePreset(
  settings: ReflowableReaderSettings,
  presetId: FontSizePresetId,
): ReflowableReaderSettings {
  return {
    ...settings,
    fontScalePercent: FONT_SIZE_PRESET_VALUES[presetId],
  };
}

/**
 * Maps Figma line-spacing chips onto persisted lineHeight values.
 */
export function applyLineSpacingPreset(
  settings: ReflowableReaderSettings,
  presetId: LineSpacingPresetId,
): ReflowableReaderSettings {
  return {
    ...settings,
    lineHeight: LINE_SPACING_PRESET_VALUES[presetId],
  };
}

/**
 * Maps Figma margin chips onto persisted marginPx values.
 */
export function applyMarginPreset(
  settings: ReflowableReaderSettings,
  presetId: MarginPresetId,
): ReflowableReaderSettings {
  return {
    ...settings,
    marginPx: MARGIN_PRESET_VALUES[presetId],
  };
}

/**
 * Resolves the nearest Figma font chip for the stored percent.
 */
export function resolveFontSizePresetId(fontScalePercent: number): FontSizePresetId {
  return resolveNearestPresetId(fontScalePercent, FONT_SIZE_PRESET_VALUES);
}

/**
 * Resolves the nearest Figma line-spacing chip for the stored line height.
 */
export function resolveLineSpacingPresetId(lineHeight: number): LineSpacingPresetId {
  return resolveNearestPresetId(lineHeight, LINE_SPACING_PRESET_VALUES);
}

/**
 * Resolves the nearest Figma margin chip for the stored margin.
 */
export function resolveMarginPresetId(marginPx: number): MarginPresetId {
  return resolveNearestPresetId(marginPx, MARGIN_PRESET_VALUES);
}

function resolveNearestPresetId<TId extends string>(
  value: number,
  presets: Record<TId, number>,
): TId {
  const entries = Object.entries(presets) as Array<[TId, number]>;
  let nearestId: TId = entries[0]?.[0] as TId;
  let nearestDiff: number = Number.POSITIVE_INFINITY;
  for (const [id, presetValue] of entries) {
    const diff: number = Math.abs(presetValue - value);
    if (diff < nearestDiff) {
      nearestId = id;
      nearestDiff = diff;
    }
  }
  return nearestId;
}
