/**
 * Shree Astro — astrologer app
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from './src/state/AppDataProvider';
import { signOut as endSession, type AuthAstrologer } from './src/services/auth';
import { disconnectLiveUpdates, fetchSupportContact } from './src/services/api';
import { getSession, onSessionChange, restoreSession } from './src/services/session';
import { colors } from './src/theme';

import { type TabKey } from './src/components/BottomNav';
import { MenuSidebar } from './src/components/MenuSidebar';
import { WITHDRAW_DEFAULT } from './src/data/wallet';
import { ApplicationSubmittedScreen } from './src/screens/ApplicationSubmittedScreen';
import { AstrologerWelcomeScreen } from './src/screens/AstrologerWelcomeScreen';
import { BankAccountsScreen } from './src/screens/BankAccountsScreen';
import { BankDetailsScreen } from './src/screens/BankDetailsScreen';
import { ConsultationChatScreen } from './src/screens/ConsultationChatScreen';
import { ConsultScreen } from './src/screens/ConsultScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DocumentsScreen } from './src/screens/DocumentsScreen';
import { DocumentUploadScreen } from './src/screens/DocumentUploadScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { HelpSupportScreen } from './src/screens/HelpSupportScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { MyProfileScreen } from './src/screens/MyProfileScreen';
import { PriceChangeScreen } from './src/screens/PriceChangeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { OtpVerificationScreen } from './src/screens/OtpVerificationScreen';
import { PersonalInfoScreen, type PersonalInfo } from './src/screens/PersonalInfoScreen';
import { ProfessionalDetailsScreen } from './src/screens/ProfessionalDetailsScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { WithdrawMoneyScreen } from './src/screens/WithdrawMoneyScreen';
import { WithdrawSuccessScreen } from './src/screens/WithdrawSuccessScreen';

/**
 * First run walks the cosmic welcome, the four-slide pitch and the account gate,
 * which then forks: log in with a mobile number and an OTP — landing on the
 * dashboard — or register through the four-step wizard. One route value drives
 * the lot rather than a navigation library; swap this for a navigator as the
 * signed-in shell grows past its first tab.
 */
type Route =
  /** Before the keystore has been read — nobody knows who is signed in yet. */
  | 'restoring'
  | 'welcome'
  | 'onboarding'
  | 'accountGate'
  | 'login'
  | 'otp'
  | 'personalInfo'
  | 'professionalDetails'
  | 'documentUpload'
  | 'bankDetails'
  | 'applicationSubmitted'
  | 'dashboard'
  | 'consultation'
  | 'withdraw'
  | 'withdrawDone'
  | 'chatHistory'
  | 'callHistory'
  /** Sidebar entries with a screen of their own. */
  | 'priceChange'
  | 'help'
  /** "View Profile" in the header dropdown, and the Edit button on it. */
  | 'profile'
  | 'profileEdit'
  /** "Bank Details" in that dropdown — the payout account already on file. */
  | 'bankAccounts'
  /** "Documents" — every scan already filed. */
  | 'documents';

/**
 * Where each sidebar entry lands. Entries without a screen of their own are
 * absent, so selecting them just collapses the drawer.
 */
const MENU_ROUTES: Record<string, Route | undefined> = {
  dashboard: 'dashboard',
  'call-history': 'callHistory',
  'chat-history': 'chatHistory',
  'missed-call': 'dashboard',
  earnings: 'dashboard',
  'price-change': 'priceChange',
  help: 'help',
};

/**
 * Sidebar entries that land back on the dashboard route also need a tab
 * switch — "Dashboard" always resets to Home, while "Missed Call" and
 * "Earnings" jump straight to the tab that shows that data.
 */
const MENU_TABS: Record<string, TabKey | undefined> = {
  dashboard: 'home',
  'missed-call': 'consult',
  earnings: 'wallet',
};

/** Groups a mobile number the way the OTP screen prints it: 98765 43210. */
const formatMobile = (digits: string) =>
  digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

