import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  CreateBookChapterRepoInput,
  ReplaceBookChaptersRepoInput,
} from '@/modules/book-processing/defs/book-chapter-repository.defs';
import { BookChapterEntity } from '@/modules/book-processing/entity/book-chapter.entity';
import { BookChapterMapper } from '@/modules/book-processing/mapper/book-chapter.mapper';
import { BookChapterRepository } from '@/modules/book-processing/repository/book-chapter.repository';
import { BookChapterType } from '@/modules/book-processing/types/book-chapter-details-schema.type';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

@Injectable()
export class BookChapterPrismaRepository implements BookChapterRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async replaceByBookId(input: ReplaceBookChaptersRepoInput): Promise<BookChapterEntity[]> {
    const rows: BookChapterType[] = await this.prismaProviderService.$transaction(
      async (transactionClient) => {
        await transactionClient.bookChapter.deleteMany({ where: { bookId: input.bookId } });
        return Promise.all(
          input.chapters.map((chapter) =>
            transactionClient.bookChapter.create({
              data: BookChapterPrismaRepository.toCreateData(input.bookId, chapter),
            }),
          ),
        );
      },
    );
    return rows.map((row) => BookChapterMapper.toEntity(row));
  }

  async listByBookId(bookId: number): Promise<BookChapterEntity[]> {
    const rows: BookChapterType[] = await this.prismaProviderService.bookChapter.findMany({
      where: { bookId, deletedAt: null },
      orderBy: [{ spineIndex: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => BookChapterMapper.toEntity(row));
  }

  private static toCreateData(
    bookId: number,
    chapter: CreateBookChapterRepoInput,
  ): Prisma.BookChapterCreateInput {
    return {
      book: { connect: { id: bookId } },
      spineIndex: chapter.spineIndex,
      href: chapter.href,
      manifestId: chapter.manifestId,
      title: chapter.title,
      contentText: chapter.contentText,
    };
  }
}
