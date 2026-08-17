import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 10;
const SEEDED_ADMIN_EMAIL = 'admin@example.com';
const SEEDED_ADMIN_PASSWORD = 'correct-horse-battery';

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

async function seed(): Promise<void> {
  if (process.env.APP_ENV === 'production') {
    console.log('Skipping admin seed in production');
    return;
  }
  await seedAdmin();
}

async function main(): Promise<void> {
  try {
    await seed();
  } finally {
    await prisma.$disconnect();
  }
}

void main();
