/**
 * The astrologer's header clock must read exactly what the seeker's reads:
 * both count on the SERVER's clock (GET /chats/:id's `serverTime`), and a
 * package booking counts its remaining time down on both sides. user_app's
 * __tests__/PackageFlow.test.tsx asserts the very same numbers for the same
 * server state.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConsultationChatScreen } from '../src/screens/ConsultationChatScreen';
import * as api from '../src/services/api';
import { clockOffsetMs, elapsedSeconds, formatClock, secondsUntil } from '../src/utils/sessionClock';
import { requestsFromApi } from '../src/utils/requests';
import { firePackageEnded, firePackageExtended, firePerMinuteStarted } from './helpers/apiMock';
import { ChatComposer } from '../src/components/ChatComposer';

const METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

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
    tree = ReactTestRenderer.create(<SafeAreaProvider initialMetrics={METRICS}>{element}</SafeAreaProvider>);
  });
  mounted.push(tree);
  await ReactTestRenderer.act(async () => {
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  });
  return tree;
};

afterEach(async () => {
  await ReactTestRenderer.act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
  jest.restoreAllMocks();
});

/**
 * The server's clock is 10 minutes AHEAD of this phone's (a phone set wrong).
 * The session started 125s ago by the server's clock.
 */
const SKEW_MS = 10 * 60 * 1000;
const serverNow = () => Date.now() + SKEW_MS;
const serverIso = (msFromServerNow: number) => new Date(serverNow() + msFromServerNow).toISOString();

const state = (extra: Record<string, unknown> = {}) => ({
  chatId: 'chat-1',
  role: 'astrologer' as const,
  channel: 'chat',
  status: 'active',
  startedAt: serverIso(-125_000),
  ratePerMinute: 20,
  minutesBilled: 3,
  amountCharged: 60,
  serverTime: serverIso(0),
  ...extra,
});

describe('session clock helpers', () => {
  test('elapsed and remaining are measured on the server clock', () => {
    const device = Date.parse('2026-01-01T10:00:00.000Z');
    const offset = clockOffsetMs('2026-01-01T10:10:00.000Z', device);
    expect(offset).toBe(SKEW_MS);
    expect(elapsedSeconds('2026-01-01T10:07:55.000Z', offset, 0, device)).toBe(125);
    expect(elapsedSeconds('2026-01-01T10:07:55.000Z', offset, 5_000, device)).toBe(120);
    expect(secondsUntil('2026-01-01T10:12:30.000Z', offset, device)).toBe(150);
    expect(formatClock(125)).toBe('02:05');
  });
});

describe('astrologer header', () => {
  test('per-minute: counts up on the server clock, not the phone\'s (02:05, not 12:05)', async () => {
    jest.spyOn(api, 'getChatState').mockImplementation(async () => state() as never);
    const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Arjun" />);
    expect(textOf(tree)).toContain('(02:05 mins)');
  });

  test('package: counts the remaining package time down, like the seeker\'s header', async () => {
    jest.spyOn(api, 'getChatState').mockImplementation(
      async () => state({ billingMode: 'package', package: { phase: 'package', endsAt: serverIso(150_000), warningSeconds: 30 } }) as never,
    );
    const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Arjun" />);
    expect(textOf(tree)).toContain('(02:30 left)');

    // The package runs out → paused on this side too, while the seeker chooses.
    await ReactTestRenderer.act(() => {
      firePackageEnded({ chatId: 'chat-1', pausedSince: serverIso(0), serverTime: serverIso(0) });
    });
    expect(textOf(tree)).toContain('(Paused)');
    expect(textOf(tree)).toContain('chat paused while the seeker chooses how to continue');
    expect(tree.root.findByType(ChatComposer).props.disabled).toBe(true);

    // They choose per-minute → both headers count the session up again.
    await ReactTestRenderer.act(() => {
      firePerMinuteStarted({ chatId: 'chat-1', perMinuteStartedAt: serverIso(0), serverTime: serverIso(0), ratePerMinute: 20 });
    });
    expect(tree.root.findByType(ChatComposer).props.disabled).toBe(false);
    await ReactTestRenderer.act(async () => {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1100));
    });
    expect(textOf(tree)).toMatch(/\(02:0[5-7] mins\)/);
    expect(textOf(tree)).not.toContain('left)');
  });
});

describe('astrologer side of a package pause', () => {
  test('the seeker taking another package resumes this side with the same fresh countdown', async () => {
    jest.spyOn(api, 'getChatState').mockImplementation(
      async () => state({ billingMode: 'package', package: { phase: 'awaiting_choice', endsAt: serverIso(-5_000), awaitingChoiceSince: serverIso(-5_000) } }) as never,
    );
    const tree = await render(<ConsultationChatScreen chatId="chat-1" peerName="Arjun" />);
    expect(textOf(tree)).toContain('(Paused)');
    expect(tree.root.findByType(ChatComposer).props.disabled).toBe(true);

    await ReactTestRenderer.act(() => {
      firePackageExtended({ chatId: 'chat-1', packageMinutes: 3, endsAt: serverIso(180_000), serverTime: serverIso(0) });
    });
    expect(textOf(tree)).toContain('(03:00 left)');
    expect(tree.root.findByType(ChatComposer).props.disabled).toBe(false);
  });
});

describe('request card', () => {
  const base = {
    chatId: 'c-1',
    channel: 'chat',
    user: { id: 'u-1', name: 'Arjun Sharma' },
    intake: { topic: 'career-job' },
    ratePerMinute: 20,
    requestedAt: new Date().toISOString(),
  };

  test('a package booking shows its length and what the seeker actually pays (after discount)', () => {
    const [card] = requestsFromApi([
      { ...base, intake: { ...base.intake, minutesBooked: 3 }, billingMode: 'package', packageMinutes: 3, packagePrice: 54, packageDiscountPercent: 10 },
    ]);
    expect(card.details.duration).toBe('3 min package (10% off)');
    expect(card.details.earnings).toBe('₹ 54');
    expect(card.details.rate).toBe('₹ 20/min');
  });

  test('a per-minute booking is unchanged', () => {
    const [card] = requestsFromApi([{ ...base, billingMode: 'per_minute' }]);
    expect(card.details.duration).toBe('—');
    expect(card.details.earnings).toBe('—');
  });
});
