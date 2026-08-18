import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandGradient } from './BrandGradient';
import { ChevronRowIcon, CloseCircleIcon } from './icons/ChatIcons';
import { DASHA_LEVELS, DASHA_ROWS } from '../data/chat';
import { colors, radius, spacing, typography } from '../theme';

const TAB_TRACK_HEIGHT = 26;
const TAB_HEIGHT = 20;
const ROW_HEIGHT = 33;
const CHART_WIDTH = 314;
const CHART_HEIGHT = 312;

type Tab = 'lagna' | 'dasha';

type KundliSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * The kundli bottom sheet the header's chart button opens. Lagna Chart shows the
 * birth chart; Dasha shows the planetary periods, each row drilling from
 * Mahadasha into Antardasha and then Pratyantardasha.
 * Figma: nodes 110:2937 (Lagna), 110:3110 (Mahadasha), 110:3375 (Antardasha),
 * 110:3646 (Pratyantardasha).
 */
export function KundliSheet({ visible, onClose }: KundliSheetProps) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('lagna');
  /** How deep into the dasha drill-down we are. */
  const [level, setLevel] = useState(0);

  const close = () => {
    setTab('lagna');
    setLevel(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
      statusBarTranslucent
    >
      <Pressable style={styles.scrim} onPress={close} accessible={false} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Kundli Details</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close kundli details"
            onPress={close}
            hitSlop={spacing.sm}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <CloseCircleIcon />
          </Pressable>
        </View>

        <View style={styles.rule} />

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'lagna' }}
            onPress={() => setTab('lagna')}
            style={styles.tab}
          >
            {tab === 'lagna' && <BrandGradient radius={radius.sheetTab} />}
            <Text
              style={tab === 'lagna' ? styles.tabLabelActive : styles.tabLabel}
            >
              Lagna Chart
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === 'dasha' }}
            onPress={() => setTab('dasha')}
            style={styles.tab}
          >
            {tab === 'dasha' && <BrandGradient radius={radius.sheetTab} />}
            <Text
              style={tab === 'dasha' ? styles.tabLabelActive : styles.tabLabel}
            >
              Dasha
            </Text>
          </Pressable>
        </View>

        {tab === 'lagna' ? (
          <ScrollView contentContainerStyle={styles.lagna}>
            <SectionTitle>Basic Birth Chart</SectionTitle>
            <Image
              accessibilityLabel="Basic birth chart"
              source={require('../assets/images/lagna-chart.png')}
              style={styles.chart}
              resizeMode="contain"
            />
          </ScrollView>
        ) : (
          <View style={styles.dasha}>
            {/* The deeper levels get a way back out (Figma node 110:3375). */}
            {level > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setLevel(current => current - 1)}
                style={({ pressed }) => [styles.back, pressed && styles.pressed]}
              >
                <Text style={styles.backLabel}>‹ Back</Text>
              </Pressable>
            )}

            <SectionTitle>{DASHA_LEVELS[level]}</SectionTitle>

            <View style={styles.tableHead}>
              <Text style={[styles.heading, styles.colPlanet]}>Planet</Text>
              <Text style={[styles.heading, styles.colDate]}>Start Date</Text>
              <Text style={[styles.heading, styles.colDate]}>End Date</Text>
              <View style={styles.colChevron} />
            </View>

            <ScrollView>
              {DASHA_ROWS.map(row => {
                const isLast = level === DASHA_LEVELS.length - 1;

                return (
                  <Pressable
                    key={row.planet}
                    accessibilityRole="button"
                    accessibilityLabel={`${row.planet} ${DASHA_LEVELS[level]}`}
                    disabled={isLast}
                    onPress={() => setLevel(current => current + 1)}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && !isLast && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.cell, styles.colPlanet]}>
                      {row.planet}
                    </Text>
                    <Text style={[styles.cell, styles.colDate]}>
                      {row.startDate}
                    </Text>
                    <Text style={[styles.cell, styles.colDate]}>
                      {row.endDate}
                    </Text>
                    <View style={styles.colChevron}>
                      {!isLast && <ChevronRowIcon />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

/** A centred heading underlined by a short rule (Figma nodes 110:2940, 110:2943). */
function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{children}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.scrim,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '62%',
    borderTopLeftRadius: radius.kundliSheet,
    borderTopRightRadius: radius.kundliSheet,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.sheet,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: 17,
  },
  title: {
    ...typography.sheetTitle,
    color: colors.text.sheet,
  },
  close: {
    position: 'absolute',
    right: 17,
  },
  pressed: {
    opacity: 0.6,
  },
  rule: {
    height: 1,
    marginTop: spacing.sm,
    marginHorizontal: 7,
    backgroundColor: colors.border.tableRow,
  },
  tabs: {
    flexDirection: 'row',
    height: TAB_TRACK_HEIGHT,
    marginTop: 6,
    marginHorizontal: 18,
    borderRadius: radius.linkChip,
    backgroundColor: colors.surfaceTrack,
    alignItems: 'center',
    paddingHorizontal: 3,
    gap: 10,
  },
  tab: {
    flex: 1,
    height: TAB_HEIGHT,
    borderRadius: radius.sheetTab,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabLabel: {
    ...typography.sheetTab,
    color: colors.text.sheet,
  },
  tabLabelActive: {
    ...typography.sheetTabActive,
    color: colors.text.inverse,
  },
  sectionTitleWrap: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.sheetTitle,
    color: colors.text.sheet,
  },
  sectionRule: {
    width: 60,
    height: 1,
    marginTop: 3,
    backgroundColor: colors.border.sheet,
  },
  lagna: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  chart: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    marginTop: 14,
  },
  dasha: {
    flex: 1,
  },
  back: {
    alignSelf: 'flex-start',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backLabel: {
    ...typography.tableCell,
    color: colors.text.sheet,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    marginTop: 12,
    paddingHorizontal: 18,
    backgroundColor: colors.surfaceRow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    paddingHorizontal: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.tableRow,
  },
  heading: {
    ...typography.tableHeading,
    color: colors.text.slateMuted,
  },
  cell: {
    ...typography.tableCell,
    color: colors.text.slateMuted,
  },
  colPlanet: {
    flex: 99,
  },
  colDate: {
    flex: 124,
  },
  colChevron: {
    width: 12,
    alignItems: 'flex-end',
  },
});
