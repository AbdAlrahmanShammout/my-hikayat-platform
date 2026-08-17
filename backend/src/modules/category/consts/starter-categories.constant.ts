import { DEFAULT_CATEGORY_WEIGHT } from '@/modules/category/consts';

export const STARTER_CATEGORIES = [
  { name: 'Picture Books', slug: 'picture-books', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
  { name: "Children's", slug: 'children-s', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
  { name: 'Fiction', slug: 'fiction', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
  { name: 'Nonfiction', slug: 'nonfiction', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
  { name: 'Young Adult', slug: 'young-adult', categoryWeight: DEFAULT_CATEGORY_WEIGHT },
] as const;
