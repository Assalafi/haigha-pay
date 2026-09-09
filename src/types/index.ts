export type UserStatus = 'active' | 'restricted' | 'suspended'
export type KycLevel = 0 | 1 | 2 | 3
export type KycStatus = 'not_started' | 'in_review' | 'verified' | 'rejected'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: UserStatus
  kycLevel: KycLevel
  kycStatus: KycStatus
  createdAt: string
  avatarColor?: string
  address?: string
  tierLabel?: string
}

export type WalletStatus = 'active' | 'restricted'

export interface Wallet {
  id: string
  userId: string
  currency: 'NGN'
  availableBalance: number
  ledgerBalance: number
  status: WalletStatus
}

export type TxType = 'wallet_funding' | 'transfer' | 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'wallet_adjustment'
export type TxStatus = 'successful' | 'pending' | 'failed' | 'reversed'
export type TxDirection = 'credit' | 'debit'
export type TxChannel = 'wallet' | 'card' | 'bank_transfer' | 'virtual_account'

export interface Transaction {
  id: string
  reference: string
  userId: string
  customerName?: string
  type: TxType
  direction: TxDirection
  amount: number
  fee: number
  status: TxStatus
  channel: TxChannel
  gatewayReference?: string
  narration: string
  description?: string
  recipientName?: string
  bank?: string
  accountNumber?: string
  createdAt: string
}

export interface GatewayPayment {
  id: string
  reference: string
  gatewayReference: string
  customer: string
  customerId: string
  amount: number
  channel: TxChannel
  gatewayStatus: 'successful' | 'pending' | 'failed'
  haighaStatus: TxStatus
  createdAt: string
  provider: 'ZainPay'
}

export type BillCategory = 'airtime' | 'data' | 'electricity' | 'cable_tv' | 'internet' | 'education' | 'betting' | 'other'

export interface Biller {
  id: string
  category: BillCategory
  name: string
  providers: { id: string; name: string; plans?: { id: string; label: string; price: number; size?: string }[]; packages?: string[] }[]
}

export interface KycApplication {
  id: string
  userId: string
  customerName: string
  customer: User
  level: number
  status: 'in_review' | 'approved' | 'rejected' | 'not_started'
  nin: string
  bvn: string
  idType: string
  submittedAt: string
  riskFlags: string[]
  note?: string
}

export type NotificationType = 'transaction' | 'security' | 'system' | 'promotion' | 'gateway' | 'kyc' | 'platform'

export interface AppNotification {
  id: string
  category: NotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  audience: 'user' | 'admin' | 'all'
}

export interface Bank {
  code: string
  name: string
  color?: string
}

export type BeneficiaryKind = 'haigha' | 'bank'

export interface Beneficiary {
  id: string
  name: string
  bank?: string
  accountNumber?: string
  kind: BeneficiaryKind
  nickname?: string
  createdAt: string
}

export interface AuditLog {
  id: string
  admin: string
  adminId: string
  action: string
  resource: string
  resourceType: string
  ip: string
  device: string
  createdAt: string
  level: 'info' | 'warning' | 'critical'
}

export type PaymentResult = 'success' | 'pending' | 'failed'

export type SessionRole = 'user' | 'admin' | 'merchant' | null

export interface KycLevelConfig {
  level: number
  label: string
  status: KycStatus
  limits: { single?: number; daily?: number }
  benefits: string[]
}

export interface TransferTarget {
  kind: 'haigha' | 'bank'
  name: string
  bank?: string
  accountNumber?: string
}
