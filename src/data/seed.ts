import type {
  AppNotification,
  AuditLog,
  GatewayPayment,
  KycApplication,
  Transaction,
  TxType,
  User,
  Wallet,
} from '../types'

const NOW = '2026-09-09T12:00:00.000Z'

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260909)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function isoBefore(days: number, hours = 0, minutes = 0): string {
  const base = new Date(NOW).getTime()
  const ms = base - days * 86400000 - hours * 3600000 - minutes * 60000
  return new Date(ms).toISOString()
}

const firstNames = [
  'Ibrahim', 'Aisha', 'Musa', 'Fatima', 'Yusuf', 'Zainab', 'Abdullahi', 'Halima',
  'Sani', 'Maryam', 'Kabiru', 'Amina', 'Usman', 'Rabiu', 'Sadiya', 'Hauwa',
  'Suleiman', 'Nafisa', 'Bello', 'Rukayya', 'Adamu', 'Khadija', 'Tijani', 'Hafsat',
  'Garba', 'Safiya', 'Danladi', 'Auwal', 'Laraba', 'Bashir', 'Jamila', 'Nuhu',
]
const lastNames = [
  'Mohammed', 'Ibrahim', 'Ali', 'Bello', 'Umar', 'Adamu', 'Sani', 'Lawal',
  'Usman', 'Abubakar', 'Musa', 'Garba', 'Yusuf', 'Suleiman', 'Danladi', 'Hassan',
  'Kabir', 'Saleh', 'Abdullahi', 'Nuhu', 'Bala', 'Tukur', 'Dauda', 'Sule',
]

const phoneGen = (): string => {
  const prefix = pick(['0803', '0802', '0809', '0701', '0812', '0901', '0806'])
  let rest = ''
  for (let i = 0; i < 7; i++) rest += Math.floor(rand() * 10)
  return prefix + rest
}

