import { useMemo, useState } from 'react'
import { Copy, FlaskConical, Play, RotateCw } from 'lucide-react'
import { Badge, Button, Card, PageHeader } from '../../components/ui'
import { CodeBlock, EnvBadge, MethodChip } from '../../components/common/DevKit'
import { useAppStore, useCurrentMerchantApps } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { toast } from 'sonner'

type EndpointKey = 'initialize' | 'verify' | 'get' | 'list' | 'refund'

const endpoints: { key: EndpointKey; method: 'GET' | 'POST'; label: string; path: string; desc: string }[] = [
  { key: 'initialize', method: 'POST', label: 'Initialize Payment', path: '/v1/payments/initialize', desc: 'Create a payment & get a hosted checkout URL' },
  { key: 'verify', method: 'GET', label: 'Verify Payment', path: '/v1/payments/HPY-260909-993021/verify', desc: 'Confirm the payment status' },
  { key: 'get', method: 'GET', label: 'Get Payment', path: '/v1/payments/HPY-260909-993021', desc: 'Full payment details' },
  { key: 'list', method: 'GET', label: 'List Payments', path: '/v1/payments?page=1&per_page=20&status=successful', desc: 'Query your payments' },
  { key: 'refund', method: 'POST', label: 'Create Refund', path: '/v1/refunds', desc: 'Refund a successful payment' },
]

const bodyTemplates: Record<EndpointKey, string> = {
  initialize: JSON.stringify(
    { amount: 50000, currency: 'NGN', email: 'customer@example.com', reference: 'ORDER-100293', callback_url: 'https://merchant.example.com/callback' },
    null,
    2,
  ),
  verify: '',
  get: '',
  list: '',
  refund: JSON.stringify({ payment_reference: 'HPY-260909-993021', amount: 50000, reason: 'Customer requested cancellation' }, null, 2),
}

export default function MerchantTestConsole() {
  const apps = useCurrentMerchantApps()
  const merchantId = useAppStore((s) => s.activeMerchantId)
  const runApiRequest = useAppStore((s) => s.runApiRequest)
  const [selected, setSelected] = useState<EndpointKey>('initialize')
  const [body, setBody] = useState(bodyTemplates.initialize)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ statusCode: number; responseTimeMs: number; body: Record<string, unknown> } | null>(null)

  const ep = endpoints.find((e) => e.key === selected)!
  const app = apps[0]

  const presetAmount = (amt: number) => {
    const parsed = JSON.parse(body || '{}')
    parsed.amount = amt
    parsed.reference = `ORDER-DEMO-${amt}`
    setBody(JSON.stringify(parsed, null, 2))
  }

  const send = () => {
    if (!app) return toast.error('Create an API application first')
    setSending(true)
    setTimeout(() => {
      const res = runApiRequest({ merchantId: merchantId ?? '', appId: app.id, method: ep.method, endpoint: ep.path, body: ep.method === 'POST' ? body : undefined })
      setResult(res)
      setSending(false)
    }, 700)
  }

  const group = useMemo(() => endpoints.filter((e) => e.key === selected), [selected])

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="API Test Console" subtitle="A lightweight playground for your Haigha Pay API." actions={<EnvBadge env="sandbox" />} />

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Sandbox simulation only — no real funds will move.</p>
          <p className="text-blue-700">Amount presets: ₦1,000 → successful · ₦2,000 → pending · ₦3,000 → failed · ₦4,000 → reversed</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        {/* Endpoint list */}
        <Card className="h-fit p-3">
          <p className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Endpoints</p>
          {endpoints.map((e) => (
            <button key={e.key} onClick={() => { setSelected(e.key); setBody(bodyTemplates[e.key]); setResult(null) }} className={cn('mb-1 flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-colors', selected === e.key ? 'bg-brand-soft text-brand' : 'hover:bg-canvas')}>
              <span className="flex items-center gap-2">
                <MethodChip method={e.method} />
                <span className="truncate text-[13px] font-medium text-ink">{e.label}</span>
              </span>
            </button>
          ))}
          <p className="mt-3 border-t border-line-soft px-2 pt-3 text-[12px] text-ink-faint">Grouped by resource. {group.length} endpoint selected.</p>
        </Card>

        {/* Request area */}
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line-soft bg-canvas/60 px-4 py-3">
              <MethodChip method={ep.method} />
              <span className="truncate font-mono text-[13px] text-ink">{ep.path}</span>
              <span className="ml-auto hidden text-[13px] text-ink-soft sm:block">{ep.desc}</span>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">Headers</p>
                <div className="rounded-xl bg-[#0B1220] px-4 py-3 font-mono text-xs text-white/80">
                  <p>Authorization: Bearer <span className="text-emerald-300">hp_test_sk_71e8••••2d</span></p>
                  <p>Content-Type: application/json</p>
                  <p>Accept: application/json</p>
                </div>
              </div>
              {ep.method === 'POST' && (
                <>
                  <div>
                    <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">Request body</p>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      spellCheck={false}
                      className="h-44 w-full resize-none rounded-xl bg-[#0B1220] p-4 font-mono text-[13px] leading-relaxed text-[#E5E7EB] outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>
                  {selected === 'initialize' && (
                    <div className="flex flex-wrap gap-2">
                      {[1000, 2000, 3000, 4000, 50000].map((a) => (
                        <button key={a} onClick={() => presetAmount(a)} className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold tabular text-ink-soft transition-colors hover:border-brand/40 hover:text-brand">
                          ₦{a.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-faint">App: {app?.name ?? '—'} · sandbox keys</p>
                <Button onClick={send} loading={sending} icon={<Play className="h-4 w-4" />}>Send request</Button>
              </div>
            </div>
          </Card>

          {/* Response */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line-soft bg-canvas/60 px-4 py-3">
              <p className="text-[13px] font-semibold text-ink">Response</p>
              {result && (
                <div className="ml-auto flex items-center gap-2">
                  <Badge tone={result.statusCode < 400 ? 'green' : 'red'}>HTTP {result.statusCode}</Badge>
                  <span className="font-mono text-xs text-ink-soft">{result.responseTimeMs}ms</span>
                </div>
              )}
            </div>
            <div className="p-5">
              {!result ? (
                <p className="rounded-xl bg-canvas px-4 py-10 text-center text-sm text-ink-faint">Send a request to see the JSON response here.</p>
              ) : (
                <div className="space-y-3">
                  <CodeBlock code={JSON.stringify(result.body, null, 2)} />
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" onClick={() => { void navigator.clipboard?.writeText(JSON.stringify(result.body, null, 2)); toast.success('Response copied') }} icon={<Copy className="h-3.5 w-3.5" />}>Copy response</Button>
                  </div>
                </div>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint"><RotateCw className="h-3 w-3" /> Requests made here are recorded in your API logs.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
