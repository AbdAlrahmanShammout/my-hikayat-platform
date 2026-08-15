import { registerAs } from '@nestjs/config';

import {
  ENCRYPTION_KEY_ID_DEFAULT,
  ENCRYPTION_PREVIOUS_KEYS_DEFAULT,
} from './encryption-config.schema';

export default [
  registerAs('encryption', () => ({
    key: process.env.ENCRYPTION_KEY,
    keyId: process.env.ENCRYPTION_KEY_ID ?? ENCRYPTION_KEY_ID_DEFAULT,
    previousKeys: process.env.ENCRYPTION_PREVIOUS_KEYS ?? ENCRYPTION_PREVIOUS_KEYS_DEFAULT,
  })),
];
