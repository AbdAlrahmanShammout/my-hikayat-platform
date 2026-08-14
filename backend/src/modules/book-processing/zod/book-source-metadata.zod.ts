import { z } from 'zod';

import { BaseZodSchema, ZodNumber, ZodString, ZodStringNullable } from '@/common/base/base.zod';

export type BookSourceMetadataZodType = z.infer<typeof BookSourceMetadataZodSchema>;

export const BookSourceMetadataZodSchema = BaseZodSchema.extend({
  bookId: ZodNumber,
  packagePath: ZodString,
  epubVersion: ZodString,
  identifier: ZodString,
  title: ZodString,
  language: ZodString,
  creator: ZodStringNullable.optional(),
  publisher: ZodStringNullable.optional(),
  description: ZodStringNullable.optional(),
});
