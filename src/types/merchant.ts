export type Env = 'sandbox' | 'live'
export type MerchantStatus = 'active' | 'pending' | 'suspended'
export type KybStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

export interface Merchant {
  id: string
  businessName: string
  legalName: string
  email: string
  phone: string
  website?: string
  industry: string
  country: string
  status: MerchantStatus
  kybStatus: KybStatus
  liveAccess: boolean
  liveRequested: boolean
  settlementBank: string
  settlementAccount: string
  settlementAccountName: string
  createdAt: string
}

export interface MerchantApp {
  id: string
  merchantId: string
  name: string
  platformType: string
  websiteUrl?: string
  description?: string
  environment: Env
  status: 'active' | 'revoked'
  createdAt: string
}

export type KeyType = 'public' | 'secret'
export type KeyStatus = 'active' | 'revoked'

export interface ApiKey {
  id: string
  applicationId: string
  merchantId: string
  label: string
  type: KeyType
  environment: Env
  prefix: string
  maskedValue: string
  status: KeyStatus
  createdAt: string
  lastUsedAt?: string
  allowedDomains?: string
  ipRestriction?: string
}

export interface WebhookConfig {
  id: string
  applicationId: string
  merchantId: string
  url: string
  events: string[]
  secretPrefix: string
  status: 'active' | 'disabled'
  retryPolicy: string
  createdAt: string
}

export type WebhookDeliveryStatus = 'delivered' | 'failed' | 'retrying'

export interface WebhookDelivery {
  id: string
  merchantId: string
  applicationId: string
  event: string
  url: string
  httpCode: number
  attempts: number
  status: WebhookDeliveryStatus
  createdAt: string
  requestHeaders: string[]
  responseBody: string
}

export type MerchantPaymentStatus =
  | 'initialized'
  | 'pending'
  | 'successful'
  | 'failed'
  | 'reversed'
  | 'refunded'
  | 'partially_refunded'

export interface MerchantPayment {
  id: string
  merchantId: string
  haighaRef: string
  merchantRef: string
  customerName: string
  customerEmail: string
  amount: number
  currency: 'NGN'
  channel: string
  status: MerchantPaymentStatus
  environment: Env
  fee: number
  applicationId: string
  gatewayReference?: string
  webhook: 'delivered' | 'pending' | 'failed'
  metadata: { order_id?: string; customer_id?: string; invoice_id?: string }
  createdAt: string
  paidAt?: string
}

export type RefundStatus = 'processing' | 'successful' | 'failed'

export interface Refund {
  id: string
  reference: string
  merchantId: string
  paymentReference: string
  amount: number
  status: RefundStatus
  reason: string
  createdAt: string
}

export type SettlementStatus = 'scheduled' | 'processing' | 'completed' | 'failed'

export interface Settlement {
  id: string
  reference: string
  merchantId: string
  gross: number
  fees: number
  net: number
  bank: string
  accountNumber: string
  accountName: string
  status: SettlementStatus
  period: string
  createdAt: string
  completedAt?: string
}

export interface ApiRequestLog {
  id: string
  merchantId: string
  applicationId: string
  requestId: string
  method: 'GET' | 'POST'
  endpoint: string
  statusCode: number
  responseTimeMs: number
  environment: Env
  ip: string
  keyPrefix: string
  requestBody?: string
  responseBody: string
  createdAt: string
}

export type TeamRole = 'owner' | 'admin' | 'developer' | 'finance' | 'viewer'

export interface TeamMember {
  id: string
  merchantId: string
  name: string
  email: string
  role: TeamRole
  status: 'active' | 'invited'
}
