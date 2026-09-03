import { useState, type JSX } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import { theme } from '@/theme/theme';

type CatalogBookCoverProps = {
  readonly cover: CatalogBook['cover'];
  readonly title: string;
  readonly size?: 'row' | 'detail';
  readonly style?: StyleProp<ViewStyle>;
};

/**
 * Catalog cover image with loading and placeholder states when artwork is missing or fails.
 */
export function CatalogBookCover({
  cover,
  title,
  size = 'row',
  style,
}: CatalogBookCoverProps): JSX.Element {
  const presentation = resolveCatalogCoverPresentation(cover);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(presentation.kind === 'image');
  const frameStyle = size === 'detail' ? styles.detailFrame : styles.rowFrame;
  if (presentation.kind === 'placeholder' || hasError) {
    return (
      <View
        style={[frameStyle, styles.placeholder, style]}
        accessibilityRole="image"
        accessibilityLabel={`No cover for ${title}`}
        testID="catalog-book-cover-placeholder"
      >
        <Text style={styles.placeholderLabel}>No cover</Text>
      </View>
    );
  }
  return (
    <View style={[frameStyle, style]} testID="catalog-book-cover">
      {isLoading ? (
        <View
          style={[StyleSheet.absoluteFillObject, styles.placeholder]}
          accessibilityElementsHidden
        >
          <Text style={styles.placeholderLabel}>…</Text>
        </View>
      ) : null}
      <Image
        source={{ uri: presentation.url }}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessibilityLabel={`Cover for ${title}`}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rowFrame: {
    width: 72,
    height: 96,
    borderRadius: theme.radii.control,
    overflow: 'hidden',
    backgroundColor: theme.colors.borderSubtle,
  },
  detailFrame: {
    width: 160,
    height: 214,
    borderRadius: theme.radii.control,
    overflow: 'hidden',
    backgroundColor: theme.colors.borderSubtle,
    alignSelf: 'flex-start',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.borderSubtle,
  },
  placeholderLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
