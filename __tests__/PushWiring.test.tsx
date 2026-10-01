/**
 * Push notifications, as the shell uses them (App.tsx): on once an astrologer
 * is signed in, a foreground push shown in the app's own dialog (but not over
 * what the socket already presents, and never over a live consultation), a
 * tapped one opening the screen its action names, and off again on sign-out —
 * before the session goes.
 *
 * services/push.ts itself is covered in push.test.ts and the route table in
 * notificationRoutes.test.ts; Firebase here is the same stub (a device that
 * grants permission and has a token).
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from '../App';
import * as messagingMock from './helpers/firebaseMessagingMock';
import { resetApiMock } from './helpers/apiMock';
import { ApplicationSubmittedScreen } from '../src/screens/ApplicationSubmittedScreen';
import { ConsultationChatScreen } from '../src/screens/ConsultationChatScreen';
import { ConsultScreen } from '../src/screens/ConsultScreen';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { EditProfileScreen } from '../src/screens/EditProfileScreen';
import { HelpSupportScreen } from '../src/screens/HelpSupportScreen';
import { NotificationsScreen } from '../src/screens/NotificationsScreen';
import { WalletScreen } from '../src/screens/WalletScreen';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';
import * as api from '../src/services/api';
import { signOut } from '../src/services/auth';
import { disablePush } from '../src/services/push';
import { clearSession, saveSession } from '../src/services/session';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** The stub jest.setup.js registered — the very object services/push.ts loads. */
const messaging = jest.requireMock('@react-native-firebase/messaging') as typeof messagingMock;
const registerDevice = api.registerDevice as jest.Mock;
const unregisterDevice = api.unregisterDevice as jest.Mock;

/** Every test mounts the whole app; on a cold transform cache or a loaded machine the first mount alone can pass Jest's 5 s. */
jest.setTimeout(20000);

type Tree = ReactTestRenderer.ReactTestRenderer;
let tree: Tree;

const act = ReactTestRenderer.act;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  });
};

/**
 * The first screen the shell settles on, once the keystore has been read —
 * Consult included, for the launch that a tapped notification routes there
 * before anything else is seen.
 */
const FIRST_SCREENS = [WelcomeScreen, DashboardScreen, ApplicationSubmittedScreen, ConsultScreen];

const renderApp = async () => {
  await act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <App />
      </SafeAreaProvider>,
    );
  });
  /** The keystore read settles over a few ticks before the shell decides where to go. */
  for (let i = 0; i < 40; i += 1) {
    await flush();
    if (FIRST_SCREENS.some(screen => tree.root.findAllByType(screen as React.ComponentType<any>).length > 0)) break;
    await act(async () => {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
    });
  }
  /** …and the first screen's own loads (the dashboard, the request queue) settle on a timer tick. */
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  });
  await flush();
  return tree;
};

const textOf = (): string => {
  const walk = (node: any): string => {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(walk).join('');
    if (typeof node === 'object') return walk(node.children);
    return '';
  };
  return walk(tree.toJSON());
};

const showing = (screen: React.ComponentType<any>) => tree.root.findAllByType(screen).length === 1;

const press = async (label: string) => {
  const target = tree.root.findAll(
    n => typeof n.type !== 'string' && typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label,
  )[0];
  if (!target) throw new Error(`nothing pressable labelled "${label}"`);
  await act(async () => {
    await target.props.onPress();
  });
  await flush();
};

/** Delivers an event the way the native side would, and lets the shell react to it. */
const deliver = async (kind: 'message' | 'opened', payload: unknown) => {
  await act(async () => {
    messaging.__emit(kind, payload);
  });
  await flush();
};

/** Switches tab the way the bottom bar does. */
const selectTab = async (screen: React.ComponentType<any>, tab: string) => {
  await act(async () => {
    tree.root.findByType(screen).props.onSelectTab(tab);
  });
  await flush();
};

/** Accepts a request from Home, which opens the live consultation. */
const openLiveConsultation = async () => {
  await act(async () => {
    tree.root.findByType(DashboardScreen).props.onAcceptRequest({ id: 'chat-priya', name: 'Priya Mehta', channel: 'chat' });
  });
  await flush();
  expect(showing(ConsultationChatScreen)).toBe(true);
};

const ASTROLOGER = { id: 'a-1', name: 'Astro Mohan', applicationStatus: 'approved', onboardingStep: 0 };
const SESSION = { accessToken: 'test-access', refreshToken: 'test-refresh', astrologer: ASTROLOGER };

const tapped = (action: string, type = 'system') => ({
  notification: { title: 'Hello', body: 'Something happened.' },
  data: { notificationId: 'n-1', type, action },
});

/** What the server sends an astrologer when a seeker asks for a consultation. */
const REQUEST_PUSH = {
  notification: { title: 'New chat request', body: 'Priya Mehta is waiting for you to accept.' },
  data: { notificationId: 'n-7', type: 'consultation_request', action: '{"screen":"consultation","id":"chat-priya"}' },
};