function App() {
  const [route, setRoute] = useState<Route>('restoring');
  /** The code the API returned while there is no SMS provider. */
  const [devCode, setDevCode] = useState<string | undefined>(undefined);
  /** The number login collected, carried into the OTP screen. */
  const [mobile, setMobile] = useState('');
  /** Step 1's answers, held until step 2 has enough to actually register. */
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>();
  /** Which tab of the signed-in shell is showing. */
  const [tab, setTab] = useState<TabKey>('home');
  /**
   * Who the open consultation is with. Figma labels the chat header
   * "Astro Rakesh", but in the astrologer's own app it is the seeker who was
   * just accepted, so the accepted request's name is carried through.
   */
  const [seeker, setSeeker] = useState<string | undefined>(undefined);
  /** The chat the accepted request opened — `ConsultationRequest.id` is already the chatId (see utils/requests.ts). */
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  /**
   * True when `chatId` was opened from History rather than a live accept —
   * a past, already-ended consultation, read-only, and returning from it
   * should land back on the history list it came from, not the dashboard.
   */
  const [pastConsultation, setPastConsultation] = useState(false);
  const [historyOrigin, setHistoryOrigin] = useState<'chatHistory' | 'callHistory'>('chatHistory');
  /** The amount carried through the withdrawal flow, in plain digits. */
  const [withdrawal, setWithdrawal] = useState(WITHDRAW_DEFAULT);

  /** Whether the navigation drawer is open over the current tab. */
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * The keystore is read once, at startup, and decides the first screen.
   *
   * Nothing is drawn until it answers — routing to the welcome screen first and
   * correcting a moment later would flash the sign-in flow at an already
   * signed-in astrologer on every launch.
   */
  useEffect(() => {
    let live = true;

    restoreSession().then(session => {
      if (live) {
        if (session) {
          routeAfterAuth(session.astrologer);
        } else {
          setRoute('welcome');
        }
      }
    });

    return () => {
      live = false;
    };
  }, []);

  /**
   * Where a signed-in astrologer lands: the live dashboard once approved, or
   * the same "under review" screen the wizard ends on otherwise — reused
   * rather than a fresh screen, since the copy already reads fine on a
   * repeat visit. Login only ever succeeds for an account that could still
   * reach `'approved'` (a rejected/suspended one is refused at the OTP step
   * itself, on the server), so those are the only two outcomes here.
   */
  const routeAfterAuth = (astrologer: AuthAstrologer) => {
    setRoute(astrologer.applicationStatus === 'approved' ? 'dashboard' : 'applicationSubmitted');
  };

  /**
   * A session can also end without anyone pressing anything: a refresh token
   * the API refuses is cleared by the client, from wherever they happened to
   * be. Listening here is what turns that into navigation.
   */
  useEffect(
    () =>
      onSessionChange(session => {
        if (!session) {
          /** A signed-out session must never hold a live socket, however it ends. */
          disconnectLiveUpdates();
          setRoute(current => (current === 'restoring' ? current : 'accountGate'));
        }
      }),
    [],
  );

  /** Clears the keystore first, so "signed out" is true before it is drawn. */
  const signOut = async () => {
    disconnectLiveUpdates();
    await endSession();
    setTab('home');
    setRoute('accountGate');
  };

  /** Menu is a drawer rather than a tab, so it opens over whatever is showing. */
  const selectTab = (next: TabKey) => {
    if (next === 'menu') {
      setMenuOpen(true);
    } else {
      setTab(next);
    }
  };

  /** Social sign-in isn't set up for astrologers yet — say so rather than leave the buttons dead. */
  const socialComingSoon = (provider: 'Google' | 'Apple') =>
    Alert.alert(`${provider} sign-in`, `${provider} sign-in is coming soon. Please continue with your mobile number.`);

  /**
   * "Delete Account" — there is no self-serve deletion on the API, and it
   * can't be undone (earnings, payouts and records are involved), so this
   * confirms and then opens a request to support rather than doing nothing.
   */
  const requestAccountDeletion = () =>
    Alert.alert(
      'Delete account?',
      'This permanently removes your astrologer profile. Our team will verify the request and settle any pending earnings first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request deletion',
          style: 'destructive',
          onPress: async () => {
            const { email } = await fetchSupportContact();
            const subject = encodeURIComponent('Delete my astrologer account');
            try {
              await Linking.openURL(`mailto:${email}?subject=${subject}`);
            } catch {
              Alert.alert('Request deletion', `Email ${email} from your registered address to delete your account.`);
            }
          },
        },
      ],
    );

  return (
    <SafeAreaProvider>
      <AppDataProvider>
      {/* Held while the keystore is read; see the effect above. */}
      {route === 'restoring' && (
        <View style={styles.splash}>
          <ActivityIndicator color={colors.brandYellow} />
        </View>
      )}

      {route === 'welcome' && (
        <WelcomeScreen
          onLogin={() => setRoute('onboarding')}
          onCreateAccount={() => setRoute('onboarding')}
        />
      )}

      {route === 'onboarding' && (
        <OnboardingScreen
          onSkip={() => setRoute('accountGate')}
          onFinish={() => setRoute('accountGate')}
        />
      )}

      {route === 'accountGate' && (
        <AstrologerWelcomeScreen
          onLogin={() => setRoute('login')}
          onRegister={() => setRoute('personalInfo')}
        />
      )}

      {route === 'login' && (
        <LoginScreen
          onGoogle={() => socialComingSoon('Google')}
          onApple={() => socialComingSoon('Apple')}
          onSendOtp={(digits, code) => {
            setMobile(digits);
            setDevCode(code);
            setRoute('otp');
          }}
          onRegister={() => setRoute('personalInfo')}
        />
      )}

      {route === 'otp' && (
        <OtpVerificationScreen
          mobile={formatMobile(mobile)}
          phone={mobile}
          devCode={devCode}
          onVerified={astrologer => (astrologer ? routeAfterAuth(astrologer) : setRoute('dashboard'))}
        />
      )}

      {route === 'dashboard' && tab === 'home' && (
        <DashboardScreen
          activeTab={tab}
          onSelectTab={selectTab}
          onAcceptRequest={request => {
            setSeeker(request.name);
            setChatId(request.id);
            setPastConsultation(false);
            setRoute('consultation');
          }}
          onViewEarnings={() => setTab('wallet')}
          onWithdraw={() => setRoute('withdraw')}
          onViewPerformance={() => setRoute('chatHistory')}
          onEditLifeAspects={() => setRoute('profileEdit')}
          onEditSkills={() => setRoute('profileEdit')}
          onViewProfile={() => setRoute('profile')}
          onBankDetails={() => setRoute('bankAccounts')}
          onDocuments={() => setRoute('documents')}
          onLogout={signOut}
        />
      )}

      {route === 'profile' && (
        <MyProfileScreen
          onBack={() => setRoute('dashboard')}
          onEdit={() => setRoute('profileEdit')}
        />
      )}

      {/* Cancel, and a successful Update, both return to the profile. */}
      {route === 'profileEdit' && (
        <EditProfileScreen
          onBack={() => setRoute('profile')}
          onClose={() => setRoute('profile')}
        />
      )}

      {route === 'documents' && (
        <DocumentsScreen onBack={() => setRoute('dashboard')} />
      )}

      {route === 'bankAccounts' && (
        <BankAccountsScreen onBack={() => setRoute('dashboard')} />
      )}

      {/* Leaving a live consultation drops back to the dashboard; leaving a past one (opened from History) returns to the history list it came from. */}
      {route === 'consultation' && (
        <ConsultationChatScreen
          chatId={chatId}
          peerName={seeker}
          readOnly={pastConsultation}
          onLeave={() => setRoute(pastConsultation ? historyOrigin : 'dashboard')}
        />
      )}

      {route === 'dashboard' && tab === 'consult' && (
        <ConsultScreen
          activeTab={tab}
          onSelectTab={selectTab}
          onAcceptRequest={request => {
            setSeeker(request.name);
            setChatId(request.id);
            setPastConsultation(false);
            setRoute('consultation');
          }}
        />
      )}

      {route === 'dashboard' && tab === 'wallet' && (
        <WalletScreen
          activeTab={tab}
          onSelectTab={selectTab}
          onWithdraw={() => setRoute('withdraw')}
        />
      )}

      {route === 'dashboard' && tab === 'alerts' && (
        <NotificationsScreen activeTab={tab} onSelectTab={selectTab} />
      )}

      {route === 'withdraw' && (
        <WithdrawMoneyScreen
          onBack={() => setRoute('dashboard')}
          onConfirm={amount => {
            setWithdrawal(amount);
            setRoute('withdrawDone');
          }}
        />
      )}

      {route === 'withdrawDone' && (
        <WithdrawSuccessScreen
          amount={withdrawal}
          onBackToWallet={() => {
            setTab('wallet');
            setRoute('dashboard');
          }}
        />
      )}

      {route === 'personalInfo' && (
        <PersonalInfoScreen
          onBack={() => setRoute('accountGate')}
          onContinue={info => {
            setMobile(info.mobile);
            setPersonalInfo(info);
            setRoute('professionalDetails');
          }}
        />
      )}

      {/* Registering the account happens inside this step — see its own doc comment. */}
      {route === 'professionalDetails' && personalInfo && (
        <ProfessionalDetailsScreen
          personalInfo={personalInfo}
          onBack={() => setRoute('personalInfo')}
          onRegistered={() => setRoute('documentUpload')}
        />
      )}

      {route === 'documentUpload' && (
        <DocumentUploadScreen
          onBack={() => setRoute('professionalDetails')}
          onContinue={() => setRoute('bankDetails')}
        />
      )}

      {/* Filing the bank account and submitting the application both happen inside this step. */}
      {route === 'bankDetails' && (
        <BankDetailsScreen
          holderNameDefault={personalInfo?.fullName}
          onBack={() => setRoute('documentUpload')}
          onSubmit={() => {
            setPersonalInfo(undefined);
            setRoute('applicationSubmitted');
          }}
        />
      )}

      {route === 'applicationSubmitted' && (
        <ApplicationSubmittedScreen
          onGetStarted={() => {
            const session = getSession();
            if (session) {
              routeAfterAuth(session.astrologer);
            } else {
              setRoute('accountGate');
            }
          }}
        />
      )}

      {route === 'chatHistory' && (
        <HistoryScreen
          variant="chat"
          onBack={() => setRoute('dashboard')}
          onSelect={(id, name) => {
            setSeeker(name);
            setChatId(id);
            setPastConsultation(true);
            setHistoryOrigin('chatHistory');
            setRoute('consultation');
          }}
        />
      )}

      {route === 'callHistory' && (
        <HistoryScreen
          variant="call"
          onBack={() => setRoute('dashboard')}
          onSelect={(id, name) => {
            setSeeker(name);
            setChatId(id);
            setPastConsultation(true);
            setHistoryOrigin('callHistory');
            setRoute('consultation');
          }}
        />
      )}

      {route === 'priceChange' && (
        <PriceChangeScreen onBack={() => setRoute('dashboard')} />
      )}

      {route === 'help' && (
        <HelpSupportScreen onBack={() => setRoute('dashboard')} />
      )}

      {/* The drawer overlays whichever tab is showing. Entries without a screen
          of their own just collapse it. */}
      <MenuSidebar
        visible={menuOpen}
        onCollapse={() => setMenuOpen(false)}
        onEditProfile={() => {
          setMenuOpen(false);
          setRoute('profileEdit');
        }}
        onSelect={item => {
          setMenuOpen(false);
          if (item.id === 'delete-account') {
            requestAccountDeletion();
            return;
          }
          const destination = MENU_ROUTES[item.id];
          if (destination) {
            setRoute(destination);
          }
          const destinationTab = MENU_TABS[item.id];
          if (destinationTab) {
            setTab(destinationTab);
          }
        }}
      />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});

export default App;
