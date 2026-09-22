import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HistoryCard } from '../components/HistoryCard';
import { ChevronSolidIcon } from '../components/icons/ChatIcons';
import { SearchIcon } from '../components/icons/SearchIcon';
import { useApi } from '../hooks/useApi';
import { useResponsive } from '../hooks/useResponsive';
import { fetchHistory, submitDispute } from '../services/api';
import { colors, radius, spacing, typography } from '../theme';

const CHEVRON_WIDTH = 7.36;
const CHEVRON_HEIGHT = 13.25;
const SEARCH_WIDTH = 110.58;
const SEARCH_HEIGHT = 29.22;
const SEARCH_ICON_SIZE = 12.005;

/** Which history is showing; only the title and the first action differ. */
export type HistoryVariant = 'chat' | 'call';

const TITLES: Record<HistoryVariant, string> = {
  chat: 'Chat History',
  call: 'Call History',
};

/** Figma labels the first pill "Chat" here and "Audio" on the call screen. */
const PRIMARY_ACTIONS: Record<HistoryVariant, string> = {
  chat: 'Chat',
  call: 'Audio',
};

type HistoryScreenProps = {
  variant: HistoryVariant;
  onBack?: () => void;
  /** Opens the past consultation's own transcript — the "Chat"/"Audio" pill on a card. */
  onSelect?: (chatId: string, userName: string) => void;
};

/**
 * A past-consultation ledger: total earnings over a card per consultation, each
 * offering the channel, a refund and a block.
 * Figma: nodes 110:8851 (chat) and 110:9040 (call).
 */
/**
 * Refund and Block on a card. Neither is a self-serve action on the API —
 * a refund moves the seeker's money and blocking needs review — so each
 * confirms, then files a support request (the same tickets as Help &
 * Support's dispute form) naming the consultation, instead of doing nothing.
 */
function askSupport(
  entry: { id: string; userName: string; amount?: string; dateTime?: string },
  kind: 'refund' | 'block',
) {
  const refund = kind === 'refund';
  const what = refund ? `Refund ${entry.userName}` : `Block ${entry.userName}`;
  Alert.alert(
    refund ? 'Request a refund?' : 'Block this seeker?',
    refund
      ? `Support will review and refund ${entry.userName} for this consultation${entry.amount ? ` (${entry.amount})` : ''}.`
      : `Support will review and stop ${entry.userName} from sending you further requests.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: refund ? 'Request refund' : 'Request block',
        style: refund ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await submitDispute({
              issueType: 'astrologer',
              description: `${what} — consultation ${entry.id}${entry.dateTime ? ` on ${entry.dateTime}` : ''}${entry.amount ? `, ${entry.amount}` : ''}.`,
            });
            Alert.alert('Request sent', 'Support has your request and will follow up.');
          } catch (error) {
            Alert.alert('Could not send', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ],
  );
}

export function HistoryScreen({ variant, onBack, onSelect }: HistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const { px, contentWidth, isTablet } = useResponsive();
  const styles = useMemo(
    () => createStyles(px, contentWidth, isTablet),
    [px, contentWidth, isTablet],
  );
  const [query, setQuery] = useState('');

  /** Reloads whenever the tab switches between chat and call. */
  const history = useApi(() => fetchHistory(variant), [variant]);

  const entries = (history.data?.entries ?? []).filter(entry =>
    entry.userName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Figma runs the yellow header to 92pt, 48pt of which is the status bar
          area, leaving the row 7pt below it. */}
      <View style={styles.headerBleed}>
        <View style={[styles.header, { paddingTop: insets.top + 7 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            hitSlop={spacing.md}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            {/* The chevron is exported pointing right, so Figma flips it. */}
            <View style={styles.backFlip}>
              <ChevronSolidIcon
                width={px(CHEVRON_WIDTH)}
                height={px(CHEVRON_HEIGHT)}
                color={colors.text.ink}
              />
            </View>
          </Pressable>

          <Text style={styles.title}>{TITLES[variant]}</Text>

          <View style={styles.search}>
            <SearchIcon size={px(SEARCH_ICON_SIZE)} />
            <TextInput
              accessibilityLabel="Search history"
              value={query}
              onChangeText={setQuery}
              placeholder="Search here"
              placeholderTextColor={colors.text.ink}
              style={styles.searchInput}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.total}>
          <Text style={styles.totalAmount}>₹ {history.data?.total ?? '0'}</Text>
          <Text style={styles.totalCaption}>Total Earnings</Text>
        </View>

        {entries.map(entry => (
          <HistoryCard
            key={entry.id}
            entry={entry}
            primaryAction={PRIMARY_ACTIONS[variant]}
            onPrimary={() => onSelect?.(entry.id, entry.userName)}
            onRefund={() => askSupport(entry, 'refund')}
            onBlock={() => askSupport(entry, 'block')}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(px: (value: number) => number, contentWidth: number, isTablet: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    headerBleed: {
      backgroundColor: colors.brandYellow,
    },
    header: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing.md,
      gap: 15,
      paddingLeft: px(23.36),
      paddingRight: spacing.md,
    },
    back: {
      width: px(20),
    },
    backFlip: {
      transform: [{ rotate: '180deg' }],
    },
    pressed: {
      opacity: 0.6,
    },
    title: {
      ...typography.screenTitle,
      flex: 1,
      color: colors.text.ink,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      width: px(SEARCH_WIDTH),
      height: px(SEARCH_HEIGHT),
      paddingHorizontal: px(7.4),
      borderRadius: radius.linkChip,
      borderWidth: 1,
      borderColor: colors.border.tableRow,
      // Figma drops the pill to 40% so the yellow reads through it.
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    searchInput: {
      ...typography.searchPlaceholder,
      flex: 1,
      paddingVertical: 0,
      color: colors.text.ink,
    },
    content: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
      paddingHorizontal: px(13),
      paddingBottom: spacing.lg,
      gap: px(17.2),
    },
    total: {
      alignItems: 'center',
      paddingTop: spacing.xxxl,
      paddingBottom: spacing.xxl,
    },
    totalAmount: {
      ...typography.earningsAmount,
      color: colors.text.sheet,
    },
    totalCaption: {
      ...typography.earningsCaption,
      color: colors.text.sheet,
    },
  });
}
