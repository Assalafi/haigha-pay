import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Lock, Search, Send, ShieldCheck, User } from 'lucide-react'
import { Button, Card, FieldError, Input, Label, Modal, PageLoader, Select } from '../../components/ui'
import { cn } from '../../lib/cn'
import { banks, bankDemoLookup, haighaUsers } from '../../data/static'
import { money, generateReference } from '../../lib/format'
import { useAppStore, useCurrentUser } from '../../store/appStore'
import { toast } from 'sonner'
import type { Transaction } from '../../types'
import { ReceiptView } from '../../components/payment/Receipt'

type Step = 'target' | 'bank' | 'haigha' | 'confirm' | 'done'

interface Draft {
  kind: 'bank' | 'haigha'
  bank?: string
  accountNumber?: string
  accountName?: string
  user?: string
  amount: number
  narration: string
}

const feeFor = (amount: number) => {
  if (amount <= 0) return 0
  if (amount < 10000) return 25
  return 50
}

export default function Transfer() {
  const navigate = useNavigate()
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const user = useCurrentUser()
  const recordTransfer = useAppStore((s) => s.recordTransfer)
  const addBeneficiary = useAppStore((s) => s.addBeneficiary)
  const setLastPayment = useAppStore((s) => s.setLastPayment)

  const [step, setStep] = useState<Step>('target')
  const [kind, setKind] = useState<'bank' | 'haigha'>('bank')
  const [bank, setBank] = useState('044')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [looking, setLooking] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [narration, setNarration] = useState('')
  const [saveBeneficiary, setSaveBeneficiary] = useState(false)
  const [err, setErr] = useState('')
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const amount = parseFloat(amountStr || '0') || 0
  const fee = feeFor(amount)

  const haighaMatches = useMemo(() => {
    const q = query.toLowerCase()
    return haighaUsers.filter((u) => u.name.toLowerCase().includes(q) || u.phone.includes(q))
  }, [query])

  const back = () => {
    setErr('')
    if (step === 'confirm' || step === 'bank' || step === 'haigha') setStep('target')
    else if (step === 'target') navigate('/app')
  }

  const resolveAccount = () => {
    setLooking(true)
    setErr('')
    setAccountName('')
    setTimeout(() => {
      setLooking(false)
      const hit = bankDemoLookup[accountNumber]
      if (hit) setAccountName(hit.name)
      else {
        setAccountName('')
        setErr('We could not find an account with that number. Please verify and try again.')
      }
    }, 700)
  }

  const nextToConfirm = () => {
    if (step === 'bank') {
      if (!accountNumber || accountNumber.length !== 10) return setErr('Enter a valid 10-digit account number.')
      if (!accountName) {
        resolveAccount()
        return setErr('Verify the account name before continuing.')
      }
    } else if (step === 'haigha') {
      if (!selectedUser) return setErr('Select a Haigha Pay user to send to.')
    }
    if (amount < 100) return setErr('Enter an amount to send (minimum ₦100).')
    if (!wallet) return
    if (amount + fee > wallet.availableBalance) return setErr('Insufficient balance for this transfer and its fee.')
    setStep('confirm')
  }

  const target = step === 'haigha' || (step === 'confirm' && kind === 'haigha') ? selectedUser : accountName

  const openPin = () => {
    if (step !== 'confirm') return
    setPin('')
    setPinErr(false)
    setPinOpen(true)
  }

  const submitPin = () => {
    if (pin.length !== 4) {
      setPinErr(true)
      return
    }
    if (pin !== '1234') {
      setPinErr(true)
      setPin('')
      toast.error('Incorrect transaction PIN. Please try again.')
      return
    }
    setPinOpen(false)
    setProcessing(true)
    const bankName = banks.find((b) => b.code === bank)?.name
    const benName = kind === 'haigha' ? selectedUser : accountName
    setTimeout(() => {
      const summary = recordTransfer({
        target: benName,
        bank: kind === 'bank' ? bankName : undefined,
        accountNumber: kind === 'bank' ? accountNumber : undefined,
        amount,
        fee,
        narration: narration || `Transfer to ${benName}`,
      })
      setLastPayment(summary)
      if (saveBeneficiary && benName) {
        addBeneficiary({
          name: benName,
          bank: kind === 'bank' ? bankName : undefined,
          accountNumber: kind === 'bank' ? accountNumber : undefined,
          kind,
        })
        toast.success('Beneficiary saved')
      }
      toast.success(`Transfer of ${money(amount)} sent to ${benName}`)
      const tx: Transaction = {
        id: 'TXN-NEW',
        reference: summary.reference,
        userId: user?.id ?? '',
        customerName: user ? `${user.firstName} ${user.lastName}` : undefined,
        type: 'transfer',
        direction: 'debit',
        amount,
        fee,
        status: 'successful',
        channel: 'wallet',
        narration: summary.narration,
        recipientName: benName,
        bank: bankName,
        accountNumber: kind === 'bank' ? accountNumber : undefined,
        createdAt: summary.date,
      }
      setResult(tx)
      setProcessing(false)
      setStep('done')
    }, 1200)
  }

  const openSteps = !wallet
  if (openSteps) return <PageLoader label="Loading wallet…" />

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-up">
      {step !== 'done' && (
        <>
          <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Send Money</h1>
            <p className="mt-1 text-sm text-ink-soft">Transfer to any Nigerian bank or a Haigha Pay user.</p>
          </div>
        </>
      )}

      {step === 'done' && result ? (
        <DoneTransfer
          tx={result}
          amount={amount}
          fee={fee}
          onReceipt={() => setShowReceipt(true)}
          onDone={() => navigate('/app')}
          onAnother={() => {
            setResult(null)
            setStep('target')
            setAccountNumber('')
            setAccountName('')
            setAmountStr('')
            setSelectedUser('')
            setQuery('')
          }}
        />
      ) : (
        <>
          {step === 'target' && (
            <Card className="p-6 animate-fade-up">
              <p className="mb-4 text-[15px] font-semibold text-ink">Who are you sending to?</p>
              <div className="space-y-3">
                <TargetOption
                  active={kind === 'bank'}
                  onClick={() => {
                    setKind('bank')
                    setStep('bank')
                  }}
                  title="Bank Account"
                  desc="Send to any Nigerian bank"
                  icon={<Send className="h-5 w-5" />}
                />
                <TargetOption
                  active={kind === 'haigha'}
                  onClick={() => {
                    setKind('haigha')
                    setStep('haigha')
                  }}
                  title="Haigha Pay User"
                  desc="Instant, fee-free transfers"
                  icon={<User className="h-5 w-5" />}
                />
              </div>
            </Card>
          )}

          {step === 'bank' && (
            <div className="space-y-4 animate-fade-up">
              <Card className="space-y-4 p-6">
                <div>
                  <Label>Bank</Label>
                  <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Account number</Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setAccountNumber(v)
                      if (v.length === 10) resolveAccount()
                      else setAccountName('')
                    }}
                    placeholder="0123456789"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {looking && (
                    <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink-soft">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" /> Verifying account…
                    </p>
                  )}
                  {accountName && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-soft/60 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand" />
                        <span>
                          <span className="block text-sm font-semibold text-ink">{accountName}</span>
                          <span className="block text-xs text-ink-soft">Account verified</span>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAccountName('')
                          setAccountNumber('')
                        }}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </Card>
              <FieldError>{err}</FieldError>
              <Button size="lg" className="w-full" onClick={nextToConfirm}>
                Continue
              </Button>
            </div>
          )}

          {step === 'haigha' && (
            <div className="space-y-4 animate-fade-up">
              <Card className="space-y-4 p-6">
                <div>
                  <Label>Search Haigha Pay user</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or phone number" className="pl-10" />
                  </div>
                  {query && !selectedUser && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-line">
                      {haighaMatches.slice(0, 4).map((u) => (
                        <button
                          key={u.phone}
                          onClick={() => {
                            setSelectedUser(u.name)
                            setQuery(u.name)
                          }}
                          className="flex w-full items-center gap-3 border-b border-line-soft px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-canvas"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                            {u.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-ink">{u.name}</span>
                            <span className="block text-xs text-ink-faint">{u.phone}</span>
                          </span>
                        </button>
                      ))}
                      {haighaMatches.length === 0 && <p className="px-3 py-3 text-sm text-ink-soft">No Haigha Pay users found.</p>}
                    </div>
                  )}
                  {selectedUser && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-soft/60 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-brand" />
                        <span className="text-sm font-semibold text-ink">Send to {selectedUser}</span>
                      </div>
                      <button onClick={() => { setSelectedUser(''); setQuery('') }} className="text-xs font-medium text-brand hover:underline">
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </Card>
              <FieldError>{err}</FieldError>
              <Button size="lg" className="w-full" onClick={nextToConfirm}>
                Continue
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 animate-fade-up">
              <Card className="space-y-4 p-6">
                <div>
                  <Label>Amount</Label>
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
                  <div className="mt-2 flex justify-between text-[13px]">
                    <span className="text-ink-soft">Available</span>
                    <span className="font-semibold tabular text-ink">{money(wallet?.availableBalance ?? 0)}</span>
                  </div>
                </div>
                <div>
                  <Label>Narration (optional)</Label>
                  <Input value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g. August rent" maxLength={60} />
                </div>
                <div className="space-y-2 rounded-2xl bg-canvas px-5 py-4 text-sm">
                  <p className="flex justify-between">
                    <span className="text-ink-soft">Beneficiary</span>
                    <span className="font-semibold text-ink">{target}</span>
                  </p>
                  {kind === 'bank' && (
                    <>
                      <p className="flex justify-between">
                        <span className="text-ink-soft">Bank / Account</span>
                        <span className="font-semibold text-ink">
                          {banks.find((b) => b.code === bank)?.name} · {accountNumber}
                        </span>
                      </p>
                    </>
                  )}
                  <p className="flex justify-between">
                    <span className="text-ink-soft">Transfer fee</span>
                    <span className="font-semibold tabular text-ink">{fee > 0 ? money(fee) : 'Free'}</span>
                  </p>
                  <p className="flex justify-between border-t border-dashed border-line pt-2">
                    <span className="font-medium text-ink">Total debit</span>
                    <span className="font-bold tabular text-ink">{money(amount + fee)}</span>
                  </p>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <input type="checkbox" checked={saveBeneficiary} onChange={(e) => setSaveBeneficiary(e.target.checked)} className="h-4 w-4 rounded accent-brand" />
                  Save {target} as a beneficiary
                </label>
                <FieldError>{err}</FieldError>
              </Card>
              <Button size="lg" className="w-full" onClick={openPin} icon={<Lock className="h-4 w-4" />}>
                Confirm & Send {amount > 0 && `· ${money(amount + fee)}`}
              </Button>
            </div>
          )}
        </>
      )}

      <PinModal
        open={pinOpen}
        value={pin}
        setValue={(v) => {
          setPin(v)
          setPinErr(false)
        }}
        error={pinErr}
        onClose={() => setPinOpen(false)}
        onSubmit={submitPin}
        amount={money(amount + fee)}
      />

      <ProcessingTransfer open={processing} amount={money(amount)} target={step === 'done' ? '' : target} />

      <Modal open={showReceipt} onClose={() => setShowReceipt(false)} size="sm" hideClose>
        {result && (
          <>
            <div className="no-print">
              <ReceiptView tx={result} className="print-visible" recipient={result.recipientName} />
            </div>
            <div className="mt-4 flex justify-end gap-2 no-print">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                Print
              </Button>
              <Button size="sm" onClick={() => setShowReceipt(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

function TargetOption({ active, onClick, title, desc, icon }: { active: boolean; onClick: () => void; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all',
        active ? 'border-brand bg-brand-soft/30' : 'border-line hover:border-brand/30',
      )}
    >
      <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', active ? 'bg-brand text-white' : 'bg-canvas text-ink-soft')}>{icon}</span>
      <span>
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        <span className="block text-[13px] text-ink-soft">{desc}</span>
      </span>
      {active && <Check className="ml-auto h-5 w-5 text-brand" />}
    </button>
  )
}

function DoneTransfer({
  tx,
  amount,
  fee,
  onReceipt,
  onDone,
  onAnother,
}: {
  tx: Transaction
  amount: number
  fee: number
  onReceipt: () => void
  onDone: () => void
  onAnother: () => void
}) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-line-soft bg-white px-6 py-10 text-center shadow-card animate-fade-up">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <svg viewBox="0 0 52 52" className="h-20 w-20 animate-pop-check">
          <circle cx="26" cy="26" r="24" fill="#D1FAE5" />
          <path d="M14 27l8 8 16-16" className="success-check" fill="none" stroke="#059669" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Transfer Successful</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {money(amount)} sent to <span className="font-semibold text-ink">{tx.recipientName}</span>
        {tx.bank ? ` · ${tx.bank}` : ''}
      </p>
      <div className="mt-6 space-y-2 rounded-2xl bg-canvas px-5 py-4 text-left text-sm">
        <div className="flex justify-between"><span className="text-ink-soft">Reference</span><span className="font-mono font-medium text-ink">{tx.reference}</span></div>
        <div className="flex justify-between"><span className="text-ink-soft">Fee</span><span className="font-medium tabular text-ink">{fee > 0 ? money(fee) : 'Free'}</span></div>
        <div className="flex justify-between"><span className="text-ink-soft">Total debited</span><span className="font-semibold tabular text-ink">{money(amount + fee)}</span></div>
        <div className="flex justify-between"><span className="text-ink-soft">Status</span><span className="font-medium text-status-success">Successful</span></div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" onClick={onReceipt}>View Receipt</Button>
        <Button onClick={onDone}>Back to Dashboard</Button>
      </div>
      <button onClick={onAnother} className="mt-4 text-sm font-medium text-brand hover:underline">
        Send another transfer
      </button>
    </div>
  )
}

