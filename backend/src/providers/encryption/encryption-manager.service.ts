import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { EncryptionConfigService } from '@/config/encryption/encryption-config.service';
import { AES_256_GCM } from '@/providers/encryption/consts';
import {
  DecryptBufferInput,
  DecryptBufferResult,
  EncryptBufferInput,
  EncryptBufferResult,
} from '@/providers/encryption/defs/encryption-manager.defs';
import { EncryptionFailureException } from '@/providers/encryption/exceptions/encryption-failure.exception';

@Injectable()
export class EncryptionManagerService {
  constructor(private readonly encryptionConfigService: EncryptionConfigService) {}

  encrypt(input: EncryptBufferInput): EncryptBufferResult {
    try {
      const iv: Buffer = randomBytes(AES_256_GCM.ivLength);
      const cipher = createCipheriv(AES_256_GCM.algorithm, this.encryptionConfigService.key, iv);
      const encrypted: Buffer = Buffer.concat([cipher.update(input.plaintext), cipher.final()]);
      const authTag: Buffer = cipher.getAuthTag();
      return {
        ciphertext: Buffer.concat([iv, authTag, encrypted]),
      };
    } catch {
      throw new EncryptionFailureException();
    }
  }

  decrypt(input: DecryptBufferInput): DecryptBufferResult {
    try {
      const headerLength: number = AES_256_GCM.ivLength + AES_256_GCM.authTagLength;
      if (input.ciphertext.byteLength < headerLength) {
        throw new EncryptionFailureException();
      }
      const iv: Buffer = input.ciphertext.subarray(0, AES_256_GCM.ivLength);
      const authTag: Buffer = input.ciphertext.subarray(AES_256_GCM.ivLength, headerLength);
      const encrypted: Buffer = input.ciphertext.subarray(headerLength);
      const decipher = createDecipheriv(
        AES_256_GCM.algorithm,
        this.encryptionConfigService.key,
        iv,
      );
      decipher.setAuthTag(authTag);
      return {
        plaintext: Buffer.concat([decipher.update(encrypted), decipher.final()]),
      };
    } catch (err: unknown) {
      if (err instanceof EncryptionFailureException) {
        throw err;
      }
      throw new EncryptionFailureException();
    }
  }
}
