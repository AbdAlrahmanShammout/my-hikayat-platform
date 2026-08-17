import { DEFAULT_CATEGORY_WEIGHT } from '@/modules/category/consts';
import { STARTER_CATEGORIES } from '@/modules/category/consts/starter-categories.constant';

describe('STARTER_CATEGORIES', () => {
  it('lists the five seeded taxonomy rows at the default weight', () => {
    expect(STARTER_CATEGORIES).toEqual([
      { name: 'Picture Books', slug: 'picture-books', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
      { name: "Children's", slug: 'children-s', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
      { name: 'Fiction', slug: 'fiction', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
      { name: 'Nonfiction', slug: 'nonfiction', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
      { name: 'Young Adult', slug: 'young-adult', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
    ]);
  });
});
