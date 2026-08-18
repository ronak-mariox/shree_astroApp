import React from 'react';
import { Modal } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from '../App';
import { MenuSidebar } from '../src/components/MenuSidebar';
import { MENU_ITEMS, MENU_PROFILE } from '../src/data/menu';
import { AstrologerWelcomeScreen } from '../src/screens/AstrologerWelcomeScreen';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { LoginScreen } from '../src/screens/LoginScreen';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { OtpVerificationScreen } from '../src/screens/OtpVerificationScreen';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the drawer draws a lot of SVG the JSON dump
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

const byLabel = (
  node: ReactTestRenderer.ReactTestInstance,
  label: string,
) =>
  node.find(
    child =>
      child.props.accessibilityLabel === label &&
      typeof child.props.onPress === 'function',
  );

test('the sidebar lists the profile and all ten entries', async () => {
  const tree = await render(
    <MenuSidebar visible onCollapse={jest.fn()} />,
  );
  const text = textOf(tree);

  expect(text).toContain(MENU_PROFILE.name);
  expect(text).toContain(MENU_PROFILE.phone);
  for (const item of MENU_ITEMS) {
    expect(text).toContain(item.label);
  }

  // Delete Account is the one destructive entry.
  expect(MENU_ITEMS.filter(item => item.destructive)).toHaveLength(1);
  expect(MENU_ITEMS[MENU_ITEMS.length - 1].label).toBe('Delete Account');
});

test('the drawer travels in from the left, not up from the bottom', async () => {
  const tree = await render(<MenuSidebar visible onCollapse={jest.fn()} />);

  // Modal's built-in slide only ever comes from the bottom, so it is off.
  expect(tree.root.findByType(Modal).props.animationType).toBe('none');

  // The panel is moved on the x axis, and starts fully off the left edge.
  const drawer = tree.root.find(
    node =>
      Array.isArray(node.props.style) &&
      node.props.style.some(
        (entry: any) => entry && Array.isArray(entry.transform),
      ),
  );
  const transform = drawer.props.style
    .filter((entry: any) => entry && Array.isArray(entry.transform))
    .flatMap((entry: any) => entry.transform)[0];

  // Horizontal travel only — a vertical one would be a translateY.
  expect(Object.keys(transform)).toEqual(['translateX']);
  // Fully open, so the panel has finished arriving at the left edge.
  expect(transform.translateX.__getValue()).toBe(0);

  // And it is the leading child, hugging that edge, with the scrim beside it.
  const stage = tree.root.find(
    node =>
      typeof node.type === 'string' &&
      node.props.style?.flexDirection === 'row',
  );
  const [panel, scrim] = stage.props.children;
  expect(panel.props.style[0].width).toBe(323);
  expect(scrim.props.style[0].flex).toBe(1);
});

test('the handle, the scrim and an entry all collapse it', async () => {
  const onCollapse = jest.fn();
  const onSelect = jest.fn();
  const tree = await render(
    <MenuSidebar visible onCollapse={onCollapse} onSelect={onSelect} />,
  );

  await act(() => {
    byLabel(tree.root, 'Collapse menu').props.onPress();
  });
  expect(onCollapse).toHaveBeenCalledTimes(1);

  await act(() => {
    byLabel(tree.root, 'Close menu').props.onPress();
  });
  expect(onCollapse).toHaveBeenCalledTimes(2);

  await act(() => {
    byLabel(tree.root, 'Dashboard').props.onPress();
  });
  expect(onSelect).toHaveBeenCalledWith(MENU_ITEMS[0]);
});

test('the Menu tab opens the drawer over the tab that is showing', async () => {
  const tree = await render(<App />);

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

  const sidebar = () => tree.root.findByType(MenuSidebar);
  expect(sidebar().props.visible).toBe(false);

  await act(() => {
    tree.root.findByType(DashboardScreen).props.onSelectTab('menu');
  });

  // The drawer opens and the dashboard stays behind it.
  expect(sidebar().props.visible).toBe(true);
  expect(tree.root.findAllByType(DashboardScreen)).toHaveLength(1);

  await act(() => {
    sidebar().props.onCollapse();
  });
  expect(sidebar().props.visible).toBe(false);
});