export function buildSeed(): {
  users: User[]
  wallets: Wallet[]
  transactions: Transaction[]
  gateway: GatewayPayment[]
  kyc: KycApplication[]
  notifications: AppNotification[]
  auditLogs: AuditLog[]
} {
  const users: User[] = []
  const statuses: User['status'][] = ['active', 'active', 'active', 'active', 'restricted', 'suspended']
  const kycStatuses: User['kycStatus'][] = ['verified', 'verified', 'verified', 'in_review', 'not_started', 'rejected']

  const demoUser: User = {
    id: 'CUS-000421',
    firstName: 'Ibrahim',
    lastName: 'Ali',
    email: 'user@haighapay.demo',
    phone: '+2348034567890',
    status: 'active',
    kycLevel: 2,
    kycStatus: 'verified',
    createdAt: '2026-04-12T09:20:00.000Z',
    avatarColor: '#086A37',
    address: '14 Ahmadu Bello Way, Kaduna',
  }
  users.push(demoUser)

  for (let i = 0; i < 31; i++) {
    const id = 100000 + 240 + i * 7 + (i % 5)
    users.push({
      id: `CUS-${id}`,
      firstName: pick(firstNames),
      lastName: pick(lastNames),
      email: `${pick(firstNames).toLowerCase()}.${pick(lastNames).toLowerCase()}${Math.floor(rand() * 90 + 10)}@example.ng`,
      phone: `+234${phoneGen()}`,
      status: pick(statuses),
      kycLevel: (pick([0, 1, 1, 2, 2, 2, 3]) as 0 | 1 | 2 | 3),
      kycStatus: pick(kycStatuses),
      createdAt: isoBefore(Math.floor(rand() * 150) + 2, Math.floor(rand() * 24), Math.floor(rand() * 60)),
      avatarColor: pick(['#086A37', '#049C47', '#2563EB', '#7C3AED', '#DC2626', '#0EA5E9']),
    })
  }

  const wallets: Wallet[] = users.map((u, i) => ({
    id: `WLT-${String(400000 + i * 17).slice(0, 6)}`,
    userId: u.id,
    currency: 'NGN',
    availableBalance: Math.round(rand() * 2_500_000) + (i === 0 ? 248500 : Math.round(rand() * 30000)),
    ledgerBalance: 0,
    status: u.status === 'active' ? 'active' : 'restricted',
  }))

  const narrationByType: Record<TxType, string[]> = {
    wallet_funding: ['Wallet Funding', 'Wallet Top-up', 'Bank Transfer Funding'],
    transfer: ['Transfer to {name}', 'Send Money to {name}', 'Transfer to {name}'],
    airtime: ['Airtime Purchase', 'Airtime Top-up'],
    data: ['Data Bundle Purchase', 'Internet Data Subscription'],
    electricity: ['Electricity Bill Payment', 'Prepaid Electricity Purchase'],
    cable_tv: ['Cable TV Subscription', 'DStv Subscription Renewal'],
    wallet_adjustment: ['Admin Adjustment', 'Wallet Correction'],
  }

  const channelsByType: Partial<Record<TxType, Transaction['channel'][]>> = {
    wallet_funding: ['card', 'bank_transfer', 'virtual_account', 'card'],
    transfer: ['wallet'],
    airtime: ['wallet'],
    data: ['wallet'],
    electricity: ['wallet'],
    cable_tv: ['wallet'],
    wallet_adjustment: ['wallet'],
  }

  const types: TxType[] = ['transfer', 'transfer', 'wallet_funding', 'airtime', 'data', 'electricity', 'cable_tv', 'wallet_funding', 'transfer']
  const banksSeed = [
    'Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Moniepoint', 'Kuda Bank', 'Opay',
  ]

  const customersNameMap = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]))

  const txs: Transaction[] = []
  let seq = 0
  const usedCustomer = new Map<string, number>()
  const demoUserRefs = new Set([
    'HPY-260909-102301', // today funding
    'HPY-260908-002931',
  ])

  for (let d = 0; d < 34; d++) {
    const count = d === 0 ? 7 : Math.floor(rand() * 4) + 2
    for (let c = 0; c < count; c++) {
      seq += 1
      const owner = users[Math.floor(rand() * users.length)]
      const type = pick(types)
      const isCredit = type === 'wallet_funding'
      const amount = isCredit
        ? pick([1000, 2000, 5000, 10000, 20000, 50000, 25000, 100000])
        : type === 'transfer'
          ? pick([1500, 3200, 7500, 12000, 18500, 22000, 45000, 90000])
          : type === 'cable_tv'
            ? pick([2500, 3800, 6900, 12500])
            : type === 'electricity'
              ? pick([2000, 5000, 8000, 15000, 25000])
              : pick([200, 500, 1000, 2000, 5000, 3000])
      const fee = type === 'transfer' ? Math.min(amount * 0.003, 50) + 10 : type === 'cable_tv' || type === 'electricity' ? 50 : 0
      const hour = d === 0 ? Math.max(0, 11 - c) : Math.floor(rand() * 24)
      const minute = Math.floor(rand() * 60)
      const second = Math.floor(rand() * 60)
      const createdAt = isoBefore(d, hour, minute)
      const replaced = new Date(createdAt).setSeconds(second)
      const destUser = pick(users)
      const narration = narrationByType[type]
        .join('|')
        .replace('{name}', `${destUser.firstName} ${destUser.lastName}`)
        .split('|')[Math.floor(rand() * 3)]
      const seqNum = String(900000 + seq)
      const datePart = createdAt.slice(2, 10).replace(/-/g, '')
      const ref =
        demoUserRefs.has(`HPY-${datePart}-${seqNum}`) ? `HPY-${datePart}-${seqNum}`
          : d === 0 && c === 0 && type === 'wallet_funding' && owner.id === 'CUS-000421' ? 'HPY-260909-102301'
          : d === 1 && type === 'transfer' && owner.id === 'CUS-000421' && c === 0 ? 'HPY-260908-002931'
          : `HPY-${datePart}-${seqNum}`

      usedCustomer.set(owner.id, (usedCustomer.get(owner.id) ?? 0) + 1)

      const status: Transaction['status'] =
        d === 0 && type === 'wallet_funding' && Math.floor(rand() * 10) === 0 ? 'pending'
          : Math.floor(rand() * 22) === 0 ? 'failed'
            : d > 26 && Math.floor(rand() * 12) === 0 ? 'reversed'
              : 'successful'

      txs.push({
        id: `TXN-${String(seq).padStart(4, '0')}`,
        reference: ref,
        userId: owner.id,
        customerName: customersNameMap.get(owner.id) ?? `${owner.firstName} ${owner.lastName}`,
        type,
        direction: isCredit ? 'credit' : 'debit',
        amount,
        fee: Math.round(fee),
        status,
        channel: pick(channelsByType[type] as Transaction['channel'][]),
        gatewayReference: ['card', 'bank_transfer', 'virtual_account'].includes(type) || type === 'wallet_funding'
          ? `ZP-DEMO-${Math.floor(rand() * 899999) + 100000}`
          : undefined,
        narration,
        description: narration,
        recipientName: type === 'transfer' ? `${destUser.firstName} ${destUser.lastName}` : undefined,
        bank: type === 'transfer' ? (isCredit ? undefined : pick(banksSeed)) : undefined,
        accountNumber: type === 'transfer' && !isCredit ? String(1000000000 + Math.floor(rand() * 899999999)) : undefined,
        createdAt: new Date(replaced).toISOString(),
      })
    }
  }

  txs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const demoUserTransactions = txs.filter((t) => t.userId === 'CUS-000421')

  const gateway: GatewayPayment[] = txs
    .filter((t) => t.channel !== 'wallet' && ['wallet_funding'].includes(t.type))
    .slice(0, 40)
    .map((t, i): GatewayPayment => ({
      id: `GW-${String(i + 1).padStart(4, '0')}`,
      reference: t.reference,
      gatewayReference: t.gatewayReference ?? `ZP-DEMO-${100000 + i * 37}`,
      customer: t.customerName ?? 'Unknown',
      customerId: t.userId,
      amount: t.amount,
      channel: t.channel,
      gatewayStatus: t.status === 'successful' ? 'successful' : t.status === 'failed' ? 'failed' : 'pending',
      haighaStatus: t.status,
      createdAt: t.createdAt,
      provider: 'ZainPay',
    }))
    .slice(0, 26)

  const kyc: KycApplication[] = []
  const pendingApplicants = users.filter((u) => u.kycStatus === 'in_review' || (u.kycStatus === 'not_started' && u.kycLevel > 0)).slice(0, 8)
  pendingApplicants.forEach((u, i) => {
    kyc.push({
      id: `KYC-${String(700 + i * 3)}`,
      userId: u.id,
      customerName: `${u.firstName} ${u.lastName}`,
      customer: u,
      level: u.kycLevel || 2,
      status: 'in_review',
      nin: String(11000000000 + Math.floor(rand() * 89999999999)),
      bvn: String(22000000000 + Math.floor(rand() * 89999999999)),
      idType: pick(['National ID', 'International Passport', "Driver's Licence"]),
      submittedAt: isoBefore(Math.floor(rand() * 6), Math.floor(rand() * 10), Math.floor(rand() * 60)),
      riskFlags: Math.floor(rand() * 4) === 0 ? ['Name mismatch on BVN', 'Duplicate NIN reference'] : [],
    })
  })

  const notifications: AppNotification[] = []
  const notifDefs: { cat: AppNotification['category']; aud: AppNotification['audience']; title: string; body: string; daysAgo: number; hours?: number }[] = [
    { cat: 'transaction', aud: 'all', title: 'Wallet funding received', body: 'Your wallet funding of ₦50,000 was successful.', daysAgo: 0, hours: 1 },
    { cat: 'system', aud: 'all', title: 'Welcome to Haigha Pay', body: 'Your account is ready. Complete your KYC to unlock higher limits.', daysAgo: 2 },
    { cat: 'transaction', aud: 'all', title: 'Transfer successful', body: 'Your transfer of ₦22,000 to Musa Ibrahim was successful.', daysAgo: 1, hours: 2 },
    { cat: 'security', aud: 'all', title: 'New device sign-in', body: 'A new sign-in was detected on Chrome, Windows. Was this you?', daysAgo: 3 },
    { cat: 'promotion', aud: 'user', title: 'Data deals this week', body: 'Get up to 20% extra data on bundles above ₦1,000.', daysAgo: 1 },
    { cat: 'security', aud: 'all', title: 'Transaction PIN changed', body: 'Your transaction PIN was changed successfully.', daysAgo: 8 },
    { cat: 'gateway', aud: 'admin', title: 'Gateway success rate alert', body: 'Gateway success rate dropped below 97% in the last hour.', daysAgo: 0, hours: 3 },
    { cat: 'kyc', aud: 'admin', title: 'New KYC submission', body: '3 KYC applications are awaiting review.', daysAgo: 0, hours: 2 },
    { cat: 'transaction', aud: 'admin', title: 'Reconciliation needed', body: '14 payments are awaiting reconciliation.', daysAgo: 0, hours: 5 },
    { cat: 'platform', aud: 'admin', title: 'Scheduled maintenance', body: 'Platform maintenance is scheduled for Sunday 02:00–04:00 WAT.', daysAgo: 1 },
  ]
  notifDefs.forEach((n, i) => {
    notifications.push({
      id: `NTF-${String(i + 1).padStart(3, '0')}`,
      category: n.cat,
      title: n.title,
      body: n.body,
      createdAt: isoBefore(n.daysAgo, n.hours ?? 0, Math.floor(rand() * 59)),
      read: false,
      audience: n.aud,
    })
  })
  const currentUserUnreadIdx = new Set([0, 1, 2])
  const adminUnreadIdx = new Set([0, 1, 2, 3])
  notifications.forEach((n, i) => {
    if (n.audience === 'user' && !currentUserUnreadIdx.has(i)) n.read = true
    if (n.audience === 'admin' && !adminUnreadIdx.has(i)) n.read = true
    if (n.audience === 'all') n.read = !currentUserUnreadIdx.has(i)
  })

  const auditActions = ['Viewed Customer', 'Restricted Customer', 'Approved KYC', 'Rejected KYC', 'Logged In', 'Logged Out', 'Reset Transaction PIN', 'Viewed Transaction', 'Exported Report', 'Updated Settings', 'Adjusted Wallet', 'Viewed Audit Logs']
  const auditLogs: AuditLog[] = []
  for (let i = 0; i < 26; i++) {
    const action = pick(auditActions)
    const critical = action === 'Restricted Customer' || action === 'Adjusted Wallet'
    auditLogs.push({
      id: `AUD-${String(i + 1).padStart(4, '0')}`,
      admin: pick(['A. Admin', 'H. Bello', 'M. Sule', 'K. Adewale']),
      adminId: `ADM-${String(300 + i)}`,
      action,
      resource: pick(['CUS-000421', 'CUS-0010', 'CUS-0034', 'TXN-0010', 'KYC-703', 'Reports', 'Settings']),
      resourceType: action.includes('Customer') ? 'Customer' : action.includes('KYC') ? 'KYC' : action.includes('Transaction') ? 'Transaction' : action.includes('Report') ? 'Report' : action.includes('Setting') ? 'Settings' : action.includes('Wallet') ? 'Wallet' : 'Auth',
      ip: `${Math.floor(rand() * 200) + 20}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 90)}.${Math.floor(rand() * 90)}`,
      device: pick(['Chrome / Windows', 'Safari / macOS', 'Firefox / Windows', 'Chrome / Android']),
      createdAt: isoBefore(Math.floor(rand() * 6), Math.floor(rand() * 12), Math.floor(rand() * 60)),
      level: critical ? 'critical' : Math.floor(rand() * 6) === 0 ? 'warning' : 'info',
    })
  }
  auditLogs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const demoUserTx = demoUserTransactions.length ? demoUserTransactions : seedDemoTransactions()

  return { users, wallets, transactions: [...demoUserTx, ...txs.filter((t) => t.userId !== 'CUS-000421')], gateway, kyc, notifications, auditLogs }
}

