import { Injectable } from '@nestjs/common';

import { BaseConfigService } from '../base-config.service';

@Injectable()
export class StorageConfigService extends BaseConfigService {
  get bucket(): string {
    return this.getValue<string>('storage.bucket');
  }

  get region(): string {
    return this.getValue<string>('storage.region');
  }

  get endpoint(): string | null {
    return this.getValue<string | null>('storage.endpoint');
  }

  get accessKeyId(): string {
    return this.getValue<string>('storage.accessKeyId');
  }

  get secretAccessKey(): string {
    return this.getValue<string>('storage.secretAccessKey');
  }

  get forcePathStyle(): boolean {
    return this.getValue<boolean>('storage.forcePathStyle');
  }
}
