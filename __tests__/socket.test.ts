/**
 * services/socket.ts against a stand-in socket.io client: what the handshake
 * carries, and what happens when the server refuses it.
 *
 * The server refuses a handshake whose access token has expired (code
 * `token_expired`, backend/socket/index.js) and socket.io never retries a
 * refused handshake by itself — so a socket that outlived its 15-minute token
 * and then blinked off the network stayed dead, and the consultation behind it
 * was paused and then ended.
 */

type Handler = (...args: any[]) => void;

class MockSocket {
  connected = false;
  active = true;
  handlers = new Map<string, Handler[]>();
  connect = jest.fn(() => {
    this.active = true;
    return this;
  });
  disconnect = jest.fn(() => {
    this.connected = false;
    this.active = false;
    return this;
  });
  removeAllListeners = jest.fn();
  emit = jest.fn();
  off = jest.fn();
  /** socket.io keeps the `auth` option on the socket itself. */
  auth: unknown;
  constructor(public opts: any) {
    this.auth = opts.auth;
  }
  on(event: string, handler: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
    return this;
  }
  fire(event: string, ...args: any[]) {
    (this.handlers.get(event) ?? []).forEach(handler => handler(...args));
  }
  /** What the client sends on a (re)connect attempt. */
  handshakeAuth(): Promise<{ token?: string }> {
    const { auth } = this.opts;
    return typeof auth === 'function' ? new Promise(resolve => auth(resolve)) : Promise.resolve(auth);
  }
}

const mockSockets: MockSocket[] = [];
jest.mock('socket.io-client', () => ({
  io: jest.fn((_url: string, opts: any) => {
    const socket = new MockSocket(opts);
    mockSockets.push(socket);
    return socket;
  }),
}));

let mockAccessToken: string | null = 'token-1';
jest.mock('../src/services/session', () => ({
  getAccessToken: () => mockAccessToken,
}));

const mockRefreshOnce = jest.fn(async () => {
  mockAccessToken = 'token-2';
  return mockAccessToken;
});
jest.mock('../src/services/client', () => ({
  API_BASE_URL: 'http://test.local/api/v1',
  refreshOnce: () => mockRefreshOnce(),
}));

import { connectSocket, disconnectSocket } from '../src/services/socket';

const flush = () => new Promise<void>(resolve => setImmediate(() => resolve()));

beforeEach(() => {
  disconnectSocket();
  mockSockets.length = 0;
  mockAccessToken = 'token-1';
  mockRefreshOnce.mockClear();
});

test('every handshake carries the token held now, not the one the socket opened with', async () => {
  const socket = connectSocket() as unknown as MockSocket;
  expect(await socket.handshakeAuth()).toEqual({ token: 'token-1' });

  mockAccessToken = 'token-9';
  expect(await socket.handshakeAuth()).toEqual({ token: 'token-9' });
});

test('a refreshed token does not drop a live connection', () => {
  const socket = connectSocket() as unknown as MockSocket;
  socket.connected = true;

  mockAccessToken = 'token-2';
  expect(connectSocket()).toBe(socket);
  // Dropping it would read on the seeker's side as the astrologer leaving — billing paused, "reconnecting…".
  expect(socket.disconnect).not.toHaveBeenCalled();
  expect(socket.connect).not.toHaveBeenCalled();
  expect(mockSockets).toHaveLength(1);
});

test('a handshake refused for an expired token refreshes, then connects again', async () => {
  const socket = connectSocket() as unknown as MockSocket;
  socket.connect.mockClear();

  // What socket.io does on a refused handshake: no automatic retry.
  socket.active = false;
  socket.fire('connect_error', Object.assign(new Error('This session has expired.'), { data: { code: 'token_expired' } }));
  await flush();

  expect(mockRefreshOnce).toHaveBeenCalledTimes(1);
  expect(socket.connect).toHaveBeenCalledTimes(1);
  expect(await socket.handshakeAuth()).toEqual({ token: 'token-2' });
});

test('any other refusal, or a plain network error socket.io is already retrying, is left alone', async () => {
  const socket = connectSocket() as unknown as MockSocket;
  socket.connect.mockClear();

  socket.active = false;
  socket.fire('connect_error', Object.assign(new Error('Invalid auth token.'), { data: { code: 'invalid_token' } }));
  socket.active = true;
  socket.fire('connect_error', Object.assign(new Error('This session has expired.'), { data: { code: 'token_expired' } }));
  socket.fire('connect_error', new Error('websocket error'));
  await flush();

  expect(mockRefreshOnce).not.toHaveBeenCalled();
  expect(socket.connect).not.toHaveBeenCalled();
});

test('a refresh that fails leaves the socket closed rather than looping', async () => {
  mockRefreshOnce.mockImplementationOnce(async () => {
    throw new Error('refresh token spent');
  });
  const socket = connectSocket() as unknown as MockSocket;
  socket.connect.mockClear();

  socket.active = false;
  socket.fire('connect_error', Object.assign(new Error('expired'), { data: { code: 'token_expired' } }));
  await flush();

  expect(socket.connect).not.toHaveBeenCalled();
});
