import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSeed, seedBeneficiaries, demoUserId } from '../data/seed'
import { demoMerchantId, seedMerchantState } from '../data/merchantSeed'
import type {
  ApiKey,
  ApiRequestLog,
  Merchant,
  MerchantApp,
  MerchantPayment,
  Refund,
  Settlement,
  TeamMember,
  WebhookConfig,
  WebhookDelivery,
} from '../types/merchant'
import type {
  AppNotification,
  AuditLog,
  Beneficiary,
  GatewayPayment,
  KycApplication,
  KycLevel,
  KycStatus,
  PaymentResult,
  SessionRole,
  Transaction,
  User,
  UserStatus,
  Wallet,
} from '../types'
import { generateReference } from '../lib/format'

export interface AdminSettings {
  platformName: string
  supportEmail: string
  supportPhone: string
  currency: string
  dailyLimit: number
  minFunding: number
  maxFunding: number
  showTransferFee: boolean
  gateway: {
    provider: string
    environment: string
    integrationStatus: string
    publicKey: string
    secretKey: string
    callbackUrl: string
  }
  brand: { primary: string; secondary: string }
  security: { sessionTimeout: number; twoFactor: boolean; passwordMinLength: number; lockoutAfter: number }
}

export interface PaymentSummary {
  result: PaymentResult
  amount: number
  fee: number
  total: number
  email: string
  reference: string
  gatewayReference?: string
  channel: string
  methodLabel: string
  narration: string
  date: string
}

export interface KycDraft {
  step: number
  status: KycStatus
  submittedAt?: string
  level: number
}

interface AppState {
  hydrated: boolean
  role: SessionRole
  activeUserId: string | null
  activeMerchantId: string | null
  users: User[]
  wallets: Wallet[]
  transactions: Transaction[]
  gateway: GatewayPayment[]
  kyc: KycApplication[]
  notifications: AppNotification[]
  auditLogs: AuditLog[]
  beneficiaries: Beneficiary[]
  nextPaymentResult: PaymentResult
  hideBalance: boolean
  lastPayment: PaymentSummary | null
  pendingTransfer: Transaction | null
  kycDraft: KycDraft
  settings: AdminSettings
  restrictedIds: string[]

  merchants: Merchant[]
  merchantApps: MerchantApp[]
  merchantKeys: ApiKey[]
  merchantWebhooks: WebhookConfig[]
  webhookDeliveries: WebhookDelivery[]
  merchantPayments: MerchantPayment[]
  merchantRefunds: Refund[]
  merchantSettlements: Settlement[]
  merchantApiLogs: ApiRequestLog[]
  merchantTeam: TeamMember[]
  addAudit: (entry: Omit<AuditLog, 'id' | 'createdAt'>) => void

  setActiveUser: (role: SessionRole, userId?: string) => void
  logout: () => void
  registerUser: (firstName: string, lastName: string, email: string, phone: string) => void
  resetDemo: () => void

  fundWallet: (amount: number, fee: number, methodLabel: string, channel: string) => PaymentSummary
  recordTransfer: (payload: {
    target: string
    bank?: string
    accountNumber?: string
    amount: number
    fee: number
    narration: string
  }) => PaymentSummary
  payBill: (payload: { narration: string; amount: number; fee: number; type: Transaction['type'] }) => PaymentSummary
  setLastPayment: (summary: PaymentSummary | null) => void
  setNextPaymentResult: (r: PaymentResult) => void

  addBeneficiary: (b: Omit<Beneficiary, 'id' | 'createdAt'>) => void
  removeBeneficiary: (id: string) => void
  renameBeneficiary: (id: string, nickname: string) => void

  markNotificationRead: (id: string, audience: 'user' | 'admin') => void
  markAllNotificationsRead: (audience: 'user' | 'admin') => void
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void

  toggleHideBalance: () => void
  updateProfile: (patch: Partial<User>) => void
  updateKyc: (patch: Partial<KycDraft>) => void
  submitKyc: () => void

  adminAction: (
    action: 'restrict' | 'unrestrict' | 'suspend' | 'activate',
    userId: string,
    note?: string,
  ) => void
  adjustWallet: (userId: string, amount: number, note: string) => void
  reviewKyc: (id: string, decision: 'approved' | 'rejected', note?: string) => void
  updateSettings: (patch: Partial<AdminSettings>) => void
  seedAdminLog: (entry: { action: string; resource: string; resourceType: string; ip?: string; device?: string }) => void
  resolvePendingTx: (reference: string) => void

