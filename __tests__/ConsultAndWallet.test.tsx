import React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IncomingRequestPopup } from '../src/components/IncomingRequestPopup';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { RequestCard } from '../src/components/RequestCard';
import { TransactionRow } from '../src/components/TransactionRow';
import {
  MISSED_CALLS,
  PENDING_REQUESTS,
} from '../src/data/dashboard';
import {
  PAYOUT_ACCOUNT,
  TRANSACTIONS,
  WALLET_BALANCE,
} from '../src/data/wallet';
import { ConsultScreen } from '../src/screens/ConsultScreen';
import { WalletScreen } from '../src/screens/WalletScreen';
import { WithdrawMoneyScreen } from '../src/screens/WithdrawMoneyScreen';
import { WithdrawSuccessScreen } from '../src/screens/WithdrawSuccessScreen';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/** Concatenated visible text — the screens draw a lot of SVG the JSON dump
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

const pressablesWithRole = (
  node: ReactTestRenderer.ReactTestInstance,
  role: string,
) =>
  node.findAll(
    child =>
      child.props.accessibilityRole === role &&
      typeof child.props.onPress === 'function',
  );

test('consult lists pending requests with answers and missed calls without', async () => {
  const tree = await render(<ConsultScreen />);
  const text = textOf(tree);

  expect(text).toContain('Consult');
  expect(text).toContain('Pending Requests');
  expect(text).toContain('Missed Call');
  expect(text).toContain('3 New');
  expect(text).toContain('Priya Mehta');
  expect(text).toContain('Arjun Rao');

  const cards = tree.root.findAllByType(RequestCard);
  expect(cards).toHaveLength(PENDING_REQUESTS.length + MISSED_CALLS.length);
  expect(cards.map(card => card.props.showActions)).toEqual([
    undefined,
    undefined,
    false,
    false,
  ]);

  // Consult is the lit tab.
  const tabs = pressablesWithRole(tree.root, 'tab');
  expect(
    tabs.findIndex(tab => tab.props.accessibilityState.selected),
  ).toBe(1);
});

test('a consult request opens its brief before it is answered', async () => {
  const onAcceptRequest = jest.fn();
  const tree = await render(<ConsultScreen onAcceptRequest={onAcceptRequest} />);

  const popup = () => tree.root.findByType(IncomingRequestPopup);
  expect(popup().props.request).toBeNull();

  await act(() => {
    tree.root.findAllByType(RequestCard)[0].props.onAccept();
  });
  expect(popup().props.request).toEqual(PENDING_REQUESTS[0]);
  expect(onAcceptRequest).not.toHaveBeenCalled();

  await act(() => {
    popup().props.onAccept(PENDING_REQUESTS[0]);
  });
  expect(onAcceptRequest).toHaveBeenCalledWith(PENDING_REQUESTS[0]);
  // The missed-call cards stay put; only the pending one goes.
  expect(tree.root.findAllByType(RequestCard)).toHaveLength(
    PENDING_REQUESTS.length - 1 + MISSED_CALLS.length,
  );
});

test('wallet shows the balance, its three windows and every transaction', async () => {
  const onWithdraw = jest.fn();
  const tree = await render(<WalletScreen onWithdraw={onWithdraw} />);
  const text = textOf(tree);

  expect(text).toContain('Total Wallet Balance');
  expect(text).toContain(WALLET_BALANCE.total);
  expect(text).toContain(WALLET_BALANCE.today);
  expect(text).toContain('Today');
  expect(text).toContain(WALLET_BALANCE.monthly);
  expect(text).toContain('Monthly');
  expect(text).toContain(WALLET_BALANCE.lifetime);
  expect(text).toContain('Lifetime');
  expect(text).toContain('Request Withdraw Money');
  expect(text).toContain('Transaction History');

  for (const transaction of TRANSACTIONS) {
    expect(text).toContain(transaction.title);
    expect(text).toContain(transaction.amount);
  }
  expect(tree.root.findAllByType(TransactionRow)).toHaveLength(
    TRANSACTIONS.length,
  );

  // Wallet is the lit tab.
  const tabs = pressablesWithRole(tree.root, 'tab');
  expect(
    tabs.findIndex(tab => tab.props.accessibilityState.selected),
  ).toBe(2);

  await act(() => {
    pressablesWithRole(tree.root, 'button')
      .find(node => node.props.accessibilityLabel === undefined)
      ?.props.onPress();
  });
  expect(onWithdraw).toHaveBeenCalledTimes(1);
});

test('withdraw starts on ₹5,000 and presets rewrite the amount', async () => {
  const onConfirm = jest.fn();
  const tree = await render(<WithdrawMoneyScreen onConfirm={onConfirm} />);
  const text = textOf(tree);

  expect(text).toContain('Withdraw Money');
  expect(text).toContain(`Available: ${WALLET_BALANCE.total}`);
  expect(text).toContain('Enter Amount');
  expect(text).toContain('Transfer To');
  expect(text).toContain(PAYOUT_ACCOUNT.bank);
  expect(text).toContain(PAYOUT_ACCOUNT.account);
  expect(text).toContain(PAYOUT_ACCOUNT.ifsc);
  expect(text).toContain('Settlement within 24 hours.');

  const field = () => tree.root.findByType(TextInput);
  expect(field().props.value).toBe('5000');

  // The ₹5,000 preset is the one Figma lights up.
  const presets = pressablesWithRole(tree.root, 'button').filter(
    node => node.props.accessibilityLabel === undefined,
  );
  expect(
    presets.map(preset => preset.props.accessibilityState?.selected),
  ).toEqual([false, false, true, false]);

  await act(() => {
    presets[3].props.onPress();
  });
  expect(field().props.value).toBe('10000');

  await act(() => {
    tree.root.findByType(PrimaryButton).props.onPress();
  });
  expect(onConfirm).toHaveBeenCalledWith('10000');
});

test('withdraw below the ₹500 floor keeps the CTA inert', async () => {
  const tree = await render(<WithdrawMoneyScreen />);
  const cta = () => tree.root.findByType(PrimaryButton);
  expect(cta().props.disabled).toBe(false);

  await act(() => {
    tree.root.findByType(TextInput).props.onChangeText('499');
  });
  expect(cta().props.disabled).toBe(true);

  await act(() => {
    tree.root.findByType(TextInput).props.onChangeText('500');
  });
  expect(cta().props.disabled).toBe(false);
});

test('the withdrawal confirmation prints the requested amount', async () => {
  const onBackToWallet = jest.fn();
  const tree = await render(
    <WithdrawSuccessScreen amount="5000" onBackToWallet={onBackToWallet} />,
  );
  const text = textOf(tree);

  expect(text).toContain('Request Successfully');
  expect(text).toContain('processed');
  expect(text).toContain('₹5,000 will be credited to your bank account');
  expect(text).toContain('Back to Wallet');

  await act(() => {
    tree.root.findByType(PrimaryButton).props.onPress();
  });
  expect(onBackToWallet).toHaveBeenCalledTimes(1);
});
