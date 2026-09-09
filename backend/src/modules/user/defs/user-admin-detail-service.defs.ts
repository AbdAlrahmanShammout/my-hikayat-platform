import { BookCatalogCover } from '@/modules/book-asset/defs/book-asset-service.defs';
import { BookEntity } from '@/modules/book/entity/book.entity';
import { BookLayoutType } from '@/modules/book/enum/general.enum';
import { SubscriptionPeriodProgress } from '@/modules/subscription/defs/subscription-period-progress.defs';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';

export type AdminUserReadingProgressItem = {
  readonly book: BookEntity;
  readonly cover: BookCatalogCover | null;
  readonly layoutType: BookLayoutType;
  readonly contentProgressPercent: number;
  readonly locationLabel: string | null;
  readonly spineIndex: number | null;
  readonly scrollOffset: number | null;
  readonly spreadIndex: number | null;
  readonly pageNumber: number | null;
  readonly activeDurationMs: number;
  readonly lastSessionAt: Date;
};

export type AdminUserDetail = {
  readonly user: UserEntity;
  readonly subscription: SubscriptionEntity | null;
  readonly periodProgress: SubscriptionPeriodProgress;
  readonly readingItems: readonly AdminUserReadingProgressItem[];
};