  createMerchantApp: (input: { merchantId: string; name: string; platformType: string; websiteUrl?: string; description?: string }) => MerchantApp
  generateSandboxKeys: (appId: string) => void
  rotateMerchantKey: (keyId: string) => void
  revokeMerchantKey: (keyId: string) => void
  saveWebhook: (cfg: { applicationId: string; url: string; events: string[] }) => void
  retryWebhookDelivery: (id: string) => void
  createRefund: (merchantId: string, paymentReference: string, amount: number, reason: string) => void
  runApiRequest: (input: { merchantId: string; appId: string; method: 'GET' | 'POST'; endpoint: string; body?: string }) => { statusCode: number; responseTimeMs: number; body: Record<string, unknown> }
  requestLiveAccess: (merchantId: string) => void
  adminMerchantAction: (merchantId: string, action: 'approveKyb' | 'rejectKyb' | 'suspend' | 'unsuspend' | 'approveLive' | 'disableLive') => void
}

const emptyKycDraft: KycDraft = { step: 0, status: 'not_started', level: 0 }

function seedState() {
  const seed = buildSeed()
  const demoWallet = seed.wallets.find((w) => w.userId === demoUserId) ?? seed.wallets[0]
  const sortedWallets = seed.wallets.map((w) =>
    w.userId === demoUserId ? { ...demoWallet, availableBalance: 248500, ledgerBalance: 248500 } : w,
  )
  const demoUser = seed.users.find((u) => u.id === demoUserId)
  const demoKyc: KycDraft = {
    step: 4,
    status: demoUser?.kycStatus ?? 'not_started',
    submittedAt: demoUser?.createdAt,
    level: demoUser?.kycLevel ?? 2,
  }
  const m = seedMerchantState()
  return {
    users: seed.users,
    wallets: sortedWallets,
    transactions: seed.transactions,
    gateway: seed.gateway,
    kyc: seed.kyc,
    notifications: seed.notifications,
    auditLogs: seed.auditLogs,
    kycDraft: demoKyc,
    merchants: m.merchants,
    merchantApps: m.apps,
    merchantKeys: m.keys,
    merchantWebhooks: m.webhooks,
    webhookDeliveries: m.webhookDeliveries,
    merchantPayments: m.merchantPayments,
    merchantRefunds: m.refunds,
    merchantSettlements: m.settlements,
    merchantApiLogs: m.apiLogs,
    merchantTeam: m.team,
  }
}

