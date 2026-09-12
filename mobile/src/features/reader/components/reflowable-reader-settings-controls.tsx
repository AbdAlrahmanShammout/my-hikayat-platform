import type { JSX } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import {
  applyFontSizePreset,
  applyLineSpacingPreset,
  applyMarginPreset,
  applyReaderTheme,
  resolveFontSizePresetId,
  resolveLineSpacingPresetId,
  resolveMarginPresetId,
  type FontSizePresetId,
  type LineSpacingPresetId,
  type MarginPresetId,
  type ReflowableReaderSettings,
} from '@/features/reader/lib/reflowable-reader-settings';
import { theme } from '@/theme/theme';

type ReflowableReaderSettingsControlsProps = {
  readonly settings: ReflowableReaderSettings;
  readonly onApplySettings: (next: ReflowableReaderSettings) => void;
  readonly onToggleTheme: () => void;
  readonly themeControl?: 'switch' | 'chips';
  readonly testIDPrefix?: string;
};

const FONT_PRESETS: { readonly id: FontSizePresetId; readonly label: string }[] = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
];

const LINE_PRESETS: { readonly id: LineSpacingPresetId; readonly label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'normal', label: 'Normal' },
  { id: 'relaxed', label: 'Relaxed' },
];

const MARGIN_PRESETS: { readonly id: MarginPresetId; readonly label: string }[] = [
  { id: 'narrow', label: 'Narrow' },
  { id: 'normal', label: 'Normal' },
  { id: 'wide', label: 'Wide' },
];

const THEME_CHIPS: { readonly id: 'light' | 'dark'; readonly label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

/**
 * Shared Figma-mapped chips for reflowable font, spacing, margin, and theme.
 */
export function ReflowableReaderSettingsControls(
  props: ReflowableReaderSettingsControlsProps,
): JSX.Element {
  const prefix: string = props.testIDPrefix ?? 'reader';
  const themeControl: 'switch' | 'chips' = props.themeControl ?? 'chips';
  const selectedFont: FontSizePresetId = resolveFontSizePresetId(props.settings.fontScalePercent);
  const selectedLine: LineSpacingPresetId = resolveLineSpacingPresetId(props.settings.lineHeight);
  const selectedMargin: MarginPresetId = resolveMarginPresetId(props.settings.marginPx);
  return (
    <View style={styles.block} testID={`${prefix}-reflowable-settings`}>
      <PresetRow
        label="Font size"
        testID={`${prefix}-font-presets`}
        options={FONT_PRESETS}
        selectedId={selectedFont}
        onSelect={(id) => {
          props.onApplySettings(applyFontSizePreset(props.settings, id));
        }}
      />
      <PresetRow
        label="Line spacing"
        testID={`${prefix}-line-presets`}
        options={LINE_PRESETS}
        selectedId={selectedLine}
        onSelect={(id) => {
          props.onApplySettings(applyLineSpacingPreset(props.settings, id));
        }}
      />
      <PresetRow
        label="Page margin"
        testID={`${prefix}-margin-presets`}
        options={MARGIN_PRESETS}
        selectedId={selectedMargin}
        onSelect={(id) => {
          props.onApplySettings(applyMarginPreset(props.settings, id));
        }}
      />
      {themeControl === 'switch' ? (
        <View style={styles.switchRow} testID={`${prefix}-theme-switch-row`}>
          <Text style={styles.switchLabel}>Dark reading theme</Text>
          <Switch
            value={props.settings.theme === 'dark'}
            onValueChange={props.onToggleTheme}
            trackColor={{ false: theme.colors.borderDefault, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
            accessibilityLabel="Dark reading theme"
            testID={`${prefix}-theme-toggle`}
          />
        </View>
      ) : (
        <PresetRow
          label="Theme"
          testID={`${prefix}-theme-presets`}
          options={THEME_CHIPS}
          selectedId={props.settings.theme}
          onSelect={(id) => {
            props.onApplySettings(applyReaderTheme(props.settings, id));
          }}
        />
      )}
    </View>
  );
}

function PresetRow<TId extends string>(input: {
  readonly label: string;
  readonly testID: string;
  readonly options: ReadonlyArray<{ readonly id: TId; readonly label: string }>;
  readonly selectedId: TId;
  readonly onSelect: (id: TId) => void;
}): JSX.Element {
  return (
    <View style={styles.group} testID={input.testID}>
      <Text style={styles.groupLabel}>{input.label}</Text>
      <View style={styles.row}>
        {input.options.map((option) => {
          const isSelected: boolean = option.id === input.selectedId;
          return (
            <Pressable
              key={option.id}
              style={[styles.chip, isSelected ? styles.chipSelected : null]}
              onPress={() => {
                input.onSelect(option.id);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${input.label} ${option.label}`}
              testID={`${input.testID}-${option.id}`}
            >
              <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: theme.spacing.sm,
  },
  group: {
    gap: theme.spacing.xs,
  },
  groupLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.canvasWarm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  chipLabelSelected: {
    color: theme.colors.textOnBrand,
  },
  switchRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  switchLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
});
