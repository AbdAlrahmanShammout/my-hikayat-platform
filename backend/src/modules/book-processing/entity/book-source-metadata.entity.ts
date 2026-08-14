import { BaseEntity } from '@/common/base/base.entity';
import { BookSourceMetadataZodType } from '@/modules/book-processing/zod/book-source-metadata.zod';

export class BookSourceMetadataEntity extends BaseEntity {
  bookId!: number;
  packagePath!: string;
  epubVersion!: string;
  identifier!: string;
  title!: string;
  language!: string;
  creator!: string | null;
  publisher!: string | null;
  description!: string | null;

  constructor(data: BookSourceMetadataZodType) {
    super();
    Object.assign(this, data);
  }
}
