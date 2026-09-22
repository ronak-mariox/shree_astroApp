import { CHAT_TRANSCRIPT } from './helpers/fixtures';
import { fireLowBalance, fireTick } from './helpers/apiMock';
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
import { GenerateKundliSheet } from '../src/components/GenerateKundliSheet';
import { KundliDetailsSheet } from '../src/components/KundliDetailsSheet';
import { LeaveChatDialog } from '../src/components/LeaveChatDialog';

import { KUNDLI_TABS } from '../src/data/kundli';
import * as api from '../src/services/api';
import { SEEKER_KUNDLI } from './helpers/apiMock';
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

test('chat renders the header, transcript and composer, and the clock counts up from the server\'s own startedAt', async () => {
  jest.useFakeTimers();
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  let text = textOf(tree);

  expect(text).toContain('Astro Rakesh');
  // services/api.ts's getChatState mock hands back startedAt as "now", so the clock opens at zero.
  expect(text).toContain('(00:00 mins)');
  expect(text).toContain('Below are my details:');
  expect(text).toContain('DOB: 08-Feb-1999');
  expect(text).toContain('Generate Kundli');
  expect(text).toContain('Welcome to KarmaGuru');
  /** Times are formatted from each message's own timestamp. */
  expect(text).toMatch(/\d{2}:\d{2}/);

  await act(() => {
    jest.advanceTimersByTime(2000);
  });
  text = textOf(tree);
  expect(text).toContain('(00:02 mins)');
  jest.useRealTimers();

  // The composer's prompt is a placeholder, so it lives on the input's props.
  expect(
    tree.root.findByType(ChatComposer).findByType(TextInput).props.placeholder,
  ).toBe('Ask your question...');

  expect(tree.root.findAllByType(ChatBubble)).toHaveLength(
    CHAT_TRANSCRIPT.length,
  );
});

test('the seeker\'s balance pausing freezes the clock and blocks the composer, and a resume picks both back up', async () => {
  jest.useFakeTimers();
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);

  await act(() => {
    jest.advanceTimersByTime(5000);
  });
  expect(textOf(tree)).toContain('(00:05 mins)');

  const send = () => byLabel(tree, 'Send');
  expect(send()?.props.accessibilityState?.disabled).toBeFalsy();

  await act(() => {
    fireLowBalance({ chatId: 'chat-1', exhausted: true, paused: true, balanceRemaining: 0 });
  });
  expect(textOf(tree)).toContain("chat paused");
  expect(send()?.props.accessibilityState?.disabled).toBe(true);

  await act(() => {
    jest.advanceTimersByTime(10000);
  });
  // Frozen — the 10 paused seconds never counted.
  expect(textOf(tree)).toContain('(00:05 mins)');

  await act(() => {
    fireLowBalance({ chatId: 'chat-1', exhausted: false, paused: false, balanceRemaining: 40 });
  });
  expect(textOf(tree)).not.toContain('chat paused');
  expect(send()?.props.accessibilityState?.disabled).toBeFalsy();

  await act(() => {
    jest.advanceTimersByTime(3000);
  });
  expect(textOf(tree)).toContain('(00:08 mins)');
  jest.useRealTimers();
});

test('a normal tick also clears a standing pause, same as an explicit resume', async () => {
  jest.useFakeTimers();
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);

  await act(() => {
    fireLowBalance({ chatId: 'chat-1', exhausted: true, paused: true });
  });
  expect(byLabel(tree, 'Send')?.props.accessibilityState?.disabled).toBe(true);

  await act(() => {
    fireTick({ minutesBilled: 2, minutesRemaining: 5 });
  });
  expect(byLabel(tree, 'Send')?.props.accessibilityState?.disabled).toBeFalsy();
  jest.useRealTimers();
});

