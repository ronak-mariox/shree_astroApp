import { HISTORY_ENTRIES, HISTORY_TOTAL } from './helpers/fixtures';
import React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import { MyReviewsScreen } from '../src/screens/MyReviewsScreen';
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
      <SafeAreaProvider initialMetrics={METRICS}>{element}</SafeAreaProvider>,
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

test('call history is the same ledger with an Audio action', async () => {
  const tree = await render(<HistoryScreen variant="call" />);
  const text = textOf(tree);

  expect(text).toContain('Call History');
  expect(text).not.toContain('Chat History');
  expect(text).toContain('Audio');

  expect(
    tree.root.findAllByType(HistoryCard).map(card => card.props.primaryAction),
  ).toEqual(HISTORY_ENTRIES.map(() => 'Audio'));
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

test('an entry without a screen of its own only collapses the drawer', async () => {
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
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(1);
});

test.each([
  ['price-change', PriceChangeScreen],
  ['my-review', MyReviewsScreen],
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
