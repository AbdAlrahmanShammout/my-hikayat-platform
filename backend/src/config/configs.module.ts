import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { appConfigSchema } from './app/app-config.schema';
import { AppConfigService } from './app/app-config.service';
import appConfigs from './app/app-configs';
import { databaseConfigSchema } from './database/database-config.schema';
import { DatabaseConfigService } from './database/database-config.service';
import databaseConfigs from './database/database-configs';
import { jwtConfigSchema } from './jwt/jwt-config.schema';
import { JwtConfigService } from './jwt/jwt-config.service';
import jwtConfigs from './jwt/jwt-configs';
import { storageConfigSchema } from './storage/storage-config.schema';
import { StorageConfigService } from './storage/storage-config.service';
import storageConfigs from './storage/storage-configs';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [...appConfigs, ...databaseConfigs, ...jwtConfigs, ...storageConfigs],
      validationSchema: Joi.object({
        ...appConfigSchema,
        ...databaseConfigSchema,
        ...jwtConfigSchema,
        ...storageConfigSchema,
      }),
      // OS and tool environment keys (PATH, npm_*, etc.) are always present.
      // Declared application variables are still validated by the merged schema.
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  providers: [AppConfigService, DatabaseConfigService, JwtConfigService, StorageConfigService],
  exports: [AppConfigService, DatabaseConfigService, JwtConfigService, StorageConfigService],
})
export class ConfigsModule {}
