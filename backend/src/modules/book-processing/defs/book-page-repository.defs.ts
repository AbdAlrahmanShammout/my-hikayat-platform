import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { BookPageSpreadRole } from '@/modules/book-processing/enum/general.enum';

export type CreateBookPageRepoInput = {
  readonly spineIndex: number;
  readonly href: string;
  readonly manifestId: string;
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly spreadRole: BookPageSpreadRole;
};

export type CreateBookSpreadRepoInput = {
  readonly spreadIndex: number;
  readonly leftSpineIndex: number | null;
  readonly rightSpineIndex: number | null;
  readonly centerSpineIndex: number | null;
};

export type ReplaceBookFixedLayoutRepoInput = {
  readonly bookId: number;
  readonly pages: readonly CreateBookPageRepoInput[];
  readonly spreads: readonly CreateBookSpreadRepoInput[];
};

export type BookFixedLayoutStructure = {
  readonly pages: BookPageEntity[];
  readonly spreads: BookSpreadEntity[];
};
