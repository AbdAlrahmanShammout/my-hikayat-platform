import { z } from 'zod';

import { BaseZodSchema, ZodDateNullable, ZodNumber, ZodString } from '@/common/base/base.zod';
import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
} from '@/modules/book/enum/general.enum';
import { CategoryZodType } from '@/modules/category/zod/category.zod';
import { UserZodType } from '@/modules/user/zod/user.zod';

export type BookZodType = z.infer<typeof BookZodSchema>;

export const BookZodSchema = BaseZodSchema.extend({
  title: ZodString,
  description: ZodString,
  layoutType: z.nativeEnum(BookLayoutType).nullable(),
  bookType: z.nativeEnum(BookType),
  publishingStatus: z.nativeEnum(BookPublishingStatus),
  processingStatus: z.nativeEnum(BookProcessingStatus),
  publishedAt: ZodDateNullable.optional(),
  ownerId: ZodNumber,
  owner: (z.any() as z.ZodType<UserZodType | null | undefined>).optional(),
  categories: (z.any().nullish() as z.ZodType<CategoryZodType[] | null | undefined>).optional(),
});
