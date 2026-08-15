import { registerAs } from '@nestjs/config';

export default [
  registerAs('monetization', () => ({
    platformCutPercent: Number(process.env.PLATFORM_CUT_PERCENT),
  })),
];
