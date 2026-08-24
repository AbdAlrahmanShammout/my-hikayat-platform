import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DiscoveryCollection } from '@/features/collections/api/get-discovery-collection';
import { theme } from '@/theme/theme';

type CollectionListRowProps = {
  readonly collection: DiscoveryCollection;
  readonly onPress: (collectionId: number) => void;
};

/**
 * One curated collection row with a large tap target.
 */
export function CollectionListRow({ collection, onPress }: CollectionListRowProps): JSX.Element {
  const bookCount: number = collection.books.length;
  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        onPress(collection.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open collection ${collection.title}`}
      testID={`collections-item-${collection.id}`}
    >
      <View style={styles.textBlock}>
        <Text style={styles.title}>{collection.title}</Text>
        <Text style={styles.meta}>
          {`${bookCount} book${bookCount === 1 ? '' : 's'}`}
        </Text>
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
  },
  textBlock: {
    gap: theme.spacing.xxs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  meta: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
});
