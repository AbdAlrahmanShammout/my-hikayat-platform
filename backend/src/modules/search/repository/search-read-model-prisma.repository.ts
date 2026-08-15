import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BookLayoutType } from '@/modules/book/enum/general.enum';
import {
  SearchInBookHitRecord,
  SearchInBookRecordPage,
  SearchInBookRepoInput,
  SearchInBookRun,
} from '@/modules/search/defs/search-read-model-repository.defs';
import { SearchReadModelRepository } from '@/modules/search/repository/search-read-model.repository';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

type SpreadIndexRow = {
  readonly spreadIndex: number;
};

type FixedLayoutLayerRow = {
  readonly contentText: string;
  readonly page: {
    readonly spineIndex: number;
    readonly title: string;
    readonly leftSpreads: SpreadIndexRow[];
    readonly rightSpreads: SpreadIndexRow[];
    readonly centerSpreads: SpreadIndexRow[];
  };
  readonly runs: Array<{
    readonly text: string;
    readonly x: number;
    readonly y: number;
    readonly width: number | null;
    readonly height: number | null;
  }>;
};

@Injectable()
export class SearchReadModelPrismaRepository implements SearchReadModelRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async searchInBook(input: SearchInBookRepoInput): Promise<SearchInBookRecordPage> {
    if (input.layoutType === BookLayoutType.REFLOWABLE) {
      return this.searchReflowableHits(input);
    }
    if (input.layoutType === BookLayoutType.FIXED_LAYOUT) {
      return this.searchFixedLayoutHits(input);
    }
    return { hits: [], total: 0 };
  }

  private async searchReflowableHits(
    input: SearchInBookRepoInput,
  ): Promise<SearchInBookRecordPage> {
    const where: Prisma.BookChapterWhereInput = {
      bookId: input.bookId,
      deletedAt: null,
      contentText: { contains: input.query, mode: 'insensitive' },
    };
    const [rows, total] = await Promise.all([
      this.prismaProviderService.bookChapter.findMany({
        where,
        select: { spineIndex: true, title: true, contentText: true },
        orderBy: [{ spineIndex: 'asc' }, { id: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.bookChapter.count({ where }),
    ]);
    return {
      hits: rows.map((row) => ({
        layoutType: BookLayoutType.REFLOWABLE,
        spineIndex: row.spineIndex,
        pageNumber: null,
        spreadIndex: null,
        title: row.title,
        contentText: row.contentText,
        runs: [],
      })),
      total,
    };
  }

  private async searchFixedLayoutHits(
    input: SearchInBookRepoInput,
  ): Promise<SearchInBookRecordPage> {
    const where: Prisma.BookPageTextLayerWhereInput = {
      bookId: input.bookId,
      deletedAt: null,
      contentText: { contains: input.query, mode: 'insensitive' },
      page: { is: { deletedAt: null } },
    };
    const [rows, total] = await Promise.all([
      this.prismaProviderService.bookPageTextLayer.findMany({
        where,
        select: {
          contentText: true,
          page: {
            select: {
              spineIndex: true,
              title: true,
              leftSpreads: {
                where: { deletedAt: null },
                select: { spreadIndex: true },
                orderBy: { spreadIndex: 'asc' },
                take: 1,
              },
              rightSpreads: {
                where: { deletedAt: null },
                select: { spreadIndex: true },
                orderBy: { spreadIndex: 'asc' },
                take: 1,
              },
              centerSpreads: {
                where: { deletedAt: null },
                select: { spreadIndex: true },
                orderBy: { spreadIndex: 'asc' },
                take: 1,
              },
            },
          },
          runs: {
            where: { deletedAt: null },
            select: { text: true, x: true, y: true, width: true, height: true },
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          },
        },
        orderBy: [{ page: { spineIndex: 'asc' } }, { id: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prismaProviderService.bookPageTextLayer.count({ where }),
    ]);
    return {
      hits: rows.map((row) => SearchReadModelPrismaRepository.toFixedLayoutHit(row)),
      total,
    };
  }

  private static toFixedLayoutHit(row: FixedLayoutLayerRow): SearchInBookHitRecord {
    return {
      layoutType: BookLayoutType.FIXED_LAYOUT,
      spineIndex: row.page.spineIndex,
      pageNumber: row.page.spineIndex + 1,
      spreadIndex: SearchReadModelPrismaRepository.readSpreadIndex(row.page),
      title: row.page.title,
      contentText: row.contentText,
      runs: row.runs.map((run): SearchInBookRun => ({
        text: run.text,
        x: run.x,
        y: run.y,
        width: run.width,
        height: run.height,
      })),
    };
  }

  private static readSpreadIndex(page: FixedLayoutLayerRow['page']): number | null {
    const spread: SpreadIndexRow | undefined =
      page.leftSpreads[0] ?? page.rightSpreads[0] ?? page.centerSpreads[0];
    return spread === undefined ? null : spread.spreadIndex;
  }
}
