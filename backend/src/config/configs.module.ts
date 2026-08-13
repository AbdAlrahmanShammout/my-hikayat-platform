import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { appConfigSchema } from './app/app-config.schema';
import { AppConfigService } from './app/app-config.service';
import appConfigs from './app/app-configs';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [...appConfigs],
      validationSchema: Joi.object({
        ...appConfigSchema,
      }),
      // OS and tool environment keys (PATH, npm_*, etc.) are always present.
      // Declared application variables are still validated by the merged schema.
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigsModule {}
