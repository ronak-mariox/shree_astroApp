import { HISTORY_ENTRIES, HISTORY_TOTAL } from './helpers/fixtures';
import React from 'react';
import { Linking, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDialogProvider } from '../src/components/AppDialogProvider';

import App from '../App';
import { ChatComposer } from '../src/components/ChatComposer';
import { HistoryCard } from '../src/components/HistoryCard';
import { MenuSidebar } from '../src/components/MenuSidebar';

import { MENU_ITEMS } from '../src/data/menu';
import { AstrologerWelcomeScreen } from '../src/screens/AstrologerWelcomeScreen';
import { ConsultationChatScreen } from '../src/screens/ConsultationChatScreen';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { HelpSupportScreen } from '../src/screens/HelpSupportScreen';
import { HistoryScreen } from '../src/screens/HistoryScreen';
import { LoginScreen } from '../src/screens/LoginScreen';
import { ConsultScreen } from '../src/screens/ConsultScreen';
import { WalletScreen } from '../src/screens/WalletScreen';
import { WithdrawMoneyScreen } from '../src/screens/WithdrawMoneyScreen';
import { WithdrawSuccessScreen } from '../src/screens/WithdrawSuccessScreen';
import { StatCard } from '../src/components/StatCard';
import { AppDataProvider } from '../src/state/AppDataProvider';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { PriceChangeScreen } from '../src/screens/PriceChangeScreen';
import { OtpVerificationScreen } from '../src/screens/OtpVerificationScreen';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 402, height: 893 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the screens draw a lot of SVG the JSON dump
 *  would otherwise drown the assertions in. */
const textOf = (tree: ReactTestRenderer.ReactTestRenderer): string => {
  const walk = (node: any): string => {
    if (node === null || node === undefined) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(walk).join('');
    if (typeof node === 'object') return walk(node.children);
    return '';
  };
  return walk(tree.toJSON());
};

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

const render = async (element: React.ReactElement) => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <AppDialogProvider>{element}</AppDialogProvider>
      </SafeAreaProvider>,
    );
  });
  mounted.push(tree);
  return tree;
};

afterEach(async () => {
  await ReactTestRenderer.act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});

const act = ReactTestRenderer.act;

/**
 * The composite pressable behind a labelled control — a dialog action, say.
 * `Pressable` puts the label on both its composite and host node; only the
 * composite carries `onPress`.
 */
const pressableLabelled = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root.find(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  );

/** Presses a labelled control and lets whatever it kicked off settle. */
const press = async (tree: ReactTestRenderer.ReactTestRenderer, label: string) => {
  await act(async () => {
    await pressableLabelled(tree, label).props.onPress();
  });
};

/** Walks a fresh app to the signed-in dashboard. */
const signIn = async (tree: ReactTestRenderer.ReactTestRenderer) => {
  await act(() => {
    tree.root.findByType(WelcomeScreen).props.onLogin();
  });
  await act(() => {
    tree.root.findByType(OnboardingScreen).props.onFinish();
  });
  await act(() => {
    tree.root.findByType(AstrologerWelcomeScreen).props.onLogin();
  });
  await act(() => {
    tree.root.findByType(LoginScreen).props.onSendOtp('9876543210');
  });
  await act(() => {
    tree.root.findByType(OtpVerificationScreen).props.onVerified();
  });
};

test('chat history renders the total and a card per consultation', async () => {
  const tree = await render(<HistoryScreen variant="chat" />);
  const text = textOf(tree);

  expect(text).toContain('Chat History');
  expect(text).toContain(HISTORY_TOTAL);
  expect(text).toContain('Total Earnings');
  expect(text).toContain('User Name');
  expect(text).toContain('Jeeshan Chandravanshi');
  expect(text).toContain('Amount Received');
  expect(text).toContain('₹49.00');
  expect(text).toContain('Date & Time');
  expect(text).toContain('05 Sep 2025, 12:55 PM');
  expect(text).toContain('Duration');
  expect(text).toContain('1 min');
  expect(text).toContain('Refund Status');
  expect(text).toContain('Refund Date');
  expect(text).toContain('Refund');
  expect(text).toContain('Block');

  expect(tree.root.findAllByType(HistoryCard)).toHaveLength(
    HISTORY_ENTRIES.length,
  );
  expect(
    tree.root.findAllByType(HistoryCard).map(card => card.props.primaryAction),
  ).toEqual(HISTORY_ENTRIES.map(() => 'Chat'));
});

