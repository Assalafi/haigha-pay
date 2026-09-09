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

const t = (daysAgo: number, hour = 10, min = 0) => {
  const now = new Date('2026-09-09T12:00:00.000Z').getTime()
  return new Date(now - daysAgo * 86400000 - (10 - hour) * 3600000 - min * 60000).toISOString()
}

export const demoMerchantId = 'MCH-1001'

export function seedMerchantState(): {
  merchants: Merchant[]
  apps: MerchantApp[]
  keys: ApiKey[]
  webhooks: WebhookConfig[]
  webhookDeliveries: WebhookDelivery[]
  merchantPayments: MerchantPayment[]
  refunds: Refund[]
  settlements: Settlement[]
  apiLogs: ApiRequestLog[]
  team: TeamMember[]
} {
  const merchants: Merchant[] = [
    {
      id: 'MCH-1001',
      businessName: 'Greenline Stores Ltd',
      legalName: 'Greenline Stores Limited',
      email: 'merchant@haighapay.demo',
      phone: '+2348031112233',
      website: 'https://greenlinestores.ng',
      industry: 'E-commerce',
      country: 'Nigeria',
      status: 'active',
      kybStatus: 'approved',
      liveAccess: false,
      liveRequested: true,
      settlementBank: 'Access Bank',
      settlementAccount: '0112345678',
      settlementAccountName: 'Greenline Stores Ltd',
      createdAt: t(120),
    },
    {
      id: 'MCH-1002',
      businessName: 'Kaduna Scholars Portal',
      legalName: 'Kaduna Education Services',
      email: 'billing@kadunascholars.edu.ng',
      phone: '+2348055544332',
      website: 'https://portal.kadunascholars.edu.ng',
      industry: 'School Portal',
      country: 'Nigeria',
      status: 'active',
      kybStatus: 'approved',
      liveAccess: true,
      liveRequested: false,
      settlementBank: 'GTBank',
      settlementAccount: '0112345690',
      settlementAccountName: 'Kaduna Education Services',
      createdAt: t(200),
    },
    {
      id: 'MCH-1003',
      businessName: 'NileMart Marketplace',
      legalName: 'NileMart Holdings',
      email: 'api@nilemart.ng',
      phone: '+2347066699887',
      website: 'https://nilemart.ng',
      industry: 'Marketplace',
      country: 'Nigeria',
      status: 'pending',
      kybStatus: 'pending',
      liveAccess: false,
      liveRequested: false,
      settlementBank: 'Zenith Bank',
      settlementAccount: '0112345671',
      settlementAccountName: 'NileMart Holdings',
      createdAt: t(6),
    },
    {
      id: 'MCH-1004',
      businessName: 'RapidGigs',
      legalName: 'RapidGigs Services NG',
      email: 'hello@rapidgigs.ng',
      phone: '+2348033998877',
      website: 'https://rapidgigs.ng',
      industry: 'Other',
      country: 'Nigeria',
      status: 'active',
      kybStatus: 'approved',
      liveAccess: true,
      liveRequested: false,
      settlementBank: 'Moniepoint',
      settlementAccount: '9112233445',
      settlementAccountName: 'RapidGigs Services NG',
      createdAt: t(90),
    },
  ]

  const apps: MerchantApp[] = [
    {
      id: 'APP-001',
      merchantId: 'MCH-1001',
      name: 'Greenline Checkout',
      platformType: 'E-commerce',
      websiteUrl: 'https://greenlinestores.ng',
      description: 'Primary website checkout and order payments.',
      environment: 'sandbox',
      status: 'active',
      createdAt: t(60),
    },
    {
      id: 'APP-002',
      merchantId: 'MCH-1002',
      name: 'School Fees Portal',
      platformType: 'School Portal',
      websiteUrl: 'https://portal.kadunascholars.edu.ng',
      description: 'School fees collection via hosted checkout.',
      environment: 'live',
      status: 'active',
      createdAt: t(150),
    },
    {
      id: 'APP-003',
      merchantId: 'MCH-1001',
      name: 'Greenline Mobile App',
      platformType: 'Mobile App',
      description: 'React Native storefront app payments.',
      environment: 'sandbox',
      status: 'active',
      createdAt: t(20),
    },
    {
      id: 'APP-004',
      merchantId: 'MCH-1004',
      name: 'RapidGigs ERP',
      platformType: 'ERP',
      description: 'B2B invoice payments through ERP.',
      environment: 'live',
      status: 'active',
      createdAt: t(70),
    },
  ]

  const keys: ApiKey[] = [
    mkKey('KEY-101', 'APP-001', 'MCH-1001', 'public', 'sandbox', 'hp_test_pk_', '82ae93d10234', t(60), '2026-09-09T09:14:00.000Z'),
    mkKey('KEY-102', 'APP-001', 'MCH-1001', 'secret', 'sandbox', 'hp_test_sk_', '71e8c9f81a2d', t(60), '2026-09-09T09:14:00.000Z'),
    mkKey('KEY-201', 'APP-002', 'MCH-1002', 'public', 'live', 'hp_live_pk_', '5a1f02be77cc', t(150), '2026-09-09T10:02:00.000Z'),
    mkKey('KEY-202', 'APP-002', 'MCH-1002', 'secret', 'live', 'hp_live_sk_', '09c4d21e8f77', t(150), '2026-09-09T10:02:00.000Z'),
    mkKey('KEY-301', 'APP-003', 'MCH-1001', 'public', 'sandbox', 'hp_test_pk_', '33d90a1b7ee5', t(20)),
    mkKey('KEY-302', 'APP-003', 'MCH-1001', 'secret', 'sandbox', 'hp_test_sk_', '991ce0aa1d42', t(20)),
    mkKey('KEY-401', 'APP-004', 'MCH-1004', 'public', 'live', 'hp_live_pk_', '20aa5f71c004', t(70), '2026-09-08T16:40:00.000Z'),
    mkKey('KEY-402', 'APP-004', 'MCH-1004', 'secret', 'live', 'hp_live_sk_', '51ec78aa01dd', t(70), '2026-09-08T16:40:00.000Z'),
  ]

  const webhooks: WebhookConfig[] = [
    {
      id: 'WHK-001',
      applicationId: 'APP-001',
      merchantId: 'MCH-1001',
      url: 'https://greenlinestores.ng/api/haigha/webhook',
      events: ['payment.successful', 'payment.failed', 'refund.processing', 'settlement.completed'],
      secretPrefix: 'whsec_demo_',
      status: 'active',
      retryPolicy: '3 attempts · exponential backoff',
      createdAt: t(58),
    },
    {
      id: 'WHK-002',
      applicationId: 'APP-002',
      merchantId: 'MCH-1002',
      url: 'https://portal.kadunascholars.edu.ng/webhook/haigha',
      events: ['payment.successful'],
      secretPrefix: 'whsec_live_',
      status: 'active',
      retryPolicy: '5 attempts · exponential backoff',
      createdAt: t(140),
    },
  ]

  const webhookDeliveries: WebhookDelivery[] = [
    {
      id: 'DEL-881',
      merchantId: 'MCH-1001',
      applicationId: 'APP-001',
      event: 'payment.successful',
      url: 'https://greenlinestores.ng/api/haigha/webhook',
      httpCode: 200,
      attempts: 1,
      status: 'delivered',
      createdAt: t(0, 10, 35),
      requestHeaders: ['X-Haigha-Signature: sha256=3f9c2a…', 'Content-Type: application/json'],
      responseBody: '{"received":true}',
    },
    {
      id: 'DEL-882',
      merchantId: 'MCH-1001',
      applicationId: 'APP-001',
      event: 'payment.failed',
      url: 'https://greenlinestores.ng/api/haigha/webhook',
      httpCode: 500,
      attempts: 3,
      status: 'failed',
      createdAt: t(0, 9, 18),
      requestHeaders: ['X-Haigha-Signature: sha256=b1e44a…', 'Content-Type: application/json'],
      responseBody: 'Internal Server Error',
    },
    {
      id: 'DEL-883',
      merchantId: 'MCH-1001',
      applicationId: 'APP-001',
      event: 'payment.pending',
      url: 'https://greenlinestores.ng/api/haigha/webhook',
      httpCode: 200,
      attempts: 2,
      status: 'retrying',
      createdAt: t(1, 17, 2),
      requestHeaders: ['X-Haigha-Signature: sha256=9dd0f3…', 'Content-Type: application/json'],
      responseBody: '{"received":true}',
    },
    {
      id: 'DEL-884',
      merchantId: 'MCH-1002',
      applicationId: 'APP-002',
      event: 'payment.successful',
      url: 'https://portal.kadunascholars.edu.ng/webhook/haigha',
      httpCode: 200,
      attempts: 1,
      status: 'delivered',
      createdAt: t(2, 8, 45),
      requestHeaders: ['X-Haigha-Signature: sha256=22ee1b…', 'Content-Type: application/json'],
      responseBody: '{"ok":true}',
    },
  ]

  const mpay = (
    i: number,
    merchantId: string,
    applicationId: string,
    haighaRef: string,
    merchantRef: string,
    amount: number,
    channel: string,
    status: MerchantPayment['status'],
    createdAt: string,
    customerName: string,
    customerEmail: string,
    extra?: Partial<MerchantPayment>,
  ): MerchantPayment => ({
    id: `MP-${String(i).padStart(4, '0')}`,
    merchantId,
    haighaRef,
    merchantRef,
    customerName,
    customerEmail,
    amount,
    currency: 'NGN',
    channel,
    status,
    environment: applicationId === 'APP-001' || applicationId === 'APP-003' ? 'sandbox' : 'live',
    fee: Math.round(amount * 0.015) + 20,
    applicationId,
    gatewayReference: `ZP-${900000 + i * 3}`,
    webhook: status === 'successful' ? 'delivered' : status === 'failed' ? 'failed' : 'pending',
    metadata: { order_id: merchantRef.replace('ORD-', ''), customer_id: `CUS-${8000 + i}` },
    createdAt,
    paidAt: status === 'successful' || status === 'refunded' ? createdAt : undefined,
    ...extra,
  })

  const merchantPayments: MerchantPayment[] = [
    mpay(1, 'MCH-1001', 'APP-001', 'HPY-260909-993021', 'ORD-100293', 50000, 'card', 'successful', t(0, 10, 33), 'Aisha Mohammed', 'aisha.m@gmail.com'),
    mpay(2, 'MCH-1001', 'APP-001', 'HPY-260909-994110', 'ORD-100294', 18500, 'bank_transfer', 'successful', t(0, 9, 41), 'Musa Ibrahim', 'musa.i@gmail.com'),
    mpay(3, 'MCH-1001', 'APP-001', 'HPY-260909-990771', 'ORD-100295', 39000, 'card', 'failed', t(0, 9, 12), 'Fatima Ali', 'fatima.a@yahoo.com'),
    mpay(4, 'MCH-1001', 'APP-001', 'HPY-260908-002930', 'ORD-100278', 25000, 'wallet', 'successful', t(1, 16, 22), 'Yusuf Bello', 'yusuf.b@gmail.com'),
    mpay(5, 'MCH-1001', 'APP-001', 'HPY-260908-002912', 'ORD-100277', 64000, 'card', 'refunded', t(1, 13, 4), 'Zainab Umar', 'zainab.umar@gmail.com'),
    mpay(6, 'MCH-1001', 'APP-001', 'HPY-260907-001845', 'ORD-100266', 12000, 'virtual_account', 'pending', t(2, 11, 30), 'Sani Lawal', 'sani.l@outlook.com'),
    mpay(7, 'MCH-1001', 'APP-003', 'HPY-260906-000918', 'APP-ORD-882', 7400, 'card', 'successful', t(3, 15, 10), 'Halima Sule', 'halima.s@gmail.com'),
    mpay(8, 'MCH-1001', 'APP-003', 'HPY-260906-000901', 'APP-ORD-881', 15400, 'ussd', 'reversed', t(3, 10, 48), 'Adamu Garba', 'adamu.g@gmail.com'),
    mpay(9, 'MCH-1002', 'APP-002', 'HPY-260905-004102', 'SF-2026-8821', 120000, 'bank_transfer', 'successful', t(4, 8, 15), 'Khadija Umar', 'khadija.u@gmail.com'),
    mpay(10, 'MCH-1002', 'APP-002', 'HPY-260904-002210', 'SF-2026-8800', 120000, 'card', 'successful', t(5, 9, 2), 'Bello Adamu', 'bello.a@gmail.com'),
    mpay(11, 'MCH-1004', 'APP-004', 'HPY-260903-008812', 'INV-0092', 850000, 'bank_transfer', 'successful', t(6, 12, 40), 'Danladi Musa', 'danladi.m@gmail.com'),
    mpay(12, 'MCH-1004', 'APP-004', 'HPY-260902-009001', 'INV-0091', 240000, 'virtual_account', 'successful', t(7, 14, 20), 'Rukayya Bala', 'rukayya.b@gmail.com'),
  ]

  const refunds: Refund[] = [
    {
      id: 'RFD-001',
      reference: 'RFD-839102',
      merchantId: 'MCH-1001',
      paymentReference: 'HPY-260908-002912',
      amount: 64000,
      status: 'successful',
      reason: 'Customer requested cancellation',
      createdAt: t(1, 13, 40),
    },
    {
      id: 'RFD-002',
      reference: 'RFD-839210',
      merchantId: 'MCH-1001',
      paymentReference: 'HPY-260907-001845',
      amount: 12000,
      status: 'processing',
      reason: 'Duplicate order payment',
      createdAt: t(0, 8, 12),
    },
  ]

  const settlements: Settlement[] = [
    {
      id: 'STL-001',
      reference: 'STL-260908-0041',
      merchantId: 'MCH-1001',
      gross: 482000,
      fees: 7230,
      net: 474770,
      bank: 'Access Bank',
      accountNumber: '0112345678',
      accountName: 'Greenline Stores Ltd',
      status: 'completed',
      period: '07–08 Sep 2026',
      createdAt: t(1, 2, 0),
      completedAt: t(1, 11, 30),
    },
    {
      id: 'STL-002',
      reference: 'STL-260909-0042',
      merchantId: 'MCH-1001',
      gross: 875400,
      fees: 13131,
      net: 862269,
      bank: 'Access Bank',
      accountNumber: '0112345678',
      accountName: 'Greenline Stores Ltd',
      status: 'processing',
      period: '09 Sep 2026',
      createdAt: t(0, 2, 0),
    },
    {
      id: 'STL-003',
      reference: 'STL-260909-0043',
      merchantId: 'MCH-1001',
      gross: 1205000,
      fees: 18075,
      net: 1186925,
      bank: 'Access Bank',
      accountNumber: '0112345678',
      accountName: 'Greenline Stores Ltd',
      status: 'scheduled',
      period: 'Next window',
      createdAt: t(0, 12, 0),
    },
    {
      id: 'STL-101',
      reference: 'STL-260908-0102',
      merchantId: 'MCH-1002',
      gross: 360000,
      fees: 5400,
      net: 354600,
      bank: 'GTBank',
      accountNumber: '0112345690',
      accountName: 'Kaduna Education Services',
      status: 'completed',
      period: '07–08 Sep 2026',
      createdAt: t(1, 2, 0),
      completedAt: t(1, 9, 10),
    },
  ]

  const apiLogs: ApiRequestLog[] = [
    log('REQ-98D21', 'MCH-1001', 'APP-001', 'POST', '/v1/payments/initialize', 200, 482, 'sandbox', t(0, 10, 33), '102.89.44.21', 'hp_test_sk_71e8'),
    log('REQ-98D22', 'MCH-1001', 'APP-001', 'POST', '/v1/payments/initialize', 200, 310, 'sandbox', t(0, 9, 41), '102.89.44.21', 'hp_test_sk_71e8'),
    log('REQ-98D23', 'MCH-1001', 'APP-001', 'GET', '/v1/payments/HPY-260909-993021/verify', 200, 187, 'sandbox', t(0, 10, 34), '102.89.44.21', 'hp_test_sk_71e8'),
    log('REQ-98D24', 'MCH-1001', 'APP-001', 'POST', '/v1/payments/initialize', 400, 96, 'sandbox', t(0, 9, 13), '41.79.210.5', 'hp_test_sk_71e8'),
    log('REQ-98D25', 'MCH-1003', 'APP-001', 'POST', '/v1/payments/initialize', 422, 110, 'sandbox', t(1, 15, 30), '41.79.210.9', 'hp_test_sk_a0c1'),
  ]

  const team: TeamMember[] = [
    { id: 'TM-1', merchantId: 'MCH-1001', name: 'Ibrahim Suleiman', email: 'ibrahim@greenlinestores.ng', role: 'owner', status: 'active' },
    { id: 'TM-2', merchantId: 'MCH-1001', name: 'Mariam Danjuma', email: 'mariam@greenlinestores.ng', role: 'admin', status: 'active' },
    { id: 'TM-3', merchantId: 'MCH-1001', name: 'Daniel Okafor', email: 'daniel@greenlinestores.ng', role: 'developer', status: 'active' },
    { id: 'TM-4', merchantId: 'MCH-1001', name: 'Aisha Bello', email: 'aisha@greenlinestores.ng', role: 'finance', status: 'active' },
    { id: 'TM-5', merchantId: 'MCH-1001', name: 'Peter Ade', email: 'peter@greenlinestores.ng', role: 'viewer', status: 'invited' },
  ]

  return { merchants, apps, keys, webhooks, webhookDeliveries, merchantPayments, refunds, settlements, apiLogs, team }
}

