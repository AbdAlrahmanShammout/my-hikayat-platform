import { createHash } from 'node:crypto';

import {
  BookLayoutType,
  BookProcessingStatus,
  BookPublishingStatus,
  BookType,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import { hash } from 'bcryptjs';

import { createSolidPng } from './create-demo-cover-png';
import { createDemoEpub } from './create-demo-epub';
import { DEMO_CATALOG } from './demo-catalog.data';
import { encryptDemoSourceFile } from './encrypt-demo-source';
import { putDemoObject } from './put-demo-object';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 10;
const SEEDED_ADMIN_EMAIL = 'admin@example.com';
const SEEDED_ADMIN_PASSWORD = 'correct-horse-battery';
const SEEDED_AUTHOR_PASSWORD = 'correct-horse-battery';
const DEMO_COVER_WIDTH = 240;
const DEMO_COVER_HEIGHT = 360;
const DEMO_IDENTIFIER_PREFIX = 'demo:';
const PAID_PERIOD_DAYS = 20;

type DemoBook = (typeof DEMO_CATALOG.books)[number];

async function seedAdmin(): Promise<void> {
  const email: string = SEEDED_ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash: string = await hash(SEEDED_ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      displayName: 'Maya Haddad',
      role: UserRole.admin,
      isPublisher: false,
    },
    update: {
      passwordHash,
      displayName: 'Maya Haddad',
      role: UserRole.admin,
      deletedAt: null,
    },
  });
  console.log(`Seeded admin user ${email}`);
}

async function seedAuthors(): Promise<Map<string, number>> {
  const passwordHash: string = await hash(SEEDED_AUTHOR_PASSWORD, BCRYPT_SALT_ROUNDS);
  const ownerIds = new Map<string, number>();
  for (const author of DEMO_CATALOG.authors) {
    const email: string = author.email.trim().toLowerCase();
    const row = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        displayName: author.displayName,
        role: UserRole.author,
        isPublisher: true,
      },
      update: {
        passwordHash,
        displayName: author.displayName,
        role: UserRole.author,
        isPublisher: true,
        deletedAt: null,
      },
    });
    ownerIds.set(email, row.id);
    console.log(`Seeded author ${author.displayName} <${email}>`);
  }
  return ownerIds;
}

async function seedPlanCopy(): Promise<void> {
  await prisma.plan.updateMany({
    where: { slug: 'free' },
    data: {
      name: 'Explorer',
      description: 'Browse the catalog and open previews. Start a trial when you are ready to read.',
    },
  });
  await prisma.plan.updateMany({
    where: { slug: 'monthly' },
    data: {
      name: 'Hikayat Monthly',
      description: 'Unlimited reading of the published library, billed once a month.',
    },
  });
}

async function seedPlatformSettings(): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { key: 'about_mission' },
    create: {
      key: 'about_mission',
      value: DEMO_CATALOG.aboutMission,
    },
    update: {
      value: DEMO_CATALOG.aboutMission,
      deletedAt: null,
    },
  });
}

async function findDemoBookId(slug: string): Promise<number | null> {
  const metadata = await prisma.bookSourceMetadata.findFirst({
    where: { identifier: `${DEMO_IDENTIFIER_PREFIX}${slug}`, deletedAt: null },
    select: { bookId: true },
  });
  return metadata?.bookId ?? null;
}

async function createDemoBook(book: DemoBook, ownerId: number): Promise<number> {
  const created = await prisma.book.create({
    data: {
      title: book.title,
      description: book.description,
      layoutType: book.layoutType as BookLayoutType,
      bookType: book.bookType as BookType,
      publishingStatus: BookPublishingStatus.approved,
      processingStatus: BookProcessingStatus.ready,
      publishedAt: new Date(book.publishedAt),
      owner: { connect: { id: ownerId } },
      categories: { connect: book.categorySlugs.map((slug) => ({ slug })) },
      sourceMetadata: {
        create: {
          packagePath: `demo/${book.slug}.epub`,
          epubVersion: '3.0',
          identifier: `${DEMO_IDENTIFIER_PREFIX}${book.slug}`,
          title: book.title,
          language: 'en',
          creator: book.authorName,
          publisher: DEMO_CATALOG.publisherName,
          description: book.description,
        },
      },
    },
  });
  return created.id;
}

