import { Tabs } from 'expo-router';
import { BookOpen, Home, UserRound } from 'lucide-react-native';
import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme/theme';
import { Icon } from '@/ui/primitives/icon';

const TAB_BAR_CONTENT_HEIGHT = 80;

/**
 * Kids-friendly main shell: Home, My Books, Me.
 */
export default function TabsLayout(): JSX.Element {
  const insets = useSafeAreaInsets();
  const bottomInset: number = Math.max(insets.bottom, theme.spacing.sm);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: [
          styles.bar,
          {
            height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarItemStyle: styles.item,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarButtonTestID: 'tab-home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color }) => <Icon icon={Home} color={color} size="lg" />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="Home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'My Books',
          tabBarButtonTestID: 'tab-library',
          tabBarAccessibilityLabel: 'Library tab',
          tabBarIcon: ({ color }) => <Icon icon={BookOpen} color={color} size="lg" />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="My Books" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarButtonTestID: 'tab-profile',
          tabBarAccessibilityLabel: 'Profile tab',
          tabBarIcon: ({ color }) => <Icon icon={UserRound} color={color} size="lg" />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="Me" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

type TabLabelProps = {
  readonly label: string;
  readonly color: string;
  readonly focused: boolean;
};

function TabLabel({ label, color, focused }: TabLabelProps): JSX.Element {
  return (
    <View style={styles.labelWrap}>
      <Text
        style={[
          styles.label,
          {
            color,
            fontWeight: focused ? theme.typography.weights.bold : theme.typography.weights.medium,
          },
        ]}
      >
        {label}
      </Text>
      <View style={[styles.dot, focused ? styles.dotActive : null]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingTop: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.borderSubtle,
    borderTopWidth: 1,
  },
  item: {
    minHeight: 44,
  },
  labelWrap: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    ...theme.typography.tab,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: theme.radii.full,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
});
