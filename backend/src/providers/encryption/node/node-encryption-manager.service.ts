import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { EncryptionConfigService } from '@/config/encryption/encryption-config.service';
import { AES_256_GCM } from '@/providers/encryption/consts';
import {
  ContentEncryptionEnvelope,
  DecryptBufferInput,
  DecryptBufferResult,
  DecryptWithDataKeyInput,
  EncryptBufferInput,
  EncryptBufferResult,
  EncryptWithDataKeyInput,
  GenerateDataKeyResult,
  LegacyEncryptionEnvelope,
  UnpackedEncryptionEnvelope,
  UnwrapDataKeyInput,
  UnwrapDataKeyResult,
  VersionedEncryptionEnvelope,
  WrapDataKeyInput,
  WrapDataKeyResult,
} from '@/providers/encryption/defs/encryption-manager.defs';
import { EncryptionEnvelope } from '@/providers/encryption/encryption-envelope.helper';
import { EncryptionManagerService } from '@/providers/encryption/encryption-manager.service';
import { EncryptionFailureException } from '@/providers/encryption/exceptions/encryption-failure.exception';

@Injectable()
export class NodeEncryptionManagerService extends EncryptionManagerService {
  private readonly keysById: ReadonlyMap<string, Buffer>;

  constructor(private readonly encryptionConfigService: EncryptionConfigService) {
    super();
    this.keysById = NodeEncryptionManagerService.buildKeysById(encryptionConfigService);
  }

  encrypt(input: EncryptBufferInput): EncryptBufferResult {
    try {
      const iv: Buffer = randomBytes(AES_256_GCM.ivLength);
      const cipher = createCipheriv(AES_256_GCM.algorithm, this.encryptionConfigService.key, iv);
      const encrypted: Buffer = Buffer.concat([cipher.update(input.plaintext), cipher.final()]);
      const authTag: Buffer = cipher.getAuthTag();
      return {
        ciphertext: EncryptionEnvelope.pack({
          keyId: this.encryptionConfigService.keyId,
          iv,
          authTag,
          encrypted,
        }),
      };
    } catch (err: unknown) {
      if (err instanceof EncryptionFailureException) {
        throw err;
      }
      throw new EncryptionFailureException();
    }
  }

  decrypt(input: DecryptBufferInput): DecryptBufferResult {
    try {
      const envelope: UnpackedEncryptionEnvelope = EncryptionEnvelope.unpack(input.ciphertext);
      if (envelope.format === 'content') {
        throw new EncryptionFailureException();
      }
      if (envelope.format === 'versioned') {
        return this.decryptVersioned(envelope);
      }
      return this.decryptLegacy(envelope);
    } catch (err: unknown) {
      if (err instanceof EncryptionFailureException) {
        throw err;
      }
      throw new EncryptionFailureException();
    }
  }

  generateDataKey(): GenerateDataKeyResult {
    return { dataKey: randomBytes(AES_256_GCM.dataKeyLength) };
  }

  wrapDataKey(input: WrapDataKeyInput): WrapDataKeyResult {
    NodeEncryptionManagerService.assertDataKeyLength(input.dataKey);
    const wrapped: EncryptBufferResult = this.encrypt({ plaintext: input.dataKey });
    return {
      wrappedKey: wrapped.ciphertext,
      keyId: this.encryptionConfigService.keyId,
    };
  }

  unwrapDataKey(input: UnwrapDataKeyInput): UnwrapDataKeyResult {
    try {
      const envelope: UnpackedEncryptionEnvelope = EncryptionEnvelope.unpack(input.wrappedKey);
      if (envelope.format !== 'versioned') {
        throw new EncryptionFailureException();
      }
      const decrypted: DecryptBufferResult = this.decryptVersioned(envelope);
      NodeEncryptionManagerService.assertDataKeyLength(decrypted.plaintext);
      return {
        dataKey: decrypted.plaintext,
        keyId: envelope.keyId,
      };
    } catch (err: unknown) {
      if (err instanceof EncryptionFailureException) {
        throw err;
      }
      throw new EncryptionFailureException();
    }
  }

