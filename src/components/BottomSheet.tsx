import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { SheetCloseIcon } from './icons/BankIcons';
import { colors, radius, spacing, typography } from '../theme';

const HEADER_HEIGHT = 45.996;

type BottomSheetProps = {
  visible: boolean;
  title: string;
  /** The close mark, the scrim and the Android back button all dismiss it. */
  onDismiss: () => void;
  children: React.ReactNode;
};

/**
 * A sheet that rises off the bottom edge under a yellow title bar, over the
 * screen dimmed behind it.
 * Figma: nodes 110:6793 and 110:6992, over the scrims at 110:6792 / 110:6991.
 */
export function BottomSheet({
  visible,
  title,
  onDismiss,
  children,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.stage}>
        <Pressable
          accessibilityLabel={`Close ${title}`}
          style={styles.scrim}
          onPress={onDismiss}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {/* Labelled "Dismiss" rather than "Close" so it stays distinct
                from a sheet's own Close button. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dismiss ${title}`}
              onPress={onDismiss}
              hitSlop={spacing.sm}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <SheetCloseIcon />
            </Pressable>
          </View>

          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // Figma dims the screen behind with flat black at half strength.
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: radius.input,
    borderTopRightRadius: radius.input,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border.sheet,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_HEIGHT,
    paddingLeft: 10.95,
    paddingRight: 10.9,
    backgroundColor: colors.brandYellow,
  },
  title: {
    ...typography.sheetHeading,
    color: colors.text.ink,
  },
  pressed: {
    opacity: 0.6,
  },
});