function mkKey(
  id: string,
  applicationId: string,
  merchantId: string,
  type: ApiKey['type'],
  environment: ApiKey['environment'],
  prefix: string,
  value: string,
  createdAt: string,
  lastUsedAt?: string,
): ApiKey {
  return {
    id,
    applicationId,
    merchantId,
    label: type === 'public' ? 'Public key' : 'Secret key',
    type,
    environment,
    prefix,
    maskedValue: `${prefix}${'•'.repeat(6)}${value.slice(-4)}`,
    status: 'active',
    createdAt,
    lastUsedAt,
  }
}

function log(
  requestId: string,
  merchantId: string,
  applicationId: string,
  method: ApiRequestLog['method'],
  endpoint: string,
  statusCode: number,
  responseTimeMs: number,
  environment: ApiRequestLog['environment'],
  createdAt: string,
  ip: string,
  keyPrefix: string,
): ApiRequestLog {
  return {
    id: `LOG-${requestId}`,
    merchantId,
    applicationId,
    requestId,
    method,
    endpoint,
    statusCode,
    responseTimeMs,
    environment,
    ip,
    keyPrefix,
    responseBody: JSON.stringify(
      { success: statusCode < 400, data: { reference: 'HPY-260909-993021', status: statusCode < 400 ? 'pending' : 'error' } },
      null,
      2,
    ),
    requestBody:
      method === 'POST'
        ? JSON.stringify({ amount: 50000, currency: 'NGN', email: 'customer@example.com', reference: 'ORDER-100293' }, null, 2)
        : undefined,
    createdAt,
  }
}
