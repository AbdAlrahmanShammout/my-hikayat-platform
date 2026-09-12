import { Text } from 'react-native';

import { renderElement } from '@/test/render-element';
import { SheetHeader } from '@/ui/layout/sheet-header';

describe('SheetHeader', () => {
  it('renders an italic title and optional icon well', () => {
    const tree = renderElement(
      <SheetHeader title="Remove download?" tone="warning" icon={<Text>!</Text>} />,
    );
    expect(tree.root.findByProps({ children: 'Remove download?' })).toBeTruthy();
    expect(tree.root.findByProps({ children: '!' })).toBeTruthy();
  });
});
