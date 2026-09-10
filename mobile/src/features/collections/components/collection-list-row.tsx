import type { JSX } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveCatalogCoverPresentation } from '@/features/catalog/lib/resolve-catalog-cover-presentation';
import type { DiscoveryCollection } from '@/features/collections/api/get-discovery-collection';
import { theme } from '@/theme/theme';
import { toViewShadow } from '@/ui/lib/to-view-shadow';

type CollectionListRowVariant = 'list' | 'shelf';

type CollectionListRowProps = {
  readonly collection: DiscoveryCollection;
  readonly onPress: (collectionId: number) => void;
  readonly variant?: CollectionListRowVariant;
};

const MOSAIC_SLOT_COUNT = 4;

/**
 * One curated collection card with a mosaic of available book covers.
 */
export function CollectionListRow({
  collection,
  onPress,
  variant = 'list',
}: CollectionListRowProps): JSX.Element {
  const bookCount: number = collection.books.length;
  const isShelf: boolean = variant === 'shelf';
  return (
    <Pressable
      style={[
        styles.card,
        toViewShadow(theme.shadows.sm),
        isShelf ? styles.shelfCard : null,
      ]}
      onPress={() => {
        onPress(collection.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open collection ${collection.title}`}
      testID={isShelf ? undefined : `collections-item-${collection.id}`}
    >
      <View style={[styles.mosaic, isShelf ? styles.shelfMosaic : null]} accessibilityElementsHidden>
        {Array.from({ length: MOSAIC_SLOT_COUNT }, (_, index) => (
          <CollectionMosaicCell
            key={index}
            collection={collection}
            index={index}
            isShelf={isShelf}
          />
        ))}
      </View>
      <View style={[styles.info, isShelf ? styles.shelfInfo : null]}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, isShelf ? styles.shelfTitle : null]} numberOfLines={2}>
            {collection.title}
          </Text>
          <Text style={styles.meta}>
            {`${bookCount} book${bookCount === 1 ? '' : 's'}`}
          </Text>
        </View>
        {isShelf ? null : <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

function CollectionMosaicCell(input: {
  readonly collection: DiscoveryCollection;
  readonly index: number;
  readonly isShelf: boolean;
}): JSX.Element {
  const cellStyle = input.isShelf ? styles.shelfMosaicCell : styles.mosaicCell;
  const book = input.collection.books[input.index];
  if (book === undefined) {
    return <View style={cellStyle} />;
  }
  const cover = resolveCatalogCoverPresentation(book.cover);
  if (cover.kind !== 'image') {
    return <View style={cellStyle} />;
  }
  return (
    <View style={cellStyle}>
      <Image source={{ uri: cover.url }} style={styles.mosaicImage} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  mosaic: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 130,
    backgroundColor: theme.colors.canvasWarm,
  },
  mosaicCell: {
    width: '50%',
    height: 65,
    backgroundColor: theme.colors.canvasWarm,
  },
  mosaicImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.scale.xs,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.lg,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  meta: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  chevron: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    color: theme.colors.textFaint,
  },
  shelfCard: {
    width: 160,
  },
  shelfMosaic: {
    height: 84,
  },
  shelfMosaicCell: {
    width: '50%',
    height: 42,
    backgroundColor: theme.colors.canvasWarm,
  },
  shelfInfo: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  shelfTitle: {
    fontSize: theme.typography.scale.base,
    fontStyle: 'normal',
    fontWeight: theme.typography.weights.bold,
  },
});
