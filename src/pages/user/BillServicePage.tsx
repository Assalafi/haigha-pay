import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Zap } from 'lucide-react'
import { Button, Card, FieldError, Input, Label, Modal, PageLoader, Select } from '../../components/ui'
import { cn } from '../../lib/cn'
import { billers, categoryMeta } from '../../data/static'
import { money } from '../../lib/format'
import { BillCategoryIcon } from '../../components/common/Icons'
import { useAppStore } from '../../store/appStore'
import type { BillCategory, Transaction, TxType } from '../../types'
import { toast } from 'sonner'

const feeByCategory: Partial<Record<BillCategory, number>> = { electricity: 50, cable_tv: 50 }

const cablePrice: Record<string, number> = {
  Padi: 2900,
  YangaLite: 3800,
  Compact: 6900,
  'Compact Plus': 9700,
  Premium: 17400,
  Supa: 2450,
  Max: 3900,
  Jolli: 900,
  Jinja: 1900,
  Smallie: 2500,
  Nova: 750,
  Basic: 1000,
  Classic: 1900,
}

const eduPrices: Record<string, number> = {
  'SSCE 6 Subjects': 4850,
  'UTME Registration': 7700,
  'Result Checker': 2500,
  'Private University': 850000,
  'Public University': 120000,
  Health: 25000,
  Motor: 30000,
  'VIO Renewal': 6500,
  LASG: 1000,
}

