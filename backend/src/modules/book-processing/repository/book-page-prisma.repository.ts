import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  BookFixedLayoutStructure,
  CreateBookPageRepoInput,
  CreateBookSpreadRepoInput,
  ReplaceBookFixedLayoutRepoInput,
} from '@/modules/book-processing/defs/book-page-repository.defs';
import { BookPageEntity } from '@/modules/book-processing/entity/book-page.entity';
import { BookPageMapper } from '@/modules/book-processing/mapper/book-page.mapper';
import { BookSpreadMapper } from '@/modules/book-processing/mapper/book-spread.mapper';
import { BookPageRepository } from '@/modules/book-processing/repository/book-page.repository';
import { BookPageType } from '@/modules/book-processing/types/book-page-details-schema.type';
import { BookSpreadType } from '@/modules/book-processing/types/book-spread-details-schema.type';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

@Injectable()
export class BookPagePrismaRepository implements BookPageRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async replaceByBookId(input: ReplaceBookFixedLayoutRepoInput): Promise<BookFixedLayoutStructure> {
    return this.prismaProviderService.$transaction(async (transactionClient) => {
      await transactionClient.bookSpread.deleteMany({ where: { bookId: input.bookId } });
      await transactionClient.bookPage.deleteMany({ where: { bookId: input.bookId } });
      const pageRows: BookPageType[] = await Promise.all(
        input.pages.map((page) =>
          transactionClient.bookPage.create({
            data: BookPagePrismaRepository.toPageCreateData(input.bookId, page),
          }),
        ),
      );
      const pagesBySpineIndex = new Map(pageRows.map((row) => [row.spineIndex, row.id] as const));
      const spreadRows: BookSpreadType[] = await Promise.all(
        input.spreads.map((spread) =>
          transactionClient.bookSpread.create({
            data: BookPagePrismaRepository.toSpreadCreateData(
              input.bookId,
              spread,
              pagesBySpineIndex,
            ),
          }),
        ),
      );
      return {
        pages: pageRows.map((row) => BookPageMapper.toEntity(row)),
        spreads: spreadRows.map((row) => BookSpreadMapper.toEntity(row)),
      };
    });
  }

  async listByBookId(bookId: number): Promise<BookPageEntity[]> {
    const rows: BookPageType[] = await this.prismaProviderService.bookPage.findMany({
      where: { bookId, deletedAt: null },
      orderBy: [{ spineIndex: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => BookPageMapper.toEntity(row));
  }

  private static toPageCreateData(
    bookId: number,
    page: CreateBookPageRepoInput,
  ): Prisma.BookPageCreateInput {
    return {
      book: { connect: { id: bookId } },
      spineIndex: page.spineIndex,
      href: page.href,
      manifestId: page.manifestId,
      title: page.title,
      width: page.width,
      height: page.height,
      spreadRole: page.spreadRole,
    };
  }

  private static toSpreadCreateData(
    bookId: number,
    spread: CreateBookSpreadRepoInput,
    pagesBySpineIndex: ReadonlyMap<number, number>,
  ): Prisma.BookSpreadCreateInput {
    return {
      book: { connect: { id: bookId } },
      spreadIndex: spread.spreadIndex,
      leftPage: BookPagePrismaRepository.connectPage(spread.leftSpineIndex, pagesBySpineIndex),
      rightPage: BookPagePrismaRepository.connectPage(spread.rightSpineIndex, pagesBySpineIndex),
      centerPage: BookPagePrismaRepository.connectPage(spread.centerSpineIndex, pagesBySpineIndex),
    };
  }

  private static connectPage(
    spineIndex: number | null,
    pagesBySpineIndex: ReadonlyMap<number, number>,
  ): { connect: { id: number } } | undefined {
    if (spineIndex === null) {
      return undefined;
    }
    const pageId: number | undefined = pagesBySpineIndex.get(spineIndex);
    if (pageId === undefined) {
      throw new Error(`Fixed-layout spread is missing page at spine index ${spineIndex}`);
    }
    return { connect: { id: pageId } };
  }
}
