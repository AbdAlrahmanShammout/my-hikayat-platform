import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class CredentialThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    const ip: string = req.ips.length > 0 ? req.ips[0] : (req.ip ?? 'unknown');
    return Promise.resolve(`${ip}:${CredentialThrottlerGuard.readEmail(req.body)}`);
  }

  private static readEmail(body: unknown): string {
    if (typeof body !== 'object' || body === null || !('email' in body)) {
      return '';
    }
    const email: unknown = body.email;
    if (typeof email !== 'string') {
      return '';
    }
    return email.trim().toLowerCase();
  }
}
