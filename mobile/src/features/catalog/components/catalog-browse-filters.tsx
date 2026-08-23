import type { JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CatalogSort } from '@/features/catalog/api/list-catalog-books';
import type { components } from '@/generated/reader';
import { theme } from '@/theme/theme';

type Category = components['schemas']['CategoryResponse'];

type CatalogBrowseFiltersProps = {
  readonly sort: CatalogSort;
  readonly categoryId: number | undefined;
  readonly categories: readonly Category[];
  readonly onChangeSort: (sort: CatalogSort) => void;
  readonly onChangeCategoryId: (categoryId: number | undefined) => void;
};

/**
 * Sort and category filter chips for catalog browse.
 */
export function CatalogBrowseFilters({
  sort,
  categoryId,
  categories,
  onChangeSort,
  onChangeCategoryId,
}: CatalogBrowseFiltersProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort</Text>
      <View style={styles.row}>
        <FilterChip
          label="Newest"
          isSelected={sort === 'newest'}
          onPress={() => {
            onChangeSort('newest');
          }}
        />
        <FilterChip
          label="Popular"
          isSelected={sort === 'popularity'}
          onPress={() => {
            onChangeSort('popularity');
          }}
        />
      </View>
      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <FilterChip
          label="All"
          isSelected={categoryId === undefined}
          onPress={() => {
            onChangeCategoryId(undefined);
          }}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            isSelected={categoryId === category.id}
            onPress={() => {
              onChangeCategoryId(category.id);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type FilterChipProps = {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onPress: () => void;
};

function FilterChip({ label, isSelected, onPress }: FilterChipProps): JSX.Element {
  return (
    <Pressable
      style={[styles.chip, isSelected ? styles.chipSelected : null]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  chipLabelSelected: {
    color: theme.colors.onPrimary,
  },
});
