import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CatalogBook } from '@/features/catalog/api/get-catalog-book';
import { CatalogBookCover } from '@/features/catalog/components/catalog-book-cover';
import { theme } from '@/theme/theme';

type CatalogBookRowProps = {
  readonly book: CatalogBook;
  readonly onPress: (bookId: number) => void;
};

/**
 * One catalog book row with a large tap target.
 */
export function CatalogBookRow({ book, onPress }: CatalogBookRowProps): JSX.Element {
  const categoryNames: string = book.categories.map((category) => category.name).join(', ');
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        onPress(book.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open ${book.title}`}
    >
      <CatalogBookCover cover={book.cover} title={book.title} size="row" />
      <View style={styles.textBlock}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.meta} numberOfLines={2}>
          {book.description}
        </Text>
        {categoryNames !== '' ? <Text style={styles.categories}>{categoryNames}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: theme.controlMinHeight,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: theme.spacing.xxs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  meta: {
    ...theme.typography.body,
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  categories: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