function seedDemoTransactions(): Transaction[] {
  const mk = (partial: Partial<Transaction> & Pick<Transaction, 'id' | 'reference' | 'type' | 'direction' | 'amount' | 'status' | 'channel' | 'narration' | 'createdAt'>): Transaction => ({
    fee: 0,
    userId: 'CUS-000421',
    description: partial.narration,
    ...partial,
  })
  return [
    mk({
      id: 'TXN-0001', reference: 'HPY-260909-102301', type: 'wallet_funding', direction: 'credit', amount: 50000, fee: 0, status: 'successful', channel: 'card', gatewayReference: 'ZP-DEMO-584901', narration: 'Wallet Funding', createdAt: '2026-09-09T09:23:01.000Z',
    }),
    mk({
      id: 'TXN-0002', reference: 'HPY-260908-002931', type: 'transfer', direction: 'debit', amount: 22000, fee: 50, status: 'successful', channel: 'wallet', narration: 'Transfer to Musa Ibrahim', recipientName: 'Musa Ibrahim', bank: 'GTBank', accountNumber: '0123456789', createdAt: '2026-09-08T10:42:00.000Z',
    }),
    mk({
      id: 'TXN-0003', reference: 'HPY-260907-001844', type: 'airtime', direction: 'debit', amount: 5000, fee: 0, status: 'successful', channel: 'wallet', narration: 'Airtime Purchase', createdAt: '2026-09-07T08:15:00.000Z',
    }),
    mk({
      id: 'TXN-0004', reference: 'HPY-260906-000012', type: 'transfer', direction: 'debit', amount: 18500, fee: 50, status: 'pending', channel: 'wallet', narration: 'Transfer to Aisha Mohammed', recipientName: 'Aisha Mohammed', bank: 'Access Bank', accountNumber: '0201234567', createdAt: '2026-09-06T16:20:00.000Z',
    }),
    mk({
      id: 'TXN-0005', reference: 'HPY-260905-009901', type: 'electricity', direction: 'debit', amount: 12500, fee: 50, status: 'successful', channel: 'wallet', narration: 'Electricity Bill Payment', createdAt: '2026-09-05T11:05:00.000Z',
    }),
    mk({
      id: 'TXN-0006', reference: 'HPY-260904-002221', type: 'wallet_funding', direction: 'credit', amount: 100000, fee: 0, status: 'successful', channel: 'bank_transfer', gatewayReference: 'ZP-DEMO-221344', narration: 'Wallet Funding', createdAt: '2026-09-04T13:45:00.000Z',
    }),
    mk({
      id: 'TXN-0007', reference: 'HPY-260902-004550', type: 'data', direction: 'debit', amount: 1000, fee: 0, status: 'failed', channel: 'wallet', narration: 'Data Bundle Purchase', createdAt: '2026-09-02T19:30:00.000Z',
    }),
    mk({
      id: 'TXN-0008', reference: 'HPY-260901-007113', type: 'cable_tv', direction: 'debit', amount: 3800, fee: 50, status: 'successful', channel: 'wallet', narration: 'Cable TV Subscription', createdAt: '2026-09-01T18:10:00.000Z',
    }),
  ]
}

