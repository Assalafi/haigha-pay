export const baseUrls = {
  sandbox: 'https://sandbox-api.haighapay.com/v1',
  live: 'https://api.haighapay.com/v1',
}

export const initRequest = JSON.stringify(
  {
    amount: 50000,
    currency: 'NGN',
    email: 'customer@example.com',
    reference: 'ORDER-100293',
    callback_url: 'https://merchant.example.com/payment/callback',
    metadata: { customer_id: 'CUS-8821', order_id: 'ORD-100293' },
  },
  null,
  2,
)

export const initResponse = JSON.stringify(
  {
    success: true,
    message: 'Payment initialized',
    data: {
      reference: 'HPY-260909-993021',
      merchant_reference: 'ORDER-100293',
      amount: 50000,
      currency: 'NGN',
      status: 'pending',
      checkout_url: 'https://checkout.haighapay.com/pay/HPY-260909-993021',
    },
  },
  null,
  2,
)

export const verifyResponse = JSON.stringify(
  {
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
  },
  null,
  2,
)

export const webhookPayload = JSON.stringify(
  {
    event: 'payment.successful',
    data: {
      reference: 'HPY-260909-993021',
      merchant_reference: 'ORDER-100293',
      amount: 50000,
      currency: 'NGN',
      status: 'successful',
      channel: 'card',
      paid_at: '2026-09-09T10:35:22Z',
    },
  },
  null,
  2,
)

export const errorValidation = JSON.stringify(
  {
    success: false,
    message: 'Validation failed',
    errors: { amount: ['The amount field is required.'] },
  },
  null,
  2,
)

export const nodeInitCode = `const response = await fetch(
  "https://sandbox-api.haighapay.com/v1/payments/initialize",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer hp_test_sk_xxxxxxxxx",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: 50000,
      currency: "NGN",
      email: "customer@example.com",
      reference: "ORDER-100293",
      callback_url: "https://merchant.example.com/callback"
    })
  }
);

const payment = await response.json();`

export const phpInitCode = `<?php

$response = Http::withToken(config('services.haighapay.secret'))
    ->post('https://sandbox-api.haighapay.com/v1/payments/initialize', [
        'amount' => 50000,
        'currency' => 'NGN',
        'email' => 'customer@example.com',
        'reference' => 'ORDER-100293',
        'callback_url' => route('payment.callback'),
    ]);

$payment = $response->json();`

export const verifyLogicCode = `// 1. Receive redirect or webhook
// 2. Get the Haigha Pay reference
// 3. Call GET /v1/payments/{reference}/verify
// 4. Check:
//    - status == successful
//    - amount == expected amount
//    - reference belongs to this order
// 5. Only then fulfill the order`

export const signatureCode = `X-Haigha-Signature: sha256=<hex-signature>`

export const statusCodes = [
  ['200', 'Success', 'Request completed successfully'],
  ['201', 'Created', 'Resource created (e.g. refund)'],
  ['400', 'Invalid request', 'Malformed syntax or missing fields'],
  ['401', 'Unauthorized', 'Invalid or missing API key'],
  ['403', 'Forbidden', 'Key lacks permission or IP blocked'],
  ['404', 'Not found', 'Resource does not exist'],
  ['409', 'Conflict', 'Duplicate reference already used'],
  ['422', 'Validation error', 'Fields failed validation'],
  ['429', 'Rate limited', 'Too many requests'],
  ['500', 'Internal error', 'Haigha Pay service error'],
  ['503', 'Unavailable', 'Payment service temporarily down'],
]

export const errorCodes = [
  ['HP_AUTH_001', 'Invalid API key', '401'],
  ['HP_AUTH_002', 'API key revoked', '401'],
  ['HP_PAY_001', 'Invalid amount', '422'],
  ['HP_PAY_002', 'Duplicate reference', '409'],
  ['HP_PAY_003', 'Payment not found', '404'],
  ['HP_PAY_004', 'Payment already completed', '409'],
  ['HP_REF_001', 'Refund exceeds payment amount', '422'],
  ['HP_WEB_001', 'Invalid webhook signature', '403'],
  ['HP_RATE_001', 'Too many requests', '429'],
  ['HP_SYS_001', 'Temporary service error', '503'],
]

export const sdkList = ['PHP', 'Node.js', 'Python', 'Java', 'Flutter', 'React Native']

export const changeLog = [
  ['2026-09-09', 'v0.4.0', 'Prototype release: merchant portal, API keys, webhooks, test console and documentation.'],
  ['2026-08-01', 'v0.3.0', 'Hosted checkout flow defined with ZainPay-powered processing.'],
  ['2026-07-15', 'v0.2.0', 'Customer wallet, transfers and bill payments demonstrated.'],
  ['2026-06-30', 'v0.1.0', 'Initial click-through prototype for customer and admin portals.'],
]
