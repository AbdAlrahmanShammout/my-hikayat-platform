import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

import { ENCRYPTION_KEY_HEX_LENGTH } from './encryption-config.schema';

@Injectable()
export class EncryptionConfigService extends BaseConfigService {
  get key(): Buffer {
    return Buffer.from(this.getValue<string>('encryption.key'), 'hex');
  }

  get keyId(): string {
    return this.getValue<string>('encryption.keyId');
  }

  get previousKeys(): ReadonlyArray<{ readonly id: string; readonly key: Buffer }> {
    const records: Array<{ readonly id: string; readonly key: Buffer }> =
      EncryptionConfigService.parsePreviousKeys(this.getValue<string>('encryption.previousKeys'));
    const seenIds: Set<string> = new Set<string>([this.keyId]);
    for (const record of records) {
      if (seenIds.has(record.id)) {
        throw new Error(`Duplicate encryption key id: ${record.id}`);
      }
      seenIds.add(record.id);
    }
    return records;
  }

  private static parsePreviousKeys(
    value: string,
  ): Array<{ readonly id: string; readonly key: Buffer }> {
    if (value === '') {
      return [];
    }
    return value.split(',').map((pair: string) => {
      const separatorIndex: number = pair.lastIndexOf(':');
      const id: string = pair.slice(0, separatorIndex);
      const hex: string = pair.slice(separatorIndex + 1);
      if (hex.length !== ENCRYPTION_KEY_HEX_LENGTH) {
        throw new Error(`Invalid previous encryption key for id: ${id}`);
      }
      return { id, key: Buffer.from(hex, 'hex') };
    });
  }
}
