import { compare } from 'bcryptjs';

export async function compareHashString(value: string, hashedValue: string): Promise<boolean> {
  return compare(value, hashedValue);
}
