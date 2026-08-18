import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, radius, typography } from '../theme';
import { ServiceCallIcon, ServiceChatIcon } from './icons/ServiceIcons';
import { ServiceSwitch } from './ServiceSwitch';

const TILE_WIDTH = 29.845;
const TILE_HEIGHT = 29.178;
const HEADER_HEIGHT = 29;
const ROW_HEIGHT = 47.5;

/**
 * Figma sets the header labels at 2.79% / 35.2% / 57.54% / 74.58% of the card,
 * which divides its 358pt into these four column widths.
 */
const COLUMNS = { service: 126, rate: 80, status: 61, time: 91 } as const;

export type ServiceRow = {
  id: 'call' | 'chat';
  label: string;
  /** Per-minute rate, already formatted. */
  rate: string;
  /** When the service last went live. */
  time: string;
  enabled: boolean;
};

type ServicesCardProps = {
  rows: ReadonlyArray<ServiceRow>;
  onToggle: (id: ServiceRow['id'], enabled: boolean) => void;
};

/**
 * The Call / Chat availability table: rate, switch and last-online time per
 * service (Figma node 106:6879).
 */
export function ServicesCard({ rows, onToggle }: ServicesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* The strip sits at 70% in Figma; the labels above it stay opaque. */}
        <View style={styles.headerTint} pointerEvents="none" />
        <Text style={[styles.columnTitle, { width: COLUMNS.service }]}>
          My services
        </Text>
        <Text style={[styles.columnTitle, { width: COLUMNS.rate }]}>
          New Rate
        </Text>
        <Text style={[styles.columnTitle, { width: COLUMNS.status }]}>
          Status
        </Text>
        <Text style={[styles.columnTitle, { width: COLUMNS.time }]}>
          Online Time
        </Text>
      </View>

      {rows.map(row => (
        <View key={row.id} style={styles.row}>
          <View style={[styles.service, { width: COLUMNS.service }]}>
            <View style={styles.tile}>
              <ServiceTileGradient />
              {row.id === 'call' ? <ServiceCallIcon /> : <ServiceChatIcon />}
            </View>
            <Text style={styles.serviceLabel}>{row.label}</Text>
          </View>

          <Text style={[styles.value, { width: COLUMNS.rate }]}>
            ₹ {row.rate}
          </Text>

          <View style={{ width: COLUMNS.status }}>
            <ServiceSwitch
              value={row.enabled}
              onValueChange={enabled => onToggle(row.id, enabled)}
              accessibilityLabel={`${row.label} availability`}
            />
          </View>

          <Text style={[styles.value, { width: COLUMNS.time }]}>{row.time}</Text>
        </View>
      ))}
    </View>
  );
}

/** The warm ramp on a service tile — 268.8° in Figma, so near horizontal. */
function ServiceTileGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="service-tile" x1="100%" y1="2%" x2="0%" y2="98%">
            <Stop offset="0" stopColor={colors.gradient.from} />
            <Stop offset="1" stopColor={colors.gradient.to} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={radius.button}
          fill="url(#service-tile)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.panel,
    borderWidth: 1.155,
    borderColor: colors.border.slate,
    backgroundColor: colors.surfaceGlass,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    paddingHorizontal: 10,
  },
  headerTint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.surfaceHeader,
    opacity: 0.7,
  },
  columnTitle: {
    ...typography.panelTitle,
    color: colors.text.slate,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    paddingHorizontal: 10,
  },
  service: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  serviceLabel: {
    ...typography.panelTitle,
    color: colors.text.slateMuted,
  },
  value: {
    ...typography.panelValue,
    color: colors.text.slateMuted,
  },
});
