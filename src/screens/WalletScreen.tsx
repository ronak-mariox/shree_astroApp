import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, type TabKey } from '../components/BottomNav';
import { BankIcon } from '../components/icons/WalletIcons';
import { TransactionRow } from '../components/TransactionRow';
import { useApi } from '../hooks/useApi';
import { useResponsive } from '../hooks/useResponsive';
import { fetchWallet } from '../services/api';
import { colors, radius, spacing, typography } from '../theme';

const BUTTON_HEIGHT = 49.992;
const ICON_SIZE = 17.993;

type WalletScreenProps = {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
  onWithdraw?: () => void;
};

/**
 * The Wallet tab: the balance and its three windows on the yellow header, the
 * withdraw request, and the transaction history beneath.
 * Figma: node 112:1194.
 */
export function WalletScreen({
  activeTab = 'wallet',
  onSelectTab,
  onWithdraw,
}: WalletScreenProps) {
  /** The header figures and the ledger, both read from the server. */
  const wallet = useApi(() => fetchWallet(), []);
  const balance = wallet.data?.balance;
  const transactions = wallet.data?.transactions ?? [];

  const insets = useSafeAreaInsets();
  const { px, contentWidth, isTablet } = useResponsive();
  const styles = useMemo(
    () => createStyles(px, contentWidth, isTablet),
    [px, contentWidth, isTablet],
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.body}>
        {/* Figma pads the header 48pt from the frame top, 1pt of which clears
            the status bar. */}
        <View style={styles.headerBleed}>
          <View style={[styles.header, { paddingTop: insets.top + 1 }]}>
            <Text style={styles.balanceLabel}>Total Wallet Balance</Text>
            <Text style={styles.balance}>{balance?.total ?? '—'}</Text>

            <View style={styles.tiles}>
              <Tile styles={styles} value={balance?.today ?? '—'} label="Today" />
              <Tile styles={styles} value={balance?.monthly ?? '—'} label="Monthly" />
              <Tile styles={styles} value={balance?.lifetime ?? '—'} label="Lifetime" />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onWithdraw}
              style={({ pressed }) => [
                styles.withdraw,
                pressed && styles.pressed,
              ]}
            >
              <BankIcon size={px(ICON_SIZE)} />
              <Text style={styles.withdrawLabel}>Request Withdraw Money</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.history}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          <View style={styles.transactions}>
            {transactions.map(transaction => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav active={activeTab} onSelect={onSelectTab} />
    </View>
  );
}

/** One of the header's three windows on earnings (Figma node 112:1206). */
function Tile({
  styles,
  value,
  label,
}: {
  styles: ReturnType<typeof createStyles>;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function createStyles(px: (value: number) => number, contentWidth: number, isTablet: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    body: {
      paddingBottom: spacing.lg,
    },
    headerBleed: {
      backgroundColor: colors.brandYellow,
    },
    header: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    balanceLabel: {
      ...typography.meta,
      color: colors.text.onYellowMuted,
    },
    balance: {
      ...typography.displayLarge,
      color: colors.text.ink,
      paddingTop: spacing.xs,
    },
    tiles: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingTop: spacing.lg,
    },
    tile: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: spacing.md,
      borderRadius: radius.field,
      backgroundColor: colors.surfaceOnBrand,
    },
    tileValue: {
      ...typography.tileValue,
      color: colors.text.ink,
      textAlign: 'center',
    },
    tileLabel: {
      ...typography.tileLabel,
      color: colors.text.onYellowMuted,
      textAlign: 'center',
      paddingTop: 2,
    },
    withdraw: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      height: px(BUTTON_HEIGHT),
      marginTop: spacing.section,
      borderRadius: radius.buttonOutline,
      backgroundColor: colors.surfaceDark,
    },
    pressed: {
      opacity: 0.8,
    },
    withdrawLabel: {
      ...typography.buttonStrong,
      color: colors.text.onDark,
      textAlign: 'center',
    },
    history: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    historyTitle: {
      ...typography.sectionTitle,
      color: colors.text.inkSoft,
    },
    transactions: {
      paddingTop: 14,
      gap: spacing.md,
    },
  });
}
