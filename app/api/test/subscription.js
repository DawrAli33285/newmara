const stripe = require('stripe')('sk_test_51TfwIyLyHmPH8TShwlJrd9KNHrLg2QNwiAusH5B9vu5X9EGmy86IPfNOtfVHdqPjRRhClp2OzUyajgyPxTrRFYqt00uzZL6PO1');
const subscription = await stripe.subscriptions.retrieve(
  '{{SUBSCRIPTION_ID}}'
);