const defaults = {
  settings: {
    platformName: 'Haigha Pay',
    supportEmail: 'support@haighapay.ng',
    supportPhone: '+234 700 000 0000',
    currency: 'NGN',
    dailyLimit: 500000,
    minFunding: 100,
    maxFunding: 2000000,
    showTransferFee: true,
    gateway: {
      provider: 'ZainPay',
      environment: 'Sandbox',
      integrationStatus: 'Not Connected',
      publicKey: 'zp_pub_••••••••••••••••••••',
      secretKey: '••••••••••••••••••••••••',
      callbackUrl: 'https://api.haighapay.ng/webhooks/zainpay',
    },
    brand: { primary: '#086A37', secondary: '#049C47' },
    security: { sessionTimeout: 30, twoFactor: true, passwordMinLength: 8, lockoutAfter: 5 },
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      let S = seedState()
      return {
        hydrated: false,
        role: null,
        activeUserId: null,
        activeMerchantId: null,
        users: S.users,
        wallets: S.wallets,
        transactions: S.transactions,
        gateway: S.gateway,
        kyc: S.kyc,
        notifications: S.notifications,
        auditLogs: S.auditLogs,
        beneficiaries: seedBeneficiaries(),
        nextPaymentResult: 'success',
        hideBalance: false,
        lastPayment: null,
        pendingTransfer: null,
        kycDraft: S.kycDraft,
        settings: defaults.settings,
        restrictedIds: [],
        merchants: S.merchants,
        merchantApps: S.merchantApps,
        merchantKeys: S.merchantKeys,
        merchantWebhooks: S.merchantWebhooks,
        webhookDeliveries: S.webhookDeliveries,
        merchantPayments: S.merchantPayments,
        merchantRefunds: S.merchantRefunds,
        merchantSettlements: S.merchantSettlements,
        merchantApiLogs: S.merchantApiLogs,
        merchantTeam: S.merchantTeam,

        setActiveUser: (role, userId) =>
          set({
            role,
            activeUserId: role === 'user' ? userId ?? demoUserId : null,
            activeMerchantId: role === 'merchant' ? userId ?? demoMerchantId : null,
            hydrated: true,
          }),
        logout: () =>
          set({ role: null, activeUserId: null, activeMerchantId: null, lastPayment: null, pendingTransfer: null }),
        registerUser: (firstName, lastName, email, phone) => {
          const regId = `CUS-NEW${String(Date.now()).slice(-6)}`
          const registered: User = {
            id: regId,
            firstName,
            lastName,
            email,
            phone: `+234${phone.replace(/\D/g, '')}`,
            status: 'active',
            kycLevel: 0,
            kycStatus: 'not_started',
            createdAt: new Date().toISOString(),
            avatarColor: '#086A37',
            tierLabel: 'Level 0',
          }
          const wallet: Wallet = {
            id: `WLT-${regId.slice(-5)}`,
            userId: regId,
            currency: 'NGN',
            availableBalance: 0,
            ledgerBalance: 0,
            status: 'active',
          }
          set({
            users: [registered, ...get().users.filter((u) => !u.id.startsWith('CUS-NEW'))],
            wallets: [wallet, ...get().wallets.filter((w) => !w.userId.startsWith('CUS-NEW'))],
            activeUserId: regId,
            role: 'user',
            hydrated: true,
            kycDraft: { ...emptyKycDraft },
            transactions: get().transactions.filter((t) => !t.userId.startsWith('CUS-NEW')),
            notifications: get().notifications.filter((n) => n.audience !== 'user'),
          })
        },

        resetDemo: () => {
          S = seedState()
          set({
            users: S.users,
            wallets: S.wallets,
            transactions: S.transactions,
            gateway: S.gateway,
            kyc: S.kyc,
            auditLogs: S.auditLogs,
            notifications: S.notifications,
            beneficiaries: seedBeneficiaries(),
            nextPaymentResult: 'success',
            hideBalance: false,
            lastPayment: null,
            pendingTransfer: null,
            kycDraft: S.kycDraft,
            restrictedIds: [],
            role: null,
            activeUserId: null,
            activeMerchantId: null,
            settings: defaults.settings,
            merchants: S.merchants,
            merchantApps: S.merchantApps,
            merchantKeys: S.merchantKeys,
            merchantWebhooks: S.merchantWebhooks,
            webhookDeliveries: S.webhookDeliveries,
            merchantPayments: S.merchantPayments,
            merchantRefunds: S.merchantRefunds,
            merchantSettlements: S.merchantSettlements,
            merchantApiLogs: S.merchantApiLogs,
            merchantTeam: S.merchantTeam,
          })
        },

        fundWallet: (amount, fee, methodLabel, channel) => {
          const { activeUserId, nextPaymentResult, wallets, transactions, users, notifications } = get()
          const result = nextPaymentResult
          const reference = generateReference()
          const gatewayReference = `ZP-DEMO-${Math.floor(Math.random() * 899999) + 100000}`
          const createdAt = new Date().toISOString()
          const userId = activeUserId ?? demoUserId
          const user = users.find((u) => u.id === userId)
          if (result === 'success') {
            set({
              wallets: wallets.map((w) =>
                w.userId === userId
                  ? { ...w, availableBalance: w.availableBalance + amount, ledgerBalance: w.ledgerBalance + amount }
                  : w,
              ),
              transactions: [
                {
                  id: `TXN-${Date.now()}`,
                  reference,
                  userId,
                  customerName: user ? `${user.firstName} ${user.lastName}` : undefined,
                  type: 'wallet_funding',
                  direction: 'credit',
                  amount,
                  fee,
                  status: 'successful',
                  channel: channel as Transaction['channel'],
                  gatewayReference,
                  narration: 'Wallet Funding',
                  description: 'Wallet funding via ' + methodLabel,
                  createdAt,
                },
                ...transactions,
              ],
              notifications: [
                {
                  id: `NTF-${Date.now()}`,
                  category: 'transaction',
                  title: 'Wallet funding received',
                  body: `Your wallet funding of ₦${amount.toLocaleString()} was successful.`,
                  createdAt,
                  read: false,
                  audience: 'user',
                },
                ...notifications,
              ],
            })
          } else {
            set({
              transactions: [
                {
                  id: `TXN-${Date.now()}`,
                  reference,
                  userId,
                  customerName: user ? `${user.firstName} ${user.lastName}` : undefined,
                  type: 'wallet_funding',
                  direction: 'credit',
                  amount,
                  fee,
                  status: result,
                  channel: channel as Transaction['channel'],
                  gatewayReference,
                  narration: 'Wallet Funding',
                  description: 'Wallet funding via ' + methodLabel,
                  createdAt,
                },
                ...transactions,
              ],
            })
          }
          const date = createdAt
          return {
            result,
            amount,
            fee,
            total: amount + fee,
            email: user?.email ?? '',
            reference,
            gatewayReference,
            channel,
            methodLabel,
            narration: 'Wallet Funding',
            date,
          }
        },

        recordTransfer: (payload) => {
          const { activeUserId, wallets, transactions, users } = get()
          const reference = generateReference()
          const createdAt = new Date().toISOString()
          const userId = activeUserId ?? demoUserId
          const user = users.find((u) => u.id === userId)
          const summary: PaymentSummary = {
            result: 'success',
            amount: payload.amount,
            fee: payload.fee,
            total: payload.amount + payload.fee,
            email: user?.email ?? '',
            reference,
            channel: 'wallet',
            methodLabel: 'Wallet Balance',
            narration: payload.narration,
            date: createdAt,
          }
          set({
            wallets: wallets.map((w) =>
              w.userId === userId
                ? { ...w, availableBalance: w.availableBalance - payload.amount - payload.fee, ledgerBalance: w.ledgerBalance - payload.amount }
                : w,
            ),
            transactions: [
              {
                id: `TXN-${Date.now()}`,
                reference,
                userId,
                customerName: user ? `${user.firstName} ${user.lastName}` : undefined,
                type: 'transfer',
                direction: 'debit',
                amount: payload.amount,
                fee: payload.fee,
                status: 'successful',
                channel: 'wallet',
                narration: payload.narration,
                description: `Transfer to ${payload.target}`,
                recipientName: payload.target,
                bank: payload.bank,
                accountNumber: payload.accountNumber,
                createdAt,
              },
              ...transactions,
            ],
          })
          return summary
        },

        payBill: (payload) => {
          const { activeUserId, wallets, transactions, users } = get()
          const reference = generateReference()
          const createdAt = new Date().toISOString()
          const userId = activeUserId ?? demoUserId
          const user = users.find((u) => u.id === userId)
          const summary: PaymentSummary = {
            result: 'success',
            amount: payload.amount,
            fee: payload.fee,
            total: payload.amount + payload.fee,
            email: user?.email ?? '',
            reference,
            channel: 'wallet',
            methodLabel: 'Wallet Balance',
            narration: payload.narration,
            date: createdAt,
          }
          set({
            wallets: wallets.map((w) =>
              w.userId === userId
                ? { ...w, availableBalance: w.availableBalance - payload.amount - payload.fee }
                : w,
            ),
            transactions: [
              {
                id: `TXN-${Date.now()}`,
                reference,
                userId,
                customerName: user ? `${user.firstName} ${user.lastName}` : undefined,
                type: payload.type,
                direction: 'debit',
                amount: payload.amount,
                fee: payload.fee,
                status: 'successful',
                channel: 'wallet',
                narration: payload.narration,
                description: payload.narration,
                createdAt,
              },
              ...transactions,
            ],
          })
          return summary
        },

        setLastPayment: (summary) => set({ lastPayment: summary }),
        setNextPaymentResult: (r) => set({ nextPaymentResult: r }),
        resolvePendingTx: (reference) => {
          const tx = get().transactions.find((t) => t.reference === reference && t.status === 'pending')
          if (!tx) return
          set({
            transactions: get().transactions.map((t) => (t.reference === reference ? { ...t, status: 'successful' } : t)),
            wallets: get().wallets.map((w) =>
              w.userId === tx.userId && tx.direction === 'credit'
                ? { ...w, availableBalance: w.availableBalance + tx.amount, ledgerBalance: w.ledgerBalance + tx.amount }
                : w,
            ),
          })
        },

        addBeneficiary: (b) =>
          set({
            beneficiaries: [
              { ...b, id: `BNF-${Date.now()}`, createdAt: new Date().toISOString() },
              ...get().beneficiaries,
            ],
          }),
        removeBeneficiary: (id) =>
          set({ beneficiaries: get().beneficiaries.filter((b) => b.id !== id) }),
        renameBeneficiary: (id, nickname) =>
          set({
            beneficiaries: get().beneficiaries.map((b) => (b.id === id ? { ...b, nickname } : b)),
          }),

        markNotificationRead: (id, audience) =>
          set({
            notifications: get().notifications.map((n) =>
              n.id === id && (n.audience === audience || n.audience === 'all') ? { ...n, read: true } : n,
            ),
          }),
        markAllNotificationsRead: (audience) =>
          set({
            notifications: get().notifications.map((n) =>
              n.audience === audience || n.audience === 'all' ? { ...n, read: true } : n,
            ),
          }),
        pushNotification: (n) =>
          set({
            notifications: [
              { ...n, id: `NTF-${Date.now()}`, read: false, createdAt: new Date().toISOString() },
              ...get().notifications,
            ],
          }),

        toggleHideBalance: () => set({ hideBalance: !get().hideBalance }),
        updateProfile: (patch) =>
          set({
            users: get().users.map((u) => (u.id === get().activeUserId ? { ...u, ...patch } : u)),
          }),
        updateKyc: (patch) => set({ kycDraft: { ...get().kycDraft, ...patch } }),
        submitKyc: () => {
          const draft = get().kycDraft
          const now = new Date().toISOString()
          set({ kycDraft: { ...draft, status: 'in_review', submittedAt: now } })
          get().pushNotification({
            category: 'kyc',
            title: 'New KYC submission',
            body: `${draft.level > 0 ? 'Upgrade' : 'New'} KYC application submitted by ${
              get().users.find((u) => u.id === get().activeUserId)?.firstName ?? 'a customer'
            }.`,
            audience: 'admin',
          })
        },

        adminAction: (action, userId, note) => {
          const user = get().users.find((u) => u.id === userId)
          const statusMap: Record<string, UserStatus> = {
            restrict: 'restricted',
            unrestrict: 'active',
            suspend: 'suspended',
            activate: 'active',
          }
          const label = user ? `${user.firstName} ${user.lastName}` : userId
          set({
            users: get().users.map((u) => (u.id === userId ? { ...u, status: statusMap[action] } : u)),
            wallets: get().wallets.map((w) =>
              w.userId === userId
                ? { ...w, status: action === 'restrict' || action === 'suspend' ? 'restricted' : 'active' }
                : w,
            ),
          })
          get().addAudit({
            admin: 'A. Admin',
            adminId: 'ADM-301',
            action: action === 'restrict' ? 'Restricted Customer' : action === 'suspend' ? 'Suspended Customer' : action === 'activate' ? 'Activated Customer' : 'Unrestricted Customer',
            resource: userId,
            resourceType: 'Customer',
            level: action === 'restrict' || action === 'suspend' ? 'critical' : 'info',
            ip: '102.89.44.21',
            device: 'Chrome / Windows',
          })
          void note
        },

        adjustWallet: (userId, amount, note) => {
          const user = get().users.find((u) => u.id === userId)
          set({
            wallets: get().wallets.map((w) =>
              w.userId === userId
                ? { ...w, availableBalance: Math.max(0, w.availableBalance + amount), ledgerBalance: Math.max(0, w.ledgerBalance + amount) }
                : w,
            ),
          })
          get().addAudit({
            admin: 'A. Admin',
            adminId: 'ADM-301',
            action: 'Adjusted Wallet',
            resource: get().wallets.find((w) => w.userId === userId)?.id ?? userId,
            resourceType: 'Wallet',
            level: 'critical',
            ip: '102.89.44.21',
            device: 'Chrome / Windows',
          })
          void user
          void note
        },

        reviewKyc: (id, decision, note) => {
          const app = get().kyc.find((k) => k.id === id)
          set({
            kyc: get().kyc.map((k) => (k.id === id ? { ...k, status: decision, note } : k)),
              users: get().users.map((u) =>
              u.id === app?.userId
                ? { ...u, kycStatus: (decision === 'approved' ? 'verified' : 'rejected') as KycStatus, kycLevel: decision === 'approved' ? (Math.max(u.kycLevel, app?.level ?? 2) as KycLevel) : u.kycLevel }
                : u,
            ),
          })
          if (app) {
            get().pushNotification({
              category: 'kyc',
              title: decision === 'approved' ? 'KYC application approved' : 'KYC application rejected',
              body: `Your ${decision === 'approved' ? 'Level ' + app.level + ' ' : ''}KYC application was ${decision}.`,
              audience: 'user',
            })
          }
          get().addAudit({
            admin: 'A. Admin',
            adminId: 'ADM-301',
            action: decision === 'approved' ? 'Approved KYC' : 'Rejected KYC',
            resource: id,
            resourceType: 'KYC',
            level: 'warning',
            ip: '102.89.44.21',
            device: 'Chrome / Windows',
          })
        },

        updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
        seedAdminLog: (entry) =>
          set({
            auditLogs: [
              {
                id: `AUD-${Date.now()}`,
                admin: 'A. Admin',
                adminId: 'ADM-301',
                action: entry.action,
                resource: entry.resource,
                resourceType: entry.resourceType,
                ip: entry.ip ?? '102.89.44.21',
                device: entry.device ?? 'Chrome / Windows',
                level: 'info',
                createdAt: new Date().toISOString(),
              },
              ...get().auditLogs,
            ],
          }),

        addAudit: (entry) =>
          set({
            auditLogs: [
              {
                ...entry,
                id: `AUD-${Date.now()}`,
                createdAt: new Date().toISOString(),
              },
              ...get().auditLogs,
            ],
          }),

        createMerchantApp: (input) => {
          const app: MerchantApp = {
            id: `APP-${String(Date.now()).slice(-6)}`,
            merchantId: input.merchantId,
            name: input.name,
            platformType: input.platformType,
            websiteUrl: input.websiteUrl,
            description: input.description,
            environment: 'sandbox',
            status: 'active',
            createdAt: new Date().toISOString(),
          }
          set({ merchantApps: [app, ...get().merchantApps] })
          return app
        },

        generateSandboxKeys: (appId) => {
          const now = new Date().toISOString()
          const mk = (type: ApiKey['type'], prefix: string): ApiKey => ({
            id: `KEY-${Date.now()}-${type}`,
            applicationId: appId,
            merchantId: get().merchantApps.find((a) => a.id === appId)?.merchantId ?? get().activeMerchantId ?? '',
            label: type === 'public' ? 'Public key' : 'Secret key',
            type,
            environment: 'sandbox',
            prefix,
            maskedValue: `${prefix}${'•'.repeat(6)}${Math.random().toString(36).slice(2, 6)}`,
            status: 'active',
            createdAt: now,
          })
          set({
            merchantKeys: [
              ...get().merchantKeys.filter((k) => !(k.applicationId === appId && k.type === 'public' && k.environment === 'sandbox' && k.status === 'active')),
              mk('public', 'hp_test_pk_'),
              mk('secret', 'hp_test_sk_'),
            ],
          })
        },

        rotateMerchantKey: (keyId) => {
          set({
            merchantKeys: get().merchantKeys.map((k) =>
              k.id === keyId
                ? {
                    ...k,
                    maskedValue: `${k.prefix}${'•'.repeat(6)}${Math.random().toString(36).slice(2, 6)}`,
                    lastUsedAt: undefined,
                  }
                : k,
            ),
          })
        },

        revokeMerchantKey: (keyId) =>
          set({ merchantKeys: get().merchantKeys.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k)) }),

        saveWebhook: (cfg) => {
          const merchantId = get().activeMerchantId ?? demoMerchantId
          const now = new Date().toISOString()
          const existing = get().merchantWebhooks.find((w) => w.applicationId === cfg.applicationId)
          if (existing) {
            set({
              merchantWebhooks: get().merchantWebhooks.map((w) =>
                w.id === existing.id ? { ...w, url: cfg.url, events: cfg.events, status: 'active' } : w,
              ),
            })
          } else {
            set({
              merchantWebhooks: [
                ...get().merchantWebhooks,
                {
                  id: `WHK-${Date.now()}`,
                  applicationId: cfg.applicationId,
                  merchantId,
                  url: cfg.url,
                  events: cfg.events,
                  secretPrefix: 'whsec_demo_',
                  status: 'active',
                  retryPolicy: '3 attempts · exponential backoff',
                  createdAt: now,
                },
              ],
            })
          }
        },

        retryWebhookDelivery: (id) =>
          set({
            webhookDeliveries: get().webhookDeliveries.map((d) =>
              d.id === id ? { ...d, status: 'delivered' as const, attempts: d.attempts + 1, httpCode: 200 } : d,
            ),
          }),

        createRefund: (merchantId, paymentReference, amount, reason) => {
          const now = new Date().toISOString()
          set({
            merchantRefunds: [
              {
                id: `RFD-${Date.now()}`,
                reference: `RFD-${String(800000 + Math.floor(Math.random() * 899999))}`,
                merchantId,
                paymentReference,
                amount,
                status: 'processing',
                reason,
                createdAt: now,
              },
              ...get().merchantRefunds,
            ],
            merchantPayments: get().merchantPayments.map((p) =>
              p.haighaRef === paymentReference ? { ...p, status: 'refunded', webhook: 'pending' } : p,
            ),
          })
        },

        runApiRequest: (input) => {
          const statusTime = (statusCode: number, responseTimeMs: number, body: Record<string, unknown>) => {
            set({
              merchantApiLogs: [
                {
                  id: `LOG-${Date.now()}`,
                  merchantId: input.merchantId,
                  applicationId: input.appId,
                  requestId: `REQ-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                  method: input.method,
                  endpoint: input.endpoint,
                  statusCode,
                  responseTimeMs,
                  environment: 'sandbox',
                  ip: '102.89.44.21',
                  keyPrefix: 'hp_test_sk_',
                  requestBody: input.body,
                  responseBody: JSON.stringify(body, null, 2),
                  createdAt: new Date().toISOString(),
                },
                ...get().merchantApiLogs,
              ],
            })
            return { statusCode, responseTimeMs, body }
          }

          if (input.endpoint.includes('/payments/verify') || input.endpoint.includes('/verify')) {
            return statusTime(200, 187, {
              success: true,
              data: {
                reference: 'HPY-260909-993021',
                merchant_reference: 'ORDER-100293',
                amount: 50000,
                currency: 'NGN',
                status: 'successful',
                paid_at: '2026-09-09T10:35:22Z',
                channel: 'bank_transfer',
              },
            })
          }

          if (input.endpoint.includes('/payments') && input.method === 'POST') {
            let amount = 0
            try {
              amount = parseInt(JSON.parse(input.body ?? '{}').amount ?? '0', 10)
            } catch {
              amount = 0
            }
            if (!input.body || !(JSON.parse(input.body ?? '{}') as { amount?: unknown }).amount) {
              return statusTime(422, 96, {
                success: false,
                message: 'Validation failed',
                errors: { amount: ['The amount field is required.'] },
              })
            }
            const status = amount === 2000 ? 'pending' : amount === 3000 ? 'failed' : amount === 4000 ? 'reversed' : 'successful'
            const code = status === 'failed' || status === 'reversed' ? 200 : 200
            void code
            return statusTime(200, amount === 50000 ? 482 : 318, {
              success: true,
              message: 'Payment initialized',
              data: {
                reference: `HPY-${Date.now()}`,
                merchant_reference: (JSON.parse(input.body) as { reference?: string }).reference ?? 'ORDER-DEMO',
                amount,
                currency: 'NGN',
                status,
                checkout_url: `https://checkout.haighapay.com/pay/HPY-${Date.now()}`,
              },
            })
          }

          if (input.endpoint.includes('/refunds') && input.method === 'POST') {
            const body = JSON.parse(input.body ?? '{}') as { amount?: string }
            return statusTime(201, 254, {
              success: true,
              data: {
                refund_reference: `RFD-${String(800000 + Math.floor(Math.random() * 899999))}`,
                payment_reference: (body as { payment_reference?: string }).payment_reference ?? 'HPY-000000',
                amount: Number(body.amount ?? 0),
                status: 'processing',
              },
            })
          }

          if (input.method === 'GET' && input.endpoint.startsWith('/v1/payments/')) {
            return statusTime(200, 140, {
              success: true,
              data: {
                reference: 'HPY-260909-993021',
                merchant_reference: 'ORDER-100293',
                amount: 50000,
                currency: 'NGN',
                status: 'successful',
                channel: 'card',
                customer: 'Aisha Mohammed',
                fee: 770,
                gateway_reference: 'ZP-900003',
                metadata: { order_id: '100293', customer_id: 'CUS-8001' },
                created_at: '2026-09-09T10:33:12Z',
                paid_at: '2026-09-09T10:35:22Z',
              },
            })
          }

          return statusTime(404, 80, { success: false, message: 'Endpoint not found' })
        },

        requestLiveAccess: (merchantId) =>
          set({
            merchants: get().merchants.map((m) => (m.id === merchantId ? { ...m, liveRequested: true } : m)),
          }),

        adminMerchantAction: (merchantId, action) => {
          const now = new Date().toISOString()
          const merchant = get().merchants.find((m) => m.id === merchantId)
          const label = merchant?.businessName ?? merchantId
          if (action === 'approveLive') {
            const app = get().merchantApps.find((a) => a.merchantId === merchantId && a.status === 'active')
            const mk = (type: ApiKey['type'], prefix: string): ApiKey => ({
              id: `KEY-${Date.now()}-${type}`,
              applicationId: app?.id ?? 'APP-LIVE',
              merchantId,
              label: type === 'public' ? 'Public key' : 'Secret key',
              type,
              environment: 'live',
              prefix,
              maskedValue: `${prefix}${'•'.repeat(6)}${Math.random().toString(36).slice(2, 6)}`,
              status: 'active',
              createdAt: now,
            })
            set({
              merchants: get().merchants.map((m) =>
                m.id === merchantId ? { ...m, liveAccess: true, liveRequested: false, kybStatus: 'approved' } : m,
              ),
              merchantApps: get().merchantApps.map((a) =>
                a.merchantId === merchantId && a.status === 'active' && a.environment === 'sandbox'
                  ? { ...a, environment: 'live' }
                  : a,
              ),
              merchantKeys: [
                ...get().merchantKeys.filter(
                  (k) => !(k.merchantId === merchantId && k.environment === 'live' && k.type === 'secret'),
                ),
                ...(app ? [mk('public', 'hp_live_pk_'), mk('secret', 'hp_live_sk_')] : []),
              ],
            })
          } else if (action === 'approveKyb' || action === 'rejectKyb') {
            set({
              merchants: get().merchants.map((m) =>
                m.id === merchantId
                  ? { ...m, kybStatus: action === 'approveKyb' ? 'approved' : 'rejected', status: action === 'approveKyb' ? 'active' : m.status }
                  : m,
              ),
            })
          } else {
            const suspend = action === 'suspend'
            set({
              merchants: get().merchants.map((m) =>
                m.id === merchantId ? { ...m, status: suspend ? 'suspended' : 'active' } : m,
              ),
            })
          }
          get().pushNotification({
            category: 'platform',
            title: action === 'approveLive' ? 'Live access approved' : action === 'suspend' ? 'Merchant suspended' : action === 'unsuspend' ? 'Merchant re-activated' : action === 'approveKyb' ? 'KYB approved' : action === 'rejectKyb' ? 'KYB rejected' : 'Live access disabled',
            body: `${label} · ${action}`,
            audience: 'admin',
          })
          get().addAudit({
            admin: 'A. Admin',
            adminId: 'ADM-301',
            action: `Merchant ${action}`,
            resource: merchantId,
            resourceType: 'Merchant',
            level: 'critical',
            ip: '102.89.44.21',
            device: 'Chrome / Windows',
          })
        },
      }
    },
    {
      name: 'haigha-pay-store-v1',
    },
  ),
)