  encryptWithDataKey(input: EncryptWithDataKeyInput): EncryptBufferResult {
    try {
      NodeEncryptionManagerService.assertDataKeyLength(input.dataKey);
      const iv: Buffer = randomBytes(AES_256_GCM.ivLength);
      const cipher = createCipheriv(AES_256_GCM.algorithm, input.dataKey, iv);
      const encrypted: Buffer = Buffer.concat([cipher.update(input.plaintext), cipher.final()]);
      const authTag: Buffer = cipher.getAuthTag();
      return {
        ciphertext: EncryptionEnvelope.packContent({
          iv,
          authTag,
          encrypted,
        }),
      };
    } catch (err: unknown) {
      if (err instanceof EncryptionFailureException) {
        throw err;
      }
      throw new EncryptionFailureException();
    }
  }

  decryptWithDataKey(input: DecryptWithDataKeyInput): DecryptBufferResult {
    try {
      NodeEncryptionManagerService.assertDataKeyLength(input.dataKey);
      const envelope: UnpackedEncryptionEnvelope = EncryptionEnvelope.unpack(input.ciphertext);
      if (envelope.format !== 'content') {
        throw new EncryptionFailureException();
      }
      const plaintext: Buffer | null = NodeEncryptionManagerService.tryDecrypt(
        envelope,
        input.dataKey,
      );
      if (plaintext === null) {
        throw new EncryptionFailureException();
      }
      return { plaintext };
    } catch (err: unknown) {
      if (err instanceof EncryptionFailureException) {
        throw err;
      }
      throw new EncryptionFailureException();
    }
  }

  private decryptVersioned(envelope: VersionedEncryptionEnvelope): DecryptBufferResult {
    const key: Buffer | undefined = this.keysById.get(envelope.keyId);
    if (key === undefined) {
      throw new EncryptionFailureException();
    }
    const plaintext: Buffer | null = NodeEncryptionManagerService.tryDecrypt(envelope, key);
    if (plaintext === null) {
      throw new EncryptionFailureException();
    }
    return { plaintext };
  }

  private decryptLegacy(envelope: LegacyEncryptionEnvelope): DecryptBufferResult {
    const keys: Buffer[] = [
      this.encryptionConfigService.key,
      ...this.encryptionConfigService.previousKeys.map(
        (record: { readonly id: string; readonly key: Buffer }) => record.key,
      ),
    ];
    for (const key of keys) {
      const plaintext: Buffer | null = NodeEncryptionManagerService.tryDecrypt(envelope, key);
      if (plaintext !== null) {
        return { plaintext };
      }
    }
    throw new EncryptionFailureException();
  }

  private static tryDecrypt(
    envelope: Pick<
      LegacyEncryptionEnvelope | ContentEncryptionEnvelope,
      'iv' | 'authTag' | 'encrypted'
    >,
    key: Buffer,
  ): Buffer | null {
    try {
      const decipher = createDecipheriv(AES_256_GCM.algorithm, key, envelope.iv);
      decipher.setAuthTag(envelope.authTag);
      return Buffer.concat([decipher.update(envelope.encrypted), decipher.final()]);
    } catch {
      return null;
    }
  }

  private static assertDataKeyLength(dataKey: Buffer): void {
    if (dataKey.byteLength !== AES_256_GCM.dataKeyLength) {
      throw new EncryptionFailureException();
    }
  }

  private static buildKeysById(
    encryptionConfigService: EncryptionConfigService,
  ): ReadonlyMap<string, Buffer> {
    const keysById: Map<string, Buffer> = new Map<string, Buffer>([
      [encryptionConfigService.keyId, encryptionConfigService.key],
    ]);
    for (const record of encryptionConfigService.previousKeys) {
      keysById.set(record.id, record.key);
    }
    return keysById;
  }
}
