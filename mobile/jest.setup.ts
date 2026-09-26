jest.mock('lucide-react-native', () => {
  const React = require('react') as typeof import('react');
  const { View } = require('react-native') as typeof import('react-native');
  return new Proxy(
    {},
    {
      get: (_target: object, property: string | symbol) => {
        if (property === '__esModule') {
          return true;
        }
        return function LucideIconMock(props: object): React.ReactElement {
          return React.createElement(View, {
            ...props,
            testID: typeof property === 'string' ? `lucide-${property}` : 'lucide-icon',
          });
        };
      },
    },
  );
});
