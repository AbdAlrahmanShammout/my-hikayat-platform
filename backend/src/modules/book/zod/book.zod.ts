import { z } from 'zod';

import { BaseZodSchema, ZodDateNullable, ZodString } from '@/common/base/base.zod';
import { BookLayoutType, BookPublishingStatus, BookType } from '@/modules/book/enum/general.enum';
import { CategoryZodType } from '@/modules/category/zod/category.zod';

export type BookZodType = z.infer<typeof BookZodSchema>;

export const BookZodSchema = BaseZodSchema.extend({
  title: ZodString,
  description: ZodString,
  layoutType: z.nativeEnum(BookLayoutType).nullable(),
  bookType: z.nativeEnum(BookType),
  publishingStatus: z.nativeEnum(BookPublishingStatus),
  publishedAt: ZodDateNullable.optional(),
  categories: (z.any().nullish() as z.ZodType<CategoryZodType[] | null | undefined>).optional(),
});
