import { Link } from 'react-router-dom'
import { Activity, ArrowRight, CheckCircle2, FlaskConical, KeyRound, Plug2, ReceiptText, RefreshCw, Rocket, Wallet2, Webhook, XCircle } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Button, Card, CountUp, PageHeader, Skeleton, StatCard } from '../../components/ui'
import { useAppStore, useCurrentMerchant, useCurrentMerchantLogs, useCurrentMerchantPayments, useCurrentMerchantSettlements } from '../../store/appStore'
import { money, moneyShort, timeAgo } from '../../lib/format'
import { EnvBadge, MerchantPaymentBadge } from '../../components/common/DevKit'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'

export default function MerchantDashboard() {
  const merchant = useCurrentMerchant()
  const payments = useCurrentMerchantPayments()
  const settlements = useCurrentMerchantSettlements()
  const logs = useCurrentMerchantLogs()
  const apps = useAppStore((s) => s.merchantApps.filter((a) => a.merchantId === s.activeMerchantId))
  const webhooks = useAppStore((s) => s.merchantWebhooks.filter((w) => w.merchantId === s.activeMerchantId))
  const loading = useFakeLoading(500)
  const navigate = useNavigate()

  const today = payments.filter((p) => p.createdAt.startsWith('2026-09-09'))
  const successful = payments.filter((p) => p.status === 'successful' || p.status === 'refunded')
  const failed = payments.filter((p) => p.status === 'failed')
  const pendingSettlement = settlements.find((s) => s.status === 'scheduled')?.net ?? settlements.filter((s) => s.status === 'processing').reduce((a, b) => a + b.net, 0)
  const balance = 4850200
  const todayVolume = today.reduce((a, p) => a + p.amount, 0)
  const successRate = Math.round((successful.length / Math.max(1, payments.length)) * 1000) / 10

  if (loading || !merchant) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      </div>
    )
  }

  const checklist = [
    { done: true, label: 'Business account created' },
    { done: true, label: 'API application created' },
    { done: true, label: 'Sandbox key generated' },
    { done: true, label: 'Webhook configured' },
    { done: true, label: 'Test payment completed' },
    { done: true, label: 'Payment verification tested' },
    { done: false, label: merchant.liveRequested ? 'Live access pending admin review' : 'Submit live access request' },
  ]
  const doneCount = checklist.filter((c) => c.done).length

  const series = [
    { d: 'Wed', v: 240000 }, { d: 'Thu', v: 410000 }, { d: 'Fri', v: 190000 }, { d: 'Sat', v: 620000 },
    { d: 'Sun', v: 480000 }, { d: 'Mon', v: 875400 }, { d: 'Tue', v: 520000 },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Welcome back, {merchant.businessName}</h1>
          <p className="mt-1 text-sm text-ink-soft">Here's your payments and API health today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/developers"><Button variant="secondary">Docs</Button></Link>
          <Link to="/merchant/integration/api-keys"><Button icon={<KeyRound className="h-4 w-4" />}>View API Keys</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available Balance" value={`₦${moneyShort(balance)}`} sub={money(balance)} icon={Wallet2} tone="brand" />
        <StatCard label="Pending Settlement" value={`₦${moneyShort(pendingSettlement)}`} icon={ReceiptText} tone="amber" />
        <StatCard label="Today's Payments" value={`₦${moneyShort(todayVolume)}`} sub={`${today.length} payments`} icon={Activity} tone="green" />
        <StatCard label="Success Rate" value={`${successRate}%`} sub={<span className="text-emerald-600">API healthy</span>} icon={CheckCircle2} tone="blue" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini label="Total payments" value={String(payments.length)} icon={ReceiptText} />
        <Mini label="Failed" value={String(failed.length)} icon={XCircle} danger />
        <Mini label="Refunds" value="2" icon={RefreshCw} />
        <Mini label="Webhook health" value={webhooks.length ? 'Delivering' : 'Not set'} icon={Webhook} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Payment Volume</h3>
              <p className="text-[13px] text-ink-soft">Last 7 days · ₦3.3m processed</p>
            </div>
            <Link to="/merchant/payments" className="text-[13px] font-medium text-brand hover:underline">View transactions</Link>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#086A37" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#086A37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${moneyShort(v)}`} />
                <Tooltip formatter={(v) => [money(Number(v)), 'Volume']} contentStyle={{ borderRadius: 12, border: '1px solid #EAECF0', fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#086A37" strokeWidth={2.5} fill="url(#mv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Rocket className="h-4 w-4 text-brand" /> Go-live progress</h3>
          <div className="mt-4">
            <div className="flex items-end justify-between text-sm">
              <span className="text-ink-soft">Integration checklist</span>
              <span className="font-bold text-brand">{doneCount}/{checklist.length}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/60">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
            </div>
          </div>
          <ol className="mt-4 space-y-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-start gap-2.5 text-[13px]">
                {c.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                ) : (
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-ink-faint/40" />
                )}
                <span className={c.done ? 'text-ink-soft' : 'font-medium text-ink'}>{c.label}</span>
              </li>
            ))}
          </ol>
          {!merchant.liveAccess && !merchant.liveRequested && (
            <Button size="sm" className="mt-4 w-full" onClick={() => navigate('/merchant/integration')}>Complete go-live steps</Button>
          )}
          {!merchant.liveAccess && merchant.liveRequested && <Badge tone="amber" className="mt-4">Live access pending admin review</Badge>}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Recent transactions</h3>
              <p className="text-[13px] text-ink-soft">Latest API payments</p>
            </div>
            <Link to="/merchant/payments" className="text-[13px] font-medium text-brand hover:underline">All payments</Link>
          </div>
          <div className="px-3 pb-3">
            {payments.slice(0, 5).map((p) => (
              <button key={p.id} onClick={() => navigate(`/merchant/payments/${p.id}`)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-canvas">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{p.merchantRef}</p>
                  <p className="font-mono text-xs text-ink-faint">{p.haighaRef}</p>
                </div>
                <span className="font-semibold tabular text-ink">{money(p.amount)}</span>
                <MerchantPaymentBadge status={p.status} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Integration status</h3>
            <EnvBadge env="sandbox" />
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-line-soft p-4">
              <p className="text-[13px] text-ink-soft">API applications</p>
              <p className="mt-1 text-2xl font-bold tabular text-ink">{apps.length}</p>
            </div>
            <div className="rounded-2xl border border-line-soft p-4">
              <p className="text-[13px] text-ink-soft">Webhook endpoints</p>
              <p className="mt-1 text-2xl font-bold tabular text-ink">{webhooks.length}</p>
            </div>
            <div className="rounded-2xl border border-line-soft p-4">
              <p className="text-[13px] text-ink-soft">Latest API calls</p>
              <p className="mt-1 text-2xl font-bold tabular text-ink">{logs.length}</p>
            </div>
            <div className="rounded-2xl border border-line-soft p-4">
              <p className="text-[13px] text-ink-soft">API health (24h)</p>
              <p className="mt-1 flex items-center gap-1.5 font-bold text-status-success"><span className="h-2 w-2 rounded-full bg-status-success animate-pulse" /> Operational</p>
            </div>
          </div>
          <Link to="/merchant/integration" className="mt-4 flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
            <span className="flex items-center gap-2"><Plug2 className="h-4 w-4" /> Open Integration Overview</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4">
        <p className="text-sm text-ink-soft">Payment processing technology is powered by <span className="font-semibold text-ink">ZainPay</span> behind Haigha Pay's API layer.</p>
        <FlaskConical className="hidden h-5 w-5 text-brand sm:block" />
      </div>
    </div>
  )
}

function Mini({ label, value, icon: Icon, danger }: { label: string; value: string; icon: typeof Activity; danger?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border border-line-soft bg-white p-4 shadow-card')}>
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', danger ? 'bg-red-50 text-red-600' : 'bg-canvas text-ink-soft')}><Icon className="h-4 w-4" /></span>
      <div>
        <p className="text-[12px] text-ink-soft">{label}</p>
        <p className="text-base font-bold text-ink">{value}</p>
      </div>
    </div>
  )
}
