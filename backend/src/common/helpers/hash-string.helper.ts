import { hash } from 'bcryptjs';

import { BCRYPT_SALT_ROUNDS } from '@/common/constants/password.constant';

export async function hashString(value: string): Promise<string> {
  return hash(value, BCRYPT_SALT_ROUNDS);
}
