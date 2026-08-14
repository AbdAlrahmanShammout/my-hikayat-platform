import { registerAs } from '@nestjs/config';

import {
  JWT_ACCESS_EXPIRES_IN_DEFAULT,
  JWT_RECOVERY_EXPIRES_IN_DEFAULT,
} from './jwt-config.schema';

export default [
  registerAs('jwt', () => ({
    access: {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? JWT_ACCESS_EXPIRES_IN_DEFAULT,
    },
    recovery: {
      secret: process.env.JWT_RECOVERY_SECRET,
      expiresIn: process.env.JWT_RECOVERY_EXPIRES_IN ?? JWT_RECOVERY_EXPIRES_IN_DEFAULT,
    },
  })),
];
