import React from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDialog, dialogBridge, showDialog, type DialogRequest } from '../src/components/AppDialog';
import { AppDialogProvider, useDialog } from '../src/components/AppDialogProvider';

const METRICS = {
  frame: { x: 0, y: 0, width: 402, height: 893 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

const act = ReactTestRenderer.act;

/** Concatenated visible text. */
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
  await act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>{element}</SafeAreaProvider>,
    );
  });
  mounted.push(tree);
  return tree;
};

afterEach(async () => {
  await act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
  jest.restoreAllMocks();
});

/** The composite pressable behind a label — the one that carries `onPress`. */
const pressableLabelled = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root.find(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  );

const pressablesLabelled = (tree: ReactTestRenderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  );

const press = async (tree: ReactTestRenderer.ReactTestRenderer, label: string) => {
  await act(async () => {
    await pressableLabelled(tree, label).props.onPress();
  });
};

/* ------------------------------------------------------------------ dialog */

test('renders the title and message, with a single OK when no actions are given', async () => {
  const onDismiss = jest.fn();
  const tree = await render(
    <AppDialog request={{ title: 'Request sent', message: 'Support has your request.' }} onDismiss={onDismiss} />,
  );

  const text = textOf(tree);
  expect(text).toContain('Request sent');
  expect(text).toContain('Support has your request.');
  expect(text).toContain('OK');
  expect(tree.root.findAll(node => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function')).toHaveLength(1);

  await press(tree, 'OK');
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('nothing is drawn without a request', async () => {
  const tree = await render(<AppDialog onDismiss={() => {}} />);
  expect(textOf(tree)).toBe('');
});

test('two actions sit in a row, and each runs its handler after the dialog has closed', async () => {
  const calls: string[] = [];
  const onDismiss = jest.fn(() => calls.push('dismiss'));
  const request: DialogRequest = {
    title: 'Request a refund?',
    actions: [
      { label: 'Cancel', variant: 'secondary', onPress: () => calls.push('cancel') },
      { label: 'Request refund', variant: 'primary', onPress: () => calls.push('refund') },
    ],
  };
  const tree = await render(<AppDialog request={request} onDismiss={onDismiss} />);

  const row = pressableLabelled(tree, 'Cancel').parent!;
  expect(StyleSheet.flatten(row.props.style).flexDirection).toBe('row');

  await press(tree, 'Request refund');
  expect(calls).toEqual(['dismiss', 'refund']);

  await press(tree, 'Cancel');
  expect(calls).toEqual(['dismiss', 'refund', 'dismiss', 'cancel']);
});

test('three or more actions stack, one under the other', async () => {
  const request: DialogRequest = {
    title: 'Profile Photo',
    message: 'Where would you like to get it from?',
    actions: [
      { label: 'Take Photo', variant: 'primary' },
      { label: 'Choose from Gallery', variant: 'secondary' },
      { label: 'Cancel', variant: 'secondary' },
    ],
  };
  const tree = await render(<AppDialog request={request} onDismiss={() => {}} />);

  const column = pressableLabelled(tree, 'Take Photo').parent!;
  expect(StyleSheet.flatten(column.props.style).flexDirection).toBe('column');
  expect(textOf(tree)).toContain('Take Photo');
  expect(textOf(tree)).toContain('Choose from Gallery');
  expect(textOf(tree)).toContain('Cancel');
});

test('tapping the scrim dismisses, and tells the request so', async () => {
  const onDismiss = jest.fn();
  const requestDismissed = jest.fn();
  const tree = await render(
    <AppDialog request={{ title: 'Profile Photo', onDismiss: requestDismissed }} onDismiss={onDismiss} />,
  );

  await press(tree, 'Close Profile Photo');
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(requestDismissed).toHaveBeenCalledTimes(1);
});

test('a non-dismissable dialog ignores the scrim and the back button', async () => {
  const onDismiss = jest.fn();
  const tree = await render(
    <AppDialog request={{ title: 'Must answer', dismissable: false }} onDismiss={onDismiss} />,
  );

  /** No pressable scrim at all — the label is there for the reader, with nothing behind it. */
  expect(pressablesLabelled(tree, 'Close Must answer')).toHaveLength(0);
  const modal = tree.root.findAll(node => typeof node.props.onRequestClose === 'function')[0];
  await act(() => {
    modal.props.onRequestClose();
  });
  expect(onDismiss).not.toHaveBeenCalled();
});

/* ---------------------------------------------------------------- provider */

/** A screen with one control of its own, which asks the shared dialog for a message. */
function Opener({ request }: { request: DialogRequest }) {
  const dialog = useDialog();
  return (
    <Pressable accessibilityLabel="Open" onPress={() => dialog.show(request)}>
      <Text>Open</Text>
    </Pressable>
  );
}

test('the provider shows what a screen asks for, and a second show replaces the first', async () => {
  const firstDismissed = jest.fn();
  const tree = await render(
    <AppDialogProvider>
      <Opener request={{ title: 'First message', onDismiss: firstDismissed }} />
    </AppDialogProvider>,
  );
  expect(textOf(tree)).not.toContain('First message');

  await press(tree, 'Open');
  expect(textOf(tree)).toContain('First message');

  await act(() => {
    showDialog({ title: 'Second message' });
  });
  expect(textOf(tree)).toContain('Second message');
  expect(textOf(tree)).not.toContain('First message');
  /** Whoever waited on the first one is told it went away unanswered. */
  expect(firstDismissed).toHaveBeenCalledTimes(1);

  await press(tree, 'OK');
  expect(textOf(tree)).not.toContain('Second message');
});

/* ------------------------------------------------------------------ bridge */

test('the bridge falls back to Alert.alert when no provider is mounted', () => {
  expect(dialogBridge.isMounted()).toBe(false);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const onPick = jest.fn();
  const onDismiss = jest.fn();

  showDialog({
    title: 'Upload Document',
    message: 'Where would you like to get it from?',
    actions: [
      { label: 'Take Photo', variant: 'primary', onPress: onPick },
      { label: 'Cancel', variant: 'secondary' },
    ],
    onDismiss,
  });

  expect(alert).toHaveBeenCalledTimes(1);
  const [title, message, buttons, options] = alert.mock.calls[0];
  expect(title).toBe('Upload Document');
  expect(message).toBe('Where would you like to get it from?');
  expect(buttons?.map(button => button.text)).toEqual(['Take Photo', 'Cancel']);
  expect(buttons?.[1].style).toBe('cancel');
  expect(options).toEqual({ cancelable: true, onDismiss });
  buttons?.[0].onPress?.();
  expect(onPick).toHaveBeenCalledTimes(1);
});

test('a plain message falls back to a one-button alert', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  showDialog({ title: 'Bank Proof', message: 'That file could not be opened.', tone: 'error' });
  expect(alert).toHaveBeenCalledWith('Bank Proof', 'That file could not be opened.', undefined, {
    cancelable: true,
    onDismiss: undefined,
  });
});

test('with a provider mounted, the bridge draws the dialog instead of an alert', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const tree = await render(
    <AppDialogProvider>
      <Opener request={{ title: 'unused' }} />
    </AppDialogProvider>,
  );
  expect(dialogBridge.isMounted()).toBe(true);

  const onPick = jest.fn();
  await act(() => {
    showDialog({
      title: 'Profile Photo',
      actions: [
        { label: 'Take Photo', variant: 'primary', onPress: onPick },
        { label: 'Choose from Gallery', variant: 'secondary' },
        { label: 'Cancel', variant: 'secondary' },
      ],
    });
  });
  expect(alert).not.toHaveBeenCalled();
  expect(textOf(tree)).toContain('Profile Photo');

  await press(tree, 'Take Photo');
  expect(onPick).toHaveBeenCalledTimes(1);
  expect(textOf(tree)).not.toContain('Profile Photo');

  /** Unmounting hands the bridge back to the alert fallback. */
  await act(() => {
    mounted.splice(0).forEach(entry => entry.unmount());
  });
  expect(dialogBridge.isMounted()).toBe(false);
});
