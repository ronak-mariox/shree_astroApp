import React, { useState } from 'react';
import {
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
import { fetchHistory } from '../services/api';
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
};

/**
 * A past-consultation ledger: total earnings over a card per consultation, each
 * offering the channel, a refund and a block.
 * Figma: nodes 110:8851 (chat) and 110:9040 (call).
 */
export function HistoryScreen({ variant, onBack }: HistoryScreenProps) {
  const insets = useSafeAreaInsets();
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
              width={CHEVRON_WIDTH}
              height={CHEVRON_HEIGHT}
              color={colors.text.ink}
            />
          </View>
        </Pressable>

        <Text style={styles.title}>{TITLES[variant]}</Text>

        <View style={styles.search}>
          <SearchIcon size={SEARCH_ICON_SIZE} />
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
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    gap : 15,
    paddingLeft: 23.36,
    paddingRight: spacing.md,
    backgroundColor: colors.brandYellow,
  },
  back: {
    width: 20,
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
    width: SEARCH_WIDTH,
    height: SEARCH_HEIGHT,
    paddingHorizontal: 7.4,
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
    paddingHorizontal: 13,
    paddingBottom: spacing.lg,
    gap: 17.2,
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