test('call history is the same ledger without a transcript pill', async () => {
  const tree = await render(<HistoryScreen variant="call" />);
  const text = textOf(tree);

  expect(text).toContain('Call History');
  expect(text).not.toContain('Chat History');
  /** A voice consultation leaves nothing to open — no "Audio" (or "Chat") pill, only Refund and Block. */
  expect(text).not.toContain('Audio');
  expect(
    tree.root.findAllByType(HistoryCard).map(card => card.props.primaryAction),
  ).toEqual(HISTORY_ENTRIES.map(() => undefined));
  expect(text).toContain('Refund');
  expect(text).toContain('Block');
});

test('the search pill filters the ledger', async () => {
  const tree = await render(<HistoryScreen variant="chat" />);
  const field = () => tree.root.findByType(TextInput);

  expect(field().props.placeholder).toBe('Search here');

  await act(() => {
    field().props.onChangeText('jeeshan');
  });
  expect(tree.root.findAllByType(HistoryCard)).toHaveLength(
    HISTORY_ENTRIES.length,
  );

  await act(() => {
    field().props.onChangeText('nobody');
  });
  expect(tree.root.findAllByType(HistoryCard)).toHaveLength(0);
});

test('the sidebar opens each history and back returns to the dashboard', async () => {
  const tree = await render(<App />);
  await signIn(tree);

  const sidebar = () => tree.root.findByType(MenuSidebar);
  const chatHistory = MENU_ITEMS.find(item => item.id === 'chat-history');
  const callHistory = MENU_ITEMS.find(item => item.id === 'call-history');

  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });
  await act(() => {
    sidebar().props.onSelect(chatHistory);
  });

  expect(sidebar().props.visible).toBe(false);
  expect(tree.root.findByType(HistoryScreen).props.variant).toBe('chat');

  await act(() => {
    tree.root.findByType(HistoryScreen).props.onBack();
  });
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(1);

  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });
  await act(() => {
    sidebar().props.onSelect(callHistory);
  });
  expect(tree.root.findByType(HistoryScreen).props.variant).toBe('call');
});

test('tapping a history card opens that past consultation as a read-only transcript', async () => {
  const tree = await render(<App />);
  await signIn(tree);

  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });
  const chatHistory = MENU_ITEMS.find(item => item.id === 'chat-history');
  await act(() => {
    tree.root.findByType(MenuSidebar).props.onSelect(chatHistory);
  });

  const card = tree.root.findAllByType(HistoryCard)[0];
  await act(() => {
    card.props.onPrimary();
  });

  const chatScreen = tree.root.findByType(ConsultationChatScreen);
  expect(chatScreen.props.chatId).toBe(HISTORY_ENTRIES[0].id);
  expect(chatScreen.props.peerName).toBe(HISTORY_ENTRIES[0].userName);
  expect(chatScreen.props.readOnly).toBe(true);
  // A finished consultation has nothing left to compose into.
  expect(tree.root.findAllByType(ChatComposer)).toHaveLength(0);

  // Leaving a past consultation returns to the history list it came from, not the dashboard.
  await act(() => {
    chatScreen.props.onLeave();
  });
  expect(tree.root.findByType(HistoryScreen).props.variant).toBe('chat');
});

test('"Missed Call" collapses the drawer onto the Consult tab, where missed requests are listed', async () => {
  const tree = await render(<App />);
  await signIn(tree);

  const sidebar = () => tree.root.findByType(MenuSidebar);
  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });
  await act(() => {
    sidebar().props.onSelect(MENU_ITEMS.find(item => item.id === 'missed-call'));
  });

  expect(sidebar().props.visible).toBe(false);
  expect(tree.root.findAllByType(HistoryScreen)).toHaveLength(0);
  expect(tree.root.findAllByType(ConsultScreen)).toHaveLength(1);
});

