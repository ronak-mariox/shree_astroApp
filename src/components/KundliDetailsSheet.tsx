import React, { useState } from 'react';
import {
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
  KUNDLI_TABLE_ROWS,
  KUNDLI_TABS,
  PLANET_HEADINGS,
  type KundliTab,
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
  /** Whose chart this is — the name the generate form was filled with. */
  name: string;
  onClose: () => void;
};

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
}: KundliDetailsSheetProps) {
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

      {tab === 'lagna' || tab === 'birth' ? (
        <ScrollView contentContainerStyle={styles.chartBody}>
          <Image
            accessibilityLabel={
              tab === 'lagna' ? 'Lagna chart' : 'Lagna and birth chart'
            }
            source={require('../assets/images/lagna-chart.png')}
            style={styles.chart}
            resizeMode="contain"
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.tableBody}>
          <Row
            cells={tab === 'dasha' ? DASHA_HEADINGS : PLANET_HEADINGS}
            heading
          />
          {KUNDLI_TABLE_ROWS.map((row, index) => (
            <Row
              key={row.planet}
              cells={[row.planet, row.rashi, row.longitude]}
              // Figma tints every other row from the first reading down.
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