async function updateDemoBook(bookId: number, book: DemoBook, ownerId: number): Promise<void> {
  await prisma.book.update({
    where: { id: bookId },
    data: {
      title: book.title,
      description: book.description,
      layoutType: book.layoutType as BookLayoutType,
      bookType: book.bookType as BookType,
      publishingStatus: BookPublishingStatus.approved,
      processingStatus: BookProcessingStatus.ready,
      publishedAt: new Date(book.publishedAt),
      ownerId,
      deletedAt: null,
      categories: { set: book.categorySlugs.map((slug) => ({ slug })) },
      sourceMetadata: {
        update: {
          title: book.title,
          creator: book.authorName,
          publisher: DEMO_CATALOG.publisherName,
          description: book.description,
          deletedAt: null,
        },
      },
    },
  });
}

async function replaceDemoChapters(bookId: number, book: DemoBook): Promise<void> {
  await prisma.bookChapter.deleteMany({ where: { bookId } });
  await prisma.bookChapter.createMany({
    data: book.chapters.map((chapter, spineIndex) => ({
      bookId,
      spineIndex,
      href: `text/${book.slug}-${spineIndex}.xhtml`,
      manifestId: `${book.slug}-c${spineIndex}`,
      title: chapter.title,
      contentText: chapter.contentText,
    })),
  });
}

async function replaceDemoPages(bookId: number, book: DemoBook): Promise<void> {
  await prisma.bookSpread.deleteMany({ where: { bookId } });
  await prisma.bookPage.deleteMany({ where: { bookId } });
  if (book.layoutType !== 'fixed_layout') {
    return;
  }
  const pageCount = 6;
  const pages = await prisma.$transaction(
    Array.from({ length: pageCount }, (_, spineIndex) =>
      prisma.bookPage.create({
        data: {
          bookId,
          spineIndex,
          href: `images/${book.slug}-${spineIndex}.jpg`,
          manifestId: `${book.slug}-p${spineIndex}`,
          title: `${book.title} · page ${spineIndex + 1}`,
          width: 1200,
          height: 1800,
          spreadRole: spineIndex === 0 ? 'center' : spineIndex % 2 === 1 ? 'left' : 'right',
        },
      }),
    ),
  );
  await prisma.bookSpread.createMany({
    data: [
      { bookId, spreadIndex: 0, centerPageId: pages[0].id },
      { bookId, spreadIndex: 1, leftPageId: pages[1].id, rightPageId: pages[2].id },
      { bookId, spreadIndex: 2, leftPageId: pages[3].id, rightPageId: pages[4].id },
    ],
  });
}

async function seedDemoBookFiles(bookId: number, book: DemoBook): Promise<void> {
  const coverKey = `demo/covers/${book.slug}.png`;
  const sourceKey = `demo/books/${book.slug}/source.enc`;
  const coverBody: Buffer = createSolidPng(DEMO_COVER_WIDTH, DEMO_COVER_HEIGHT, book.cover);
  const epubBytes: Buffer = createDemoEpub({
    slug: book.slug,
    title: book.title,
    authorName: book.authorName,
    language: 'en',
    layoutType: book.layoutType,
    chapters: book.chapters,
  });
  await putDemoObject({
    key: coverKey,
    body: coverBody,
    contentType: 'image/png',
  });
  await upsertDemoAsset({
    bookId,
    storageKey: coverKey,
    kind: 'preview_image',
    contentType: 'image/png',
    byteSize: coverBody.byteLength,
    originalFileName: `${book.slug}.png`,
    isEncrypted: false,
    wrappedContentKey: null,
    checksumSha256: createHash('sha256').update(coverBody).digest('hex'),
  });
  const masterKey: Buffer = Buffer.from(readRequiredEnv('ENCRYPTION_KEY'), 'hex');
  const keyId: string = process.env.ENCRYPTION_KEY_ID?.trim() || 'v1';
  const encrypted = encryptDemoSourceFile(epubBytes, masterKey, keyId);
  await putDemoObject({
    key: sourceKey,
    body: encrypted.ciphertext,
    contentType: 'application/epub+zip',
  });
  await upsertDemoAsset({
    bookId,
    storageKey: sourceKey,
    kind: 'source',
    contentType: 'application/epub+zip',
    byteSize: encrypted.ciphertext.byteLength,
    originalFileName: `${book.slug}.epub`,
    isEncrypted: true,
    wrappedContentKey: encrypted.wrappedKey,
    checksumSha256: createHash('sha256').update(encrypted.ciphertext).digest('hex'),
  });
}

