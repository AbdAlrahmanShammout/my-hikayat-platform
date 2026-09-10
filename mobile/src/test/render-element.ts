import type { JSX } from 'react';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';

let currentTree: ReactTestRenderer | undefined;

/**
 * Renders a RN element inside `act` and unmounts it after each test.
 * React 19's test renderer otherwise leaves updates pending and unmounts the tree.
 */
export function renderElement(element: JSX.Element): ReactTestRenderer {
  unmountCurrentTree();
  let tree: ReactTestRenderer | undefined;
  act(() => {
    tree = create(element);
  });
  if (tree === undefined) {
    throw new Error('Expected renderer tree');
  }
  currentTree = tree;
  return tree;
}

/**
 * Returns the interactive or labeled node with `testID`.
 * Pressable forwards testID onto an inner View that does not keep `onPress`.
 */
export function findHostByTestId(tree: ReactTestRenderer, testID: string): ReactTestInstance {
  const matches = tree.root.findAll((node: ReactTestInstance) => node.props.testID === testID);
  if (matches.length === 0) {
    throw new Error(`Expected host node with testID ${testID}`);
  }
  const pressable = matches.find((node) => {
    return typeof node.props.onPress === 'function' && node.props.accessibilityRole === 'button';
  });
  if (pressable !== undefined) {
    return pressable;
  }
  const labeled = matches.find((node) => node.props.accessibilityRole !== undefined);
  if (labeled !== undefined) {
    return labeled;
  }
  return matches[matches.length - 1];
}

export function pressHost(node: ReactTestInstance): void {
  const onPress = node.props.onPress;
  if (typeof onPress !== 'function') {
    throw new Error('Expected host onPress handler');
  }
  act(() => {
    onPress();
  });
}

afterEach(() => {
  unmountCurrentTree();
});

function unmountCurrentTree(): void {
  if (currentTree === undefined) {
    return;
  }
  const tree = currentTree;
  currentTree = undefined;
  act(() => {
    tree.unmount();
  });
}
