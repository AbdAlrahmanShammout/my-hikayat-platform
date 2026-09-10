import { pressHost, renderElement } from '@/test/render-element';
import { ErrorState } from '@/ui/feedback/error-state';

describe('ErrorState', () => {
  it('lets the parent own retry', () => {
    const onRetry = jest.fn();
    const tree = renderElement(
      <ErrorState
        description="We couldn't load your library. Check your connection and try again."
        onRetry={onRetry}
        testID="home-error"
      />,
    );
    pressHost(tree.root.findByProps({ accessibilityLabel: 'Try Again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
