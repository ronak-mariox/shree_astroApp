import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AccordionChevronIcon,
  RowChevronIcon,
} from '../components/icons/ReviewIcons';
import { PriceChangeSheet } from '../components/PriceChangeSheet';
import { ProfileHeader } from '../components/ProfileHeader';
import { CHANGE_REQUEST_INTRO, rateRowsOf } from '../data/priceChange';
import { useAppData } from '../state/AppDataProvider';
import { colors, radius, spacing, typography } from '../theme';

const HEADER_HEIGHT = 58.88;
const REQUEST_BUTTON_HEIGHT = 34.65;
const ILLUSTRATION_WIDTH = 104.05;
const ILLUSTRATION_HEIGHT = 68.601;

type PriceChangeScreenProps = {
  onBack?: () => void;
};

/**
 * What the astrologer charges per service, and the changes they have asked for.
 * One panel is open at a time; the rest collapse to a yellow row.
 * Figma: node 110:11895, with its sheet at 110:12182.
 */
export function PriceChangeScreen({ onBack }: PriceChangeScreenProps) {
  const { serviceRates, requestPriceChange, error, clearError } = useAppData();
  /** Figma opens the screen on the first service. */
  /**
   * Which panel is open. `undefined` means "not chosen yet", which falls back to
   * the first service — the rates arrive from the server a moment after mount,
   * so a plain initial value would fix it to nothing.
   */
  const [chosenId, setChosenId] = useState<string | null | undefined>(undefined);
  const openId = chosenId === undefined ? serviceRates[0]?.id ?? null : chosenId;
  const setOpenId = setChosenId;
  /** Which service the sheet is repricing, if it is up. */
  const [repricing, setRepricing] = useState<string | null>(null);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ProfileHeader title="Change Request" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <View style={styles.introText}>
            <Text style={styles.introTitle}>Change Request</Text>
            <Text style={styles.introBody}>{CHANGE_REQUEST_INTRO}</Text>
          </View>
          <Image
            accessibilityLabel="Price change"
            source={require('../assets/images/price-request-illustration.png')}
            resizeMode="contain"
            style={styles.illustration}
          />
        </View>

        {serviceRates.map(service => {
          const open = service.id === openId;

          return (
            <View
              key={service.id}
              style={[styles.panel, open && styles.panelOpen]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={service.name}
                accessibilityState={{ expanded: open }}
                onPress={() => setOpenId(open ? null : service.id)}
                style={({ pressed }) => [
                  styles.panelHeader,
                  open && styles.panelHeaderOpen,
                  service.emergency && styles.panelHeaderEmergency,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.panelTitle,
                    service.emergency && styles.panelTitleEmergency,
                  ]}
                >
                  {service.name}
                </Text>
                {open ? (
                  <AccordionChevronIcon color={colors.text.ink} />
                ) : (
                  <RowChevronIcon />
                )}
              </Pressable>

              {open && (
                <View style={styles.panelBody}>
                  {rateRowsOf(service).map(row => (
                    <View key={row.label} style={styles.rateRow}>
                      <Text style={styles.rateLabel}>{row.label}</Text>
                      <Text
                        style={[
                          styles.rateValue,
                          row.status && styles.rateStatus,
                        ]}
                      >
                        {row.value}
                      </Text>
                    </View>
                  ))}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Request New Rate for ${service.name}`}
                    onPress={() => {
                      clearError();
                      setRepricing(service.name);
                    }}
                    style={({ pressed }) => [
                      styles.requestButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.requestLabel}>Request New Rate</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <PriceChangeSheet
        visible={repricing !== null}
        service={repricing ?? undefined}
        error={repricing !== null ? error : null}
        onDismiss={() => {
          clearError();
          setRepricing(null);
        }}
        onSubmit={async draft => {
          const requested = await requestPriceChange(draft);
          if (requested) {
            setRepricing(null);
          }
          return requested;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  content: {
    paddingHorizontal: 13,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 15,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  introText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  introTitle: {
    ...typography.profileSectionStrong,
    color: colors.text.slateMuted,
  },
  introBody: {
    ...typography.historyLabel,
    lineHeight: 16,
    color: colors.text.slateMuted,
    paddingTop: 4,
  },
  illustration: {
    width: ILLUSTRATION_WIDTH,
    height: ILLUSTRATION_HEIGHT,
  },
  panel: {
    borderRadius: radius.input,
    overflow: 'hidden',
  },
  panelOpen: {
    backgroundColor: colors.surface,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: HEADER_HEIGHT,
    paddingHorizontal: 16.18,
    borderRadius: radius.input,
    backgroundColor: colors.brandYellow,
  },
  panelHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // Figma warms the emergency row and reddens its label (node 110:12034).
  panelHeaderEmergency: {
    backgroundColor: '#FFDB5C',
  },
  panelTitle: {
    ...typography.serviceTitle,
    color: colors.text.ink,
  },
  panelTitleEmergency: {
    color: colors.emergency,
  },
  pressed: {
    opacity: 0.6,
  },
  panelBody: {
    paddingHorizontal: 16.18,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10.6,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rateLabel: {
    ...typography.rateLabel,
    color: 'rgba(0, 0, 0, 0.64)',
  },
  rateValue: {
    ...typography.rateValue,
    color: 'rgba(0, 0, 0, 0.64)',
    textAlign: 'right',
  },
  rateStatus: {
    color: colors.status.danger,
  },
  requestButton: {
    height: REQUEST_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.text.ink,
  },
  requestLabel: {
    ...typography.historyAction,
    color: colors.text.ink,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
