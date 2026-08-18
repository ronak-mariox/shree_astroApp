import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing, typography } from '../theme';

/** Figma frames the cheque at 369.822 × 191.284 (node 110:6998). */
const ATTACHMENT_WIDTH = 369.822;
const ATTACHMENT_HEIGHT = 191.284;

type BankAttachmentSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  /** The proof filed against the account, named under the scan. */
  fileName?: string;
};

/**
 * The proof filed against the account — a cancelled cheque, shown when the eye
 * beside the account's status is tapped.
 * Figma: node 110:6992.
 */
export function BankAttachmentSheet({
  visible,
  onDismiss,
  fileName,
}: BankAttachmentSheetProps) {
  return (
    <BottomSheet visible={visible} title="Bank Attachment" onDismiss={onDismiss}>
      <View style={styles.body}>
        <Image
          accessibilityLabel="Cancelled cheque"
          source={require('../assets/images/bank-attachment.png')}
          // Figma crops the photo into its frame rather than letterboxing it.
          resizeMode="cover"
          style={styles.attachment}
        />
        {fileName ? (
          <Text style={styles.fileName}>{fileName}</Text>
        ) : (
          <Text style={styles.fileName}>No proof filed yet</Text>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 16.34,
    paddingBottom: spacing.xl,
  },
  fileName: {
    ...typography.profileRowLabel,
    color: colors.text.slateMuted,
    opacity: 0.8,
  },
  attachment: {
    width: '100%',
    maxWidth: ATTACHMENT_WIDTH,
    aspectRatio: ATTACHMENT_WIDTH / ATTACHMENT_HEIGHT,
    borderRadius: radius.attachment,
  },
});