async function upsertDemoAsset(input: {
  readonly bookId: number;
  readonly storageKey: string;
  readonly kind: 'preview_image' | 'source';
  readonly contentType: string;
  readonly byteSize: number;
  readonly originalFileName: string;
  readonly isEncrypted: boolean;
  readonly wrappedContentKey: Buffer | null;
  readonly checksumSha256: string;
}): Promise<void> {
  const existing = await prisma.bookAsset.findFirst({
    where: { storageKey: input.storageKey },
  });
  if (existing !== null) {
    await prisma.bookAsset.update({
      where: { id: existing.id },
      data: {
        bookId: input.bookId,
        kind: input.kind,
        contentType: input.contentType,
        byteSize: input.byteSize,
        originalFileName: input.originalFileName,
        isEncrypted: input.isEncrypted,
        wrappedContentKey:
          input.wrappedContentKey === null ? null : new Uint8Array(input.wrappedContentKey),
        checksumSha256: input.checksumSha256,
        deletedAt: null,
      },
    });
    return;
  }
  await prisma.bookAsset.create({
    data: {
      bookId: input.bookId,
      kind: input.kind,
      storageKey: input.storageKey,
      contentType: input.contentType,
      byteSize: input.byteSize,
      originalFileName: input.originalFileName,
      isEncrypted: input.isEncrypted,
      wrappedContentKey:
        input.wrappedContentKey === null ? null : new Uint8Array(input.wrappedContentKey),
      checksumSha256: input.checksumSha256,
      sortOrder: 0,
    },
  });
}

