import type { JSX } from 'react';

import { Badge } from '@/components/ui/badge';

type NamedCategory = {
  readonly id: number;
  readonly name: string;
};

type BookCategoryChipsProps = {
  readonly categories: ReadonlyArray<NamedCategory>;
};

/**
 * Category names as chips. Empty assignments stay a plain label.
 */
export function BookCategoryChips({ categories }: BookCategoryChipsProps): JSX.Element {
  if (categories.length === 0) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((category) => (
        <Badge key={category.id} variant="secondary" className="rounded-full whitespace-nowrap">
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
