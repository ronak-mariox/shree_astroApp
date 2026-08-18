import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { ChatBubbleIcon, StarOutlineIcon } from './icons/DashboardIcons';
import {
  CurrencyIcon,
  LandmarkIcon,
  ZapIcon,
} from './icons/NotificationIcons';

const WELL_SIZE = 43.998;
const ICON_SIZE = 19.999;
const DOT_SIZE = 8;

/**
 * What happened. The kind picks the glyph and the colour of the well behind it
 * — the rest of the card is the same whichever it is.
 */
export type NotificationKind =
  | 'chat'
  | 'wallet'
  | 'review'
  | 'withdrawal'
  | 'platform';

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** How long ago it arrived, already formatted. */
  age: string;
  unread: boolean;
};

/** Glyph and well per kind (Figma nodes 112:1548, 1567, 1587, 1604, 1626). */
const ICONS: Record<
  NotificationKind,
  { render: (color: string) => React.ReactNode; color: string; well: string }
> = {
  chat: {
    render: color => <ChatBubbleIcon size={ICON_SIZE} color={color} />,
    color: colors.status.info,
    well: colors.status.infoWell,
  },
  wallet: {
    render: color => <CurrencyIcon size={ICON_SIZE} color={color} />,
    color: colors.status.success,
    well: colors.status.successWell,
  },
  review: {
    render: color => <StarOutlineIcon size={ICON_SIZE} color={color} />,
    color: colors.status.warning,
    well: colors.status.warningWell,
  },
  withdrawal: {
    render: color => <LandmarkIcon size={ICON_SIZE} color={color} />,
    color: colors.status.success,
    well: colors.status.successWell,
  },
  platform: {
    render: color => <ZapIcon size={ICON_SIZE} color={color} />,
    color: colors.status.accent,
    well: colors.status.accentWell,
  },
};

type NotificationCardProps = {
  notification: Notification;
  /** Reading it drops the yellow wash and the dot. */
  onPress?: () => void;
};

/**
 * One row of the notifications feed. An unread one takes a faint yellow wash,
 * a yellow outline and a dot beside its title; once read it settles onto the
 * plain white card the rest of the app uses (Figma nodes 112:1547 unread,
 * 112:1586 read).
 */
export function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const { unread } = notification;
  const icon = ICONS[notification.kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.body} ${notification.age}`}
      accessibilityState={{ selected: unread }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        unread ? styles.cardUnread : styles.cardRead,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.well, { backgroundColor: icon.well }]}>
        {icon.render(icon.color)}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{notification.title}</Text>
          {unread && (
            <View style={styles.dotSlot}>
              <View style={styles.dot} />
            </View>
          )}
        </View>

        <Text style={styles.message}>{notification.body}</Text>
        <Text style={styles.age}>{notification.age}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: 14.755,
    borderRadius: radius.panel,
    borderWidth: hairline,
  },
  cardUnread: {
    backgroundColor: colors.brandTint.card,
    borderColor: colors.border.brandSubtle,
  },
  cardRead: {
    backgroundColor: colors.surface,
    borderColor: colors.border.hairline,
  },
  pressed: {
    opacity: 0.85,
  },
  well: {
    width: WELL_SIZE,
    height: WELL_SIZE,
    borderRadius: radius.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.requestName,
    flex: 1,
    color: colors.text.inkSoft,
  },
  // Figma nudges the dot down so it sits on the title's midline.
  dotSlot: {
    paddingTop: spacing.xs,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.brandYellow,
  },
  message: {
    ...typography.meta,
    paddingTop: 3,
    color: colors.text.secondary,
  },
  age: {
    ...typography.requestTime,
    paddingTop: 5,
    color: colors.text.muted,
  },
});
