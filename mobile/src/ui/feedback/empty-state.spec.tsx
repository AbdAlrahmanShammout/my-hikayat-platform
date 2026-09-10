import { pressHost, renderElement } from '@/test/render-element';
import { EmptyState } from '@/ui/feedback/empty-state';

describe('EmptyState', () => {
  it('keeps copy and actions in the parent', () => {
    const onAction = jest.fn();
    const tree = renderElement(
      <EmptyState
        title="No books yet"
        description="Download books from the library to read them anywhere."
        actionLabel="Browse library"
        onAction={onAction}
        testID="library-empty"
      />,
    );
    expect(tree.root.findByProps({ testID: 'library-empty' })).toBeTruthy();
    pressHost(tree.root.findByProps({ accessibilityLabel: 'Browse library' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
