import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomSheet } from './BottomSheet';
import { BrandGradient } from './BrandGradient';
import { type Review } from '../data/reviews';
import { colors, radius, spacing, typography } from '../theme';

const INPUT_HEIGHT = 96;
const ACTION_HEIGHT = 34.65;

type ReviewReplySheetProps = {
  review: Review | null;
  onDismiss: () => void;
  /** Resolves true once the reply is in, so the sheet knows to close. */
  onSend: (message: string) => Promise<boolean>;
  error?: string | null;
};

/**
 * Where the astrologer answers a review. Figma designs the Reply button but not
 * what it opens, so this follows the app's other sheets.
 */
export function ReviewReplySheet({
  review,
  onDismiss,
  onSend,
  error,
}: ReviewReplySheetProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Reopening starts from whatever reply is already on the review.
  useEffect(() => {
    setMessage(review?.reply?.message ?? '');
  }, [review]);

  const send = async () => {
    setSending(true);
    const sent = await onSend(message);
    setSending(false);
    if (sent) {
      setMessage('');
    }
  };

  return (
    <BottomSheet
      visible={review !== null}
      title="Reply to review"
      onDismiss={onDismiss}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {review && (
          <View style={styles.quote}>
            <Text style={styles.quoteName}>{review.reviewer}</Text>
            <Text style={styles.quoteBody}>{review.comment}</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Your reply *</Text>
          <TextInput
            accessibilityLabel="Your reply *"
            value={message}
            onChangeText={setMessage}
            placeholder="Write your reply..."
            placeholderTextColor={colors.text.slateMuted}
            multiline
            style={styles.input}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.action,
              styles.close,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send reply"
            disabled={sending}
            onPress={send}
            style={({ pressed }) => [
              styles.action,
              styles.send,
              sending && styles.busy,
              pressed && styles.pressed,
            ]}
          >
            <BrandGradient radius={radius.button} angle="shallow" />
            {sending ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.sendLabel}>Send</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.section,
    paddingTop: 12,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  quote: {
    padding: spacing.md,
    borderRadius: radius.mediaCard,
    backgroundColor: colors.review.card,
  },
  quoteName: {
    ...typography.reviewName,
    color: colors.text.slateMuted,
  },
  quoteBody: {
    ...typography.reviewLabel,
    color: colors.text.slateMuted,
  },
  field: {
    gap: 6,
  },
  label: {
    ...typography.menuMeta,
    color: colors.text.slateMuted,
  },
  input: {
    ...typography.menuMeta,
    height: INPUT_HEIGHT,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderRadius: radius.thumb,
    borderWidth: 1,
    borderColor: colors.border.sheetField,
    color: colors.text.sheet,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.menuMeta,
    color: colors.status.danger,
  },
  pressed: {
    opacity: 0.6,
  },
  busy: {
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 9.4,
    paddingTop: 6,
  },
  action: {
    flex: 1,
    height: ACTION_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  close: {
    borderRadius: radius.thumb,
    borderWidth: 1,
    borderColor: colors.text.ink,
  },
  closeLabel: {
    ...typography.historyAction,
    color: colors.text.ink,
    textTransform: 'capitalize',
  },
  send: {
    borderRadius: radius.button,
  },
  sendLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
});
