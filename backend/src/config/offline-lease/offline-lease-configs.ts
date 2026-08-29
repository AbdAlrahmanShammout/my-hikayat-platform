import { registerAs } from '@nestjs/config';

import { OFFLINE_LEASE_KEY_ID_DEFAULT } from './offline-lease-config.schema';

export default [
  registerAs('offlineLease', () => ({
    privateKey: process.env.OFFLINE_LEASE_PRIVATE_KEY,
    keyId: process.env.OFFLINE_LEASE_KEY_ID ?? OFFLINE_LEASE_KEY_ID_DEFAULT,
  })),
];