export function useCurrentUser() {
  return useAppStore((s) => s.users.find((u) => u.id === s.activeUserId) ?? null)
}

export function useCurrentMerchant() {
  return useAppStore((s) => s.merchants.find((m) => m.id === s.activeMerchantId) ?? null)
}

export function useCurrentMerchantApps() {
  return useAppStore((s) => {
    const mid = s.activeMerchantId
    return s.merchantApps.filter((a) => a.merchantId === mid)
  })
}

export function useCurrentMerchantKeys() {
  return useAppStore((s) => {
    const mid = s.activeMerchantId
    const appIds = s.merchantApps.filter((a) => a.merchantId === mid).map((a) => a.id)
    return s.merchantKeys.filter((k) => appIds.includes(k.applicationId))
  })
}

export function useCurrentMerchantPayments() {
  return useAppStore((s) => s.merchantPayments.filter((p) => p.merchantId === s.activeMerchantId))
}

export function useCurrentMerchantRefunds() {
  return useAppStore((s) => s.merchantRefunds.filter((r) => r.merchantId === s.activeMerchantId))
}

export function useCurrentMerchantSettlements() {
  return useAppStore((s) => s.merchantSettlements.filter((st) => st.merchantId === s.activeMerchantId))
}

export function useCurrentMerchantLogs() {
  return useAppStore((s) => s.merchantApiLogs.filter((l) => l.merchantId === s.activeMerchantId))
}

export function useCurrentWallet() {
  return useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId) ?? null)
}

export function useCurrentTransactions() {
  return useAppStore((s) => s.transactions.filter((t) => t.userId === s.activeUserId))
}

export function useUserNotifications() {
  return useAppStore((s) => s.notifications.filter((n) => n.audience === 'user' || n.audience === 'all'))
}

export function useAdminNotifications() {
  return useAppStore((s) => s.notifications.filter((n) => n.audience === 'admin' || n.audience === 'all'))
}