export default function BillServicePage() {
  const { service } = useParams()
  const category = (service as BillCategory) || 'other'
  const navigate = useNavigate()
  const biller = billers.find((b) => b.category === category) ?? billers[0]
  const meta = categoryMeta[category]

  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const payBill = useAppStore((s) => s.payBill)
  const user = useAppStore((s) => s.users.find((u) => u.id === s.activeUserId))

  const [providerIdx, setProviderIdx] = useState(0)
  const provider = biller.providers[providerIdx] ?? biller.providers[0]
  const [phone, setPhone] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [planId, setPlanId] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')
  const [meterNo, setMeterNo] = useState('')
  const [custLookup, setCustLookup] = useState<{ name: string; address: string } | null>(null)
  const [looking, setLooking] = useState(false)
  const [smartcard, setSmartcard] = useState('')
  const [pkg, setPkg] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [err, setErr] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const plan = provider.plans?.find((p) => p.id === planId)

  const amount: number = useMemo(() => {
    if (category === 'data' && plan) return plan.price
    if (category === 'cable_tv') return cablePrice[pkg] ?? 0
    if (category === 'education' || category === 'internet' || category === 'other') return eduPrices[pkg] ?? parseFloat(amountStr || '0')
    return parseFloat(amountStr || '0') || 0
  }, [category, plan, pkg, amountStr])

  const fee = feeByCategory[category] ?? 0
  const narration = `${meta.label} Payment`

  const lookupMeter = () => {
    setLooking(true)
    setTimeout(() => {
      setLooking(false)
      const digits = meterNo.replace(/\D/g, '')
      if (digits.length >= 6) {
        setCustLookup({ name: digits.startsWith('2') ? 'SULEIMAN ABDULLAHI' : 'AISHA MOHAMMED', address: `${digits.slice(0, 4)} Yusuf Street, Kaduna` })
      } else {
        setCustLookup(null)
        setErr('We could not find a customer for this meter number. Try a sample like 20091234567.')
      }
    }, 800)
  }

  const startPay = () => {
    setErr('')
    if (category === 'airtime' || category === 'data') {
      if (phone.replace(/\D/g, '').length !== 11) return setErr('Enter a valid 11-digit phone number.')
    }
    if (category === 'data' && !plan) return setErr('Select a data plan.')
    if (category === 'electricity') {
      const digits = meterNo.replace(/\D/g, '')
      if (digits.length < 6) return setErr('Enter a valid meter number.')
      if (!custLookup) return setErr('Verify the customer before continuing.')
    }
    if (category === 'cable_tv') {
      if (smartcard.replace(/\D/g, '').length < 8) return setErr('Enter a valid smartcard/IUC number.')
      if (!pkg) return setErr('Select a package.')
    }
    if (amount < 50) return setErr('Enter a valid amount (minimum ₦50).')
    if (!wallet || amount + fee > wallet.availableBalance) return setErr('Insufficient balance for this payment.')
    setProcessing(true)
    setTimeout(() => {
      const summary = payBill({
        narration,
        amount,
        fee,
        type: category as TxType,
      })
      toast.success(`${narration} of ${money(amount)} successful`)
      const tx: Transaction = {
        id: 'TXN-BILL',
        reference: summary.reference,
        userId: user?.id ?? '',
        type: category as TxType,
        direction: 'debit',
        amount,
        fee,
        status: 'successful',
        channel: 'wallet',
        narration,
        description: `${provider.name}${category === 'electricity' ? ' · ' + meterNo : category === 'cable_tv' ? ' · ' + smartcard : ''}`,
        createdAt: summary.date,
      }
      setResult(tx)
      setProcessing(false)
    }, 1300)
  }

  if (!billers.find((b) => b.category === category)) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Service not found</p>
        <Link to="/app/bills" className="mt-2 inline-block text-brand hover:underline">
          ← Back to bills
        </Link>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up">
        <div className="rounded-3xl border border-line-soft bg-white px-6 py-10 text-center shadow-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <svg viewBox="0 0 52 52" className="h-20 w-20 animate-pop-check">
              <circle cx="26" cy="26" r="24" fill="#D1FAE5" />
              <path d="M14 27l8 8 16-16" className="success-check" fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">{meta.label} Paid</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {provider.name} · <span className="font-semibold text-ink">{money(amount)}</span>
          </p>
          <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-2xl bg-canvas px-5 py-4 text-left text-sm">
            <Row k="Reference" v={result.reference} mono />
            <Row k="Fee" v={fee > 0 ? money(fee) : 'Free'} />
            <Row k="Status" v={<span className="text-status-success">Successful</span>} />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => setShowReceipt(true)}>
              View Receipt
            </Button>
            <Button onClick={() => navigate('/app')}>Back to Dashboard</Button>
          </div>
          <button onClick={() => { setResult(null); setAmountStr(''); setMeterNo(''); setSmartcard(''); setCustLookup(null); setPhone('') }} className="mt-4 text-sm font-medium text-brand hover:underline">
            Pay another {meta.label.toLowerCase()}
          </button>
        </div>
        <Modal open={showReceipt} onClose={() => setShowReceipt(false)} size="sm" hideClose>
          <div className="no-print">
            <BasicReceipt tx={result} provider={provider.name} extra={result.description} />
          </div>
          <div className="mt-4 flex justify-end gap-2 no-print">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>Print</Button>
            <Button size="sm" onClick={() => setShowReceipt(false)}>Close</Button>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-up">
      <button onClick={() => navigate('/app/bills')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to bills
      </button>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
          <BillCategoryIcon category={category} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pay {meta.label}</h1>
          <p className="text-sm text-ink-soft">Powered by Haigha Pay wallet</p>
        </div>
      </div>

      <Card className="space-y-4 p-6">
        <div>
          <Label>Provider</Label>
          <div className="grid grid-cols-2 gap-2">
            {biller.providers.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  setProviderIdx(idx)
                  setPlanId('')
                  setPkg('')
                }}
                className={cn(
                  'rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all',
                  providerIdx === idx ? 'border-brand bg-brand-soft/40 text-brand' : 'border-line text-ink-soft hover:border-brand/30',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {(category === 'airtime' || category === 'data') && (
          <div>
            <Label>Phone number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="08031234567" inputMode="numeric" />
            <div className="mt-2 flex gap-2 text-[12px] text-ink-faint">
              <span className="rounded-full bg-canvas px-2.5 py-1">e.g. 08031234567</span>
            </div>
          </div>
        )}

        {category === 'airtime' && (
          <div>
            <Label>Amount</Label>
            <input
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => { setAmountStr(e.target.value.replace(/[^\d]/g, '')); setErr('') }}
              className="h-16 w-full rounded-2xl border border-line bg-canvas/40 px-5 text-3xl font-extrabold tabular text-ink outline-none focus:border-brand focus:bg-white"
            />
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[100, 200, 500, 1000, 2000, 5000].map((q) => (
                <button key={q} onClick={() => setAmountStr(String(q))} className={cn('rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold tabular transition-all', parseFloat(amountStr) === q ? 'border-brand bg-brand text-white' : 'text-ink hover:border-brand/40')}>
                  ₦{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {category === 'data' && provider.plans && (
          <div>
            <Label>Data plan</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {provider.plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all',
                    planId === p.id ? 'border-brand bg-brand-soft/40' : 'border-line hover:border-brand/30',
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">{p.label}</span>
                    <span className="block text-xs text-ink-soft tabular">{money(p.price)}</span>
                  </span>
                  {planId === p.id && <Check className="h-5 w-5 text-brand" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {category === 'electricity' && (
          <>
            <div>
              <Label>Meter type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['prepaid', 'postpaid'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMeterType(t)}
                    className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all', meterType === t ? 'border-brand bg-brand-soft/40 text-brand' : 'border-line text-ink-soft')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Meter number</Label>
              <div className="flex gap-2">
                <Input value={meterNo} onChange={(e) => { setMeterNo(e.target.value); setCustLookup(null); setErr('') }} placeholder="20091234567" inputMode="numeric" />
                <Button variant="secondary" type="button" onClick={lookupMeter} disabled={looking}>
                  {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>
              {looking && <p className="mt-2 text-[13px] text-ink-soft">Fetching customer details…</p>}
              {custLookup && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                  <Check className="h-4 w-4 text-status-success" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{custLookup.name}</p>
                    <p className="text-xs text-ink-soft">{custLookup.address}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {category === 'cable_tv' && (
          <>
            <div>
              <Label>Smartcard / IUC number</Label>
              <Input value={smartcard} onChange={(e) => setSmartcard(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="7000123456" inputMode="numeric" />
            </div>
            {provider.packages && (
              <div>
                <Label>Package</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[...new Set(provider.packages)].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPkg(p)}
                      className={cn('flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all', pkg === p ? 'border-brand bg-brand-soft/40' : 'border-line hover:border-brand/30')}
                    >
                      <span className="text-sm font-semibold text-ink">{p}</span>
                      <span className="text-sm font-semibold tabular text-ink-soft">{cablePrice[p] ? money(cablePrice[p]) : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {(category === 'internet' || category === 'education' || category === 'other') && (
          <>
            {category === 'internet' && (
              <div>
                <Label>Customer / account number</Label>
                <Input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="Account number" />
              </div>
            )}
            {category === 'education' && (
              <div>
                <Label>What are you paying for?</Label>
                <Select value={pkg} onChange={(e) => setPkg(e.target.value)}>
                  <option value="">Select service</option>
                  {provider.packages?.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
                {eduPrices[pkg] ? <p className="mt-2 text-[13px] font-semibold tabular text-ink">{money(eduPrices[pkg])}</p> : null}
              </div>
            )}
            {category === 'other' && provider.packages && (
              <div>
                <Label>Service type</Label>
                <Select value={pkg} onChange={(e) => setPkg(e.target.value)}>
                  <option value="">Select service</option>
                  {provider.packages.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </div>
            )}
          </>
        )}

        {(category === 'internet' || category === 'other' || (category === 'education' && !eduPrices[pkg])) && (
          <div>
            <Label>Amount</Label>
            <input
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => { setAmountStr(e.target.value.replace(/[^\d]/g, '')); setErr('') }}
              className="h-16 w-full rounded-2xl border border-line bg-canvas/40 px-5 text-3xl font-extrabold tabular text-ink outline-none focus:border-brand focus:bg-white"
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-ink-soft">
            <Zap className="h-4 w-4 text-brand" /> Total with fee
          </span>
          <span className="font-bold tabular text-ink">{amount > 0 ? money(amount + fee) : '—'}</span>
        </div>
        <FieldError>{err}</FieldError>
      </Card>

      <Button size="lg" className="w-full" onClick={startPay}>
        Pay {amount > 0 ? money(amount + fee) : meta.label}
      </Button>

      <Modal open={processing} onClose={() => undefined} hideClose>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/10" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
              <Loader2 className="h-9 w-9 animate-spin text-brand" />
            </div>
          </div>
          <h3 className="mt-6 text-lg font-bold text-ink">Paying {meta.label}</h3>
          <p className="mt-1 text-sm text-ink-soft">
            {provider.name} · <span className="font-semibold">{amount > 0 ? money(amount) : ''}</span>
          </p>
        </div>
      </Modal>
    </div>
  )
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-soft">{k}</span>
      <span className={cn('font-medium text-ink', mono && 'font-mono text-xs')}>{v}</span>
    </div>
  )
}

function BasicReceipt({ tx, provider, extra }: { tx: Transaction; provider: string; extra?: string }) {
  const fmt = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft">
      <div className="bg-brand px-5 py-4">
        <p className="text-sm font-bold text-white">Haigha Pay</p>
        <p className="text-xs text-white/70">Bill payment receipt · {provider}</p>
      </div>
      <div className="space-y-2.5 px-5 py-5 text-sm">
        <p className="pb-2 text-center text-2xl font-extrabold tabular">{fmt.format(tx.amount)}</p>
        <Row k="Reference" v={tx.reference} mono />
        <Row k="Amount" v={fmt.format(tx.amount)} />
        <Row k="Fee" v={tx.fee > 0 ? fmt.format(tx.fee) : 'Free'} />
        {extra && <Row k="Detail" v={extra} />}
        <Row k="Status" v={<span className="text-status-success">Successful</span>} />
      </div>
    </div>
  )
}
