import { theme } from '@/theme/theme';
import { toViewShadow } from '@/ui/lib/to-view-shadow';

describe('toViewShadow', () => {
  it('copies RN shadow fields and omits Figma spread', () => {
    const actual = toViewShadow(theme.shadows.sm);
    expect(actual.shadowColor).toBe(theme.shadows.sm.shadowColor);
    expect(actual.shadowOpacity).toBe(theme.shadows.sm.shadowOpacity);
    expect(actual.elevation).toBe(theme.shadows.sm.elevation);
    expect(actual).not.toHaveProperty('spread');
    expect(actual).not.toHaveProperty('ringColor');
  });
});
