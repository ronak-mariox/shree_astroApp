import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from '../App';
import { NotificationCard } from '../src/components/NotificationCard';
import { NOTIFICATIONS } from '../src/data/notifications';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { LoginScreen } from '../src/screens/LoginScreen';
import { NotificationsScreen } from '../src/screens/NotificationsScreen';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { OtpVerificationScreen } from '../src/screens/OtpVerificationScreen';
import { AstrologerWelcomeScreen } from '../src/screens/AstrologerWelcomeScreen';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the feed draws a lot of SVG the JSON dump
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

/**
 * The pressable behind a control. Pressable puts `accessibilityRole` on both its
 * composite and its host node, but only the composite carries `onPress`.
 */
const pressablesWithRole = (
  node: ReactTestRenderer.ReactTestInstance,
  role: string,
) =>
  node.findAll(
    child =>
      child.props.accessibilityRole === role &&
      typeof child.props.onPress === 'function',
  );

test('the feed lists every notification under an unread count', async () => {
  const tree = await render(<NotificationsScreen />);
  const text = textOf(tree);

  expect(text).toContain('Notifications');
  expect(text).toContain('2 unread');

  for (const notification of NOTIFICATIONS) {
    expect(text).toContain(notification.title);
    expect(text).toContain(notification.body);
    expect(text).toContain(notification.age);
  }

  expect(tree.root.findAllByType(NotificationCard)).toHaveLength(
    NOTIFICATIONS.length,
  );
});

test('the two newest arrive unread and the rest do not', async () => {
  const tree = await render(<NotificationsScreen />);

  expect(
    tree.root
      .findAllByType(NotificationCard)
      .map(card => card.props.notification.unread),
  ).toEqual([true, true, false, false, false]);
});

test('reading a notification ticks the header count down', async () => {
  const tree = await render(<NotificationsScreen />);

  const cards = () => tree.root.findAllByType(NotificationCard);

  await act(() => {
    cards()[0].props.onPress();
  });
  expect(cards()[0].props.notification.unread).toBe(false);
  expect(textOf(tree)).toContain('1 unread');

  await act(() => {
    cards()[1].props.onPress();
  });
  expect(textOf(tree)).toContain('All caught up');
});

test('the tab bar marks Alerts as the selected tab', async () => {
  const onSelectTab = jest.fn();
  const tree = await render(<NotificationsScreen onSelectTab={onSelectTab} />);

  const tabs = pressablesWithRole(tree.root, 'tab');
  expect(tabs).toHaveLength(5);
  expect(tabs.map(tab => tab.props.accessibilityState.selected)).toEqual([
    false,
    false,
    false,
    true,
    false,
  ]);

  await act(() => {
    tabs[0].props.onPress();
  });
  expect(onSelectTab).toHaveBeenCalledWith('home');
});

test('the Alerts tab swaps the dashboard for the feed and Home swaps back', async () => {
  const tree = await render(<App />);

  // Walk the sign-in flow to the dashboard.
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
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(1);

  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('alerts');
  });
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(0);
  expect(tree.root.findAllByType(NotificationsScreen)).toHaveLength(1);
  expect(textOf(tree)).toContain('2 unread');

  // Menu is the only tab still without a screen, so it leaves the feed put.
  await act(() => {
    tree.root.findByType(NotificationsScreen).props.onSelectTab('menu');
  });
  expect(tree.root.findAllByType(NotificationsScreen)).toHaveLength(1);

  await act(() => {
    tree.root.findByType(NotificationsScreen).props.onSelectTab('home');
  });
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(1);
  expect(tree.root.findAllByType(NotificationsScreen)).toHaveLength(0);
});
