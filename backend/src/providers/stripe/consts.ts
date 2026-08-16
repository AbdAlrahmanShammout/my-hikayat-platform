export const STRIPE = {
  checkout: {
    mode: 'subscription',
    quantity: 1,
  },
  webhookEventType: {
    checkoutSessionCompleted: 'checkout.session.completed',
    customerSubscriptionUpdated: 'customer.subscription.updated',
    customerSubscriptionDeleted: 'customer.subscription.deleted',
    invoicePaymentFailed: 'invoice.payment_failed',
  },
  canceledStatuses: ['canceled', 'unpaid', 'incomplete_expired'],
} as const;
