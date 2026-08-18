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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailabilityToggle } from '../components/AvailabilityToggle';
import { BottomNav, type TabKey } from '../components/BottomNav';
import { ExpertiseCard } from '../components/ExpertiseCard';
import {
  TrendingUpIcon,
  WalletCardIcon,
} from '../components/icons/DashboardIcons';
import { IncomingRequestPopup } from '../components/IncomingRequestPopup';
import { PerformanceCard } from '../components/PerformanceCard';
import { ProfileMenu, type ProfileMenuAction } from '../components/ProfileMenu';
import { RequestCard, type ConsultationRequest } from '../components/RequestCard';
import { ServicesCard, type ServiceRow } from '../components/ServicesCard';
import { StatCard } from '../components/StatCard';
import {
  ASTROLOGER,
  EARNINGS,
  LIFE_ASPECTS,
  PENDING_COUNT,
  PENDING_REQUESTS,
  PERFORMANCE,
  SERVICES,
  SKILLS,
} from '../data/dashboard';
import { colors, hairline, radius, spacing, stroke, typography } from '../theme';

const AVATAR_SIZE = 47.998;
const AVATAR_BADGE_SIZE = 15.999;
const STAT_ICON_SIZE = 17.993;

type DashboardScreenProps = {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
  onViewPerformance?: () => void;
  onWithdraw?: () => void;
  onEditLifeAspects?: () => void;
  onEditSkills?: () => void;
  /** Taking a request opens the consultation; declining drops it off the list. */
  onAcceptRequest?: (request: ConsultationRequest) => void;
  /** The four entries of the header avatar's dropdown (Figma node 110:6263). */
  onViewProfile?: () => void;
  onBankDetails?: () => void;
  onDocuments?: () => void;
  onLogout?: () => void;
};

/**
 * The astrologer's home: availability, today's money and performance, the
 * services they are taking, their declared expertise, and the requests waiting
 * on an answer.
 * Figma: node 104:5694.
 */
export function DashboardScreen({
  activeTab = 'home',
  onSelectTab,
  onViewPerformance,
  onWithdraw,
  onEditLifeAspects,
  onEditSkills,
  onAcceptRequest,
  onViewProfile,
  onBankDetails,
  onDocuments,
  onLogout,
}: DashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const [online, setOnline] = useState(true);
  /** Whether the header avatar's dropdown is showing. */
  const [profileOpen, setProfileOpen] = useState(false);
  const [services, setServices] = useState<ServiceRow[]>([...SERVICES]);
  const [requests, setRequests] = useState<ConsultationRequest[]>([
    ...PENDING_REQUESTS,
  ]);
  /** The request whose details are open in the popup. */
  const [reviewing, setReviewing] = useState<ConsultationRequest | null>(null);

  const toggleService = (id: ServiceRow['id'], enabled: boolean) =>
    setServices(current =>
      current.map(row => (row.id === id ? { ...row, enabled } : row)),
    );

  /**
   * Either button on a request card opens the full brief rather than answering
   * straight away; the popup's own buttons are what settle it.
   */
  const answer = (request: ConsultationRequest, accepted: boolean) => {
    setReviewing(null);
    setRequests(current => current.filter(item => item.id !== request.id));
    if (accepted) {
      onAcceptRequest?.(request);
    }
  };

  /** Every dropdown entry closes the menu before it goes anywhere. */
  const chooseProfileAction = (action: ProfileMenuAction) => {
    setProfileOpen(false);
    switch (action) {
      case 'view-profile':
        onViewProfile?.();
        break;
      case 'bank-details':
        onBankDetails?.();
        break;
      case 'documents':
        onDocuments?.();
        break;
      case 'logout':
        onLogout?.();
        break;
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Figma pads the header 48pt from the frame top, 1pt of which clears
          the status bar. */}
      <View style={[styles.header, { paddingTop: insets.top + 1 }]}>
        <View style={styles.headerRow}>
          <View style={styles.greetingColumn}>
            <Text style={styles.greeting}>{ASTROLOGER.greeting}</Text>
            <Text style={styles.name}>{ASTROLOGER.name}</Text>
          </View>

          <AvailabilityToggle online={online} onChange={setOnline} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile menu"
            accessibilityState={{ expanded: profileOpen }}
            onPress={() => setProfileOpen(open => !open)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Image
              accessibilityLabel={ASTROLOGER.name}
              source={require('../assets/images/astrologer-avatar.jpg')}
              style={styles.avatar}
            />
            {online && <View style={styles.avatarBadge} />}
          </Pressable>
        </View>
      </View>

      {/* The dropdown hangs off the bottom of the avatar: the header's top
          padding, the avatar itself, then an 8pt gap. */}
      <ProfileMenu
        visible={profileOpen}
        top={insets.top + 1 + AVATAR_SIZE + spacing.sm}
        onDismiss={() => setProfileOpen(false)}
        onSelect={chooseProfileAction}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statRow}>
          <StatCard
            icon={<TrendingUpIcon size={STAT_ICON_SIZE} />}
            wellColor={colors.status.successBadge}
            badgeColor={colors.status.successBadge}
            badgeLabelColor={colors.status.success}
            badge="LIVE"
            value={EARNINGS.today}
            caption="Today's Earnings"
            footnote={EARNINGS.todayTrend}
            footnoteColor={colors.status.success}
          />
          <StatCard
            icon={<WalletCardIcon size={STAT_ICON_SIZE} />}
            wellColor="rgba(240, 223, 32, 0.15)"
            badgeColor="rgba(240, 223, 32, 0.12)"
            badgeLabelColor={colors.text.ink}
            badge="LIVE"
            value={EARNINGS.walletBalance}
            caption="Wallet Balance"
            footnote="Tap to withdraw"
            footnoteColor={colors.text.ink}
            onPress={onWithdraw}
          />
        </View>

        <PerformanceCard stats={PERFORMANCE} onViewAll={onViewPerformance} />

        <ServicesCard rows={services} onToggle={toggleService} />

        <ExpertiseCard
          title="My Expertise in Life Aspects"
          items={LIFE_ASPECTS}
          onEdit={onEditLifeAspects}
        />

        <ExpertiseCard
          title="My Expertise in Skills"
          items={SKILLS}
          onEdit={onEditSkills}
        />

        <View style={styles.requests}>
          <View style={styles.requestsHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countLabel}>{PENDING_COUNT} New</Text>
            </View>
          </View>

          {requests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={() => setReviewing(request)}
              onDecline={() => setReviewing(request)}
            />
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
    paddingBottom: 16.755,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border.hairline,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  greetingColumn: {
    flex: 1,
  },
  greeting: {
    ...typography.greeting,
    color: colors.text.secondary,
  },
  name: {
    ...typography.dashboardTitle,
    color: colors.text.inkSoft,
    paddingTop: 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.iconTile,
    borderWidth: stroke,
    borderColor: colors.brandYellow,
  },
  pressed: {
    opacity: 0.6,
  },
  avatarBadge: {
    position: 'absolute',
    left: 36,
    top: 36,
    width: AVATAR_BADGE_SIZE,
    height: AVATAR_BADGE_SIZE,
    borderRadius: AVATAR_BADGE_SIZE / 2,
    borderWidth: stroke,
    borderColor: colors.surface,
    backgroundColor: colors.status.success,
  },
  content: {
    padding: spacing.section,
    gap: spacing.section,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  requests: {
    gap: spacing.md,
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text.inkSoft,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.note,
    backgroundColor: colors.status.danger,
  },
  countLabel: {
    ...typography.badgeLabelStrong,
    color: colors.text.inverse,
  },
});
