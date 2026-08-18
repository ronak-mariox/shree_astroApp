import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AvailabilityToggle } from '../src/components/AvailabilityToggle';
import { IncomingRequestPopup } from '../src/components/IncomingRequestPopup';
import { ProfileMenu } from '../src/components/ProfileMenu';
import { RequestCard } from '../src/components/RequestCard';
import { ServiceSwitch } from '../src/components/ServiceSwitch';
import {
  LIFE_ASPECTS,
  PENDING_REQUESTS,
  SKILLS,
} from '../src/data/dashboard';
import { DashboardScreen } from '../src/screens/DashboardScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the screen draws a lot of SVG the JSON dump
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

test('dashboard renders every section of the home screen', async () => {
  const text = textOf(await render(<DashboardScreen />));

  expect(text).toContain('Good Morning ✨');
  expect(text).toContain('Pt. Rajesh');
  expect(text).toContain('₹2,840');
  expect(text).toContain("Today's Earnings");
  expect(text).toContain('+₹340 this hour');
  expect(text).toContain('₹18,520');
  expect(text).toContain('Tap to withdraw');
  expect(text).toContain("Today's Performance");
  expect(text).toContain('12');
  expect(text).toContain('4.9');
  expect(text).toContain('94%');
  expect(text).toContain('My services');
  expect(text).toContain('Online Time');
  expect(text).toContain('01 Dec 12:00 PM');

  for (const aspect of LIFE_ASPECTS) {
    expect(text).toContain(aspect);
  }
  for (const skill of SKILLS) {
    expect(text).toContain(skill);
  }

  expect(text).toContain('Pending Requests');
  expect(text).toContain('3 New');
  expect(text).toContain('Priya Mehta');
  expect(text).toContain('Marriage timing');
  expect(text).toContain('Arjun Rao');
  expect(text).toContain('Career & job change');
});

test('the tab bar marks Home as the selected tab', async () => {
  const onSelectTab = jest.fn();
  const tree = await render(<DashboardScreen onSelectTab={onSelectTab} />);

  const tabs = pressablesWithRole(tree.root, 'tab');
  expect(tabs).toHaveLength(5);
  expect(tabs.map(tab => tab.props.accessibilityState.selected)).toEqual([
    true,
    false,
    false,
    false,
    false,
  ]);

  await act(() => {
    tabs[1].props.onPress();
  });
  expect(onSelectTab).toHaveBeenCalledWith('consult');
});

test('availability starts online and can be switched off', async () => {
  const tree = await render(<DashboardScreen />);

  const segments = () =>
    pressablesWithRole(tree.root.findByType(AvailabilityToggle), 'radio');
  expect(segments().map(s => s.props.accessibilityState.selected)).toEqual([
    false,
    true,
  ]);

  await act(() => {
    segments()[0].props.onPress();
  });
  expect(segments().map(s => s.props.accessibilityState.selected)).toEqual([
    true,
    false,
  ]);
});

test('each service switch flips on its own', async () => {
  const tree = await render(<DashboardScreen />);

  const switches = () => tree.root.findAllByType(ServiceSwitch);
  expect(switches().map(item => item.props.value)).toEqual([false, false]);

  await act(() => {
    switches()[1].props.onValueChange(true);
  });
  expect(switches().map(item => item.props.value)).toEqual([false, true]);
});

test('either button on a request card opens its brief instead of answering', async () => {
  const onAcceptRequest = jest.fn();
  const tree = await render(
    <DashboardScreen onAcceptRequest={onAcceptRequest} />,
  );

  const popup = () => tree.root.findByType(IncomingRequestPopup);
  expect(popup().props.request).toBeNull();

  await act(() => {
    tree.root.findAllByType(RequestCard)[0].props.onAccept();
  });

  // The card is still on the list; the popup is now showing its details.
  expect(tree.root.findAllByType(RequestCard)).toHaveLength(
    PENDING_REQUESTS.length,
  );
  expect(onAcceptRequest).not.toHaveBeenCalled();
  expect(popup().props.request).toEqual(PENDING_REQUESTS[0]);

  const text = textOf(tree);
  expect(text).toContain('PM');
  expect(text).toContain('Chat Consultation');
  expect(text).toContain('Date of Birth');
  expect(text).toContain('15 June 1992, 06:30 AM');
  expect(text).toContain('Mumbai, Maharashtra');
  expect(text).toContain('Marriage Timing & Compatibility');
  expect(text).toContain('₹25/min');
  expect(text).toContain('20–30 minutes');
  expect(text).toContain('Est. Earnings:');
  expect(text).toContain('₹500 – ₹750');
  expect(text).toContain('Accept');
  expect(text).toContain('Decline');

  // Declining from the popup closes it and drops the request.
  await act(() => {
    popup().props.onDecline(PENDING_REQUESTS[0]);
  });
  expect(popup().props.request).toBeNull();
  expect(textOf(tree)).not.toContain('Priya Mehta');
  expect(onAcceptRequest).not.toHaveBeenCalled();
});

test('the header avatar opens a dropdown whose four entries all lead somewhere', async () => {
  const handlers = {
    onViewProfile: jest.fn(),
    onBankDetails: jest.fn(),
    onDocuments: jest.fn(),
    onLogout: jest.fn(),
  };
  const tree = await render(<DashboardScreen {...handlers} />);

  const menu = () => tree.root.findByType(ProfileMenu);
  const avatar = () =>
    tree.root.find(
      node =>
        node.props.accessibilityLabel === 'Profile menu' &&
        typeof node.props.onPress === 'function',
    );

  expect(menu().props.visible).toBe(false);

  await act(() => {
    avatar().props.onPress();
  });
  expect(menu().props.visible).toBe(true);

  const rows = pressablesWithRole(menu(), 'button');
  expect(rows.map(row => row.props.accessibilityLabel)).toEqual([
    'View Profile',
    'Bank Details',
    'Documents',
    'Logout',
  ]);

  // Tapping off the card closes it again.
  await act(() => {
    menu().props.onDismiss();
  });
  expect(menu().props.visible).toBe(false);

  // Every entry fires its own handler and closes the menu behind it.
  for (const [index, handler] of [
    handlers.onViewProfile,
    handlers.onBankDetails,
    handlers.onDocuments,
    handlers.onLogout,
  ].entries()) {
    await act(() => {
      avatar().props.onPress();
    });
    await act(() => {
      pressablesWithRole(menu(), 'button')[index].props.onPress();
    });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(menu().props.visible).toBe(false);
  }
});

test('accepting from the popup reports the request and clears the list', async () => {
  const onAcceptRequest = jest.fn();
  const tree = await render(
    <DashboardScreen onAcceptRequest={onAcceptRequest} />,
  );

  const popup = () => tree.root.findByType(IncomingRequestPopup);

  // The voice request opens with its own channel tag.
  await act(() => {
    tree.root.findAllByType(RequestCard)[1].props.onDecline();
  });
  expect(textOf(tree)).toContain('Voice Consultation');

  await act(() => {
    popup().props.onAccept(PENDING_REQUESTS[1]);
  });
  expect(onAcceptRequest).toHaveBeenCalledWith(PENDING_REQUESTS[1]);
  expect(tree.root.findAllByType(RequestCard)).toHaveLength(1);
  expect(popup().props.request).toBeNull();
});
