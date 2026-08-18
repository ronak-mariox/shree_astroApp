/**
 * Shree Astro — astrologer app
 *
 * @format
 */

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from './src/state/AppDataProvider';

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
import { MyReviewsScreen } from './src/screens/MyReviewsScreen';
import { PriceChangeScreen } from './src/screens/PriceChangeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { OtpVerificationScreen } from './src/screens/OtpVerificationScreen';
import { PersonalInfoScreen } from './src/screens/PersonalInfoScreen';
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
  | 'reviews'
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
  'price-change': 'priceChange',
  'my-review': 'reviews',
  help: 'help',
};

/** Groups a mobile number the way the OTP screen prints it: 98765 43210. */
const formatMobile = (digits: string) =>
  digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

function App() {
  const [route, setRoute] = useState<Route>('welcome');
  /** The number login collected, carried into the OTP screen. */
  const [mobile, setMobile] = useState('');
  /** Which tab of the signed-in shell is showing. */
  const [tab, setTab] = useState<TabKey>('home');
  /**
   * Who the open consultation is with. Figma labels the chat header
   * "Astro Rakesh", but in the astrologer's own app it is the seeker who was
   * just accepted, so the accepted request's name is carried through.
   */
  const [seeker, setSeeker] = useState<string | undefined>(undefined);
  /** The amount carried through the withdrawal flow, in plain digits. */
  const [withdrawal, setWithdrawal] = useState(WITHDRAW_DEFAULT);

  /** Whether the navigation drawer is open over the current tab. */
  const [menuOpen, setMenuOpen] = useState(false);

  /** Menu is a drawer rather than a tab, so it opens over whatever is showing. */
  const selectTab = (next: TabKey) => {
    if (next === 'menu') {
      setMenuOpen(true);
    } else {
      setTab(next);
    }
  };

  return (
    <SafeAreaProvider>
      <AppDataProvider>
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
          onSendOtp={digits => {
            setMobile(digits);
            setRoute('otp');
          }}
        />
      )}

      {route === 'otp' && (
        <OtpVerificationScreen
          mobile={formatMobile(mobile)}
          onVerified={() => setRoute('dashboard')}
        />
      )}

      {route === 'dashboard' && tab === 'home' && (
        <DashboardScreen
          activeTab={tab}
          onSelectTab={selectTab}
          onAcceptRequest={request => {
            setSeeker(request.name);
            setRoute('consultation');
          }}
          onViewProfile={() => setRoute('profile')}
          onBankDetails={() => setRoute('bankAccounts')}
          onDocuments={() => setRoute('documents')}
          onLogout={() => {
            setTab('home');
            setRoute('accountGate');
          }}
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

      {/* Leaving the consultation drops back to the dashboard. */}
      {route === 'consultation' && (
        <ConsultationChatScreen
          peerName={seeker}
          onLeave={() => setRoute('dashboard')}
        />
      )}

      {route === 'dashboard' && tab === 'consult' && (
        <ConsultScreen
          activeTab={tab}
          onSelectTab={selectTab}
          onAcceptRequest={request => {
            setSeeker(request.name);
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
          onBackToWallet={() => setRoute('dashboard')}
        />
      )}

      {route === 'personalInfo' && (
        <PersonalInfoScreen
          onBack={() => setRoute('accountGate')}
          onContinue={info => {
            setMobile(info.mobile);
            setRoute('professionalDetails');
          }}
        />
      )}

      {route === 'professionalDetails' && (
        <ProfessionalDetailsScreen
          onBack={() => setRoute('personalInfo')}
          onContinue={() => setRoute('documentUpload')}
        />
      )}

      {route === 'documentUpload' && (
        <DocumentUploadScreen
          onBack={() => setRoute('professionalDetails')}
          onContinue={() => setRoute('bankDetails')}
        />
      )}

      {route === 'bankDetails' && (
        <BankDetailsScreen
          onBack={() => setRoute('documentUpload')}
          onSubmit={() => setRoute('applicationSubmitted')}
        />
      )}

      {route === 'applicationSubmitted' && (
        <ApplicationSubmittedScreen onBackToHome={() => setRoute('dashboard')} />
      )}

      {route === 'chatHistory' && (
        <HistoryScreen variant="chat" onBack={() => setRoute('dashboard')} />
      )}

      {route === 'callHistory' && (
        <HistoryScreen variant="call" onBack={() => setRoute('dashboard')} />
      )}

      {route === 'priceChange' && (
        <PriceChangeScreen onBack={() => setRoute('dashboard')} />
      )}

      {route === 'reviews' && (
        <MyReviewsScreen onBack={() => setRoute('dashboard')} />
      )}

      {route === 'help' && (
        <HelpSupportScreen onBack={() => setRoute('dashboard')} />
      )}

      {/* The drawer overlays whichever tab is showing. Entries without a screen
          of their own just collapse it. */}
      <MenuSidebar
        visible={menuOpen}
        onCollapse={() => setMenuOpen(false)}
        onSelect={item => {
          setMenuOpen(false);
          const destination = MENU_ROUTES[item.id];
          if (destination) {
            setRoute(destination);
          }
        }}
      />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

export default App;
