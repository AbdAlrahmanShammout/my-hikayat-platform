import { ENCRYPTION_KEY_ID_PATTERN } from '@/config/encryption/encryption-config.schema';
import { AES_256_GCM } from '@/providers/encryption/consts';
import {
  ContentEncryptionEnvelope,
  LegacyEncryptionEnvelope,
  PackContentEncryptionEnvelopeInput,
  PackEncryptionEnvelopeInput,
  UnpackedEncryptionEnvelope,
  VersionedEncryptionEnvelope,
} from '@/providers/encryption/defs/encryption-manager.defs';
import { ENCRYPTION_ENVELOPE } from '@/providers/encryption/encryption-envelope.constant';
import { EncryptionFailureException } from '@/providers/encryption/exceptions/encryption-failure.exception';

export class EncryptionEnvelope {
  static pack(input: PackEncryptionEnvelopeInput): Buffer {
    const keyIdBytes: Buffer = Buffer.from(input.keyId, 'utf8');
    EncryptionEnvelope.assertValidKeyId(input.keyId, keyIdBytes.byteLength);
    EncryptionEnvelope.assertExactLength(input.iv, AES_256_GCM.ivLength);
    EncryptionEnvelope.assertExactLength(input.authTag, AES_256_GCM.authTagLength);
    return Buffer.concat([
      ENCRYPTION_ENVELOPE.magic,
      Buffer.from([ENCRYPTION_ENVELOPE.version, keyIdBytes.byteLength]),
      keyIdBytes,
      input.iv,
      input.authTag,
      input.encrypted,
    ]);
  }

  /**
   * Packs content ciphertext encrypted with an external DEK (envelope version 2).
   * No key id is embedded; the DEK is delivered separately after authorization.
   */
  static packContent(input: PackContentEncryptionEnvelopeInput): Buffer {
    EncryptionEnvelope.assertExactLength(input.iv, AES_256_GCM.ivLength);
    EncryptionEnvelope.assertExactLength(input.authTag, AES_256_GCM.authTagLength);
    return Buffer.concat([
      ENCRYPTION_ENVELOPE.magic,
      Buffer.from([ENCRYPTION_ENVELOPE.contentVersion, 0]),
      input.iv,
      input.authTag,
      input.encrypted,
    ]);
  }

  static unpack(ciphertext: Buffer): UnpackedEncryptionEnvelope {
    if (EncryptionEnvelope.hasMagic(ciphertext)) {
      return EncryptionEnvelope.unpackVersioned(ciphertext);
    }
    return EncryptionEnvelope.unpackLegacy(ciphertext);
  }

  private static unpackVersioned(ciphertext: Buffer): UnpackedEncryptionEnvelope {
    const magicLength: number = ENCRYPTION_ENVELOPE.magic.byteLength;
    if (ciphertext.byteLength < magicLength + 2) {
      throw new EncryptionFailureException();
    }
    const version: number = ciphertext.readUInt8(magicLength);
    const keyIdLength: number = ciphertext.readUInt8(magicLength + 1);
    const keyIdStart: number = magicLength + 2;
    if (version === ENCRYPTION_ENVELOPE.contentVersion) {
      return EncryptionEnvelope.unpackContent(ciphertext, keyIdLength, keyIdStart);
    }
    if (version !== ENCRYPTION_ENVELOPE.version) {
      throw new EncryptionFailureException();
    }
    const headerLength: number =
      keyIdStart + keyIdLength + AES_256_GCM.ivLength + AES_256_GCM.authTagLength;
    if (ciphertext.byteLength < headerLength) {
      throw new EncryptionFailureException();
    }
    const keyId: string = ciphertext
      .subarray(keyIdStart, keyIdStart + keyIdLength)
      .toString('utf8');
    EncryptionEnvelope.assertValidKeyId(keyId, keyIdLength);
    const ivStart: number = keyIdStart + keyIdLength;
    const authTagStart: number = ivStart + AES_256_GCM.ivLength;
    const envelope: VersionedEncryptionEnvelope = {
      format: 'versioned',
      version,
      keyId,
      iv: ciphertext.subarray(ivStart, authTagStart),
      authTag: ciphertext.subarray(authTagStart, headerLength),
      encrypted: ciphertext.subarray(headerLength),
    };
    return envelope;
  }

  private static unpackContent(
    ciphertext: Buffer,
    keyIdLength: number,
    keyIdStart: number,
  ): ContentEncryptionEnvelope {
    if (keyIdLength !== 0) {
      throw new EncryptionFailureException();
    }
    const headerLength: number = keyIdStart + AES_256_GCM.ivLength + AES_256_GCM.authTagLength;
    if (ciphertext.byteLength < headerLength) {
      throw new EncryptionFailureException();
    }
    const authTagStart: number = keyIdStart + AES_256_GCM.ivLength;
    return {
      format: 'content',
      version: ENCRYPTION_ENVELOPE.contentVersion,
      iv: ciphertext.subarray(keyIdStart, authTagStart),
      authTag: ciphertext.subarray(authTagStart, headerLength),
      encrypted: ciphertext.subarray(headerLength),
    };
  }

  private static unpackLegacy(ciphertext: Buffer): LegacyEncryptionEnvelope {
    const headerLength: number = AES_256_GCM.ivLength + AES_256_GCM.authTagLength;
    if (ciphertext.byteLength < headerLength) {
      throw new EncryptionFailureException();
    }
    return {
      format: 'legacy',
      iv: ciphertext.subarray(0, AES_256_GCM.ivLength),
      authTag: ciphertext.subarray(AES_256_GCM.ivLength, headerLength),
      encrypted: ciphertext.subarray(headerLength),
    };
  }

  private static hasMagic(ciphertext: Buffer): boolean {
    const magic: Buffer = ENCRYPTION_ENVELOPE.magic;
    if (ciphertext.byteLength < magic.byteLength) {
      return false;
    }
    return ciphertext.subarray(0, magic.byteLength).equals(magic);
  }

  private static assertValidKeyId(keyId: string, byteLength: number): void {
    if (
      byteLength < ENCRYPTION_ENVELOPE.keyIdMinLength ||
      byteLength > ENCRYPTION_ENVELOPE.keyIdMaxLength ||
      !ENCRYPTION_KEY_ID_PATTERN.test(keyId)
    ) {
      throw new EncryptionFailureException();
    }
  }

  private static assertExactLength(value: Buffer, expectedLength: number): void {
    if (value.byteLength !== expectedLength) {
      throw new EncryptionFailureException();
    }
  }
}
