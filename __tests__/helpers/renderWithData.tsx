import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '../../src/state/AppDataProvider';
/** The API is mocked in jest.setup.js; this only resets it between tests. */
import { resetApiMock } from './apiMock';
import { pickFile } from '../../src/services/filePicker';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export const act = ReactTestRenderer.act;

/**
 * Concatenated visible text — these screens draw enough SVG that a JSON dump
 * would drown the assertions.
 */
export const textOf = (tree: ReactTestRenderer.ReactTestRenderer): string => {
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

/** Mounts a screen over a fresh store, and settles the provider's first load. */
export const render = async (element: React.ReactElement) => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <AppDataProvider>{element}</AppDataProvider>
      </SafeAreaProvider>,
    );
  });
  /**
   * App reads the keystore before it decides the first screen, and the provider
   * fetches on mount. Both settle on a later tick, so one more pass is needed
   * before a test can look for anything.
   */
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

  mounted.push(tree);
  return tree;
};

/**
 * The composite pressable behind a control — `Pressable` puts
 * `accessibilityRole` on both its composite and its host node, but only the
 * composite carries `onPress`.
 */
export const pressableLabelled = (
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) =>
  tree.root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );

/**
 * Lets a pending stub resolve. `settle()` goes through a timer, so awaiting a
 * microtask alone is not enough for effects that fetch on mount.
 */
export const flush = async () => {
  await act(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  });
};

/** The text input behind a labelled field. */
export const inputLabelled = (
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
) =>
  tree.root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onChangeText === 'function',
  );

beforeEach(() => {
  resetApiMock();
  /** Restarts the picker's file numbering; see jest.setup.js. */
  (pickFile as jest.Mock).mockClear();
});

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});
