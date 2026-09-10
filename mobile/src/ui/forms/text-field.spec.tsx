import { act } from 'react-test-renderer';

import { findHostByTestId, renderElement } from '@/test/render-element';
import { TextField } from '@/ui/forms/text-field';

describe('TextField', () => {
  it('forwards testID and change handler without owning validation', () => {
    const onChangeText = jest.fn();
    const tree = renderElement(
      <TextField
        label="Email address"
        value="a@b.com"
        onChangeText={onChangeText}
        testID="auth-email"
        errorMessage="Please enter a valid email address."
      />,
    );
    const input = findHostByTestId(tree, 'auth-email');
    const handleChange = input.props.onChangeText;
    if (typeof handleChange !== 'function') {
      throw new Error('Expected TextInput onChangeText');
    }
    act(() => {
      handleChange('new@b.com');
    });
    expect(onChangeText).toHaveBeenCalledWith('new@b.com');
    expect(tree.root.findByProps({ children: 'Please enter a valid email address.' })).toBeTruthy();
  });
});
