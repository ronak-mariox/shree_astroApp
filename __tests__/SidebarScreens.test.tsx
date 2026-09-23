import React from 'react';

import { FIXTURE_SERVICE_RATES , FIXTURE_REVIEWS } from './helpers/fixtures';

import { OptionPickerSheet } from '../src/components/OptionPickerSheet';
import { PriceChangeSheet } from '../src/components/PriceChangeSheet';
import { ReviewReplySheet } from '../src/components/ReviewReplySheet';
import {
  CHANGE_REQUEST_INTRO,
  rateRowsOf,
} from '../src/data/priceChange';
import { REVIEWS_NOTICE } from '../src/data/reviews';
import { FAQS, ISSUE_TYPES } from '../src/data/support';
import { HelpSupportScreen } from '../src/screens/HelpSupportScreen';
import { MyReviewsScreen } from '../src/screens/MyReviewsScreen';
import { PriceChangeScreen } from '../src/screens/PriceChangeScreen';
import {
  act,
  inputLabelled,
  pressableLabelled,
  render,
  textOf,
} from './helpers/renderWithData';

/* ------------------------------------------------------------ Help & Support */

test('help & support lists quick help, the FAQs and the dispute form', async () => {
  const text = textOf(await render(<HelpSupportScreen />));

  expect(text).toContain('Help & Support');
  expect(text).toContain('Quick Help');
  expect(text).toContain('Live Chat');
  expect(text).toContain('Email Us');

  expect(text).toContain('FAQs');
  for (const faq of FAQS) {
    expect(text).toContain(faq.question);
    expect(text).toContain(faq.answer);
  }

  expect(text).toContain('Raise a Dispute');
  expect(text).toContain('Issue Type');
  for (const issue of ISSUE_TYPES) {
    expect(text).toContain(issue.label);
  }
  expect(text).toContain('Description');
  expect(text).toContain('Submit Dispute');
});

test('both quick-help buttons report where they should go', async () => {
  const onLiveChat = jest.fn();
  const onEmailUs = jest.fn();
  const tree = await render(
    <HelpSupportScreen onLiveChat={onLiveChat} onEmailUs={onEmailUs} />,
  );

  await act(async () => {
    pressableLabelled(tree, 'Live Chat').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Email Us').props.onPress();
  });

  expect(onLiveChat).toHaveBeenCalled();
  expect(onEmailUs).toHaveBeenCalled();
});

test('a dispute is refused without an issue type or enough detail', async () => {
  const tree = await render(<HelpSupportScreen />);

  await act(async () => {
    await pressableLabelled(tree, 'Submit Dispute').props.onPress();
  });
  expect(textOf(tree)).toContain('Pick the kind of issue you are reporting.');

  await act(async () => {
    pressableLabelled(tree, 'Puja Service').props.onPress();
  });
  await act(async () => {
    inputLabelled(tree, 'Description').props.onChangeText('too short');
  });
  await act(async () => {
    await pressableLabelled(tree, 'Submit Dispute').props.onPress();
  });
  expect(textOf(tree)).toContain('Describe the issue in a little more detail.');
});

