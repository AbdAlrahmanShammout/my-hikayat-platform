import { Tabs } from 'expo-router';
import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

/**
 * Kids-friendly main shell: Home, My Books, Me.
 */
export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: styles.bar,
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
          tabBarIcon: ({ color }) => <HomeTabIcon color={color} />,
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
          tabBarIcon: ({ color }) => <BooksTabIcon color={color} />,
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
          tabBarIcon: ({ color }) => <MeTabIcon color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="Me" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

type TintProps = {
  readonly color: string;
};

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

function HomeTabIcon({ color }: TintProps): JSX.Element {
  return (
    <View style={styles.icon} accessibilityElementsHidden>
      <View
        style={[
          styles.homeRoof,
          {
            borderBottomColor: color,
          },
        ]}
      />
      <View style={[styles.homeBody, { borderColor: color }]} />
    </View>
  );
}

function BooksTabIcon({ color }: TintProps): JSX.Element {
  return (
    <View style={styles.icon} accessibilityElementsHidden>
      <View style={[styles.bookSpine, { borderColor: color }]} />
      <View style={[styles.bookPage, { borderColor: color }]} />
    </View>
  );
}

function MeTabIcon({ color }: TintProps): JSX.Element {
  return (
    <View style={styles.icon} accessibilityElementsHidden>
      <View style={[styles.meHead, { borderColor: color }]} />
      <View style={[styles.meShoulders, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 64,
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
  icon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBody: {
    width: 12,
    height: 9,
    borderWidth: 1.75,
    borderTopWidth: 0,
  },
  bookSpine: {
    position: 'absolute',
    left: 3,
    top: 2,
    width: 10,
    height: 16,
    borderWidth: 1.75,
    borderRadius: 2,
  },
  bookPage: {
    position: 'absolute',
    left: 9,
    top: 4,
    width: 9,
    height: 14,
    borderWidth: 1.75,
    borderRadius: 2,
  },
  meHead: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.full,
    borderWidth: 1.75,
    marginBottom: 2,
  },
  meShoulders: {
    width: 16,
    height: 7,
    borderWidth: 1.75,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
});