test('bubbles keep the widths and tail corners Figma gives them', async () => {
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  const bubbles = tree.root.findAllByType(ChatBubble);

  /**
   * The tail follows who sent the message rather than being placed by hand:
   * the astrologer's flicks off the trailing corner, the seeker's off the
   * leading one. The transcript runs seeker, astrologer, seeker, astrologer,
   * seeker.
   */
  expect(bubbles.map(bubble => bubble.props.message.tail)).toEqual([
    'left',
    'right',
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
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  const quoted = tree.root
    .findAllByType(ChatBubble)
    .find(bubble => bubble.props.message.quote !== undefined);

  expect(quoted).toBeDefined();
  expect(quoted?.props.message.quote.lines).toEqual([
    /** One stored message, so the quote card carries one line. */
    'Welcome to KarmaGuru Astrologer will join within 10 second  Please share your question in the meanwhile',
  ]);
  // The reply below the card is the message's own stored text.
  expect(quoted?.props.message.lines).toEqual([
    'Please share your question in the the meanwhile',
  ]);
});

test('sending appends the message and empties the draft', async () => {
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
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
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" onLeave={onLeave} />);

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

/** Lets the screen's GET /chats/:chatId/kundli settle. */
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  });
};

test('the header\'s kundli button shows the seeker\'s saved kundli straight away', async () => {
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  await settle();
  expect((api as any).fetchSeekerKundli).toHaveBeenCalledWith('chat-1');

  await act(() => {
    byLabel(tree, 'Kundli details').props.onPress();
  });
  expect(tree.root.findByType(GenerateKundliSheet).props.visible).toBe(false);
  const details = tree.root.findByType(KundliDetailsSheet);
  expect(details.props.visible).toBe(true);
  expect(details.props.kundli).toEqual(SEEKER_KUNDLI);
  const text = textOf(tree);
  expect(text).toContain('Kundli Details of mithu');
  expect(text).toContain('Lagna: Taurus');
  expect(text).toContain('Nakshatra: Rohini');
});

test('the details sheet shows the saved chart, birth details, dasha and planets', async () => {
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  await settle();
  await act(() => {
    byLabel(tree, 'Kundli details').props.onPress();
  });

  const sheet = () => tree.root.findByType(KundliDetailsSheet);
  const tabs = () => pressablesWithRole(sheet(), 'tab');
  expect(tabs().map(tab => tab.props.accessibilityLabel)).toEqual(KUNDLI_TABS.map(tab => tab.label));
  expect(tabs().map(tab => tab.props.accessibilityState.selected)).toEqual([true, false, false, false]);
  // The stored chart image, not a bundled picture.
  const chart = sheet().findAll(node => node.props.accessibilityLabel === 'Lagna chart')[0];
  expect(chart.props.source).toEqual({ uri: SEEKER_KUNDLI.chart.url });

  await act(() => {
    tabs()[1].props.onPress();
  });
  let text = textOf(tree);
  expect(text).toContain('08 Feb 1999');
  expect(text).toContain('12:45 PM');
  expect(text).toContain('Delhi, India');
  expect(text).toContain('Capricorn');

  await act(() => {
    tabs()[2].props.onPress();
  });
  text = textOf(tree);
  expect(text).toContain('Start Date');
  expect(text).toContain('Rahu (now)');
  expect(text).toContain('01 Jan 2012');

  await act(() => {
    tabs()[3].props.onPress();
  });
  text = textOf(tree);
  expect(text).toContain('Rashi');
  expect(text).toContain('House');
  expect(text).toContain('Saturn (R)');
  expect(text).toContain('Aries');
});

test('the intake\'s Generate Kundli opens the form pre-filled with the seeker\'s saved details, and Generate shows their kundli', async () => {
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  await settle();

  await act(() => {
    tree.root.findAllByType(ChatBubble)[0].props.onAction();
  });
  const form = () => tree.root.findByType(GenerateKundliSheet);
  expect(form().props.visible).toBe(true);
  expect(form().props.initialDraft).toEqual({
    name: 'mithu', gender: 'Male', day: '08', month: 'February', year: '1999', hour: '12', minute: '45', birthPlace: 'Delhi, India',
  });
  const text = textOf(tree);
  expect(text).toContain("The seeker's saved birth details");
  const nameField = tree.root.findAll(node => node.props.accessibilityLabel === 'Name' && typeof node.props.onChangeText === 'function')[0];
  expect(nameField.props.value).toBe('mithu');

  await act(() => {
    form().props.onGenerate(form().props.initialDraft);
  });
  expect(form().props.visible).toBe(false);
  expect(tree.root.findByType(KundliDetailsSheet).props.visible).toBe(true);
  expect(tree.root.findByType(KundliDetailsSheet).props.mismatch).toBe(false);
  expect(textOf(tree)).toContain('Lagna: Taurus');
});

test('details edited to someone else never show the seeker\'s chart for them', async () => {
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  await settle();
  await act(() => {
    tree.root.findAllByType(ChatBubble)[0].props.onAction();
  });
  await act(() => {
    tree.root.findByType(GenerateKundliSheet).props.onGenerate({
      name: 'Someone', gender: 'Female', day: '01', month: 'January', year: '2000', hour: '10', minute: '00', birthPlace: 'Mumbai, India',
    });
  });
  const text = textOf(tree);
  expect(text).toContain('No saved kundli');
  expect(text).toContain("don't match the seeker's saved kundli");
  expect(text).not.toContain('Lagna: Taurus');
});

test('a seeker with no saved kundli: an honest empty state, and the form pre-filled from their intake', async () => {
  (api as any).fetchSeekerKundli.mockResolvedValueOnce({
    found: false,
    birthDetails: { fullName: 'Priya', gender: 'female', dateOfBirth: '2000-01-01T00:00:00.000Z', timeOfBirth: '10:00', place: 'Delhi' },
  });
  const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Astro Rakesh" />);
  await settle();

  await act(() => {
    byLabel(tree, 'Kundli details').props.onPress();
  });
  let text = textOf(tree);
  expect(text).toContain('Kundli Details of Priya');
  expect(text).toContain('No saved kundli');
  expect(text).toContain("hasn't generated a kundli");

  await act(() => {
    byLabel(tree, 'Fill birth details').props.onPress();
  });
  const form = tree.root.findByType(GenerateKundliSheet);
  expect(form.props.visible).toBe(true);
  expect(form.props.initialDraft).toEqual(expect.objectContaining({ name: 'Priya', gender: 'Female', day: '01', year: '2000' }));
  text = textOf(tree);
  expect(text).toContain('They have no saved kundli for these yet.');
});

