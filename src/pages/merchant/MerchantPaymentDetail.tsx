import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, RefreshCw, ReceiptText, ShieldCheck, Webhook } from 'lucide-react'
import { Badge, Button, Card, FieldError, Input, Modal, Select, Textarea } from '../../components/ui'
import { CodeBlock, EnvBadge, MerchantPaymentBadge } from '../../components/common/DevKit'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime, money } from '../../lib/format'
import { toast } from 'sonner'

export default function MerchantPaymentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pay = useAppStore((s) => s.merchantPayments.find((p) => p.id === id))
  const app = useAppStore((s) => s.merchantApps.find((a) => a.id === (s.merchantPayments.find((p) => p.id === id)?.applicationId ?? '')))
  const createRefund = useAppStore((s) => s.createRefund)
  const merchantId = useAppStore((s) => s.activeMerchantId)
  const [refundOpen, setRefundOpen] = useState(false)
  const [amount, setAmount] = useState(pay ? String(pay.amount) : '')
  const [reason, setReason] = useState('Customer requested cancellation')
  const [err, setErr] = useState('')

  if (!pay) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Payment not found</p>
        <Link to="/app/business/payments" className="mt-2 inline-block text-brand hover:underline">← Back to transactions</Link>
      </div>
    )
  }

  const canRefund = pay.status === 'successful'

  const submitRefund = () => {
    const amt = parseFloat(amount)
    if (Number.isNaN(amt) || amt <= 0) return setErr('Enter a valid refund amount.')
    if (amt > pay.amount) return setErr('Refund cannot exceed the payment amount.')
    createRefund(merchantId ?? '', pay.haighaRef, amt, reason.trim() || 'No reason')
    setRefundOpen(false)
    setErr('')
    toast.success('Refund initiated', { description: `₦${amt.toLocaleString()} refund is processing.` })
  }

  const verify = () => {
    toast('Verifying payment…')
    setTimeout(() => toast.success('Verification successful — payment is valid', { description: 'Server-side verification returns status: successful' }), 900)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-up">
      <button onClick={() => navigate('/app/business/payments')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All transactions
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">{pay.merchantRef}</h1>
          <p className="font-mono text-sm text-ink-soft">{pay.haighaRef}</p>
        </div>
        <div className="flex items-center gap-2">
          <EnvBadge env={pay.environment} />
          <MerchantPaymentBadge status={pay.status} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Payment summary</h3>
            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Info k="Amount" v={<span className="text-lg font-bold">{money(pay.amount)}</span>} />
              <Info k="Status" v={<MerchantPaymentBadge status={pay.status} />} />
              <Info k="Customer" v={`${pay.customerName} · ${pay.customerEmail}`} />
              <Info k="Channel" v={pay.channel.replace('_', ' ')} />
              <Info k="Fee" v={money(pay.fee)} />
              <Info k="Created" v={formatDateTime(pay.createdAt)} />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3">
              <span className="font-mono text-xs text-ink-soft">{pay.haighaRef}</span>
              <button onClick={() => { void navigator.clipboard?.writeText(pay.haighaRef); toast.success('Reference copied') }} className="rounded p-1 text-ink-faint hover:text-brand"><Copy className="h-3.5 w-3.5" /></button>
              <span className="ml-auto rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">Not a payment proof — verify server-side</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">API information</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row k="Application" v={app?.name ?? '—'} />
              <Row k="Environment" v={pay.environment} />
              <Row k="Merchant reference" v={<span className="font-mono text-xs">{pay.merchantRef}</span>} />
              <Row k="Gateway (ZainPay)" v={pay.gatewayReference ? <span className="font-mono text-xs">{pay.gatewayReference}</span> : '—'} />
              <Row k="Metadata" v={<span className="font-mono text-xs">{JSON.stringify(pay.metadata)}</span>} />
            </dl>
          </Card>

          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Webhook className="h-4 w-4 text-brand" /> Webhook</h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink-soft">Last event</span>
              <Badge tone={pay.webhook === 'delivered' ? 'green' : pay.webhook === 'failed' ? 'red' : 'amber'} dot>
                {pay.webhook === 'delivered' ? 'payment.successful · Delivered' : pay.webhook === 'failed' ? 'Delivery failed' : 'Awaiting delivery'}
              </Badge>
            </div>
            <p className="mt-2 text-[13px] text-ink-faint">Never fulfill an order only because the browser reached a success page. Verify through the API or a verified webhook.</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">Actions</h3>
            <div className="space-y-2.5">
              <Button variant="secondary" className="w-full justify-start" onClick={verify} icon={<ShieldCheck className="h-4 w-4" />}>Verify payment</Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => { void navigator.clipboard?.writeText(pay.haighaRef); toast.success('Haigha reference copied') }} icon={<Copy className="h-4 w-4" />}>Copy reference</Button>
              <Button className="w-full justify-start" disabled={!canRefund} onClick={() => setRefundOpen(true)} icon={<ReceiptText className="h-4 w-4" />}>
                {canRefund ? 'Refund payment' : 'Not refundable in this state'}
              </Button>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-2 text-sm font-semibold text-ink">Lifecycle</h3>
            <ol>
              {['Initialized', 'Sent for processing', 'Gateway response', 'Final status'].map((s, i) => (
                <li key={s} className="flex items-start gap-2.5 pb-3 last:pb-0">
                  <span className={cn('mt-1 h-2 w-2 rounded-full', i < 3 || pay.status !== 'pending' ? 'bg-brand' : 'bg-ink-faint/30')} />
                  <span className={cn('text-[13px]', i < 3 || pay.status !== 'pending' ? 'text-ink' : 'text-ink-faint')}>{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <CodeBlock
        title="curl · verify payment"
        code={`curl https://sandbox-api.haighapay.com/v1/payments/${pay.haighaRef}/verify \\\n  -H "Authorization: Bearer hp_test_sk_••••••" \\\n  -H "Accept: application/json"`}
      />

      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Refund payment" subtitle={`${pay.merchantRef} · ${money(pay.amount)}`}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Amount</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="Refund amount" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Reason</label>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Customer requested cancellation</option>
              <option>Duplicate order payment</option>
              <option>Product out of stock</option>
              <option>Fraud / unauthorized</option>
            </Select>
          </div>
          <FieldError>{err}</FieldError>
          <p className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-800">
            <RefreshCw className="h-4 w-4" /> Sandbox simulation only — no real funds move.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button onClick={submitRefund}>Create refund</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Info({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] text-ink-faint">{k}</dt>
      <dd className="mt-0.5 font-medium text-ink">{v}</dd>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft/60 pb-2 last:border-0">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}
