import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, type TabKey } from '../components/BottomNav';
import {
  NotificationCard,
  type Notification,
} from '../components/NotificationCard';
import { NOTIFICATIONS } from '../data/notifications';
import { colors, hairline, spacing, typography } from '../theme';

type NotificationsScreenProps = {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
};

/** "2 unread", "1 unread", and nothing left to read. */
const unreadLabel = (count: number) =>
  count === 0 ? 'All caught up' : `${count} unread`;

/**
 * The Alerts tab: everything that has happened since the astrologer last
 * looked, unread first. Tapping a card reads it, which drops its wash and
 * ticks the header's count down.
 * Figma: node 112:1537.
 */
export function NotificationsScreen({
  activeTab = 'alerts',
  onSelectTab,
}: NotificationsScreenProps) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([
    ...NOTIFICATIONS,
  ]);

  const unread = notifications.filter(item => item.unread).length;

  const read = (id: string) =>
    setNotifications(current =>
      current.map(item => (item.id === id ? { ...item, unread: false } : item)),
    );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Figma pads the header 48pt from the frame top, 1pt of which clears
          the status bar. */}
      <View style={[styles.header, { paddingTop: insets.top + 1 }]}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>{unreadLabel(unread)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => read(notification.id)}
          />
        ))}
      </ScrollView>

      <BottomNav active={activeTab} onSelect={onSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: 20.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  title: {
    ...typography.pageTitleSmall,
    color: colors.text.inkSoft,
  },
  subtitle: {
    ...typography.meta,
    paddingTop: 2,
    color: colors.text.secondary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.section,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