export const demoUserId = 'CUS-000421'

export function seedBeneficiaries() {
  return [
    {
      id: 'BNF-001', name: 'Aisha Mohammed', kind: 'bank' as const, bank: 'Access Bank', accountNumber: '0123456789', createdAt: '2026-05-02T10:00:00.000Z',
    },
    {
      id: 'BNF-002', name: 'Musa Ibrahim', kind: 'bank' as const, bank: 'GTBank', accountNumber: '0041223141', createdAt: '2026-06-18T09:12:00.000Z',
    },
    {
      id: 'BNF-003', name: 'Fatima Ali', kind: 'haigha' as const, accountNumber: 'HPY-88012', createdAt: '2026-07-30T15:44:00.000Z',
    },
    {
      id: 'BNF-004', name: 'Yusuf Bello', kind: 'haigha' as const, accountNumber: 'HPY-77190', createdAt: '2026-08-11T08:30:00.000Z',
    },
  ]
}

export function series7Days() {
  const data = [
    { day: 'Mon', spent: 18500, received: 50000 },
    { day: 'Tue', spent: 3400, received: 10000 },
    { day: 'Wed', spent: 22000, received: 0 },
    { day: 'Thu', spent: 12500, received: 5000 },
    { day: 'Fri', spent: 7600, received: 20000 },
    { day: 'Sat', spent: 9800, received: 1000 },
    { day: 'Sun', spent: 2400, received: 100000 },
  ]
  return data
}

