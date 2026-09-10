import { findHostByTestId, renderElement } from '@/test/render-element';
import { Skeleton } from '@/ui/primitives/skeleton';

describe('Skeleton', () => {
  it('hides the placeholder from accessibility', () => {
    const tree = renderElement(<Skeleton width={80} height={16} testID="home-skeleton" />);
    const node = findHostByTestId(tree, 'home-skeleton');
    expect(node.props.accessibilityElementsHidden).toBe(true);
  });
});
