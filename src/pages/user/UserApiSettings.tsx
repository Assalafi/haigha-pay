import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Check, CheckCircle2, Copy, Eye, EyeOff, FlaskConical, Globe2, KeyRound, Play, RefreshCw, ShieldAlert, Webhook,
} from 'lucide-react'
import { Badge, Button, Card, Input, Label } from '../../components/ui'
import { CodeBlock } from '../../components/common/DevKit'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { toast } from 'sonner'

const key = (type: 'public' | 'secret', seed: string) => (type === 'public' ? `hp_test_pk_${seed}` : `hp_test_sk_${seed}`)

type Activity = { requestId: string; method: 'GET' | 'POST'; endpoint: string; status: number; ms: number; body: string }

const starterActivity: Activity[] = [
  { requestId: 'REQ-98D21', method: 'POST', endpoint: '/v1/payments/initialize', status: 200, ms: 482, body: '{"success":true,"message":"Payment initialized","data":{"reference":"HPY-260909-993021","status":"pending"}}' },
  { requestId: 'REQ-98D22', method: 'GET', endpoint: '/v1/payments/HPY-260909-993021/verify', status: 200, ms: 187, body: '{"success":true,"data":{"status":"successful","channel":"bank_transfer"}}' },
]

export default function UserApiSettings() {
  const user = useAppStore((s) => s.users.find((u) => u.id === s.activeUserId))
  const [pubSeed] = useState('82ae93d10234')
  const [secSeed, setSecSeed] = useState('71e8c9f81a2d')
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [endpoint, setEndpoint] = useState<'initialize' | 'verify' | 'refund'>('initialize')
  const [amount, setAmount] = useState(50000)
  const [resp, setResp] = useState<{ status: number; ms: number; body: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [activity, setActivity] = useState<Activity[]>(starterActivity)
  const [hookUrl, setHookUrl] = useState('')
  const [hookEvents, setHookEvents] = useState(['payment.successful', 'payment.failed'])
  const [hookOn, setHookOn] = useState(false)

  const secretKey = key('secret', secSeed)
  const pubKey = key('public', pubSeed)

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* ignore */
    }
    setCopied(label)
    setTimeout(() => setCopied(null), 1200)
    toast.success(`${label} copied`)
  }

  const preset = (a: number) => setAmount(a)

  const send = () => {
    setSending(true)
    const scenario = amount === 1000 ? 'successful' : amount === 2000 ? 'pending' : amount === 3000 ? 'failed' : amount === 4000 ? 'reversed' : 'successful'
    const ref = `HPY-${Date.now()}`
    setTimeout(() => {
      const status = 200
      const ms = 190 + Math.floor(Math.random() * 400)
      let body = ''
      if (endpoint === 'initialize') {
        body = JSON.stringify({ success: true, message: 'Payment initialized', data: { reference: ref, merchant_reference: `ORDER-${amount}`, amount, currency: 'NGN', status: scenario === 'successful' ? 'pending' : scenario, checkout_url: `https://checkout.haighapay.com/pay/${ref}` } }, null, 2)
      } else if (endpoint === 'verify') {
        body = JSON.stringify({ success: true, data: { reference: 'HPY-260909-993021', merchant_reference: 'ORDER-100293', amount: 50000, status: 'successful', channel: 'bank_transfer' } }, null, 2)
      } else {
        body = JSON.stringify({ success: true, data: { refund_reference: `RFD-${800000 + Math.floor(Math.random() * 899999)}`, payment_reference: 'HPY-260909-993021', amount: 50000, status: 'processing' } }, null, 2)
      }
      setResp({ status, ms, body })
      setActivity((a) => [
        { requestId: `REQ-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, method: endpoint === 'verify' ? 'GET' : 'POST', endpoint: `/v1/payments${endpoint === 'initialize' ? '/initialize' : endpoint === 'verify' ? '/HPY-260909-993021/verify' : '/refunds'}`, status, ms, body },
        ...a,
      ])
      setSending(false)
    }, 650)
  }

  const envPath = endpoint === 'initialize' ? '/v1/payments/initialize' : endpoint === 'verify' ? '/v1/payments/HPY-260909-993021/verify' : '/v1/refunds'

  const eventsAll = ['payment.pending', 'payment.successful', 'payment.failed', 'payment.reversed', 'refund.processing', 'refund.successful']

  const usage = useMemo(() => activity.reduce((acc, a) => ({ calls: acc.calls + 1, errors: acc.errors + (a.status >= 400 ? 1 : 0) }), { calls: 0, errors: 0 }), [activity])

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <Link to="/app/settings" className="inline-flex items-center gap-1.5 font-medium hover:text-brand"><ArrowLeft className="h-4 w-4" /> Settings</Link>
        <span>/</span>
        <span className="font-semibold text-ink">Developer &amp; API</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Developer &amp; API</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Sandbox tools for the signed-in account {user ? `(${user.firstName} ${user.lastName})` : ''} — no separate account needed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="blue" dot>Sandbox</Badge>
          <Link to="/developers" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
            Full API docs
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Sandbox simulation only — no real funds move and no real request is sent.</p>
          <p className="text-blue-700">Haigha Pay owns the merchant-facing API; ZainPay powers processing behind the scenes.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Credentials */}
        <Card className="space-y-4 p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><KeyRound className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Sandbox credentials</h3>
              <p className="text-[13px] text-ink-soft">Application: Checkout API · <span className="font-mono">app_demo_{pubSeed.slice(0, 5)}</span></p>
            </div>
          </div>
          <KeyField
            label="Public key"
            value={pubKey}
            mono
            secret={false}
            onCopy={() => copy(pubKey, 'Public key')}
            copied={copied === 'Public key'}
          />
          <div>
            <KeyField
              label="Secret key"
              value={revealed ? secretKey : `hp_test_sk_${'•'.repeat(10)}${secSeed.slice(-4)}`}
              secret={!revealed}
              onToggle={() => setRevealed((r) => !r)}
              onCopy={() => copy(revealed ? secretKey : 'hp_test_sk_••••••••••••••••', 'Secret key')}
              copied={copied === 'Secret key'}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setRevealed(true); toast.success('Secret key revealed (demo)') }} icon={<Eye className="h-3.5 w-3.5" />}>Reveal</Button>
              <Button variant="secondary" size="sm" onClick={() => { setRevealed(false); toast.success('Secret key hidden') }} icon={<EyeOff className="h-3.5 w-3.5" />}>Hide</Button>
              <Button variant="secondary" size="sm" onClick={() => { const s = Math.random().toString(36).slice(2, 14); setSecSeed(s); setRevealed(false); toast.success('Key rotated — old key deactivated') }} icon={<RefreshCw className="h-3.5 w-3.5" />}>Rotate key</Button>
            </div>
          </div>
          <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-800">
            <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Secret keys must never be exposed in frontend JavaScript, mobile apps, or public repositories.</p>
            <p className="mt-1 text-red-700">In production, your server talks to the Haigha Pay API with this key. Rotate it immediately if you suspect a leak.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#0B1220] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">Sandbox base URL</p>
              <p className="mt-1 truncate font-mono text-xs text-emerald-300">https://sandbox-api.haighapay.com/v1</p>
            </div>
            <div className="rounded-xl bg-[#0B1220] px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-white/50">Live base URL</p>
              <p className="mt-1 truncate font-mono text-xs text-emerald-300">https://api.haighapay.com/v1</p>
            </div>
          </div>
        </Card>

        {/* Usage */}
        <div className="space-y-5">
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Sandbox usage</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-canvas px-2 py-4">
                <p className="text-2xl font-bold tabular text-ink">{usage.calls}</p>
                <p className="text-[12px] text-ink-soft">Requests</p>
              </div>
              <div className="rounded-2xl bg-canvas px-2 py-4">
                <p className="text-2xl font-bold tabular text-ink">{usage.errors}</p>
                <p className="text-[12px] text-ink-soft">Errors</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-ink-soft">Requests made in the sandbox below are recorded here and in your API logs.</p>
          </Card>
          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Webhook className="h-4 w-4 text-brand" /> Webhook endpoint</h3>
            <div className="mt-3">
              <Label>Delivery URL</Label>
              <Input value={hookUrl} onChange={(e) => setHookUrl(e.target.value)} placeholder="https://your-server.com/haigha/webhook" className="font-mono text-[13px]" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {eventsAll.map((ev) => (
                <button key={ev} onClick={() => setHookEvents((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]))} className={cn('rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors', hookEvents.includes(ev) ? 'border-brand bg-brand text-white' : 'border-line text-ink-soft hover:border-brand/40')}>
                  {ev}
                </button>
              ))}
            </div>
            <Button size="sm" className="mt-4" onClick={() => {
              if (!/^https:\/\//.test(hookUrl)) return toast.error('Enter a valid https:// webhook URL')
              setHookOn(true)
              toast.success('Webhook endpoint saved')
            }}>Save webhook</Button>
            {hookOn && <p className="mt-2 flex items-center gap-1.5 text-[13px] text-status-success"><CheckCircle2 className="h-4 w-4" /> Receiving events with a signing secret.</p>}
          </Card>
        </div>
      </div>

      {/* Try it */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line-soft bg-canvas/60 px-5 py-3">
          <FlaskConical className="h-4 w-4 text-brand" />
          <h3 className="text-[15px] font-semibold text-ink">Try the API</h3>
          <span className="ml-auto font-mono text-xs text-ink-soft">Sandbox only</span>
        </div>
        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
          <div className="border-b border-line-soft p-3 lg:border-b-0 lg:border-r">
            <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Endpoints</p>
            {([
              ['initialize', 'Initialize Payment', 'POST'],
              ['verify', 'Verify Payment', 'GET'],
              ['refund', 'Create Refund', 'POST'],
            ] as const).map(([k, label, m]) => (
              <button key={k} onClick={() => { setEndpoint(k); setResp(null) }} className={cn('mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors', endpoint === k ? 'bg-brand-soft text-brand' : 'hover:bg-canvas')}>
                <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10px] font-bold', m === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')}>{m}</span>
                <span className="text-[13px] font-medium text-ink">{label}</span>
              </button>
            ))}
            <div className="mt-4 px-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Outcome by amount</p>
              {[[1000, 'successful'], [2000, 'pending'], [3000, 'failed'], [4000, 'reversed']].map(([a, s]) => (
                <button key={a as number} onClick={() => preset(a as number)} className="mb-1 flex w-full items-center justify-between rounded-lg border border-line px-3 py-1.5 text-[12px] hover:border-brand/40">
                  <span className="tabular font-semibold text-ink">₦{(a as number).toLocaleString()}</span>
                  <span className="text-ink-faint">{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line px-4 py-3">
              <span className={cn('rounded px-2 py-0.5 font-mono text-[11px] font-bold', endpoint === 'verify' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')}>{endpoint === 'verify' ? 'GET' : 'POST'}</span>
              <code className="font-mono text-[13px] text-ink">{envPath}</code>
              {endpoint === 'initialize' && <span className="ml-auto text-xs text-ink-soft">amount: ₦{amount.toLocaleString()}</span>}
            </div>
            <div className="mt-3 rounded-xl bg-[#0B1220] px-4 py-3 font-mono text-xs text-white/80">
              <p>Authorization: Bearer <span className="text-emerald-300">hp_test_sk_••••••••</span></p>
              <p>Content-Type: application/json</p>
              {endpoint === 'initialize' && <p>Accept: application/json</p>}
            </div>
            {endpoint === 'initialize' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[1000, 2000, 3000, 4000, 50000].map((a) => (
                  <button key={a} onClick={() => preset(a)} className={cn('rounded-lg border px-3 py-1.5 text-[13px] font-semibold tabular transition-colors', amount === a ? 'border-brand bg-brand text-white' : 'border-line text-ink-soft hover:border-brand/40')}>
                    ₦{a.toLocaleString()}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <p className="font-mono text-xs text-ink-faint">App: Checkout API · sandbox</p>
              <Button onClick={send} loading={sending} icon={<Play className="h-4 w-4" />}>Send request</Button>
            </div>

            <div className="mt-4">
              <p className="mb-2 flex items-center justify-between text-[13px] font-semibold text-ink-soft">
                Response
                {resp && <span className="flex items-center gap-2"><Badge tone={resp.status < 400 ? 'green' : 'red'}>HTTP {resp.status}</Badge><span className="font-mono text-xs">{resp.ms}ms</span></span>}
              </p>
              {resp ? (
                <CodeBlock code={resp.body} />
              ) : (
                <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-faint">Send a request to preview the JSON response here.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Recent API requests</h3>
          <Badge tone="gray">{activity.length} in this session</Badge>
        </div>
        <div className="px-3 pb-4">
          {activity.slice(0, 6).map((a) => (
            <div key={a.requestId} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-canvas">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', a.status < 400 ? 'bg-status-success' : 'bg-status-danger')} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] text-ink">{a.method} {a.endpoint}</p>
                <p className="text-xs text-ink-faint">{a.requestId}</p>
              </div>
              <span className="font-mono text-xs text-ink-soft">{a.status} · {a.ms}ms</span>
              <Check className="hidden h-4 w-4 text-status-success sm:block" />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4 text-sm text-ink-soft">
        <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div>
          <p className="font-medium text-ink">Ready to accept real payments?</p>
          <p className="text-[13px]">These tools are sandbox-only. Full merchant API access, live keys and settlements are enabled when your business is approved — contact support from <Link to="/app/support" className="font-medium text-brand hover:underline">Help &amp; Support</Link>.</p>
        </div>
      </div>
    </div>
  )
}

function KeyField({ label, value, secret, mono, onCopy, onToggle, copied }: {
  label: string
  value: string
  secret?: boolean
  mono?: boolean
  onCopy: () => void
  onToggle?: () => void
  copied?: boolean
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-ink">
        {label}
        {secret && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">keep secret</span>}
      </p>
      <div className="flex items-center gap-2 rounded-xl bg-[#0B1220] px-3.5 py-2.5">
        <span className={cn('flex-1 truncate font-mono text-[13px]', mono ?? secret ? 'text-emerald-300' : 'text-white/85')}>{value}</span>
        {onToggle && (
          <button onClick={onToggle} className="rounded p-1 text-white/60 hover:text-white" aria-label="Toggle visibility">
            {secret ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
        <button onClick={onCopy} className="rounded p-1 text-white/60 hover:text-white" aria-label="Copy">
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
