import React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  BUBBLE_WIDTH,
  ChatBubble,
  QUOTED_BUBBLE_WIDTH,
} from '../src/components/ChatBubble';
import { ChatComposer } from '../src/components/ChatComposer';
import { KundliSheet } from '../src/components/KundliSheet';
import { LeaveChatDialog } from '../src/components/LeaveChatDialog';
import {
  CHAT_TRANSCRIPT,
  DASHA_LEVELS,
  DASHA_ROWS,
} from '../src/data/chat';
import { ConsultationChatScreen } from '../src/screens/ConsultationChatScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
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

const byLabel = (
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) =>
  tree.root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );

test('chat renders the header, transcript and composer', async () => {
  const tree = await render(<ConsultationChatScreen />);
  const text = textOf(tree);

  expect(text).toContain('Astro Rakesh');
  expect(text).toContain('(04:58 mins)');
  expect(text).toContain('Below are my details:');
  expect(text).toContain('DOB: 08-Feb-1999');
  expect(text).toContain('Generate Kundli');
  expect(text).toContain('Welcome to KarmaGuru');
  expect(text).toContain('10:52 AM');

  // The composer's prompt is a placeholder, so it lives on the input's props.
  expect(
    tree.root.findByType(ChatComposer).findByType(TextInput).props.placeholder,
  ).toBe('Ask your question...');

  expect(tree.root.findAllByType(ChatBubble)).toHaveLength(
    CHAT_TRANSCRIPT.length,
  );
});

test('bubbles keep the widths and tail corners Figma gives them', async () => {
  const tree = await render(<ConsultationChatScreen />);
  const bubbles = tree.root.findAllByType(ChatBubble);

  expect(bubbles.map(bubble => bubble.props.message.tail)).toEqual([
    'right',
    'left',
    'left',
    'right',
    'left',
  ]);

  // Every bubble is drawn at 193pt, except the quoted one at 202.3pt.
  const widths = bubbles.map(bubble =>
    bubble.props.message.quote ? QUOTED_BUBBLE_WIDTH : BUBBLE_WIDTH,
  );
  expect(widths).toEqual([
    BUBBLE_WIDTH,
    BUBBLE_WIDTH,
    QUOTED_BUBBLE_WIDTH,
    BUBBLE_WIDTH,
    BUBBLE_WIDTH,
  ]);
});

test('the quoted message keeps its quote card above the reply', async () => {
  const tree = await render(<ConsultationChatScreen />);
  const quoted = tree.root
    .findAllByType(ChatBubble)
    .find(bubble => bubble.props.message.quote !== undefined);

  expect(quoted).toBeDefined();
  expect(quoted?.props.message.quote.lines).toEqual([
    'Welcome to KarmaGuru',
    'Astrologer will join within 10 second',
  ]);
  // The reply below the card is a separate run of lines.
  expect(quoted?.props.message.lines).toEqual([
    'Please share your question in the the',
    'meanwhile',
  ]);
});

test('sending appends the message and empties the draft', async () => {
  const tree = await render(<ConsultationChatScreen />);
  const composer = () => tree.root.findByType(ChatComposer);

  // A blank draft is ignored.
  await act(() => {
    composer().props.onSend();
  });
  expect(tree.root.findAllByType(ChatBubble)).toHaveLength(
    CHAT_TRANSCRIPT.length,
  );

  await act(() => {
    composer().findByType(TextInput).props.onChangeText('  Namaste  ');
  });
  await act(() => {
    composer().props.onSend();
  });

  expect(tree.root.findAllByType(ChatBubble)).toHaveLength(
    CHAT_TRANSCRIPT.length + 1,
  );
  expect(textOf(tree)).toContain('Namaste');
  expect(composer().props.value).toBe('');
});

test('the cross asks before leaving, and Stay keeps the chat', async () => {
  const onLeave = jest.fn();
  const tree = await render(<ConsultationChatScreen onLeave={onLeave} />);

  const dialog = () => tree.root.findByType(LeaveChatDialog);
  expect(dialog().props.visible).toBe(false);

  await act(() => {
    byLabel(tree, 'Leave chat').props.onPress();
  });
  expect(dialog().props.visible).toBe(true);
  const text = textOf(tree);
  expect(text).toContain('Do you want to leave this chat?');
  expect(text).toContain('Once you leave, this conversation can’t be resumed.');
  expect(text).toContain('Stay');
  expect(text).toContain('Leave Chat');

  await act(() => {
    dialog().props.onStay();
  });
  expect(dialog().props.visible).toBe(false);
  expect(onLeave).not.toHaveBeenCalled();

  await act(() => {
    byLabel(tree, 'Leave chat').props.onPress();
  });
  await act(() => {
    dialog().props.onLeave();
  });
  expect(onLeave).toHaveBeenCalledTimes(1);
  expect(dialog().props.visible).toBe(false);
});

test('the chart button opens the kundli sheet on its Lagna tab', async () => {
  const tree = await render(<ConsultationChatScreen />);

  const sheet = () => tree.root.findByType(KundliSheet);
  expect(sheet().props.visible).toBe(false);

  await act(() => {
    byLabel(tree, 'Kundli details').props.onPress();
  });

  expect(sheet().props.visible).toBe(true);
  const text = textOf(tree);
  expect(text).toContain('Kundli Details');
  expect(text).toContain('Lagna Chart');
  expect(text).toContain('Dasha');
  expect(text).toContain('Basic Birth Chart');

  const tabs = pressablesWithRole(sheet(), 'tab');
  expect(tabs.map(tab => tab.props.accessibilityState.selected)).toEqual([
    true,
    false,
  ]);
});

test('the Generate Kundli action opens the same sheet', async () => {
  const tree = await render(<ConsultationChatScreen />);

  await act(() => {
    tree.root.findAllByType(ChatBubble)[0].props.onAction();
  });
  expect(tree.root.findByType(KundliSheet).props.visible).toBe(true);
});

test('the dasha tab drills from Mahadasha through to Pratyantardasha', async () => {
  const tree = await render(<ConsultationChatScreen />);

  await act(() => {
    byLabel(tree, 'Kundli details').props.onPress();
  });

  const sheet = () => tree.root.findByType(KundliSheet);
  await act(() => {
    pressablesWithRole(sheet(), 'tab')[1].props.onPress();
  });

  let text = textOf(tree);
  expect(text).toContain('Mahadasha');
  expect(text).toContain('Planet');
  expect(text).toContain('Start Date');
  expect(text).toContain('End Date');
  for (const row of DASHA_ROWS) {
    expect(text).toContain(row.planet);
  }
  expect(text).not.toContain('Back');

  // Each row steps one level deeper, and the deepest level stops drilling.
  await act(() => {
    byLabel(tree, `Jupiter ${DASHA_LEVELS[0]}`).props.onPress();
  });
  text = textOf(tree);
  expect(text).toContain('Antardasha');
  expect(text).toContain('Back');

  await act(() => {
    byLabel(tree, `Jupiter ${DASHA_LEVELS[1]}`).props.onPress();
  });
  expect(textOf(tree)).toContain('Pratyantardasha');

  const deepest = sheet().findAll(
    node => node.props.accessibilityLabel === `Jupiter ${DASHA_LEVELS[2]}`,
  );
  expect(deepest.some(node => node.props.disabled === true)).toBe(true);

  // Back walks the drill-down out again.
  await act(() => {
    pressablesWithRole(sheet(), 'button')
      .find(node => node.props.accessibilityLabel === undefined)
      ?.props.onPress();
  });
  expect(textOf(tree)).toContain('Antardasha');
});
