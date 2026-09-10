import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BankDetailsIcon,
  DocumentsIcon,
  LogoutIcon,
  ViewProfileIcon,
} from './icons/ProfileMenuIcons';
import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing, typography } from '../theme';

/** The card Figma draws at 128 × 146, on 16pt of padding and a 14pt gap. */
const CARD_WIDTH = 128;
/** Figma seats every label 21pt from the left edge of its icon (node 110:6265). */
const ICON_COLUMN = 21;
const ROW_HEIGHT = 18;

export type ProfileMenuAction =
  | 'view-profile'
  | 'bank-details'
  | 'documents'
  | 'logout';

type ProfileMenuProps = {
  visible: boolean;
  /** Tapping the scrim, the avatar again, or Android back all close it. */
  onDismiss: () => void;
  onSelect: (action: ProfileMenuAction) => void;
  /** Distance from the top of the screen to the card, measured by the header. */
  top: number;
  /** Its distance from the right edge — the header's own gutter. */
  right?: number;
};

const ITEMS: ReadonlyArray<{
  action: ProfileMenuAction;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  { action: 'view-profile', label: 'View Profile', Icon: ViewProfileIcon },
  { action: 'bank-details', label: 'Bank Details', Icon: BankDetailsIcon },
  { action: 'documents', label: 'Documents', Icon: DocumentsIcon },
  { action: 'logout', label: 'Logout', Icon: LogoutIcon },
];

/**
 * The dropdown the dashboard's header avatar opens: four account shortcuts on a
 * white rounded card, anchored under the avatar at the header's right gutter.
 * Figma: node 110:6263.
 */
export function ProfileMenu({
  visible,
  onDismiss,
  onSelect,
  top,
  right = spacing.lg,
}: ProfileMenuProps) {
  const { px } = useResponsive();
  const styles = useMemo(() => createStyles(px), [px]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* The scrim is invisible — it only exists so a tap anywhere off the card
          closes the menu, the way a dropdown behaves. */}
      <Pressable
        accessibilityLabel="Close profile menu"
        style={styles.scrim}
        onPress={onDismiss}
      >
        <View style={[styles.card, { top, right }]}>
          {ITEMS.map(({ action, label, Icon }) => (
            <Pressable
              key={action}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => onSelect(action)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowIcon}>
                <Icon />
              </View>
              <Text style={styles.rowLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

function createStyles(px: (value: number) => number) {
  return StyleSheet.create({
    scrim: {
      flex: 1,
    },
    card: {
      position: 'absolute',
      width: px(CARD_WIDTH),
      padding: spacing.section,
      gap: 14,
      borderRadius: radius.input,
      backgroundColor: colors.surface,
      // Figma leaves the card flat; a soft lift is added here so it still reads
      // as floating where it overlaps the white header.
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: px(ROW_HEIGHT),
    },
    rowIcon: {
      width: px(ICON_COLUMN),
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    rowLabel: {
      ...typography.dropdownLabel,
      color: colors.text.dropdown,
    },
    pressed: {
      opacity: 0.6,
    },
  });
}
