import { z } from 'zod';

import {
  BaseZodSchema,
  ZodBoolean,
  ZodNumber,
  ZodString,
  ZodStringNullable,
} from '@/common/base/base.zod';
import { BookAssetKind } from '@/modules/book-asset/enum/general.enum';

export type BookAssetZodType = z.infer<typeof BookAssetZodSchema>;

export const BookAssetZodSchema = BaseZodSchema.extend({
  bookId: ZodNumber,
  kind: z.nativeEnum(BookAssetKind),
  storageKey: ZodString,
  contentType: ZodString,
  byteSize: ZodNumber,
  checksumSha256: ZodStringNullable.optional(),
  originalFileName: ZodStringNullable.optional(),
  sortOrder: ZodNumber,
  isEncrypted: ZodBoolean,
});
