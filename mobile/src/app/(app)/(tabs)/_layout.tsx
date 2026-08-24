import { Tabs } from 'expo-router';
import type { JSX } from 'react';
import { Text } from 'react-native';

import { theme } from '@/theme/theme';

/**
 * Kids-friendly main shell: Home, My books, Me.
 */
export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textPlaceholder,
        tabBarStyle: {
          minHeight: 64,
          paddingBottom: theme.spacing.xs,
          paddingTop: theme.spacing.xs,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.borderSubtle,
        },
        tabBarLabelStyle: {
          ...theme.typography.tab,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarButtonTestID: 'tab-home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color }) => <TabIcon label="H" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'My books',
          tabBarButtonTestID: 'tab-library',
          tabBarAccessibilityLabel: 'Library tab',
          tabBarIcon: ({ color }) => <TabIcon label="B" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarButtonTestID: 'tab-profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ color }) => <TabIcon label="M" color={color} />,
        }}
      />
    </Tabs>
  );
}

type TabIconProps = {
  readonly label: string;
  readonly color: string;
};

function TabIcon({ label, color }: TabIconProps): JSX.Element {
  return (
    <Text style={{ color, fontSize: 16, fontWeight: '700' }} accessibilityElementsHidden>
      {label}
    </Text>
  );
}
