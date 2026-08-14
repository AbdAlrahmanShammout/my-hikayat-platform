import { Injectable } from '@nestjs/common';

import { BookSpreadEntity } from '@/modules/book-processing/entity/book-spread.entity';
import { BookSpreadMapper } from '@/modules/book-processing/mapper/book-spread.mapper';
import { BookSpreadRepository } from '@/modules/book-processing/repository/book-spread.repository';
import { BookSpreadType } from '@/modules/book-processing/types/book-spread-details-schema.type';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

@Injectable()
export class BookSpreadPrismaRepository implements BookSpreadRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async listByBookId(bookId: number): Promise<BookSpreadEntity[]> {
    const rows: BookSpreadType[] = await this.prismaProviderService.bookSpread.findMany({
      where: { bookId, deletedAt: null },
      orderBy: [{ spreadIndex: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => BookSpreadMapper.toEntity(row));
  }
}
