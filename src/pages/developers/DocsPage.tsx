import { Link, useLocation } from 'react-router-dom'
import {
  Callout, Code, DataTable, Endpoint, H1, H2, H3, HeadersCode, InlineCode, Lead, P, TryButton, UL,
} from '../../components/common/DocsUI'
import {
  baseUrls, changeLog, errorCodes, errorValidation, initRequest, initResponse, nodeInitCode, phpInitCode,
  signatureCode, sdkList, statusCodes, verifyLogicCode, verifyResponse, webhookPayload,
} from '../../data/apiSnippets'
import { ArrowLeft } from 'lucide-react'

export default function DocsPage() {
  const { pathname } = useLocation()
  const section = pathname.split('/').filter(Boolean).pop() ?? 'introduction'

  return (
    <article>
      <div className="mb-6 flex items-center gap-2 text-[13px] text-ink-faint">
        <Link to="/" className="hover:text-brand">Home</Link> / <span>Developers</span> / <span className="font-medium text-ink">{titleFor(section)}</span>
      </div>
      {render(section)}
      <div className="mt-12 flex items-center justify-between border-t border-line pt-6 text-sm">
        <Link to="/app/settings/api" className="flex items-center gap-1.5 font-medium text-brand hover:underline"><ArrowLeft className="h-4 w-4" /> Developer tools in the app</Link>
        <p className="text-[12px] text-ink-faint">Last updated 9 Sep 2026 · v0.4.0</p>
      </div>
    </article>
  )
}

function titleFor(s: string): string {
  return (
    {
      introduction: 'Introduction',
      environments: 'Environments',
      authentication: 'Authentication',
      quickstart: 'Quick Start',
      payments: 'Initialize Payment',
      verification: 'Verify Payment',
      'payment-details': 'Get & List Payments',
      refunds: 'Refunds',
      webhooks: 'Webhooks',
      errors: 'Errors & Status Codes',
      testing: 'Sandbox & Testing',
      sdk: 'SDKs & Libraries',
      changelog: 'Changelog',
    }[s] ?? 'Documentation'
  )
}

