export type MembershipStatus =
  | "pending"
  | "active"
  | "past_due"
  | "paused"
  | "cancelled"
  | "expired"
  | "failed";

export interface SubscriptionRecord {
  userId: string;
  provider: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  status: MembershipStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutInput {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  providerSessionId?: string;
}

export interface PortalInput {
  userId: string;
}

export interface PortalResult {
  portalUrl: string;
}

export interface ProviderSubscription {
  providerSubscriptionId: string;
  providerCustomerId?: string;
  status: MembershipStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface WebhookEvent {
  eventId: string;
  type: string;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  payload: unknown;
}

export interface BillingProvider {
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  getCustomerPortal(input: PortalInput): Promise<PortalResult>;
  getSubscription(id: string): Promise<ProviderSubscription>;
  cancelSubscription(id: string): Promise<void>;
  handleWebhook(request: Request): Promise<WebhookEvent>;
}