const PAYOUT_PUSH = {
  notification: { title: 'Withdrawal approved', body: '₹5,000 is on its way to your bank account.' },
  data: { notificationId: 'n-42', type: 'payout_approved', action: '{"screen":"wallets","id":"w-1"}' },
};

beforeEach(() => {
  jest.clearAllMocks();
  resetApiMock();
});

afterEach(async () => {
  await act(() => {
    tree.unmount();
  });
  /** push.ts keeps its state in the module; every test starts with it off. */
  await disablePush();
  await clearSession();
  jest.restoreAllMocks();
});

describe('who gets push', () => {
  test('nobody signed in: no permission is asked for and no device is registered', async () => {
    await renderApp();

    expect(showing(WelcomeScreen)).toBe(true);
    expect(messaging.requestPermission).not.toHaveBeenCalled();
    expect(messaging.getToken).not.toHaveBeenCalled();
    expect(registerDevice).not.toHaveBeenCalled();
  });

  test('reopening the app signed in registers this device for push', async () => {
    await saveSession(SESSION);
    await renderApp();

    expect(showing(DashboardScreen)).toBe(true);
    expect(registerDevice).toHaveBeenCalledTimes(1);
    expect(registerDevice).toHaveBeenCalledWith('fcm-token-1', 'ios');
  });

  test('signing in registers it too', async () => {
    await renderApp();
    expect(registerDevice).not.toHaveBeenCalled();

    await act(async () => {
      await saveSession(SESSION);
    });
    await flush();

    expect(registerDevice).toHaveBeenCalledTimes(1);
  });

  test('an astrologer still waiting on approval is registered as well — that is how "approved" reaches them', async () => {
    await saveSession({ ...SESSION, astrologer: { ...ASTROLOGER, applicationStatus: 'under_review' } });
    await renderApp();

    expect(showing(ApplicationSubmittedScreen)).toBe(true);
    expect(registerDevice).toHaveBeenCalledTimes(1);
  });
});

describe('a push with the app open', () => {
  test('is shown in the app dialog, and what is on screen is read again', async () => {
    await saveSession(SESSION);
    await renderApp();
    const fetchDashboard = jest.spyOn(api, 'fetchDashboard');
    const fetchRequests = jest.spyOn(api, 'fetchRequests');

    await deliver('message', PAYOUT_PUSH);

    expect(textOf()).toContain('Withdrawal approved');
    expect(textOf()).toContain('₹5,000 is on its way to your bank account.');
    expect(fetchDashboard).toHaveBeenCalledTimes(1);
    expect(fetchRequests).toHaveBeenCalledTimes(1);

    await press('OK');
    expect(textOf()).not.toContain('₹5,000 is on its way to your bank account.');
    /** Still on Home: a foreground push informs, it does not navigate. */
    expect(showing(DashboardScreen)).toBe(true);
  });

  test('on the Alerts tab, the feed is read again so the new one is listed', async () => {
    await saveSession(SESSION);
    await renderApp();
    await selectTab(DashboardScreen, 'alerts');
    const fetchNotificationFeed = jest.spyOn(api, 'fetchNotificationFeed');

    await deliver('message', PAYOUT_PUSH);

    expect(fetchNotificationFeed).toHaveBeenCalledTimes(1);
    expect(showing(NotificationsScreen)).toBe(true);
  });

  test('a new consultation request is not put in a dialog — the request queue is read again instead', async () => {
    await saveSession(SESSION);
    await renderApp();
    const fetchRequests = jest.spyOn(api, 'fetchRequests');

    await deliver('message', REQUEST_PUSH);

    expect(textOf()).not.toContain('New chat request');
    expect(textOf()).not.toContain('Priya Mehta is waiting for you to accept.');
    expect(fetchRequests).toHaveBeenCalledTimes(1);
  });

  test.each(['consultation_cancelled', 'consultation_ended'])('%s is left to the socket too', async type => {
    await saveSession(SESSION);
    await renderApp();

    await deliver('message', {
      notification: { title: 'Consultation update', body: 'Handled live.' },
      data: { notificationId: 'n-8', type, action: '{"screen":"consultation","id":"chat-priya"}' },
    });

    expect(textOf()).not.toContain('Consultation update');
  });

  test('nothing is drawn over a live consultation', async () => {
    await saveSession(SESSION);
    await renderApp();
    await openLiveConsultation();

    await deliver('message', PAYOUT_PUSH);

    expect(textOf()).not.toContain('Withdrawal approved');
    expect(showing(ConsultationChatScreen)).toBe(true);
  });
});

