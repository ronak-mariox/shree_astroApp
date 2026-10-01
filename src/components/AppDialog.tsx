import React, { useMemo } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AlertButton,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from './BrandGradient';
import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing, typography } from '../theme';

const ACTION_HEIGHT = 46;
const GLYPH_WELL = 44;

/** What the message is about, which decides the glyph and the well behind it. */
export type DialogTone = 'info' | 'warning' | 'error' | 'success';

const TONE = {
  info: { glyph: 'ℹ️', tint: colors.status.infoTint },
  warning: { glyph: '⚠️', tint: colors.status.warningWell },
  error: { glyph: '⚠️', tint: colors.status.dangerTint },
  success: { glyph: '✅', tint: colors.status.successTint },
} as const;

export type DialogAction = {
  label: string;
  onPress?: () => void;
  /**
   * 'primary' fills with the brand gradient, 'secondary' is the outlined way
   * out. Exactly one primary reads best; nothing enforces it.
   */
  variant?: 'primary' | 'secondary';
};

export type DialogRequest = {
  title: string;
  message?: string;
  tone?: DialogTone;
  /**
   * Left out, the dialog offers a single "OK" — which is what most of these
   * messages want, and what the native alert they replaced did.
   */
  actions?: ReadonlyArray<DialogAction>;
  /** False for a message that must be answered rather than dismissed by tapping away. */
  dismissable?: boolean;
  /**
   * Runs when the dialog goes away without an action being chosen — the scrim
   * or the back button — or when a newer message replaces it. A caller waiting
   * on an answer (the file picker's source chooser) resolves "no answer" here.
   */
  onDismiss?: () => void;
};

type AppDialogProps = {
  /** The message to show, or nothing at all. */
  request?: DialogRequest;
  onDismiss: () => void;
};

/**
 * The app's own dialog, in place of `Alert.alert`.
 *
 * Every one of these used to be a native OS alert: a grey system box with the
 * platform's own type and buttons, in the middle of an app that otherwise draws
 * yellow sheets with gradient actions. They carried the right words and looked
 * like they belonged to a different product.
 *
 * So this is the same frame as the app's other sheets (BottomSheet,
 * LeaveChatDialog): a sheet from the bottom on a phone, a capped centred card
 * on a tablet, the title left-aligned, and the actions in a row with the
 * primary one carrying the brand gradient — stacked once there are three or
 * more, so no label has to squeeze. A tone glyph sits above the title so an
 * error is recognisable before a word of it is read.
 */
