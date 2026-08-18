import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 10;
const SEEDED_ADMIN_EMAIL = 'admin@example.com';
const SEEDED_ADMIN_PASSWORD = 'correct-horse-battery';
const SEEDED_AUTHOR_EMAIL = 'author@example.com';
const SEEDED_AUTHOR_PASSWORD = 'correct-horse-battery';

async function seedAdmin(): Promise<void> {
  const email: string = SEEDED_ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash: string = await hash(SEEDED_ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: UserRole.admin,
      isPublisher: false,
    },
    update: {
      passwordHash,
      role: UserRole.admin,
      deletedAt: null,
    },
  });
  console.log(`Seeded admin user ${email}`);
}

async function seedAuthor(): Promise<void> {
  const email: string = SEEDED_AUTHOR_EMAIL.trim().toLowerCase();
  const passwordHash: string = await hash(SEEDED_AUTHOR_PASSWORD, BCRYPT_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: UserRole.author,
      isPublisher: true,
    },
    update: {
      passwordHash,
      role: UserRole.author,
      isPublisher: true,
      deletedAt: null,
    },
  });
  console.log(`Seeded author user ${email}`);
}

async function seed(): Promise<void> {
  if (process.env.APP_ENV === 'production') {
    console.log('Skipping local user seeds in production');
    return;
  }
  await seedAdmin();
  await seedAuthor();
}

async function main(): Promise<void> {
  try {
    await seed();
  } finally {
    await prisma.$disconnect();
  }
}

void main();