function render(s: string) {
  switch (s) {
    case 'environments':
      return (
        <>
          <H1>Environments</H1>
          <Lead>Haigha Pay exposes two isolated environments. Sandbox is always free and safe — live moves real money.</Lead>
          <DataTable
            headers={['Environment', 'Base URL', 'Keys prefix', 'Use']}
            rows={[
              [<span key="a">Sandbox <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">TEST</span></span>, <code className="font-mono text-xs">{baseUrls.sandbox}</code>, <code className="font-mono text-xs">hp_test_</code>, 'Testing and development'],
              [<span key="b">Live <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">PROD</span></span>, <code className="font-mono text-xs">{baseUrls.live}</code>, <code className="font-mono text-xs">hp_live_</code>, 'Real production payments'],
            ]}
          />
          <Callout tone="warn" title="Proposed URLs">
            These base URLs are proposed for prototype documentation until backend implementation is finalized.
          </Callout>
        </>
      )
    case 'authentication':
      return (
        <>
          <H1>Authentication</H1>
          <Lead>Authenticate every request by sending your secret key as a bearer token. Keys are issued per API application from the merchant dashboard.</Lead>
          <HeadersCode lines={['Authorization: Bearer hp_test_sk_xxxxxxxxx', 'Content-Type: application/json', 'Accept: application/json']} />
          <H2>Key types</H2>
          <DataTable headers={['Key', 'Purpose', 'Example']} rows={[['Public key', 'Identifies requests (client-side safe)', <code key="pk" className="font-mono text-xs">hp_test_pk_82ae93d10234</code>], ['Secret key', 'Authenticates server-side requests', <code key="sk" className="font-mono text-xs">hp_test_sk_71e8••••••••</code>]]} />
          <Callout tone="danger" title="Never expose secret keys">
            Secret keys must never appear in frontend JavaScript, mobile apps or public repositories. Your server talks to the Haigha Pay API.
          </Callout>
          <Callout tone="info">
            The safe React flow is <InlineCode>React Frontend → Merchant Backend → Haigha Pay API</InlineCode>. Never call initialize from the browser with your secret key.
          </Callout>
        </>
      )
    case 'quickstart':
      return (
        <>
          <H1>Quick Start</H1>
          <Lead>From signup to your first live payment in ten steps.</Lead>
          <UL items={[
            'Create a merchant account',
            'Complete business profile & KYB',
            'Create an API application',
            'Generate a sandbox secret key',
            <span key="c">Initialize a payment via <InlineCode>POST /v1/payments/initialize</InlineCode></span>,
            'Redirect the customer to the hosted checkout_url',
            'Receive the webhook on your server',
            <span key="v">Verify with <InlineCode>GET /v1/payments/{'{reference}'}/verify</InlineCode></span>,
            'Fulfill the order',
            'Test refunds, then request live access',
          ]} />
          <H2>Node.js example</H2>
          <Code code={nodeInitCode} lang="javascript" title="initialize-payment.mjs" />
          <H2>Laravel example</H2>
          <Code code={phpInitCode} lang="php" title="PaymentController.php" />
          <P>Recommended Laravel structure: <InlineCode>PaymentController → PaymentService → HaighaPayClient → Haigha Pay API</InlineCode>.</P>
        </>
      )
    case 'payments':
      return (
        <>
          <H1>Initialize Payment</H1>
          <Lead>Create a payment and receive a hosted checkout URL. Haigha Pay handles the payment experience and the ZainPay processing behind it.</Lead>
          <Endpoint method="POST" path="/v1/payments/initialize" desc="Create a new payment" />
          <H2>Request</H2>
          <Code code={initRequest} title="Request body · application/json" />
          <DataTable
            headers={['Field', 'Type', 'Required', 'Description']}
            rows={[
              ['amount', 'integer', 'Yes', 'Amount in kobo-independent minor unit of NGN (e.g. 50000 = ₦500.00 or kobo — see notes)'],
              ['currency', 'string', 'Yes', '"NGN"'],
              ['email', 'string', 'Yes', 'Customer email for the receipt'],
              ['reference', 'string', 'Yes', 'Your unique merchant reference (max 64 chars, no duplicates)'],
              ['callback_url', 'string', 'No', 'Where the customer returns after checkout'],
              ['metadata', 'object', 'No', 'Free-form object shown in your payment details'],
            ]}
          />
          <Callout tone="info">
            Amounts in this prototype are treated as whole Naira for readability. The real API contract will specify kobo precision before backend build.
          </Callout>
          <H2>Response</H2>
          <Code code={initResponse} title="200 OK" />
          <P>Redirect the customer to <InlineCode>data.checkout_url</InlineCode>. The hosted checkout shows the Haigha Pay logo, merchant name, amount, email, reference, payment methods and the footer “Secured by Haigha Pay · Payment processing technology powered by ZainPay”.</P>
          <TryButton label="Try in Test Console" />
        </>
      )
    case 'verification':
      return (
        <>
          <H1>Verify Payment</H1>
          <Lead>Always confirm payment server-side before fulfilling an order. Never rely on the browser reaching a success page.</Lead>
          <Endpoint method="GET" path="/v1/payments/{reference}/verify" desc="Confirm payment status" />
          <Code code={verifyResponse} title="200 OK" />
          <Code code={verifyLogicCode} lang="text" title="verify-logic.txt" />
          <Callout tone="danger" title="Critical rule">
            Never fulfill an order only because the customer's browser reached a success page. The merchant backend should verify payment through the API or a verified webhook.
          </Callout>
          <TryButton label="Test verification" />
        </>
      )
    case 'payment-details':
      return (
        <>
          <H1>Get & List Payments</H1>
          <Endpoint method="GET" path="/v1/payments/{reference}" desc="Full details for one payment" />
          <P>Returns the Haigha reference, merchant reference, amount, currency, status, channel, customer, fee, gateway reference, metadata, created_at and paid_at.</P>
          <Endpoint method="GET" path="/v1/payments" desc="List & filter payments" />
          <Code
            code={`GET /v1/payments?page=1&per_page=20&status=successful&from=2026-09-01&to=2026-09-09`}
            lang="http"
            title="Example query"
          />
          <H2>Status lifecycle</H2>
          <DataTable
            headers={['Status', 'Meaning', 'Colour']}
            rows={[
              ['initialized', 'Created but not yet paid', 'Gray'],
              ['pending', 'Processing at gateway', 'Amber'],
              ['successful', 'Payment confirmed', 'Green'],
              ['failed', 'Payment declined/failed', 'Red'],
              ['reversed', 'Payment reversed', 'Blue/Gray'],
              ['refunded', 'Fully refunded', 'Purple/Gray'],
              ['partially_refunded', 'Partially refunded', 'Purple/Gray'],
            ]}
          />
        </>
      )
    case 'refunds':
      return (
        <>
          <H1>Refunds</H1>
          <Lead>Refund a successful payment to the customer's original payment method.</Lead>
          <Endpoint method="POST" path="/v1/refunds" desc="Create a refund" />
          <Code code={JSON.stringify({ payment_reference: 'HPY-260909-993021', amount: 50000, reason: 'Customer requested cancellation' }, null, 2)} title="Request body" />
          <Callout tone="info">
            Response returns <InlineCode>refund_reference</InlineCode> with status <InlineCode>processing</InlineCode>. Refund references are also delivered over webhooks (<InlineCode>refund.processing</InlineCode> / <InlineCode>refund.successful</InlineCode>).
          </Callout>
          <UL items={['Refunds can never exceed the paid amount (error HP_REF_001)', 'Failed payments cannot be refunded', 'Refunds settle back through the same lifecycle as payments']} />
        </>
      )
    case 'webhooks':
      return (
        <>
          <H1>Webhooks</H1>
          <Lead>Webhooks notify your server the moment a payment or refund changes state. Configure the endpoint URL and events from the merchant dashboard.</Lead>
          <DataTable headers={['Event', 'When']} rows={[['payment.pending', 'Payment initialized at gateway'], ['payment.successful', 'Payment confirmed'], ['payment.failed', 'Payment failed'], ['payment.reversed', 'Payment reversed'], ['refund.processing', 'Refund started'], ['refund.successful', 'Refund completed'], ['settlement.created', 'Settlement prepared'], ['settlement.completed', 'Settlement paid out']]} />
          <H2>Payload</H2>
          <Code code={webhookPayload} title="Example payload · payment.successful" />
          <H2>Signature verification</H2>
          <HeadersCode lines={[signatureCode]} />
          <P>Compute an HMAC-SHA256 of the raw body with your webhook signing secret and compare it to the header value. Only accept the event when signatures match.</P>
          <Callout tone="info">Deliveries retry up to 3–5 times with exponential backoff. Delivery history and manual retry are available in the merchant dashboard.</Callout>
        </>
      )
    case 'errors':
      return (
        <>
          <H1>Errors & Status Codes</H1>
          <H2>Standard response envelope</H2>
          <Code code={JSON.stringify({ success: true, message: 'Operation completed successfully', data: {}, meta: {} }, null, 2)} title="Success envelope" />
          <Code code={errorValidation} title="Validation error envelope" />
          <H2>HTTP status codes</H2>
          <DataTable headers={['Code', 'Meaning', 'Note']} rows={statusCodes.map(([c, m, n]) => [<code key={c} className="font-mono font-semibold text-brand">{c}</code>, m, n])} />
          <H2>Machine-readable error codes</H2>
          <DataTable headers={['Code', 'Message', 'HTTP']} rows={errorCodes.map(([c, m, h]) => [<code key={c} className="font-mono text-xs">{c}</code>, m, <code key={h} className="font-mono text-xs">{h}</code>])} />
          <Callout tone="info">Send an <InlineCode>Idempotency-Key</InlineCode> header on create requests so network retries never create duplicate transactions.</Callout>
        </>
      )
    case 'testing':
      return (
        <>
          <H1>Sandbox & Testing</H1>
          <Lead>Everything in sandbox is simulated. No real money ever moves and no request leaves the prototype.</Lead>
          <Callout tone="success" title="Predictable test results">
            Use these amounts in <InlineCode>POST /v1/payments/initialize</InlineCode> to produce outcomes:
          </Callout>
          <DataTable headers={['Amount', 'Outcome']} rows={[['₦1,000', 'successful'], ['₦2,000', 'pending'], ['₦3,000', 'failed'], ['₦4,000', 'reversed'], ['₦50,000', 'successful (checkout demo)']].map(([a, o]) => [a, <span key={o as string} className="font-semibold">{o as string}</span>])} />
          <UL items={['Test initialize, verify, refund and webhooks freely', 'Sandbox keys never touch production data', 'Test cards always succeed for supported channels', 'Webhook deliveries can be forced and retried']} />
        </>
      )
    case 'sdk':
      return (
        <>
          <H1>SDKs & Libraries</H1>
          <Lead>Official libraries remove the boilerplate. Each SDK wraps authentication, signing and responses.</Lead>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sdkList.map((s) => (
              <div key={s} className="rounded-2xl border border-line p-4 text-center transition-colors hover:border-brand/40">
                <p className="text-lg font-bold text-ink">{s}</p>
                <p className="mt-0.5 text-[12px] text-ink-faint">Install docs</p>
              </div>
            ))}
          </div>
          <Callout tone="info">
            SDK install commands and versioned package names are placeholders until backend libraries are published.
          </Callout>
        </>
      )
    case 'changelog':
      return (
        <>
          <H1>Changelog</H1>
          <Lead>Prototype progress for the Haigha Pay merchant API portal.</Lead>
          <DataTable headers={['Date', 'Version', 'Notes']} rows={changeLog.map(([d, v, n]) => [d, <code key={v} className="font-mono text-xs">{v}</code>, n])} />
        </>
      )
    case 'introduction':
    default:
      return (
        <>
          <H1>Haigha Pay for developers</H1>
          <Lead>
            Haigha Pay provides merchants with a clean, Haigha-branded payment API, while ZainPay operates as the underlying
            payment technology provider behind Haigha Pay's backend integration layer.
          </Lead>
          <P>
            A merchant should understand how to integrate within minutes, even before writing code. This portal documents the
            payment lifecycle: initialize → hosted checkout → webhook → verify → fulfill.
          </P>
          <H2>Integration flow</H2>
          <Code
            code={`Merchant Website / App\n        ↓\nMerchant Backend\n        ↓\nInitialize Payment  →  POST /v1/payments/initialize\n        ↓\nHosted Checkout (Haigha Pay · powered by ZainPay)\n        ↓\nWebhook sent to merchant\n        ↓\nMerchant verifies payment  →  GET /v1/payments/{reference}/verify\n        ↓\nOrder / Service Fulfilled`}
            lang="text"
            title="flow.txt"
          />
          <Callout tone="success" title="Why merchants use Haigha Pay">
            One clean API contract, Haigha-branded checkout, centralised webhooks and reconciliation, and the freedom to switch
            providers later — ZainPay stays hidden behind our integration layer.
          </Callout>
          <UL items={[
            <span key="a">Start with the <Link className="font-semibold text-brand hover:underline" to="/developers/quickstart">Quick Start</Link></span>,
            'Create a merchant account to get sandbox keys',
            'Test checkout, webhooks and refunds in sandbox',
            'Request live access once your integration passes review',
          ]} />
          <TryButton label="Open the Test Console" />
        </>
      )
  }
}
