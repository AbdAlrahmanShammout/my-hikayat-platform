import { inflateRawSync } from 'node:zlib';

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP_STORED = 0;
const ZIP_DEFLATED = 8;
const LOCAL_HEADER_LENGTH = 30;
const CENTRAL_HEADER_LENGTH = 46;
const EOCD_LENGTH = 22;
const MAX_ZIP_COMMENT_LENGTH = 65_535;
const ZIP64_SIZE = 0xffffffff;

const CRC32_TABLE: Uint32Array = createCrc32Table();

type ZipStoredEntry = {
  readonly name: string;
  readonly data: Buffer;
};

type ZipFileRecord = {
  readonly name: string;
  readonly compressionMethod: number;
  readonly localHeaderOffset: number;
  readonly compressedSize: number;
  readonly uncompressedSize: number;
};

export class ZipArchive {
  private constructor(
    private readonly buffer: Buffer,
    private readonly files: ReadonlyMap<string, ZipFileRecord>,
    private readonly firstEntry: ZipFileRecord,
    private readonly firstEntryExtraLength: number,
  ) {}

  static createStored(entries: readonly ZipStoredEntry[]): Buffer {
    const locals: Buffer[] = [];
    const centrals: Buffer[] = [];
    let offset = 0;
    for (const entry of entries) {
      const nameBytes: Buffer = Buffer.from(entry.name, 'utf8');
      const local: Buffer = writeLocalFile(nameBytes, entry.data);
      locals.push(local);
      centrals.push(writeCentralDirectoryHeader(nameBytes, entry.data, offset));
      offset += local.byteLength;
    }
    const centralDirectory: Buffer = Buffer.concat(centrals);
    return Buffer.concat([
      ...locals,
      centralDirectory,
      writeEndOfCentralDirectory(entries.length, centralDirectory.byteLength, offset),
    ]);
  }

  static fromBuffer(buffer: Buffer): ZipArchive {
    const eocdOffset: number = findEndOfCentralDirectory(buffer);
    const entryCount: number = buffer.readUInt16LE(eocdOffset + 10);
    const centralSize: number = buffer.readUInt32LE(eocdOffset + 12);
    const centralOffset: number = buffer.readUInt32LE(eocdOffset + 16);
    ZipArchive.assertSupportedArchive(entryCount, centralSize, centralOffset);
    const files: Map<string, ZipFileRecord> = parseCentralDirectory(
      buffer,
      centralOffset,
      entryCount,
    );
    const firstEntry: ZipFileRecord = parseLocalFileRecord(buffer, 0);
    return new ZipArchive(buffer, files, firstEntry, readLocalExtraLength(buffer, 0));
  }

  get firstEntryName(): string {
    return this.firstEntry.name;
  }

  get isFirstEntryStoredWithoutExtra(): boolean {
    return this.firstEntry.compressionMethod === ZIP_STORED && this.firstEntryExtraLength === 0;
  }

  has(name: string): boolean {
    return this.files.has(normalizeZipPath(name));
  }

  read(name: string): Buffer {
    const record: ZipFileRecord | undefined = this.files.get(normalizeZipPath(name));
    if (record === undefined) {
      throw new Error(`ZIP entry not found: ${name}`);
    }
    return readZipFileData(this.buffer, record);
  }

  private static assertSupportedArchive(
    entryCount: number,
    centralSize: number,
    centralOffset: number,
  ): void {
    if (entryCount === 0) {
      throw new Error('ZIP archive has no files');
    }
    if (centralSize === ZIP64_SIZE || centralOffset === ZIP64_SIZE) {
      throw new Error('ZIP64 archives are not supported');
    }
  }
}

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 0 ? value >>> 1 : 0xedb88320 ^ (value >>> 1);
    }
    table[i] = value >>> 0;
  }
  return table;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function normalizeZipPath(name: string): string {
  return name.replaceAll('\\', '/');
}

function writeLocalFile(nameBytes: Buffer, data: Buffer): Buffer {
  const header = Buffer.alloc(LOCAL_HEADER_LENGTH);
  header.writeUInt32LE(LOCAL_FILE_HEADER_SIGNATURE, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(ZIP_STORED, 8);
  header.writeUInt32LE(crc32(data), 14);
  header.writeUInt32LE(data.byteLength, 18);
  header.writeUInt32LE(data.byteLength, 22);
  header.writeUInt16LE(nameBytes.byteLength, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, nameBytes, data]);
}

