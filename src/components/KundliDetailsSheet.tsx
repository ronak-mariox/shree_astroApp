import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandGradient } from './BrandGradient';
import { KundliSheetFrame } from './KundliSheetFrame';
import {
  DASHA_HEADINGS,
  KUNDLI_TABS,
  formatKundliDate,
  formatKundliTime,
  type KundliTab,
  type SeekerKundli,
} from '../data/kundli';
import { colors, radius, spacing, typography } from '../theme';

const SHEET_HEIGHT = 483;
const TAB_TRACK_HEIGHT = 26;
const TAB_HEIGHT = 20;
const ROW_HEIGHT = 25.3;
const CHART_WIDTH = 314;
const CHART_HEIGHT = 312;

type KundliDetailsSheetProps = {
  visible: boolean;
  /** Whose chart this is. */
  name: string;
  onClose: () => void;
  /** The seeker's saved kundli (GET /chats/:chatId/kundli); undefined while it loads. */
  kundli?: SeekerKundli | null;
  loading?: boolean;
  /**
   * Set when the sheet was opened for details that aren't the saved chart's
   * person (edited in the form) — the saved chart is then NOT shown for them.
   */
  mismatch?: boolean;
  /** "Fill birth details" from the empty state — opens the generate form. */
  onOpenForm?: () => void;
};

const PLANET_TABLE_HEADINGS = ['Planet', 'Rashi', 'House'] as const;

/**
 * The generated chart: the birth chart under "Lagna Chart", and the same set of
 * readings tabulated against dates on "Dasha" and against the chart on
 * "Planet Details".
 * Figma: nodes 110:4476 (Dasha) and 110:4739 (Planet Details), over the scrims
 * at 110:4269 and 110:4662.
 */
