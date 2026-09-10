import { findHostByTestId, renderElement } from '@/test/render-element';
import { BookCover } from '@/ui/primitives/book-cover';

describe('BookCover', () => {
  it('shows a placeholder when artwork is missing', () => {
    const tree = renderElement(<BookCover title="Cerita Ibu" coverUri={null} testID="cover" />);
    const frame = findHostByTestId(tree, 'cover');
    expect(frame.props.accessibilityLabel).toBe('No cover for Cerita Ibu');
    expect(tree.root.findByProps({ children: 'No cover' })).toBeTruthy();
  });

  it('renders continue-reading progress only when requested', () => {
    const withProgress = renderElement(
      <BookCover title="Night Market" coverUri={null} showProgress progressFraction={0.5} />,
    );
    expect(findHostByTestId(withProgress, 'book-cover-progress')).toBeTruthy();
    const withoutProgress = renderElement(
      <BookCover title="Night Market" coverUri={null} progressFraction={0.5} />,
    );
    expect(() => findHostByTestId(withoutProgress, 'book-cover-progress')).toThrow();
  });
});