function PinModal({
  open,
  value,
  setValue,
  error,
  onClose,
  onSubmit,
  amount,
}: {
  open: boolean
  value: string
  setValue: (v: string) => void
  error: boolean
  onClose: () => void
  onSubmit: () => void
  amount: string
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enter Transaction PIN"
      subtitle={
        <span>
          Authorise a debit of <span className="font-semibold text-ink">{amount}</span> · Demo PIN <span className="font-mono">1234</span>
        </span>
      }
      size="sm"
    >
      <div className="flex justify-center gap-3 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold tabular transition-colors',
              error ? 'border-status-danger bg-red-50 text-status-danger' : value[i] ? 'border-brand text-ink' : 'border-line',
            )}
          >
            {value[i] ? '•' : ''}
          </span>
        ))}
      </div>
      <input
        autoFocus
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 4)
          setValue(v)
          if (v.length === 4) setTimeout(onSubmit, 120)
        }}
        className="sr-only"
        aria-label="Transaction PIN"
      />
      <p className="text-center text-[13px] text-ink-soft">
        {error ? 'Incorrect PIN. Try 1234.' : 'This action is protected for your security.'}
        <ShieldCheck className="ml-1 inline h-3.5 w-3.5 text-brand" />
      </p>
    </Modal>
  )
}

function ProcessingTransfer({ open, amount, target }: { open: boolean; amount: string; target: string }) {
  return (
    <Modal open={open} onClose={() => undefined} hideClose>
      <div className="flex flex-col items-center py-8 text-center">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/10" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
            <Loader2 className="h-9 w-9 animate-spin text-brand" />
          </div>
        </div>
        <h3 className="mt-6 text-lg font-bold text-ink">Sending {amount}</h3>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">
          {target ? `Transferring to ${target}. Please wait — do not close this window.` : 'Please wait while we complete your transfer.'}
        </p>
      </div>
    </Modal>
  )
}