describe('a tapped push', () => {
  test('"New chat request" lands on the Consult tab, where the request is waiting on Accept / Decline', async () => {
    await saveSession(SESSION);
    await renderApp();

    await deliver('opened', REQUEST_PUSH);

    expect(showing(ConsultScreen)).toBe(true);
    expect(tree.root.findByType(ConsultScreen).props.activeTab).toBe('consult');
    expect(textOf()).toContain('Pending Requests');
    /** The card for the seeker who is waiting, with both answers on it. */
    const labels = tree.root.findAll(n => typeof n.props.onPress === 'function').map(n => n.props.accessibilityLabel);
    expect(labels).toContain('Accept Priya Mehta');
    expect(labels).toContain('Decline Priya Mehta');
  });

  test('tapped again while already on the Consult tab, the queue is read again', async () => {
    await saveSession(SESSION);
    await renderApp();
    await deliver('opened', REQUEST_PUSH);
    const fetchRequests = jest.spyOn(api, 'fetchRequests');

    await deliver('opened', REQUEST_PUSH);

    expect(showing(ConsultScreen)).toBe(true);
    expect(fetchRequests).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['{"screen":"wallets","id":"w-1"}', 'the Wallet tab', WalletScreen],
    ['{"screen":"wallet"}', 'the Wallet tab', WalletScreen],
    ['{"screen":"support","id":"t-1"}', 'Help & Support', HelpSupportScreen],
    ['{"screen":"profileEdit"}', 'the profile edit screen', EditProfileScreen],
    ['{"screen":"order","id":"o-1"}', 'the Alerts tab', NotificationsScreen],
    ['{"screen":"something-new"}', 'the Alerts tab', NotificationsScreen],
    ['', 'the Alerts tab', NotificationsScreen],
    ['not json', 'the Alerts tab', NotificationsScreen],
  ])('action %s opens %s', async (action, _name, screen) => {
    await saveSession(SESSION);
    await renderApp();

    await deliver('opened', tapped(action));

    expect(showing(screen as React.ComponentType<any>)).toBe(true);
    expect(showing(DashboardScreen)).toBe(false);
  });

  test.each(['{"screen":"dashboard"}', '{"screen":"astrologer","id":"a-1"}'])(
    'action %s opens Home, from whichever tab was showing',
    async action => {
      await saveSession(SESSION);
      await renderApp();
      await selectTab(DashboardScreen, 'wallet');
      expect(showing(WalletScreen)).toBe(true);

      await deliver('opened', tapped(action));

      expect(showing(DashboardScreen)).toBe(true);
      expect(showing(WalletScreen)).toBe(false);
    },
  );

  test('from a screen pushed over the tabs, it still gets to its tab', async () => {
    await saveSession(SESSION);
    await renderApp();
    await deliver('opened', tapped('{"screen":"support"}'));
    expect(showing(HelpSupportScreen)).toBe(true);

    await deliver('opened', PAYOUT_PUSH);

    expect(showing(WalletScreen)).toBe(true);
    expect(showing(HelpSupportScreen)).toBe(false);
  });

  test('the notification that launched the app is routed once the signed-in shell is up', async () => {
    messaging.getInitialNotification.mockResolvedValueOnce(REQUEST_PUSH);
    await saveSession(SESSION);
    await renderApp();
    await flush();

    expect(showing(ConsultScreen)).toBe(true);
    expect(showing(DashboardScreen)).toBe(false);
  });

  test('never pulls the astrologer out of a live consultation', async () => {
    await saveSession(SESSION);
    await renderApp();
    await openLiveConsultation();

    await deliver('opened', REQUEST_PUSH);
    await deliver('opened', PAYOUT_PUSH);

    expect(showing(ConsultationChatScreen)).toBe(true);
    expect(showing(ConsultScreen)).toBe(false);
    expect(showing(WalletScreen)).toBe(false);
  });

  test('does not take an astrologer who is not approved yet into a dashboard they do not have', async () => {
    await saveSession({ ...SESSION, astrologer: { ...ASTROLOGER, applicationStatus: 'under_review' } });
    await renderApp();

    await deliver('opened', tapped('{"screen":"dashboard"}'));
    await deliver('opened', REQUEST_PUSH);

    expect(showing(ApplicationSubmittedScreen)).toBe(true);
    expect(showing(DashboardScreen)).toBe(false);
    expect(showing(ConsultScreen)).toBe(false);
  });
});

describe('signing out', () => {
  test('takes the device off the account before the session is ended', async () => {
    await saveSession(SESSION);
    await renderApp();

    await act(async () => {
      await tree.root.findByType(DashboardScreen).props.onLogout();
    });
    await flush();

    expect(unregisterDevice).toHaveBeenCalledTimes(1);
    expect(unregisterDevice).toHaveBeenCalledWith('fcm-token-1');
    expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(unregisterDevice.mock.invocationCallOrder[0]).toBeLessThan((signOut as jest.Mock).mock.invocationCallOrder[0]);

    /** And nothing that arrives afterwards is shown to whoever picks the phone up next. */
    await deliver('message', PAYOUT_PUSH);
    expect(textOf()).not.toContain('Withdrawal approved');
  });

  test('a session that ends by itself still drops the token from this phone', async () => {
    await saveSession(SESSION);
    await renderApp();
    expect(registerDevice).toHaveBeenCalledTimes(1);

    /** What the HTTP client does when a refresh token turns out to be spent. */
    await act(async () => {
      await clearSession();
    });
    await flush();

    expect(showing(DashboardScreen)).toBe(false);
    expect(messaging.deleteToken).toHaveBeenCalledTimes(1);
  });
});
