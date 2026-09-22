import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ConsultationRequest } from './RequestCard';
import { ChatBubbleIcon, CloseIcon, PhoneIcon } from './icons/DashboardIcons';
import { CheckIcon } from './icons/CheckIcon';
import { INCOMING_STARS, StarField } from './StarField';
import { useResponsive } from '../hooks/useResponsive';
import { colors, hairline, radius, spacing, stroke, typography } from '../theme';

const AVATAR_SIZE = 95.996;
const TAG_ICON_SIZE = 13.994;
const ACTION_ICON_SIZE = 17.993;
const ACTION_HEIGHT = 55.998;
const CARD_WIDTH = 325.994;
/** The frame the star scatter was measured on. */
const FRAME_HEIGHT = 843.992;

type IncomingRequestPopupProps = {
  /** The request under review; `null` keeps the popup closed. */
  request: ConsultationRequest | null;
  onAccept: (request: ConsultationRequest) => void;
  onDecline: (request: ConsultationRequest) => void;
  /** Dismissing without answering — the Android back button. */
  onDismiss?: () => void;
};

/**
 * The incoming-consultation popup: who is calling, the birth details they filed,
 * what the session is worth, and the two ways to answer.
 * Figma: node 108:7369.
 */
export function IncomingRequestPopup({
  request,
  onAccept,
  onDecline,
  onDismiss,
}: IncomingRequestPopupProps) {
  return (
    <Modal
      visible={request !== null}
      animationType="fade"
      transparent={false}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {request && <PopupBody request={request} onAccept={onAccept} onDecline={onDecline} />}
    </Modal>
  );
}

function PopupBody({
  request,
  onAccept,
  onDecline,
}: {
  request: ConsultationRequest;
  onAccept: (request: ConsultationRequest) => void;
  onDecline: (request: ConsultationRequest) => void;
}) {
  const insets = useSafeAreaInsets();
  const { px } = useResponsive();
  const styles = useMemo(() => createStyles(px), [px]);
  const { details } = request;
  const isChat = request.channel === 'chat';

  return (
    <View style={styles.screen}>
      <StarField stars={INCOMING_STARS} frameHeight={px(FRAME_HEIGHT)} />

      {/* Centred on a tall screen, scrollable on a short one, and always clear
          of the status bar and the home indicator. */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{request.initials}</Text>
          </View>
        </View>

        <Text style={styles.name}>{request.name}</Text>

        <View style={styles.tag}>
          {isChat ? (
            <ChatBubbleIcon size={px(TAG_ICON_SIZE)} color={colors.text.ink} />
          ) : (
            <PhoneIcon size={px(TAG_ICON_SIZE)} color={colors.text.ink} />
          )}
          <Text style={styles.tagLabel}>
            {isChat ? 'Chat' : 'Voice'} Consultation
          </Text>
        </View>

        <View style={styles.card}>
          <DetailRow styles={styles} label="Date of Birth" value={details.dateOfBirth} />
          <DetailRow styles={styles} label="Birth Place" value={details.birthPlace} />
          <DetailRow styles={styles} label="Issue" value={details.issue} />
          <DetailRow styles={styles} label="Rate" value={details.rate} />
          <DetailRow styles={styles} label="Est. Duration" value={details.duration} />
        </View>

        <Text style={styles.earnings}>
          Est. Earnings:{' '}
          <Text style={styles.earningsValue}>{details.earnings}</Text>
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Decline ${request.name}`}
            onPress={() => onDecline(request)}
            style={({ pressed }) => [
              styles.action,
              styles.decline,
              pressed && styles.pressed,
            ]}
          >
            <CloseIcon size={px(ACTION_ICON_SIZE)} />
            <Text style={[styles.actionLabel, styles.declineLabel]}>
              Decline
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Accept ${request.name}`}
            onPress={() => onAccept(request)}
            style={({ pressed }) => [
              styles.action,
              styles.accept,
              pressed && styles.pressed,
            ]}
          >
            <CheckIcon
              size={px(ACTION_ICON_SIZE)}
              color={colors.text.inverse}
            />
            <Text style={[styles.actionLabel, styles.acceptLabel]}>Accept</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  styles,
  label,
  value,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function createStyles(px: (value: number) => number) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  avatarWrap: {
    paddingBottom: spacing.section,
  },
  avatar: {
    width: px(AVATAR_SIZE),
    height: px(AVATAR_SIZE),
    borderRadius: px(AVATAR_SIZE) / 2,
    backgroundColor: colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    // drop-shadow(0 0 20px rgba(240, 223, 32, 0.5))
    ...Platform.select({
      ios: {
        shadowColor: colors.brandYellow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        shadowColor: colors.brandYellow,
        elevation: 12,
      },
      default: {},
    }),
  },
  initials: {
    ...typography.initialsLarge,
    color: colors.text.ink,
  },
  name: {
    ...typography.headline,
    color: colors.text.ink,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    backgroundColor: colors.brandTint.tag,
  },
  tagLabel: {
    ...typography.metaMedium,
    color: colors.text.ink,
  },
  card: {
    width: px(CARD_WIDTH),
    marginTop: spacing.lg,
    padding: px(16.755),
    borderRadius: radius.card,
    borderWidth: hairline,
    borderColor: colors.border.glass,
    backgroundColor: colors.surfaceSubtle,
  },
  // Figma rules every row, the last one included.
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: px(8.755),
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.rowFaint,
  },
  rowLabel: {
    ...typography.meta,
    color: colors.text.labelMuted,
  },
  rowValue: {
    ...typography.metaMedium,
    color: colors.text.ink,
  },
  earnings: {
    ...typography.meta,
    color: colors.text.ink,
    marginTop: 14,
  },
  earningsValue: {
    ...typography.metaBold,
    color: colors.text.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.section,
    width: px(CARD_WIDTH),
    paddingTop: spacing.xl,
  },
  action: {
    flex: 1,
    height: px(ACTION_HEIGHT),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.buttonLarge,
  },
  decline: {
    borderWidth: stroke,
    borderColor: colors.status.dangerBorder,
    backgroundColor: colors.status.dangerTintStrong,
  },
  accept: {
    backgroundColor: colors.status.success,
  },
  pressed: {
    opacity: 0.8,
  },
  actionLabel: {
    ...typography.buttonSmallStrong,
    textAlign: 'center',
  },
  declineLabel: {
    color: colors.status.danger,
  },
  acceptLabel: {
    color: colors.text.inverse,
  },
  });
}