function writeCentralDirectoryHeader(nameBytes: Buffer, data: Buffer, localOffset: number): Buffer {
  const header = Buffer.alloc(CENTRAL_HEADER_LENGTH);
  header.writeUInt32LE(CENTRAL_DIRECTORY_SIGNATURE, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(ZIP_STORED, 10);
  header.writeUInt32LE(crc32(data), 16);
  header.writeUInt32LE(data.byteLength, 20);
  header.writeUInt32LE(data.byteLength, 24);
  header.writeUInt16LE(nameBytes.byteLength, 28);
  header.writeUInt32LE(localOffset, 42);
  return Buffer.concat([header, nameBytes]);
}

function writeEndOfCentralDirectory(
  entryCount: number,
  centralSize: number,
  centralOffset: number,
): Buffer {
  const header = Buffer.alloc(EOCD_LENGTH);
  header.writeUInt32LE(END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  return header;
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  if (buffer.byteLength < EOCD_LENGTH) {
    throw new Error('Buffer is too small to be a ZIP archive');
  }
  const searchStart: number = Math.max(0, buffer.byteLength - EOCD_LENGTH - MAX_ZIP_COMMENT_LENGTH);
  for (let offset = buffer.byteLength - EOCD_LENGTH; offset >= searchStart; offset -= 1) {
    if (buffer.readUInt32LE(offset) !== END_OF_CENTRAL_DIRECTORY_SIGNATURE) {
      continue;
    }
    const commentLength: number = buffer.readUInt16LE(offset + 20);
    if (offset + EOCD_LENGTH + commentLength === buffer.byteLength) {
      return offset;
    }
  }
  throw new Error('ZIP end of central directory was not found');
}

function parseCentralDirectory(
  buffer: Buffer,
  centralOffset: number,
  entryCount: number,
): Map<string, ZipFileRecord> {
  const files = new Map<string, ZipFileRecord>();
  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    const record: ZipFileRecord = parseCentralDirectoryRecord(buffer, cursor);
    files.set(record.name, record);
    cursor += centralDirectoryRecordLength(buffer, cursor);
  }
  return files;
}

function parseCentralDirectoryRecord(buffer: Buffer, offset: number): ZipFileRecord {
  if (buffer.readUInt32LE(offset) !== CENTRAL_DIRECTORY_SIGNATURE) {
    throw new Error('ZIP central directory is malformed');
  }
  const nameLength: number = buffer.readUInt16LE(offset + 28);
  const name: string = normalizeZipPath(
    buffer
      .subarray(offset + CENTRAL_HEADER_LENGTH, offset + CENTRAL_HEADER_LENGTH + nameLength)
      .toString('utf8'),
  );
  return {
    name,
    compressionMethod: buffer.readUInt16LE(offset + 10),
    compressedSize: buffer.readUInt32LE(offset + 20),
    uncompressedSize: buffer.readUInt32LE(offset + 24),
    localHeaderOffset: buffer.readUInt32LE(offset + 42),
  };
}

function centralDirectoryRecordLength(buffer: Buffer, offset: number): number {
  return (
    CENTRAL_HEADER_LENGTH +
    buffer.readUInt16LE(offset + 28) +
    buffer.readUInt16LE(offset + 30) +
    buffer.readUInt16LE(offset + 32)
  );
}

function parseLocalFileRecord(buffer: Buffer, offset: number): ZipFileRecord {
  if (buffer.readUInt32LE(offset) !== LOCAL_FILE_HEADER_SIGNATURE) {
    throw new Error('ZIP local file header is malformed');
  }
  const nameLength: number = buffer.readUInt16LE(offset + 26);
  const name: string = normalizeZipPath(
    buffer
      .subarray(offset + LOCAL_HEADER_LENGTH, offset + LOCAL_HEADER_LENGTH + nameLength)
      .toString('utf8'),
  );
  return {
    name,
    compressionMethod: buffer.readUInt16LE(offset + 8),
    compressedSize: buffer.readUInt32LE(offset + 18),
    uncompressedSize: buffer.readUInt32LE(offset + 22),
    localHeaderOffset: offset,
  };
}

function readLocalExtraLength(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset + 28);
}

function readZipFileData(buffer: Buffer, record: ZipFileRecord): Buffer {
  const nameLength: number = buffer.readUInt16LE(record.localHeaderOffset + 26);
  const extraLength: number = buffer.readUInt16LE(record.localHeaderOffset + 28);
  const dataOffset: number =
    record.localHeaderOffset + LOCAL_HEADER_LENGTH + nameLength + extraLength;
  const compressed: Buffer = buffer.subarray(dataOffset, dataOffset + record.compressedSize);
  if (record.compressionMethod === ZIP_STORED) {
    return compressed;
  }
  if (record.compressionMethod === ZIP_DEFLATED) {
    return inflateRawSync(compressed);
  }
  throw new Error(`Unsupported ZIP compression method ${record.compressionMethod}`);
}
