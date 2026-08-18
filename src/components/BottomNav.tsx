import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, hairline, spacing, typography } from '../theme';
import {
  BellIcon,
  ChatBubbleIcon,
  HomeIcon,
  MenuIcon,
  WalletCardIcon,
} from './icons/DashboardIcons';

const ICON_SIZE = 21.993;
const MENU_WIDTH = 20;
const MENU_HEIGHT = 12;
const INDICATOR_WIDTH = 31.999;

export type TabKey = 'home' | 'consult' | 'wallet' | 'alerts' | 'menu';

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'consult', label: 'Consult' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'menu', label: 'Menu' },
];

type BottomNavProps = {
  active: TabKey;
  onSelect?: (tab: TabKey) => void;
};

/**
 * The five-tab bar. The selected tab takes the brand green and a pill pinned to
 * the bar's top edge (Figma node 104:5696).
 */
export function BottomNav({ active, onSelect }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {TABS.map(tab => {
        const isActive = tab.key === active;
        const color = isActive ? colors.status.success : colors.text.muted;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect?.(tab.key)}
            style={styles.tab}
          >
            {isActive && <View style={styles.indicator} />}

            <View style={tab.key === 'menu' ? styles.menuIcon : undefined}>
              {tab.key === 'home' && <HomeIcon size={ICON_SIZE} color={color} />}
              {tab.key === 'consult' && (
                <ChatBubbleIcon size={ICON_SIZE} color={color} />
              )}
              {tab.key === 'wallet' && (
                <WalletCardIcon size={ICON_SIZE} color={color} />
              )}
              {tab.key === 'alerts' && <BellIcon size={ICON_SIZE} color={color} />}
              {tab.key === 'menu' && (
                <MenuIcon width={MENU_WIDTH} height={MENU_HEIGHT} color={color} />
              )}
            </View>

            <Text
              style={[
                isActive ? styles.labelActive : styles.label,
                { color },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.border.hairline,
    // drop-shadow(0 -4px 12px rgba(0, 0, 0, 0.06))
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
      default: {},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingBottom: spacing.md,
  },
  indicator: {
    position: 'absolute',
    // Figma pins it 12pt above the tab's content, flush with the bar's edge.
    top: -spacing.md,
    width: INDICATOR_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.status.success,
  },
  // The menu glyph is shorter than the others, so Figma pads it out to match.
  menuIcon: {
    height: ICON_SIZE,
    justifyContent: 'center',
  },
  label: {
    ...typography.tabLabel,
    textAlign: 'center',
  },
  labelActive: {
    ...typography.tabLabelActive,
    textAlign: 'center',
  },
});
