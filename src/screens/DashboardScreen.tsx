import React, { useMemo, useState } from 'react';
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
import { useApi } from '../hooks/useApi';
import { useIncomingRequests } from '../hooks/useIncomingRequests';
import { useResponsive } from '../hooks/useResponsive';
import * as api from '../services/api';
import { useAppData } from '../state/AppDataProvider';
import { colors, hairline, radius, spacing, stroke, typography } from '../theme';
import { photoOf } from '../utils/images';

/** "Good Morning ✨" / "Good Afternoon ✨" / "Good Evening ✨". */
function greetingFor(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good Morning ✨';
  if (hour < 17) return 'Good Afternoon ✨';
  return 'Good Evening ✨';
}

/** "Numerology , Tarot" -> ["Numerology", "Tarot"]. */
const splitList = (value?: string) =>
  (value ?? '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

const AVATAR_SIZE = 47.998;
const AVATAR_BADGE_SIZE = 15.999;
const STAT_ICON_SIZE = 17.993;

type DashboardScreenProps = {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
  onViewPerformance?: () => void;
  /** "Today's Earnings" card — opens the wallet's earnings and ledger. */
  onViewEarnings?: () => void;
  /** "Wallet Balance" card — "Tap to withdraw". */
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
  onViewEarnings,
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
  const { px, contentWidth, isTablet } = useResponsive();
  const styles = useMemo(
    () => createStyles(px, contentWidth, isTablet),
    [px, contentWidth, isTablet],
  );
  const { profile } = useAppData();

  /** Everything the screen prints, in one call. */
  const dashboard = useApi(() => api.fetchDashboard(), []);
  /** The queue behind the incoming-request popup — live, via the account's socket room. */
  const { requests, reviewing, setReviewing, answer } = useIncomingRequests({
    onAccepted: onAcceptRequest,
    onSettled: dashboard.reload,
  });

  /**
   * The availability toggle. `undefined` means "not touched yet", which falls
   * back to whatever the server says — the dashboard arrives a moment after
   * mount, so a plain initial value would fix it to the wrong state.
   */
  const [chosenOnline, setChosenOnline] = useState<boolean | undefined>(undefined);
  const online = chosenOnline ?? dashboard.data?.isOnline ?? false;

  /** Whether the header avatar's dropdown is showing. */
  const [profileOpen, setProfileOpen] = useState(false);

  const earnings = dashboard.data?.earnings;
  const performance = dashboard.data?.performance;

  /**
   * The API's services, in the shape the card draws. The card only has a Call
   * and a Chat row (Figma node 106:6879), so anything else the account carries
   * — live sessions, the emergency line — sits outside this table.
   */
  const services: ServiceRow[] = (dashboard.data?.services ?? [])
    .filter((service): service is typeof service & { type: 'call' | 'chat' } =>
      service.type === 'call' || service.type === 'chat',
    )
    .map(service => ({
      id: service.type,
      label: service.type === 'call' ? 'Call' : 'Chat',
      rate: String(service.effectiveRate ?? service.ratePerMinute),
      time: service.onlineTime ?? '',
      enabled: service.isEnabled,
    }));

  /** Turning availability on or off is written straight through to the server. */
  const changeOnline = async (next: boolean) => {
    setChosenOnline(next);
    try {
      await api.setOnline(next);
    } catch {
      /** Put the switch back if the server refused. */
      setChosenOnline(!next);
    }
  };

  const toggleService = async (id: ServiceRow['id'], enabled: boolean) => {
    try {
      await api.setServiceEnabled(String(id), enabled);
      await dashboard.reload();
    } catch {
      /** The card re-reads from the server, so a refusal simply undoes itself. */
      await dashboard.reload();
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
            <Text style={styles.greeting}>{greetingFor(new Date())}</Text>
            <Text style={styles.name}>
              {profile.fullName || dashboard.data?.name || 'Astrologer'}
            </Text>
          </View>

          <AvailabilityToggle online={online} onChange={changeOnline} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile menu"
            accessibilityState={{ expanded: profileOpen }}
            onPress={() => setProfileOpen(open => !open)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Image
              accessibilityLabel={profile.fullName || dashboard.data?.name || 'Profile'}
              source={photoOf(profile.photoUrl, require('../assets/images/astrologer-avatar.jpg'))}
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
        top={insets.top + 1 + px(AVATAR_SIZE) + spacing.sm}
        onDismiss={() => setProfileOpen(false)}
        onSelect={chooseProfileAction}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statRow}>
          <StatCard
            icon={<TrendingUpIcon size={px(STAT_ICON_SIZE)} />}
            wellColor={colors.status.successBadge}
            badgeColor={colors.status.successBadge}
            badgeLabelColor={colors.status.success}
            badge="LIVE"
            value={`₹${(earnings?.today ?? 0).toLocaleString('en-IN')}`}
            caption="Today's Earnings"
            footnote={`₹${(earnings?.thisMonth ?? 0).toLocaleString('en-IN')} this month`}
            footnoteColor={colors.status.success}
            accessibilityLabel="Today's Earnings — view earnings"
            onPress={onViewEarnings}
          />
          <StatCard
            icon={<WalletCardIcon size={px(STAT_ICON_SIZE)} />}
            wellColor="rgba(240, 223, 32, 0.15)"
            badgeColor="rgba(240, 223, 32, 0.12)"
            badgeLabelColor={colors.text.ink}
            badge="LIVE"
            value={`₹${(earnings?.balance ?? 0).toLocaleString('en-IN')}`}
            caption="Wallet Balance"
            footnote="Tap to withdraw"
            footnoteColor={colors.text.ink}
            accessibilityLabel="Wallet Balance — withdraw"
            onPress={onWithdraw}
          />
        </View>

        <PerformanceCard
          stats={{
            consultations: performance?.consultationsToday ?? 0,
            rating: performance?.rating ?? 0,
            acceptance: performance?.acceptance ?? 0,
          }}
          onViewAll={onViewPerformance}
        />

        <ServicesCard rows={services} onToggle={toggleService} />

        <ExpertiseCard
          title="My Expertise in Life Aspects"
          items={splitList(profile.skill)}
          onEdit={onEditLifeAspects}
        />

        <ExpertiseCard
          title="My Expertise in Skills"
          items={splitList(profile.language)}
          onEdit={onEditSkills}
        />

        <View style={styles.requests}>
          <View style={styles.requestsHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countLabel}>{requests.length} New</Text>
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

function createStyles(px: (value: number) => number, contentWidth: number, isTablet: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingBottom: px(16.755),
      borderBottomWidth: hairline,
      borderBottomColor: colors.border.hairline,
    },
    headerRow: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
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
      width: px(AVATAR_SIZE),
      height: px(AVATAR_SIZE),
      borderRadius: radius.iconTile,
      borderWidth: stroke,
      borderColor: colors.brandYellow,
    },
    pressed: {
      opacity: 0.6,
    },
    avatarBadge: {
      position: 'absolute',
      left: px(36),
      top: px(36),
      width: px(AVATAR_BADGE_SIZE),
      height: px(AVATAR_BADGE_SIZE),
      borderRadius: px(AVATAR_BADGE_SIZE) / 2,
      borderWidth: stroke,
      borderColor: colors.surface,
      backgroundColor: colors.status.success,
    },
    content: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: isTablet ? contentWidth : undefined,
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
}