export function volumeSeries(days = 30) {
  const r = mulberry32(77)
  const out: { label: string; value: number }[] = []
  const start = new Date(NOW).getTime()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start - i * 86400000)
    out.push({
      label: d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' }),
      value: Math.round((2_800_000 + r() * 2_200_000) * (0.75 + r() * 0.5)),
    })
  }
  return out
}

export function gatewayChartData() {
  return [
    { name: 'Successful', value: 12482, color: '#16A34A' },
    { name: 'Pending', value: 210, color: '#F59E0B' },
    { name: 'Failed', value: 184, color: '#DC2626' },
    { name: 'Reversed', value: 63, color: '#2563EB' },
  ]
}

export function channelChartData() {
  return [
    { name: 'Card', value: 6420, color: '#086A37' },
    { name: 'Bank Transfer', value: 3890, color: '#049C47' },
    { name: 'Wallet', value: 5010, color: '#98A2B3' },
    { name: 'Virtual Account', value: 1230, color: '#F59E0B' },
  ]
}

export function growthSeries() {
  const r = mulberry32(5)
  const out: { label: string; customers: number; wallets: number }[] = []
  const start = new Date(NOW).getTime()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(start - i * 86400000)
    const idx = 30 - i
    out.push({
      label: d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' }),
      customers: Math.round(7600 + idx * 24 + r() * 40),
      wallets: Math.round(7000 + idx * 22 + r() * 40),
    })
  }
  return out
}

export function revenueSeries() {
  const r = mulberry32(11)
  const out: { label: string; fees: number; value: number }[] = []
  for (let m = 0; m < 6; m++) {
    const d = new Date(new Date(NOW).getTime() - m * 30 * 86400000)
    out.push({
      label: d.toLocaleDateString('en-NG', { month: 'short' }),
      fees: Math.round(400_000 + r() * 350_000),
      value: Math.round(60_000_000 + r() * 30_000_000),
    })
  }
  return out.reverse()
}
