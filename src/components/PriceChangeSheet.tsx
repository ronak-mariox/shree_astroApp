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
import { EMPTY_PRICE_CHANGE, type PriceChangeDraft } from '../data/priceChange';
import { colors, radius, spacing, typography } from '../theme';

const FIELD_HEIGHT = 32;
const ACTION_HEIGHT = 34.65;

type PriceChangeSheetProps = {
  visible: boolean;
  /** The service the panel was opened from, prefilled into the form. */
  service?: string;
  onDismiss: () => void;
  /** Resolves true once the request is in, so the sheet knows to close. */
  onSubmit: (draft: PriceChangeDraft) => Promise<boolean>;
  error?: string | null;
};

/**
 * The sheet behind "Request New Rate": which service is being repriced, and
 * what to.
 * Figma: node 110:12182.
 */
export function PriceChangeSheet({
  visible,
  service,
  onDismiss,
  onSubmit,
  error,
}: PriceChangeSheetProps) {
  const [draft, setDraft] = useState<PriceChangeDraft>(EMPTY_PRICE_CHANGE);
  const [submitting, setSubmitting] = useState(false);

  // Opening the sheet from a panel starts it on that panel's service.
  useEffect(() => {
    if (visible) {
      setDraft({ service: service ?? '', newPrice: '' });
    }
  }, [visible, service]);

  const submit = async () => {
    setSubmitting(true);
    const requested = await onSubmit(draft);
    setSubmitting(false);
    if (requested) {
      setDraft(EMPTY_PRICE_CHANGE);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title="Price Change Request"
      onDismiss={onDismiss}
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Service *</Text>
          <TextInput
            accessibilityLabel="Service *"
            value={draft.service}
            onChangeText={next =>
              setDraft(current => ({ ...current, service: next }))
            }
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>New Price Request *</Text>
          <TextInput
            accessibilityLabel="New Price Request *"
            value={draft.newPrice}
            onChangeText={next =>
              setDraft(current => ({ ...current, newPrice: next }))
            }
            keyboardType="number-pad"
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
            accessibilityLabel="Submit"
            disabled={submitting}
            onPress={submit}
            style={({ pressed }) => [
              styles.action,
              styles.submit,
              submitting && styles.busy,
              pressed && styles.pressed,
            ]}
          >
            <BrandGradient radius={radius.button} angle="shallow" />
            {submitting ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Text style={styles.submitLabel}>Submit</Text>
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
    paddingTop: 11,
    paddingBottom: spacing.lg,
    gap: 15,
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
    height: FIELD_HEIGHT,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: radius.thumb,
    borderWidth: 1,
    // Figma drops the outline to 5% (node 110:12197).
    borderColor: 'rgba(13, 12, 12, 0.05)',
    backgroundColor: colors.surface,
    color: colors.text.slateMuted,
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
    paddingTop: 12,
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
  submit: {
    borderRadius: radius.button,
  },
  submitLabel: {
    ...typography.historyAction,
    color: colors.text.inverse,
    textTransform: 'capitalize',
  },
});
