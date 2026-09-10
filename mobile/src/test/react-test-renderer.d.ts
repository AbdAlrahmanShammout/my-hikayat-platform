declare module 'react-test-renderer' {
  import type { ReactElement } from 'react';

  export type ReactTestInstance = {
    readonly props: {
      readonly [key: string]: unknown;
      readonly testID?: string;
      readonly onPress?: () => void;
      readonly onChangeText?: (value: string) => void;
      readonly disabled?: boolean;
      readonly accessibilityRole?: string;
      readonly accessibilityLabel?: string;
      readonly accessibilityState?: { readonly disabled: boolean; readonly busy: boolean };
      readonly accessibilityElementsHidden?: boolean;
      readonly children?: unknown;
    };
    findByProps(props: object): ReactTestInstance;
    findAll(predicate: (node: ReactTestInstance) => boolean): ReactTestInstance[];
  };

  export type ReactTestRenderer = {
    readonly root: ReactTestInstance;
    unmount(): void;
  };

  export function create(element: ReactElement): ReactTestRenderer;
  export function act(callback: () => void): void;
}