function readRequiredEnv(name: string): string {
  const value: string | undefined = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is required to seed demo files`);
  }
  return value;
}

async function seedDemoBooks(ownerIds: Map<string, number>): Promise<Map<string, number>> {
  const bookIds = new Map<string, number>();
  for (const book of DEMO_CATALOG.books) {
    const ownerId: number | undefined = ownerIds.get(book.authorEmail);
    if (ownerId === undefined) {
      throw new Error(`Missing owner for ${book.authorEmail}`);
    }
    const existingId: number | null = await findDemoBookId(book.slug);
    const bookId: number =
      existingId === null ? await createDemoBook(book, ownerId) : existingId;
    if (existingId !== null) {
      await updateDemoBook(bookId, book, ownerId);
    }
    await replaceDemoChapters(bookId, book);
    await replaceDemoPages(bookId, book);
    await seedDemoBookFiles(bookId, book);
    bookIds.set(book.slug, bookId);
    console.log(`Seeded book ${book.title}`);
  }
  return bookIds;
}

async function seedDemoCollections(bookIds: Map<string, number>): Promise<void> {
  const leftover = await prisma.collection.findFirst({
    where: { title: 'Sport', deletedAt: null },
  });
  if (leftover !== null) {
    await prisma.collection.update({
      where: { id: leftover.id },
      data: {
        title: DEMO_CATALOG.collections[0].title,
        description: DEMO_CATALOG.collections[0].description,
        accentColor: DEMO_CATALOG.collections[0].accentColor,
      },
    });
  }
  for (const collection of DEMO_CATALOG.collections) {
    const existing = await prisma.collection.findFirst({
      where: { title: collection.title, deletedAt: null },
    });
    const row =
      existing === null
        ? await prisma.collection.create({
            data: {
              title: collection.title,
              description: collection.description,
              accentColor: collection.accentColor,
            },
          })
        : await prisma.collection.update({
            where: { id: existing.id },
            data: {
              description: collection.description,
              accentColor: collection.accentColor,
              deletedAt: null,
            },
          });
    await prisma.collectionBook.deleteMany({ where: { collectionId: row.id } });
    await prisma.collectionBook.createMany({
      data: collection.bookSlugs.map((slug, displayOrder) => {
        const bookId: number | undefined = bookIds.get(slug);
        if (bookId === undefined) {
          throw new Error(`Missing collection book ${slug}`);
        }
        return { collectionId: row.id, bookId, displayOrder };
      }),
    });
    console.log(`Seeded collection ${collection.title}`);
  }
}

async function seedDemoReaderExperience(bookIds: Map<string, number>): Promise<void> {
  const email: string = DEMO_CATALOG.readerEmail.trim().toLowerCase();
  const reader = await prisma.user.findUnique({ where: { email } });
  if (reader === null) {
    console.log(`Skipping reader demo experience; ${email} is not registered`);
    return;
  }
  const monthly = await prisma.plan.findUnique({ where: { slug: 'monthly' } });
  if (monthly === null) {
    throw new Error('Monthly plan is missing');
  }
  const periodStart = new Date();
  periodStart.setUTCDate(periodStart.getUTCDate() - 8);
  const periodEnd = new Date();
  periodEnd.setUTCDate(periodEnd.getUTCDate() + PAID_PERIOD_DAYS);
  await prisma.subscription.upsert({
    where: { userId: reader.id },
    create: {
      userId: reader.id,
      planId: monthly.id,
      status: 'active',
      startedAt: periodStart,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      activatedAt: periodStart,
    },
    update: {
      planId: monthly.id,
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      activatedAt: periodStart,
      canceledAt: null,
      deletedAt: null,
    },
  });
  for (const item of DEMO_CATALOG.continueReading) {
    const bookId: number | undefined = bookIds.get(item.slug);
    const book = DEMO_CATALOG.books.find((entry) => entry.slug === item.slug);
    if (bookId === undefined || book === undefined) {
      throw new Error(`Missing continue-reading book ${item.slug}`);
    }
    const lastSessionAt = new Date();
    await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId: reader.id, bookId } },
      create: {
        userId: reader.id,
        bookId,
        layoutType: book.layoutType as BookLayoutType,
        spineIndex: 'spineIndex' in item ? item.spineIndex : null,
        scrollOffset: 'scrollOffset' in item ? item.scrollOffset : null,
        spreadIndex: 'spreadIndex' in item ? item.spreadIndex : null,
        pageNumber: 'pageNumber' in item ? item.pageNumber : null,
        lastSessionAt,
      },
      update: {
        layoutType: book.layoutType as BookLayoutType,
        spineIndex: 'spineIndex' in item ? item.spineIndex : null,
        scrollOffset: 'scrollOffset' in item ? item.scrollOffset : null,
        spreadIndex: 'spreadIndex' in item ? item.spreadIndex : null,
        pageNumber: 'pageNumber' in item ? item.pageNumber : null,
        lastSessionAt,
        deletedAt: null,
      },
    });
  }
  console.log(`Seeded paid reading demo for ${email}`);
}

async function seed(): Promise<void> {
  if (process.env.APP_ENV === 'production') {
    console.log('Skipping demo catalog seed in production');
    return;
  }
  const bucket: string = process.env.STORAGE_BUCKET?.trim() || '(missing STORAGE_BUCKET)';
  const endpoint: string = process.env.STORAGE_ENDPOINT?.trim() || 'AWS S3';
  console.log(`Demo files upload to ${bucket} via ${endpoint}`);
  await seedAdmin();
  const ownerIds: Map<string, number> = await seedAuthors();
  await seedPlanCopy();
  await seedPlatformSettings();
  const bookIds: Map<string, number> = await seedDemoBooks(ownerIds);
  await seedDemoCollections(bookIds);
  await seedDemoReaderExperience(bookIds);
}

async function main(): Promise<void> {
  try {
    await seed();
  } finally {
    await prisma.$disconnect();
  }
}

void main();
