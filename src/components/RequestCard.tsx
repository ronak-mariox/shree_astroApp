import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, radius, spacing, typography } from '../theme';
import { CheckIcon } from './icons/CheckIcon';
import { ChatBubbleIcon, CloseIcon, PhoneIcon } from './icons/DashboardIcons';

const AVATAR_SIZE = 43.998;
const TAG_ICON_SIZE = 9.994;
const ACTION_ICON_SIZE = 12;
const ACTION_HEIGHT = 33.993;

/** What the incoming-request popup shows once the card is answered. */
export type RequestDetails = {
  dateOfBirth: string;
  birthPlace: string;
  issue: string;
  /** Per-minute rate, already formatted. */
  rate: string;
  duration: string;
  earnings: string;
};

export type ConsultationRequest = {
  id: string;
  name: string;
  /** Initials shown on the yellow tile. */
  initials: string;
  /** How long ago it came in, already formatted. */
  age: string;
  channel: 'chat' | 'voice';
  topic: string;
  details: RequestDetails;
};

type RequestCardProps = {
  request: ConsultationRequest;
  onAccept?: () => void;
  onDecline?: () => void;
  /**
   * The Missed Call list on the consult screen reuses this card without its
   * answer buttons (Figma node 112:2160).
   */
  showActions?: boolean;
};

/**
 * A pending consultation request: who is asking, over which channel, about what,
 * and the two ways to answer (Figma nodes 104:5910 chat, 104:5946 voice).
 */
export function RequestCard({
  request,
  onAccept,
  onDecline,
  showActions = true,
}: RequestCardProps) {
  const isChat = request.channel === 'chat';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{request.initials}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{request.name}</Text>
            <Text style={styles.age}>{request.age}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.tag, isChat ? styles.tagChat : styles.tagVoice]}>
              {isChat ? (
                <ChatBubbleIcon size={TAG_ICON_SIZE} />
              ) : (
                <PhoneIcon size={TAG_ICON_SIZE} />
              )}
              <Text
                style={[
                  styles.tagLabel,
                  isChat ? styles.tagLabelChat : styles.tagLabelVoice,
                ]}
              >
                {isChat ? 'Chat' : 'Voice'}
              </Text>
            </View>

            <Text style={styles.topic}>{request.topic}</Text>
          </View>

          {showActions && (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Accept ${request.name}`}
              onPress={onAccept}
              style={({ pressed }) => [
                styles.action,
                styles.accept,
                pressed && styles.pressed,
              ]}
            >
              <CheckIcon
                size={ACTION_ICON_SIZE}
                color={colors.text.inverse}
              />
              <Text style={[styles.actionLabel, styles.acceptLabel]}>
                Accept
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Decline ${request.name}`}
              onPress={onDecline}
              style={({ pressed }) => [
                styles.action,
                styles.decline,
                pressed && styles.pressed,
              ]}
            >
              <CloseIcon size={ACTION_ICON_SIZE} />
              <Text style={[styles.actionLabel, styles.declineLabel]}>
                Decline
              </Text>
            </Pressable>
          </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14.755,
    borderRadius: radius.panel,
    borderWidth: hairline,
    borderColor: colors.border.hairline,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.input,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.requestInitials,
    color: colors.text.ink,
  },
  body: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.requestName,
    color: colors.text.inkSoft,
  },
  age: {
    ...typography.requestTime,
    color: colors.text.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.tag,
  },
  tagChat: {
    backgroundColor: colors.status.infoBadge,
  },
  tagVoice: {
    backgroundColor: colors.status.successBadge,
  },
  tagLabel: {
    ...typography.tagLabel,
  },
  tagLabelChat: {
    color: colors.status.info,
  },
  tagLabelVoice: {
    color: colors.status.success,
  },
  topic: {
    ...typography.note,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  action: {
    flex: 1,
    height: ACTION_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.action,
  },
  accept: {
    backgroundColor: colors.status.success,
  },
  decline: {
    borderWidth: hairline,
    borderColor: colors.status.dangerTintBorder,
    backgroundColor: colors.status.dangerTint,
  },
  pressed: {
    opacity: 0.8,
  },
  actionLabel: {
    ...typography.requestAction,
    textAlign: 'center',
  },
  acceptLabel: {
    color: colors.text.inverse,
  },
  declineLabel: {
    color: colors.status.danger,
  },
});
