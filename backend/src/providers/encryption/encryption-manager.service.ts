import {
  DecryptBufferInput,
  DecryptBufferResult,
  EncryptBufferInput,
  EncryptBufferResult,
} from '@/providers/encryption/defs/encryption-manager.defs';

export abstract class EncryptionManagerService {
  abstract encrypt(input: EncryptBufferInput): EncryptBufferResult;
  abstract decrypt(input: DecryptBufferInput): DecryptBufferResult;
}
