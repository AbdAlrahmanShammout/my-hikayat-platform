import { findHostByTestId, renderElement } from '@/test/render-element';
import { Pill } from '@/ui/primitives/pill';

describe('Pill', () => {
  it('renders the label without encoding access rules', () => {
    const tree = renderElement(<Pill label="Available offline" variant="success" testID="lease-pill" />);
    expect(findHostByTestId(tree, 'lease-pill')).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Available offline' })).toBeTruthy();
  });
});
