import { Prisma } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

import { mapPrismaException } from '@/common/filter/exception_mappers/prisma-exception-handler';

describe('mapPrismaException', () => {
  it('maps a unique-violation code to a user-friendly conflict', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '6.19.3',
    });
    const actualResult = mapPrismaException(exception);
    expect(actualResult?.statusCode).toBe(HttpStatus.CONFLICT);
    expect(actualResult?.code).toBe('RESOURCE_CONFLICT');
    expect(actualResult?.userFriendly).toBe(true);
  });

  it('maps a record-not-found code to a user-friendly not-found', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.19.3',
    });
    const actualResult = mapPrismaException(exception);
    expect(actualResult?.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(actualResult?.code).toBe('RESOURCE_NOT_FOUND');
  });

  it('maps an unrecognized driver code to an internal error', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown driver failure', {
      code: 'P9999',
      clientVersion: '6.19.3',
    });
    const actualResult = mapPrismaException(exception);
    expect(actualResult?.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(actualResult?.userFriendly).toBe(false);
    expect(actualResult?.code).toBe('DATABASE_ERROR');
  });

  it('maps an initialization error to a dependency failure', () => {
    const exception = new Prisma.PrismaClientInitializationError('Cannot reach database', '6.19.3');
    const actualResult = mapPrismaException(exception);
    expect(actualResult?.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(actualResult?.code).toBe('DEPENDENCY_FAILURE');
    expect(actualResult?.userFriendly).toBe(false);
  });

  it('returns null for unrelated errors', () => {
    const actualResult = mapPrismaException(new TypeError('not a prisma error'));
    expect(actualResult).toBeNull();
  });
});
