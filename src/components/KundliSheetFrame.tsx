import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseCircleIcon } from './icons/ChatIcons';
import { colors, radius, spacing, typography } from '../theme';

/** Figma draws both kundli sheets on an 813pt frame (nodes 110:3900, 110:4740). */
const DESIGN_FRAME_HEIGHT = 813;

type KundliSheetFrameProps = {
  visible: boolean;
  title: string;
  /** The sheet's designed height, in points off that 813pt frame. */
  designHeight: number;
  /** How far the close mark sits from the right edge. */
  closeInset?: number;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * The white sheet both kundli popups rise on: a centred title, the close mark
 * on its right, and a rule under both.
 * Figma: nodes 110:3899 (generate) and 110:4476 / 110:4739 (details).
 */
export function KundliSheetFrame({
  visible,
  title,
  designHeight,
  closeInset = 17,
  onClose,
  children,
}: KundliSheetFrameProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Keep the designed proportion of the screen rather than a fixed height, so
  // the sheet reads the same on a taller or shorter phone.
  const sheetHeight = Math.round((designHeight / DESIGN_FRAME_HEIGHT) * height);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.stage}>
        <Pressable
          accessibilityLabel={`Close ${title}`}
          style={styles.scrim}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            { height: sheetHeight, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Dismiss ${title}`}
              onPress={onClose}
              hitSlop={spacing.sm}
              style={({ pressed }) => [
                styles.close,
                { right: closeInset },
                pressed && styles.pressed,
              ]}
            >
              <CloseCircleIcon />
            </Pressable>
          </View>

          <View style={styles.rule} />

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
    backgroundColor: colors.scrim,
  },
  sheet: {
    borderTopLeftRadius: radius.input,
    borderTopRightRadius: radius.input,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  title: {
    ...typography.sheetTitle,
    color: colors.text.sheet,
  },
  close: {
    position: 'absolute',
  },
  pressed: {
    opacity: 0.6,
  },
  rule: {
    height: 1,
    marginTop: spacing.sm,
    marginHorizontal: 7.5,
    backgroundColor: colors.border.tableRow,
  },
});
