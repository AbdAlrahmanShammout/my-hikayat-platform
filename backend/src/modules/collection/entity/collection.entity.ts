import { BaseEntity } from '@/common/base/base.entity';
import { CollectionBookEntity } from '@/modules/collection/entity/collection-book.entity';
import { CollectionZodType } from '@/modules/collection/zod/collection.zod';

export class CollectionEntity extends BaseEntity {
  title!: string;
  description!: string | null;
  accentColor!: string | null;
  items?: CollectionBookEntity[];

  constructor(data: CollectionZodType) {
    super();
    Object.assign(this, data);
    this.description = data.description ?? null;
    this.accentColor = data.accentColor ?? null;
  }
}
