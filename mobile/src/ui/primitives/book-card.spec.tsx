import { findHostByTestId, pressHost, renderElement } from '@/test/render-element';
import { BookCard } from '@/ui/primitives/book-card';

describe('BookCard', () => {
  it('does not attach cover progress on grid cards', () => {
    const tree = renderElement(
      <BookCard
        title="Sang Kancil"
        authorName="Zaleha Ahmad"
        variant="grid"
        showCoverProgress
        progressFraction={0.8}
        progressLabel="Chapter 4 of 14"
        onPress={() => {}}
        testID="grid-card"
      />,
    );
    expect(findHostByTestId(tree, 'grid-card')).toBeTruthy();
    expect(() => findHostByTestId(tree, 'book-cover-progress')).toThrow();
    expect(() => tree.root.findByProps({ children: 'Chapter 4 of 14' })).toThrow();
  });

  it('shows the coarse progress label on continue cards', () => {
    const onPress = jest.fn();
    const tree = renderElement(
      <BookCard
        title="The Night Market Chronicles"
        variant="continue"
        progressLabel="Chapter 4 of 14"
        onPress={onPress}
        testID="continue-card"
      />,
    );
    expect(tree.root.findByProps({ children: 'Chapter 4 of 14' })).toBeTruthy();
    pressHost(findHostByTestId(tree, 'continue-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a horizontal row without continue-reading chrome', () => {
    const tree = renderElement(
      <BookCard
        title="Sang Kancil"
        authorName="Zaleha Ahmad"
        publisherName="Kota Press"
        variant="row"
        onPress={() => undefined}
        testID="search-row"
      />,
    );
    expect(findHostByTestId(tree, 'search-row')).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Zaleha Ahmad' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Kota Press' })).toBeTruthy();
    expect(() => tree.root.findByProps({ children: '▶' })).toThrow();
  });
});
