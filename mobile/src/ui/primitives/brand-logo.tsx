import type { JSX } from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

export type BrandLogoVariant = 'lockup' | 'icon';

type BrandLogoProps = {
  readonly variant?: BrandLogoVariant;
  readonly size?: number;
  readonly style?: StyleProp<ImageStyle>;
  readonly testID?: string;
};

const LOCKUP_SOURCE = require('../../../assets/hikayat-logo.png');
const ICON_SOURCE = require('../../../assets/hikayat-icon.png');

/**
 * Official My Hikayat mark. Prefer lockup on light surfaces; icon on dark/splash.
 */
export function BrandLogo({
  variant = 'icon',
  size = 32,
  style,
  testID,
}: BrandLogoProps): JSX.Element {
  const source = variant === 'lockup' ? LOCKUP_SOURCE : ICON_SOURCE;
  return (
    <Image
      source={source}
      accessibilityRole="image"
      accessibilityLabel="My Hikayat"
      resizeMode="contain"
      style={[styles.base, { width: size, height: size }, style]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'center',
  },
});
