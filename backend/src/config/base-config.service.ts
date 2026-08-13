import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BaseConfigService {
  constructor(private readonly configService: ConfigService) {}

  getValue<T>(key: string): T {
    const value: T | undefined = this.configService.get<T>(key);
    if (value === undefined) {
      throw new Error(`Missing configuration key: ${key}`);
    }
    return value;
  }
}
