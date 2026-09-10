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

  it('forwards search submit from the keyboard', () => {
    const onSubmitEditing = jest.fn();
    const tree = renderElement(
      <TextField
        label="Search text"
        isLabelHidden
        value="kancil"
        onChangeText={() => undefined}
        onSubmitEditing={onSubmitEditing}
        testID="search-query-input"
      />,
    );
    const input = findHostByTestId(tree, 'search-query-input');
    expect(input.props.onSubmitEditing).toBe(onSubmitEditing);
    expect(() => tree.root.findByProps({ children: 'Search text' })).toThrow();
  });

  it('supports multiline token paste without owning validation', () => {
    const tree = renderElement(
      <TextField
        label="Reset token"
        value="abc"
        onChangeText={() => undefined}
        isMultiline
        numberOfLines={4}
        testID="auth-reset-token-input"
      />,
    );
    const input = findHostByTestId(tree, 'auth-reset-token-input');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });
});
