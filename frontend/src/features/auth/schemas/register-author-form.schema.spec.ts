import { describe, expect, it } from 'vitest';

import { registerAuthorFormSchema } from '@/features/auth/schemas/register-author-form.schema';

describe('registerAuthorFormSchema', () => {
  it('accepts a valid email and matching password', () => {
    const actualResult = registerAuthorFormSchema.safeParse({
      email: 'author@example.com',
      password: 'correct-horse-battery',
      confirmPassword: 'correct-horse-battery',
    });
    expect(actualResult.success).toBe(true);
  });

  it('rejects a blank or invalid email', () => {
    const actualResult = registerAuthorFormSchema.safeParse({
      email: 'not-an-email',
      password: 'correct-horse-battery',
      confirmPassword: 'correct-horse-battery',
    });
    expect(actualResult.success).toBe(false);
  });

  it('rejects a short password', () => {
    const actualResult = registerAuthorFormSchema.safeParse({
      email: 'author@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(actualResult.success).toBe(false);
  });

  it('reports a mismatch on the confirmation field', () => {
    const actualResult = registerAuthorFormSchema.safeParse({
      email: 'author@example.com',
      password: 'correct-horse-battery',
      confirmPassword: 'correct-horse-batteries',
    });
    expect(actualResult.success).toBe(false);
    expect(actualResult.error?.issues[0].path).toEqual(['confirmPassword']);
  });
});
