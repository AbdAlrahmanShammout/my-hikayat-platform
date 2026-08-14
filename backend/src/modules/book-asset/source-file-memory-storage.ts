import type { Request } from 'express';

type SourceFileStream = {
  readonly stream: NodeJS.ReadableStream;
};

type SourceFileStorageInfo = {
  readonly buffer: Buffer;
  readonly size: number;
};

export const sourceFileMemoryStorage = {
  _handleFile(
    _request: Request,
    file: SourceFileStream,
    callback: (error: Error | null, info?: SourceFileStorageInfo) => void,
  ): void {
    const chunks: Buffer[] = [];
    file.stream.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    file.stream.on('end', () => {
      const buffer: Buffer = Buffer.concat(chunks);
      callback(null, { buffer, size: buffer.byteLength });
    });
    file.stream.on('error', (err: Error) => {
      callback(err);
    });
  },
  _removeFile(
    _request: Request,
    _file: SourceFileStream,
    callback: (error: Error | null) => void,
  ): void {
    callback(null);
  },
};