test('a raised dispute is listed under the form, with support\'s answer when it comes', async () => {
  const { resetDisputes, fetchMyDisputes } = require('./helpers/apiMock');
  resetDisputes();
  const tree = await render(<HelpSupportScreen />);
  /** Nothing raised yet — no list at all. */
  expect(textOf(tree)).not.toContain('My Disputes');

  await act(async () => {
    pressableLabelled(tree, 'Astrologer Issue').props.onPress();
  });
  await act(async () => {
    inputLabelled(tree, 'Description').props.onChangeText('A seeker disputed my reading, please review the chat.');
  });
  await act(async () => {
    await pressableLabelled(tree, 'Submit Dispute').props.onPress();
  });
  await act(async () => {
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  });

  let text = textOf(tree);
  expect(text).toContain('My Disputes');
  expect(text).toContain('TKT-TEST1');
  expect(text).toContain('A seeker disputed my reading');
  expect(text).toContain('Open');

  /** Once an admin answers from the panel, the reply comes back here. */
  fetchMyDisputes.mockResolvedValueOnce([
    {
      _id: 'tkt-1',
      reference: 'TKT-TEST1',
      issueType: 'astrologer',
      description: 'A seeker disputed my reading, please review the chat.',
      status: 'resolved',
      resolution: 'Reviewed the transcript — the seeker has been refunded.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const answered = await render(<HelpSupportScreen />);
  text = textOf(answered);
  expect(text).toContain('Resolved');
  expect(text).toContain('Support: Reviewed the transcript');
});

test('a complete dispute is raised and the form clears', async () => {
  const tree = await render(<HelpSupportScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Astrologer Issue').props.onPress();
  });
  expect(
    tree.root.find(
      node =>
        node.props.accessibilityLabel === 'Astrologer Issue' &&
        typeof node.props.onPress === 'function',
    ).props.accessibilityState.selected,
  ).toBe(true);

  await act(async () => {
    inputLabelled(tree, 'Description').props.onChangeText(
      'The astrologer left the consultation half way through.',
    );
  });
  await act(async () => {
    await pressableLabelled(tree, 'Submit Dispute').props.onPress();
  });

  expect(textOf(tree)).toContain('Your dispute has been raised.');
  expect(inputLabelled(tree, 'Description').props.value).toBe('');
});

/* ----------------------------------------------------------- Change Request */

test('change request opens on the first service with its rates showing', async () => {
  const tree = await render(<PriceChangeScreen />);
  const text = textOf(tree);

  expect(text).toContain('Change Request');
  expect(text).toContain(CHANGE_REQUEST_INTRO);

  for (const service of FIXTURE_SERVICE_RATES) {
    expect(text).toContain(service.name);
  }

  // Only the first panel is open, so only its rows are drawn.
  for (const row of rateRowsOf(FIXTURE_SERVICE_RATES[0])) {
    expect(text).toContain(row.label);
  }
  expect(text).toContain('Request New Rate');
  expect(
    tree.root.findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Request New Rate for') &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(1);
});

test('tapping a closed service opens it and closes the one that was open', async () => {
  const tree = await render(<PriceChangeScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Live Chat').props.onPress();
  });

  const openButtons = tree.root.findAll(
    node =>
      typeof node.props.accessibilityLabel === 'string' &&
      node.props.accessibilityLabel.startsWith('Request New Rate for'),
  );
  expect(openButtons[0].props.accessibilityLabel).toBe(
    'Request New Rate for Live Chat',
  );
});

test('a price change is refused without a number, then lands on the service', async () => {
  const tree = await render(<PriceChangeScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Request New Rate for Call').props.onPress();
  });
  expect(tree.root.findByType(PriceChangeSheet).props.visible).toBe(true);
  // The sheet opens on the service it was reached from.
  expect(inputLabelled(tree, 'Service *').props.value).toBe('Call');

  await act(async () => {
    await pressableLabelled(tree, 'Submit').props.onPress();
  });
  expect(textOf(tree)).toContain('Enter the new rate as a number.');

  await act(async () => {
    inputLabelled(tree, 'New Price Request *').props.onChangeText('42');
  });
  await act(async () => {
    await pressableLabelled(tree, 'Submit').props.onPress();
  });

  expect(tree.root.findByType(PriceChangeSheet).props.visible).toBe(false);
  expect(textOf(tree)).toContain('₹ 42');
});

/* --------------------------------------------------------------- My Reviews */

test('my reviews prints the notice, the filters and every review', async () => {
  const tree = await render(<MyReviewsScreen />);
  const text = textOf(tree);

  expect(text).toContain('My Reviews');
  expect(text).toContain('Ratings And Reviews');
  expect(text).toContain(REVIEWS_NOTICE);
  expect(text).toContain('2025');
  expect(text).toContain('May');
  // The search box is empty, so its prompt is a placeholder rather than text.
  expect(inputLabelled(tree, 'Search reviews').props.placeholder).toBe(
    'Search Here...',
  );

  for (const review of FIXTURE_REVIEWS) {
    expect(text).toContain(review.reviewer);
    expect(text).toContain(review.orderId);
    expect(text).toContain(review.comment);
  }
  expect(text).toContain('Reply');
});

test('the search box narrows the list', async () => {
  const tree = await render(<MyReviewsScreen />);

  await act(async () => {
    inputLabelled(tree, 'Search reviews').props.onChangeText('nobody');
  });
  expect(textOf(tree)).toContain('No reviews for May 2025.');

  await act(async () => {
    inputLabelled(tree, 'Search reviews').props.onChangeText('Rahul');
  });
  expect(textOf(tree)).not.toContain('No reviews for May 2025.');
});

test('the month filter opens a picker and empties the list when changed', async () => {
  const tree = await render(<MyReviewsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Month').props.onPress();
  });
  expect(tree.root.findAllByType(OptionPickerSheet)).toHaveLength(1);

  await act(async () => {
    pressableLabelled(tree, 'January').props.onPress();
  });
  await act(async () => {
    pressableLabelled(tree, 'Done').props.onPress();
  });

  expect(textOf(tree)).toContain('No reviews for January 2025.');
});

test('flagging and pinning a review both stick', async () => {
  const tree = await render(<MyReviewsScreen />);

  const flag = () => pressableLabelled(tree, 'Flag review 1');
  const pin = () => pressableLabelled(tree, 'Pin review 1');

  expect(flag().props.accessibilityState.selected).toBeFalsy();

  await act(async () => {
    await flag().props.onPress();
  });
  expect(flag().props.accessibilityState.selected).toBe(true);

  await act(async () => {
    await pin().props.onPress();
  });
  expect(pin().props.accessibilityState.selected).toBe(true);
});

test('replying to a review is refused when blank, then shows on the card', async () => {
  const tree = await render(<MyReviewsScreen />);

  await act(async () => {
    pressableLabelled(tree, 'Reply to review 1').props.onPress();
  });
  expect(tree.root.findByType(ReviewReplySheet).props.review).not.toBeNull();

  await act(async () => {
    await pressableLabelled(tree, 'Send reply').props.onPress();
  });
  expect(textOf(tree)).toContain('Write a reply before sending it.');

  await act(async () => {
    inputLabelled(tree, 'Your reply *').props.onChangeText(
      'Sorry to hear that — happy to take another look.',
    );
  });
  await act(async () => {
    await pressableLabelled(tree, 'Send reply').props.onPress();
  });

  expect(tree.root.findByType(ReviewReplySheet).props.review).toBeNull();
  expect(textOf(tree)).toContain('Sorry to hear that');
});