export function AppDialog({ request, onDismiss }: AppDialogProps) {
  const insets = useSafeAreaInsets();
  const { px, isTablet } = useResponsive();
  const styles = useMemo(() => createStyles(px, isTablet), [px, isTablet]);

  const tone = TONE[request?.tone ?? 'info'];
  const actions = request?.actions?.length ? request.actions : [{ label: 'OK', variant: 'primary' as const }];
  const dismissable = request?.dismissable !== false;
  const stacked = actions.length >= 3;

  /** An action closes the dialog first, so its own handler can open the next screen. */
  const run = (action: DialogAction) => {
    onDismiss();
    action.onPress?.();
  };

  /** Going away without an answer: the caller waiting on one hears about it. */
  const dismiss = () => {
    onDismiss();
    request?.onDismiss?.();
  };

  return (
    <Modal
      visible={Boolean(request)}
      transparent
      animationType="slide"
      onRequestClose={dismissable ? dismiss : () => {}}
      statusBarTranslucent
    >
      <View style={styles.stage}>
        <Pressable
          accessibilityLabel={`Close ${request?.title ?? 'dialog'}`}
          accessibilityElementsHidden={!dismissable}
          style={styles.scrim}
          onPress={dismissable ? dismiss : undefined}
        />

        <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
          <View style={[styles.glyphWell, { backgroundColor: tone.tint }]}>
            <Text style={styles.glyph}>{tone.glyph}</Text>
          </View>

          <Text accessibilityRole="header" style={styles.title}>
            {request?.title}
          </Text>
          {request?.message ? <Text style={styles.body}>{request.message}</Text> : null}

          <View
            style={[
              styles.actions,
              stacked && styles.actionsStacked,
              actions.length === 1 && styles.actionsSingle,
            ]}
          >
            {actions.map(action => {
              const primary = action.variant !== 'secondary';

              return (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={() => run(action)}
                  style={({ pressed }) => [
                    styles.action,
                    stacked && styles.actionStacked,
                    !primary && styles.secondary,
                    pressed && styles.pressed,
                  ]}
                >
                  {primary && <BrandGradient radius={radius.action} />}
                  <Text style={primary ? styles.primaryLabel : styles.secondaryLabel}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ bridge */

type Presenter = (request: DialogRequest) => void;

let presenter: Presenter | undefined;

/**
 * How code with no React tree of its own — a service such as the file picker —
 * reaches the one dialog the provider mounts. The provider registers its
 * `show` here on mount and takes it back on unmount.
 */
export const dialogBridge = {
  /** Returns the matching unregister; a later registration is never undone by an earlier one's cleanup. */
  register(show: Presenter): () => void {
    presenter = show;
    return () => {
      if (presenter === show) {
        presenter = undefined;
      }
    };
  },
  /** Whether a provider is mounted right now. */
  isMounted(): boolean {
    return presenter !== undefined;
  },
};

/** `Alert.alert`'s shape of the same request, for when nothing is mounted to draw it. */
function toAlertButtons(request: DialogRequest): AlertButton[] | undefined {
  if (!request.actions?.length) {
    return undefined;
  }
  return request.actions.map(action => ({
    text: action.label,
    onPress: action.onPress,
    style: action.variant === 'secondary' ? 'cancel' : 'default',
  }));
}

/**
 * Shows a message through the mounted provider, or — with nothing mounted yet
 * (a test, or very early boot) — through the native alert, so the message is
 * never lost.
 */
export function showDialog(request: DialogRequest): void {
  if (presenter) {
    presenter(request);
    return;
  }
  Alert.alert(request.title, request.message, toAlertButtons(request), {
    cancelable: request.dismissable !== false,
    onDismiss: request.onDismiss,
  });
}

function createStyles(px: (value: number) => number, isTablet: boolean) {
  return StyleSheet.create({
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
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? 480 : undefined,
      marginBottom: isTablet ? px(spacing.xxl) : 0,
      borderTopLeftRadius: radius.kundliSheet,
      borderTopRightRadius: radius.kundliSheet,
      borderBottomLeftRadius: isTablet ? radius.kundliSheet : 0,
      borderBottomRightRadius: isTablet ? radius.kundliSheet : 0,
      backgroundColor: colors.surface,
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    glyphWell: {
      width: px(GLYPH_WELL),
      height: px(GLYPH_WELL),
      borderRadius: px(GLYPH_WELL / 2),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    glyph: {
      fontSize: px(20),
    },
    title: {
      ...typography.sheetHeading,
      color: colors.text.sheet,
    },
    body: {
      ...typography.dialogBody,
      color: colors.text.secondary,
      paddingTop: spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingTop: spacing.xl,
    },
    /** Three or more choices go one under the other, full width. */
    actionsStacked: {
      flexDirection: 'column',
      gap: spacing.sm,
    },
    /** One action stretches, rather than sitting half-width beside nothing. */
    actionsSingle: {
      paddingTop: spacing.lg,
    },
    action: {
      flex: 1,
      height: px(ACTION_HEIGHT),
      borderRadius: radius.action,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    actionStacked: {
      flex: 0,
      width: '100%',
    },
    secondary: {
      borderWidth: 1,
      borderColor: colors.text.ink,
      backgroundColor: colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: { elevation: 3 },
        default: {},
      }),
    },
    primaryLabel: {
      ...typography.dialogButton,
      color: colors.text.inverse,
    },
    secondaryLabel: {
      ...typography.dialogButton,
      color: colors.text.ink,
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
