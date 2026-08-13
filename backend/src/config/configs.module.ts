import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { appConfigSchema } from './app/app-config.schema';
import { AppConfigService } from './app/app-config.service';
import appConfigs from './app/app-configs';
import { databaseConfigSchema } from './database/database-config.schema';
import { DatabaseConfigService } from './database/database-config.service';
import databaseConfigs from './database/database-configs';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [...appConfigs, ...databaseConfigs],
      validationSchema: Joi.object({
        ...appConfigSchema,
        ...databaseConfigSchema,
      }),
      // OS and tool environment keys (PATH, npm_*, etc.) are always present.
      // Declared application variables are still validated by the merged schema.
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  providers: [AppConfigService, DatabaseConfigService],
  exports: [AppConfigService, DatabaseConfigService],
})
export class ConfigsModule {}