export function KundliDetailsSheet({
  visible,
  name,
  onClose,
  kundli,
  loading = false,
  mismatch = false,
  onOpenForm,
}: KundliDetailsSheetProps) {
  const chart = kundli?.found && !mismatch ? kundli : null;
  const [tab, setTab] = useState<KundliTab>('lagna');

  const close = () => {
    setTab('lagna');
    onClose();
  };

  return (
    <KundliSheetFrame
      visible={visible}
      title={`Kundli Details of ${name}`}
      designHeight={SHEET_HEIGHT}
      closeInset={24}
      onClose={close}
    >
      <View style={styles.tabs}>
        {KUNDLI_TABS.map(item => {
          const selected = item.key === tab;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label}
              onPress={() => setTab(item.key)}
              style={styles.tab}
            >
              {selected && <BrandGradient radius={radius.sheetTab} />}
              <Text
                numberOfLines={1}
                style={selected ? styles.tabLabelActive : styles.tabLabel}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading && !chart ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.text.slateMuted} />
          <Text style={styles.stateText}>Loading the seeker's kundli…</Text>
        </View>
      ) : !chart ? (
        <View style={styles.state}>
          <Text style={styles.stateTitle}>No saved kundli</Text>
          <Text style={styles.stateText}>
            {mismatch
              ? "These birth details don't match the seeker's saved kundli, so it isn't shown for them."
              : `${name} hasn't generated a kundli for these birth details yet. Once they generate it in their app, it shows here.`}
          </Text>
          {onOpenForm && (
            <Pressable accessibilityRole="button" accessibilityLabel="Fill birth details" onPress={onOpenForm}>
              <Text style={styles.stateLink}>View birth details</Text>
            </Pressable>
          )}
        </View>
      ) : tab === 'lagna' ? (
        <ScrollView contentContainerStyle={styles.chartBody}>
          {chart.chart?.url ? (
            <Image
              accessibilityLabel="Lagna chart"
              source={{ uri: chart.chart.url }}
              style={styles.chart}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.stateText}>Chart image unavailable — the details are on the other tabs.</Text>
          )}
          <Text style={styles.summary}>
            Lagna: {chart.lagna ?? '—'}   ·   Nakshatra: {chart.nakshatra ?? '—'}
          </Text>
        </ScrollView>
      ) : tab === 'birth' ? (
        <ScrollView contentContainerStyle={styles.tableBody}>
          <Row cells={['Name', chart.birthDetails?.fullName ?? name, '']} striped />
          <Row cells={['Date of birth', formatKundliDate(chart.birthDetails?.dateOfBirth), '']} />
          <Row cells={['Time of birth', formatKundliTime(chart.birthDetails?.timeOfBirth), '']} striped />
          <Row cells={['Place', chart.birthDetails?.place ?? '—', '']} />
          <Row cells={['Lagna', chart.lagna ?? '—', '']} striped />
          <Row cells={['Nakshatra', chart.nakshatra ?? '—', '']} />
          {(chart.keyPositions ?? [])
            .filter(position => position.label !== 'Lagna')
            .map((position, index) => (
              <Row key={position.label} cells={[position.label, position.sign ?? '—', '']} striped={index % 2 === 0} />
            ))}
        </ScrollView>
      ) : tab === 'dasha' ? (
        <ScrollView contentContainerStyle={styles.tableBody}>
          <Row cells={DASHA_HEADINGS} heading />
          {chart.mahadasha.length === 0 ? (
            <Text style={styles.stateText}>Dasha periods unavailable.</Text>
          ) : (
            chart.mahadasha.map((period, index) => (
              <Row
                key={`${period.lord}-${period.start}`}
                cells={[period.current ? `${period.lord} (now)` : period.lord, formatKundliDate(period.start), formatKundliDate(period.end)]}
                striped={index % 2 === 0}
              />
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.tableBody}>
          <Row cells={PLANET_TABLE_HEADINGS} heading />
          {chart.planetaryPositions.map((row, index) => (
            <Row
              key={row.planet}
              cells={[row.isRetrograde ? `${row.planet} (R)` : row.planet, row.sign ?? '—', row.house !== undefined ? String(row.house) : '—']}
              striped={index % 2 === 0}
            />
          ))}
        </ScrollView>
      )}
    </KundliSheetFrame>
  );
}

/** One line of either table — the columns keep the design's three stops. */
function Row({
  cells,
  heading = false,
  striped = false,
}: {
  cells: ReadonlyArray<string>;
  heading?: boolean;
  striped?: boolean;
}) {
  return (
    <View style={[styles.row, striped && styles.rowStriped]}>
      <Text style={[styles.cell, styles.colPlanet, heading && styles.heading]}>
        {cells[0]}
      </Text>
      <Text style={[styles.cell, styles.colMiddle, heading && styles.heading]}>
        {cells[1]}
      </Text>
      <Text style={[styles.cell, styles.colLast, heading && styles.heading]}>
        {cells[2]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  stateTitle: {
    ...typography.tableHeading,
    color: colors.text.slateMuted,
  },
  stateText: {
    ...typography.tableCell,
    color: colors.text.slateMuted,
    textAlign: 'center',
  },
  stateLink: {
    ...typography.tableHeading,
    color: colors.text.slateMuted,
    textDecorationLine: 'underline',
  },
  summary: {
    ...typography.tableHeading,
    color: colors.text.slateMuted,
    paddingTop: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: TAB_TRACK_HEIGHT,
    marginTop: 14,
    marginHorizontal: 18,
    paddingHorizontal: 3,
    borderRadius: radius.linkChip,
    backgroundColor: colors.surfaceTabTrack,
  },
  tab: {
    height: TAB_HEIGHT,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    borderRadius: radius.sheetTab,
    overflow: 'hidden',
  },
  tabLabel: {
    ...typography.sheetTab,
    color: colors.text.slateMuted,
  },
  tabLabelActive: {
    ...typography.sheetTabActive,
    color: colors.text.inverse,
  },
  chartBody: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: spacing.lg,
  },
  chart: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
  tableBody: {
    paddingTop: 6,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    paddingLeft: 28,
    paddingRight: 18,
  },
  rowStriped: {
    backgroundColor: colors.surfaceTableStripe,
  },
  // The three columns start at 27.84, 158.75 and 288.66 on the 375pt frame.
  colPlanet: {
    flex: 131,
  },
  colMiddle: {
    flex: 130,
  },
  colLast: {
    flex: 68,
  },
  cell: {
    ...typography.tableCell,
    color: colors.text.slateMuted,
  },
  heading: {
    ...typography.tableHeading,
    color: colors.text.slateMuted,
  },
});
