import { BaseEntity } from '@/common/base/base.entity';
import { CategoryZodType } from '@/modules/category/zod/category.zod';

export class CategoryEntity extends BaseEntity {
  name!: string;
  slug!: string;
  categoryWeight!: number;

  constructor(data: CategoryZodType) {
    super();
    Object.assign(this, data);
  }
}
