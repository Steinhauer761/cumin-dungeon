# Billing Provider Contract

Cum IN Dungeon must remain provider-neutral. The application must not depend on Stripe-specific APIs or SDKs because adult-content/payment-provider eligibility must be confirmed separately with the selected processor.

## Application contract

The payment adapter should expose these provider-neutral operations:

- `createCheckoutSession(input)`
- `getCustomerPortal(input)`
- `getSubscription(subscriptionId)`
- `cancelSubscription(subscriptionId)`
- `handleWebhook(request)`
- `verifyEntitlement(userId)`

## Required subscription states

Use an internal status model rather than provider-specific status strings:

- `pending`
- `active`
- `past_due`
- `paused`
- `cancelled`
- `expired`
- `failed`

Store the provider name and provider-side identifiers separately so the processor can be changed without rewriting member entitlements.

## Webhook/event rules

1. Verify the provider signature before processing an event.
2. Treat webhook delivery as retryable and idempotent.
3. Never grant membership solely from a client-side redirect.
4. Record the provider event ID and reject duplicate processing.
5. Update the internal subscription record from verified provider events.
6. Keep payment credentials and raw card data out of the application database.

## Entitlements

Membership checks should consume the internal subscription state, not provider-specific API responses. A member may receive access only when the internal record is `active` and the account satisfies the platform's age/verification requirements.

## Provider adapter boundary

The eventual adult-compatible processor should be implemented behind an adapter such as:

```ts
export interface BillingProvider {
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  getCustomerPortal(input: PortalInput): Promise<PortalResult>;
  getSubscription(id: string): Promise<ProviderSubscription>;
  cancelSubscription(id: string): Promise<void>;
  handleWebhook(request: Request): Promise<WebhookEvent>;
}
```

This deliberately borrows the useful architecture from the existing HustleINFlow billing implementation while excluding Stripe/Base44-specific code.

## Security/account controls

The billing layer should integrate with account deletion, entitlement checks, audit events, and safety controls. Provider-specific secrets belong in deployment environment variables and must never be committed to the repository.
