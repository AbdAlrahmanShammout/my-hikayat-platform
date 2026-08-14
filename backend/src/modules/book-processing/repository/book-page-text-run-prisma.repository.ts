import { Injectable } from '@nestjs/common';

import { BookPageTextRunEntity } from '@/modules/book-processing/entity/book-page-text-run.entity';
import { BookPageTextRunMapper } from '@/modules/book-processing/mapper/book-page-text-run.mapper';
import { BookPageTextRunRepository } from '@/modules/book-processing/repository/book-page-text-run.repository';
import { BookPageTextRunType } from '@/modules/book-processing/types/book-page-text-run-details-schema.type';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

@Injectable()
export class BookPageTextRunPrismaRepository implements BookPageTextRunRepository {
  constructor(private readonly prismaProviderService: PrismaProviderService) {}

  async listByTextLayerId(textLayerId: number): Promise<BookPageTextRunEntity[]> {
    const rows: BookPageTextRunType[] = await this.prismaProviderService.bookPageTextRun.findMany({
      where: { textLayerId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    return rows.map((row) => BookPageTextRunMapper.toEntity(row));
  }
}