test('"Delete Account" asks for confirmation, then opens a deletion request to support', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
  const tree = await render(<App />);
  await signIn(tree);

  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });
  await act(() => {
    tree.root.findByType(MenuSidebar).props.onSelect(MENU_ITEMS.find(item => item.id === 'delete-account'));
  });
  expect(tree.root.findByType(MenuSidebar).props.visible).toBe(false);
  /** The app's own dialog, not the OS box: both choices are there, nothing sent yet. */
  expect(textOf(tree)).toContain('Delete account?');
  expect(pressableLabelled(tree, 'Cancel')).toBeTruthy();
  expect(pressableLabelled(tree, 'Request deletion')).toBeTruthy();
  expect(openURL).not.toHaveBeenCalled();

  await press(tree, 'Request deletion');
  expect(openURL).toHaveBeenCalledWith(expect.stringMatching(/^mailto:.+\?subject=Delete%20my%20astrologer%20account$/));
  expect(textOf(tree)).not.toContain('Delete account?');
  jest.restoreAllMocks();
});

test.each([
  ['price-change', PriceChangeScreen],
  ['help', HelpSupportScreen],
])('the %s entry opens its own screen', async (id, Screen) => {
  const tree = await render(<App />);
  await signIn(tree);

  const sidebar = () => tree.root.findByType(MenuSidebar);
  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });
  await act(async () => {
    sidebar().props.onSelect(MENU_ITEMS.find(item => item.id === id));
  });

  expect(sidebar().props.visible).toBe(false);
  expect(tree.root.findAllByType(Screen)).toHaveLength(1);
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(0);
});

describe('dashboard stat cards', () => {
  const card = (tree: ReactTestRenderer.ReactTestRenderer, caption: string) =>
    tree.root.findAllByType(StatCard).find(entry => entry.props.caption === caption)!;

  test('"Today\'s Earnings" opens the Wallet tab (earnings and ledger)', async () => {
    const tree = await render(<App />);
    await signIn(tree);
    expect(card(tree, "Today's Earnings").props.onPress).toEqual(expect.any(Function));
    await act(() => {
      card(tree, "Today's Earnings").props.onPress();
    });
    expect(tree.root.findAllByType(WalletScreen)).toHaveLength(1);
    expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(0);
  });

  test('"Wallet Balance" opens withdraw; its success screen goes back to the Wallet tab', async () => {
    const tree = await render(<App />);
    await signIn(tree);
    await act(() => {
      card(tree, 'Wallet Balance').props.onPress();
    });
    const withdraw = tree.root.findByType(WithdrawMoneyScreen);

    // Backing out returns to the dashboard it came from.
    await act(() => {
      withdraw.props.onBack();
    });
    expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(1);

    await act(() => {
      card(tree, 'Wallet Balance').props.onPress();
    });
    await act(() => {
      tree.root.findByType(WithdrawMoneyScreen).props.onConfirm('500');
    });
    await act(() => {
      tree.root.findByType(WithdrawSuccessScreen).props.onBackToWallet();
    });
    expect(tree.root.findAllByType(WalletScreen)).toHaveLength(1);
  });

  test('performance "View All" opens the consultation (chat) history', async () => {
    const tree = await render(<App />);
    await signIn(tree);
    await act(() => {
      tree.root.findByType(DashboardScreen).props.onViewPerformance();
    });
    expect(tree.root.findByType(HistoryScreen).props.variant).toBe('chat');
  });
});

