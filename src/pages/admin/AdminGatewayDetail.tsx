import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react'
import { Badge, Button, Card } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../store/appStore'
import { formatDateTime, money } from '../../lib/format'
import { toast } from 'sonner'

export default function AdminGatewayDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const gw = useAppStore((s) => s.gateway.find((g) => g.id === id))
  const [requerying, setRequerying] = useState(false)

  if (!gw) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Gateway payment not found</p>
        <Link to="/admin/payments" className="mt-2 inline-block text-brand hover:underline">← Back to gateway monitor</Link>
      </div>
    )
  }

  const ts = new Date(gw.createdAt).getTime()
  const timeline = [
    { t: 'Checkout initiated', done: true },
    { t: 'Sent to ZainPay', done: true },
    { t: gw.gatewayStatus === 'failed' ? 'Gateway declined' : 'Gateway accepted', done: gw.gatewayStatus !== 'failed' },
    { t: gw.gatewayStatus === 'successful' ? 'Webhook received' : gw.gatewayStatus === 'failed' ? 'Webhook: failed' : 'Awaiting webhook', done: gw.gatewayStatus !== 'pending' },
    { t: 'Wallet credited', done: gw.haighaStatus === 'successful' },
  ]

  const requery = () => {
    setRequerying(true)
    setTimeout(() => {
      setRequerying(false)
      if (gw.gatewayStatus === 'pending') {
        toast.success('Requery returned: success', { description: 'Gateway confirmed this payment (simulated).' })
      } else {
        toast.success('Requery returned current state', { description: `Gateway reports ${gw.gatewayStatus}.` })
      }
    }, 1300)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <button onClick={() => navigate('/admin/payments')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Gateway monitor
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">ZainPay Gateway Payment</h1>
          <p className="font-mono text-sm text-ink-soft">{gw.reference}</p>
        </div>
        <Badge tone={gw.gatewayStatus === 'successful' ? 'green' : gw.gatewayStatus === 'pending' ? 'amber' : 'red'} dot>{gw.gatewayStatus}</Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Gateway summary</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Amount" v={money(gw.amount)} />
            <Row k="Customer" v={gw.customer} />
            <Row k="Payment channel" v={gw.channel.replace('_', ' ')} />
            <Row k="Provider" v="ZainPay" />
            <Row k="Created" v={formatDateTime(gw.createdAt)} />
            <Row k="Gateway reference" v={gw.gatewayReference} mono />
          </dl>
          <Button variant="secondary" className="mt-5 w-full" onClick={requery} loading={requerying} icon={<RefreshCw className="h-4 w-4" />}>
            Requery gateway
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Lifecycle</h3>
          <ol className="mt-4">
            {timeline.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 pb-5 last:pb-0">
                {i < timeline.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-line" />}
                <span className={cn('relative z-10 flex h-5 w-5 items-center justify-center rounded-full', s.done ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400')}>
                  {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                <div className="text-sm">
                  <p className={cn('font-medium', s.done ? 'text-ink' : 'text-ink-faint')}>{s.t}</p>
                  {i === 3 && <p className="font-mono text-xs text-ink-faint">{formatDateTime(new Date(ts + 1200).toISOString())}</p>}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-2 rounded-xl bg-canvas px-4 py-3 text-[12px] leading-relaxed text-ink-faint">
            In production, webhook verification and payment confirmation happen on the Haigha Pay backend — never on the frontend.
          </p>
        </Card>
      </div>
    </div>
  )
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft/70 pb-2.5 last:border-0">
      <dt className="text-ink-soft">{k}</dt>
      <dd className={cn('font-medium text-ink', mono && 'font-mono text-xs')}>{v}</dd>
    </div>
  )
}
