import { describe, expect, it } from 'vitest';

import { resolvePublisherForRole } from '@/features/users/lib/resolve-publisher-for-role';

describe('resolvePublisherForRole', () => {
  it('forces reader off and author on', () => {
    expect(resolvePublisherForRole('reader', true)).toBe(false);
    expect(resolvePublisherForRole('author', false)).toBe(true);
  });

  it('leaves admin publisher capability unchanged', () => {
    expect(resolvePublisherForRole('admin', true)).toBe(true);
    expect(resolvePublisherForRole('admin', false)).toBe(false);
  });
});