describe('help & support quick help', () => {
  test('"Email Us" opens a mail to support; "Live Chat" explains and offers email', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    const tree = await render(
      <AppDataProvider>
        <HelpSupportScreen />
      </AppDataProvider>,
    );

    await press(tree, 'Email Us');
    expect(openURL).toHaveBeenCalledWith(expect.stringMatching(/^mailto:support@shreeastro\.com\?subject=/));

    openURL.mockClear();
    await press(tree, 'Live Chat');
    expect(textOf(tree)).toContain('Live chat');
    expect(textOf(tree)).toContain("Live chat isn't available yet.");
    expect(pressableLabelled(tree, 'OK')).toBeTruthy();
    /** Its "Email us" is the same mail as the Email Us tile. */
    await press(tree, 'Email us');
    await act(async () => {
      await Promise.resolve();
    });
    expect(openURL).toHaveBeenCalledWith(expect.stringMatching(/^mailto:support@shreeastro\.com\?subject=/));
    jest.restoreAllMocks();
  });
});

describe('history card actions', () => {
  test('Refund and Block confirm, then file a support request naming the consultation', async () => {
    const api = require('../src/services/api');
    const dispute = jest.spyOn(api, 'submitDispute').mockResolvedValue(undefined as never);
    const tree = await render(<HistoryScreen variant="chat" />);
    const card = tree.root.findAllByType(HistoryCard)[0];

    await act(() => {
      card.props.onRefund();
    });
    expect(textOf(tree)).toContain('Request a refund?');
    await press(tree, 'Request refund');
    expect(dispute).toHaveBeenCalledWith(expect.objectContaining({
      issueType: 'astrologer',
      description: expect.stringContaining(`Refund ${HISTORY_ENTRIES[0].userName} — consultation ${HISTORY_ENTRIES[0].id}`),
    }));
    expect(textOf(tree)).toContain('Request sent');
    expect(textOf(tree)).not.toContain('Request a refund?');

    await press(tree, 'OK');
    expect(textOf(tree)).not.toContain('Request sent');

    await act(() => {
      card.props.onBlock();
    });
    expect(textOf(tree)).toContain('Block this seeker?');
    await press(tree, 'Request block');
    expect(dispute).toHaveBeenLastCalledWith(expect.objectContaining({ description: expect.stringContaining(`Block ${HISTORY_ENTRIES[0].userName}`) }));
    expect(textOf(tree)).toContain('Request sent');
    jest.restoreAllMocks();
  });

  test('Cancel on the confirm files nothing', async () => {
    const api = require('../src/services/api');
    const dispute = jest.spyOn(api, 'submitDispute').mockResolvedValue(undefined as never);
    const tree = await render(<HistoryScreen variant="chat" />);

    await act(() => {
      tree.root.findAllByType(HistoryCard)[0].props.onRefund();
    });
    expect(textOf(tree)).toContain('Request a refund?');
    await press(tree, 'Cancel');
    expect(dispute).not.toHaveBeenCalled();
    expect(textOf(tree)).not.toContain('Request a refund?');
    expect(textOf(tree)).not.toContain('Request sent');
    jest.restoreAllMocks();
  });

  test('a request support could not take says so', async () => {
    const api = require('../src/services/api');
    const dispute = jest.spyOn(api, 'submitDispute').mockRejectedValue(new Error('Support is offline'));
    const tree = await render(<HistoryScreen variant="chat" />);

    await act(() => {
      tree.root.findAllByType(HistoryCard)[0].props.onBlock();
    });
    await press(tree, 'Request block');
    expect(dispute).toHaveBeenCalledTimes(1);
    expect(textOf(tree)).toContain('Could not send');
    expect(textOf(tree)).toContain('Support is offline');
    jest.restoreAllMocks();
  });

  test('the sidebar\'s edit (pencil) opens Edit Profile', async () => {
    const tree = await render(<App />);
    await signIn(tree);
    await act(() => {
      tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
    });
    await act(() => {
      tree.root.findByType(MenuSidebar).props.onEditProfile();
    });
    expect(tree.root.findByType(MenuSidebar).props.visible).toBe(false);
    const { EditProfileScreen } = require('../src/screens/EditProfileScreen');
    expect(tree.root.findAllByType(EditProfileScreen)).toHaveLength(1);
  });
});
