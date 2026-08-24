import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * Seeds only the deterministic mobile E2E reader user.
 * Requires DATABASE_URL + E2E_READER_EMAIL + E2E_READER_PASSWORD.
 * Refuses production.
 */
const prisma = new PrismaClient();
const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_E2E_READER_EMAIL = 'e2e-reader@example.test';

async function seedE2eReader(): Promise<void> {
  if (process.env.APP_ENV === 'production') {
    throw new Error('Refusing to seed E2E reader in production');
  }
  const email: string = (process.env.E2E_READER_EMAIL ?? DEFAULT_E2E_READER_EMAIL).trim().toLowerCase();
  const password: string | undefined = process.env.E2E_READER_PASSWORD;
  if (password === undefined || password.trim() === '') {
    throw new Error('E2E_READER_PASSWORD is required to seed the mobile E2E reader');
  }
  if (password.length < 8 || password.length > 72) {
    throw new Error('E2E_READER_PASSWORD must be 8–72 characters');
  }
  const passwordHash: string = await hash(password, BCRYPT_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: UserRole.reader,
      isPublisher: false,
    },
    update: {
      passwordHash,
      role: UserRole.reader,
      isPublisher: false,
      deletedAt: null,
    },
  });
  console.log(`Seeded E2E reader ${email}`);
}

async function main(): Promise<void> {
  try {
    await seedE2eReader();
  } finally {
    await prisma.$disconnect();
  }
}

void main();
