import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Landmark, Loader2, Lock, ShieldCheck, Wallet, Zap } from 'lucide-react'
import { Button, Card, FieldError, Input, Label, Modal, PageLoader, Steps } from '../../components/ui'
import { WalletBalanceCard } from '../../components/common/WalletBalanceCard'
import { BalanceText } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore, useCurrentUser } from '../../store/appStore'
import { money, generateReference } from '../../lib/format'
import { toast } from 'sonner'
import type { PaymentResult } from '../../types'

const quickAmounts = [1000, 5000, 10000, 20000, 50000]

const methods = [
  { id: 'card', label: 'Card', desc: 'Debit / credit card', icon: CreditCard, note: 'Powered by ZainPay' },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Pay from any bank app', icon: Landmark, note: 'Instant credit' },
  { id: 'virtual_account', label: 'Virtual Account', desc: 'Dedicated NUBAN account', icon: Wallet, note: 'Auto-credited' },
] as const

export default function FundWallet() {
  const [step, setStep] = useState(1)
  const [amountStr, setAmountStr] = useState('50000')
  const [method, setMethod] = useState<(typeof methods)[number]['id']>('card')
  const [email, setEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [err, setErr] = useState('')
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const user = useCurrentUser()
  const fundWallet = useAppStore((s) => s.fundWallet)
  const setLastPayment = useAppStore((s) => s.setLastPayment)
  const nextResult = useAppStore((s) => s.nextPaymentResult)
  const setNextResult = useAppStore((s) => s.setNextPaymentResult)
  const hide = useAppStore((s) => s.hideBalance)
  const navigate = useNavigate()

  const amount = parseFloat(amountStr || '0') || 0
  const fee = 0
  const ref = useMemo(() => generateReference(), [])
  const methodMeta = methods.find((m) => m.id === method)!

  const continueToMethod = () => {
    if (amount < 100) return setErr('Minimum funding amount is ₦100.')
    if (amount > 2000000) return setErr('Maximum funding amount is ₦2,000,000.')
    setErr('')
    setStep(2)
  }

  const pay = () => {
    const receiptEmail = (email.trim() || user?.email || '').trim()
    if (!/^\S+@\S+\.\S+$/.test(receiptEmail)) return setErr('Enter the email address for your payment receipt.')
    setErr('')
    setProcessing(true)
    setTimeout(() => {
      const summary = fundWallet(amount, fee, methodMeta.label, method)
      setLastPayment(summary)
      setProcessing(false)
      navigate(summary.result === 'success' ? '/app/payment/success' : summary.result === 'pending' ? '/app/payment/pending' : '/app/payment/failed')
    }, 1500)
  }

  if (!wallet) return <PageLoader label="Loading wallet…" />

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      {step > 1 && (
        <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Fund Wallet</h1>
        <p className="mt-1 text-sm text-ink-soft">Add money to your Haigha Pay wallet instantly.</p>
      </div>

      <Steps steps={['Amount', 'Payment method', 'Confirm']} current={step - 1} />

      <WalletBalanceCard compact />

      {step === 1 && (
        <Card className="space-y-5 p-6 animate-fade-up">
          <div>
            <Label>Amount to fund</Label>
            <input
              autoFocus
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value.replace(/[^\d.]/g, ''))
                setErr('')
              }}
              className="h-20 w-full rounded-2xl border border-line bg-canvas/40 px-6 text-right text-4xl font-extrabold tabular text-ink outline-none transition-all focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
            <div className="mt-1 text-right">
              <BalanceText amount={amount} hidden={false} className="text-sm text-ink-soft" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">Quick amounts</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setAmountStr(String(q))
                    setErr('')
                  }}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-semibold tabular transition-all',
                    amount === q ? 'border-brand bg-brand text-white shadow-sm' : 'border-line bg-white text-ink hover:border-brand/40 hover:text-brand',
                  )}
                >
                  ₦{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <FieldError>{err}</FieldError>
          <Button size="lg" className="w-full" onClick={continueToMethod}>
            Continue
          </Button>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-up">
          <Card className="p-6">
            <p className="mb-4 text-[15px] font-semibold text-ink">Choose how to pay</p>
            <div className="space-y-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all',
                    method === m.id ? 'border-brand bg-brand-soft/40' : 'border-line hover:border-brand/30',
                  )}
                >
                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', method === m.id ? 'bg-brand text-white' : 'bg-canvas text-ink-soft')}>
                    <m.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{m.label}</span>
                    <span className="block text-[13px] text-ink-soft">{m.desc}</span>
                  </span>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">{m.note}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 text-[13px] text-ink-soft">
              <Zap className="h-4 w-4 text-brand" /> Payment processing powered by ZainPay — demo checkout only.
            </div>
          </Card>
          <Button size="lg" className="w-full" onClick={() => setStep(3)}>
            Continue to review
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-up">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-brand to-brand-deep px-6 py-4 text-white">
              <p className="text-[12px] uppercase tracking-wider text-white/70">Review & pay</p>
              <p className="mt-1 flex items-baseline gap-1 text-3xl font-extrabold tabular">
                <span className="text-xl">₦</span>
                {(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <dl className="space-y-3 px-6 py-5 text-sm">
              <Row label="Amount" value={money(amount)} />
              <Row label="Processing fee" value={fee === 0 ? 'Free' : money(fee)} />
              <div className="border-t border-dashed border-line pt-3">
                <Row label="Total" value={money(amount + fee)} strong />
              </div>
              <Row label="Payment method" value={methodMeta.label} />
              <Row label="Receipt email" value={user?.email ?? email} mono />
              <Row label="Reference" value={ref} mono />
            </dl>
          </Card>
          <Card className="space-y-4 p-5">
            <div>
              <Label>Receipt email address</Label>
              <Input type="email" value={email || user?.email || ''} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <FieldError>{err}</FieldError>
          </Card>

          <Button size="lg" className="w-full" onClick={pay} icon={<Lock className="h-4 w-4" />}>
            Pay ₦{(amount + fee).toLocaleString()}
          </Button>

          <div className="rounded-xl border border-line bg-canvas/60 p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Demo presenter control</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-ink-soft">Next payment outcome</span>
              <div className="flex overflow-hidden rounded-lg border border-line bg-white">
                {(['success', 'pending', 'failed'] as PaymentResult[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setNextResult(r)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                      nextResult === r
                        ? r === 'success'
                          ? 'bg-brand text-white'
                          : r === 'pending'
                            ? 'bg-amber-500 text-white'
                            : 'bg-status-danger text-white'
                        : 'text-ink-soft hover:bg-canvas',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ProcessingModal open={processing} amount={amount + fee} />
    </div>
  )
}

function Row({ label, value, strong, mono }: { label: string; value: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={cn('font-semibold tabular text-ink', strong && 'text-base', mono && 'font-mono text-[13px]')}>{value}</dd>
    </div>
  )
}

function ProcessingModal({ open, amount }: { open: boolean; amount: number }) {
  const [secs, setSecs] = useState(0)
  return (
    <Modal open={open} onClose={() => undefined} hideClose>
      <div className="flex flex-col items-center py-8 text-center">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/10" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
            <Loader2 className="h-9 w-9 animate-spin text-brand" />
          </div>
        </div>
        <h3 className="mt-6 text-lg font-bold text-ink">Processing Payment</h3>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">
          Please do not close this window. Your payment of <span className="font-semibold text-ink">₦{amount.toLocaleString()}</span> is being processed securely via ZainPay.
        </p>
        <div className="mt-5 flex items-center gap-1.5 text-[13px] text-ink-faint">
          <ShieldCheck className="h-4 w-4 text-brand" />
          Secured & encrypted · 256-bit SSL
        </div>
      </div>
    </Modal>
  )
}
