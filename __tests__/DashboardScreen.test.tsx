import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AvailabilityToggle } from '../src/components/AvailabilityToggle';
import { IncomingRequestPopup } from '../src/components/IncomingRequestPopup';
import { ProfileMenu } from '../src/components/ProfileMenu';
import { RequestCard } from '../src/components/RequestCard';
import { ServiceSwitch } from '../src/components/ServiceSwitch';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { render, textOf } from './helpers/renderWithData';
import { FIXTURE_PROFILE } from './helpers/fixtures';

/** The expertise cards print the record's own skills and languages. */
const splitList = (value: string) =>
  value.split(',').map(part => part.trim()).filter(Boolean);

const LIFE_ASPECTS = splitList(FIXTURE_PROFILE.skill);
const SKILLS = splitList(FIXTURE_PROFILE.language);

/** The two requests the mocked API answers with (see helpers/apiMock.ts). */
const REQUEST_COUNT = 2;

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

  /** The greeting follows the clock, so match any of the three. */
  expect(text).toMatch(/Good (Morning|Afternoon|Evening) ✨/);
  expect(text).toContain('Pt. Rajesh');
  expect(text).toContain('₹2,840');
  expect(text).toContain("Today's Earnings");
  expect(text).toContain('₹42,350 this month');
  expect(text).toContain('₹18,520');
  expect(text).toContain('Tap to withdraw');
  expect(text).toContain("Today's Performance");
  expect(text).toContain('12');
  expect(text).toContain('4.9');
  expect(text).toContain('94%');
  expect(text).toContain('My services');

  for (const aspect of LIFE_ASPECTS) {
    expect(text).toContain(aspect);
  }
  for (const skill of SKILLS) {
    expect(text).toContain(skill);
  }

  expect(text).toContain('Pending Requests');
  expect(text).toContain('2 New');
  expect(text).toContain('Priya Mehta');
  expect(text).toContain('Arjun Rao');
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
  expect(tree.root.findAllByType(RequestCard)).toHaveLength(REQUEST_COUNT);
  expect(onAcceptRequest).not.toHaveBeenCalled();
  expect(popup().props.request.name).toBe('Priya Mehta');

  const text = textOf(tree);
  expect(text).toContain('PM');
  expect(text).toContain('Chat Consultation');
  expect(text).toContain('Date of Birth');
  expect(text).toContain('Pune, Maharashtra');
  expect(text).toContain('Marriage timing');
  expect(text).toContain('₹ 20/min');
  expect(text).toContain('Est. Earnings:');
  expect(text).toContain('Accept');
  expect(text).toContain('Decline');

  // Declining from the popup closes it and drops the request.
  const first = popup().props.request;
  await act(() => {
    popup().props.onDecline(first);
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

  const second = popup().props.request;
  await act(() => {
    popup().props.onAccept(second);
  });
  expect(onAcceptRequest).toHaveBeenCalledWith(second);
  expect(popup().props.request).toBeNull();
});
