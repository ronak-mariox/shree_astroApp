import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, type TabKey } from '../components/BottomNav';
import { IncomingRequestPopup } from '../components/IncomingRequestPopup';
import { RequestCard, type ConsultationRequest } from '../components/RequestCard';
import { SectionHeader } from '../components/SectionHeader';
import {
  MISSED_CALLS,
  MISSED_COUNT,
  PENDING_COUNT,
  PENDING_REQUESTS,
} from '../data/dashboard';
import { colors, hairline, spacing, typography } from '../theme';

type ConsultScreenProps = {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
  /** Taking a request opens the consultation. */
  onAcceptRequest?: (request: ConsultationRequest) => void;
};

/**
 * The Consult tab: requests still waiting on an answer, and the calls that were
 * missed. Answering either button on a card opens its full brief first.
 * Figma: node 112:1997.
 */
export function ConsultScreen({
  activeTab = 'consult',
  onSelectTab,
  onAcceptRequest,
}: ConsultScreenProps) {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<ConsultationRequest[]>([
    ...PENDING_REQUESTS,
  ]);
  const [reviewing, setReviewing] = useState<ConsultationRequest | null>(null);

  const answer = (request: ConsultationRequest, accepted: boolean) => {
    setReviewing(null);
    setRequests(current => current.filter(item => item.id !== request.id));
    if (accepted) {
      onAcceptRequest?.(request);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Figma pads the header 48pt from the frame top, 1pt of which clears
          the status bar. */}
      <View style={[styles.header, { paddingTop: insets.top + 1 }]}>
        <Text style={styles.title}>Consult</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <SectionHeader
            title="Pending Requests"
            badge={`${PENDING_COUNT} New`}
          />
          {requests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={() => setReviewing(request)}
              onDecline={() => setReviewing(request)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Missed Call" badge={`${MISSED_COUNT} New`} />
          {MISSED_CALLS.map(call => (
            <RequestCard key={call.id} request={call} showActions={false} />
          ))}
        </View>
      </ScrollView>

      <BottomNav active={activeTab} onSelect={onSelectTab} />

      <IncomingRequestPopup
        request={reviewing}
        onAccept={request => answer(request, true)}
        onDecline={request => answer(request, false)}
        onDismiss={() => setReviewing(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: 20.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  title: {
    ...typography.wizardTitle,
    fontSize: 22,
    lineHeight: 33,
    color: colors.text.inkSoft,
    paddingTop: spacing.md,
  },
  content: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
});
