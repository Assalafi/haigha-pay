import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Download, Headphones } from 'lucide-react'
import { Button, Modal } from '../../components/ui'
import { StatusIcon } from '../../components/common/Icons'
import { ReceiptView } from '../../components/payment/Receipt'
import { useAppStore } from '../../store/appStore'
import { money, formatDateTime } from '../../lib/format'
import type { PaymentResult, Transaction } from '../../types'
import { cn } from '../../lib/cn'

export default function PaymentResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const last = useAppStore((s) => s.lastPayment)
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const resolvePending = useAppStore((s) => s.resolvePendingTx)
  const setLastPayment = useAppStore((s) => s.setLastPayment)
  const [receipt, setReceipt] = useState(false)

  const kind: PaymentResult = location.pathname.includes('/pending') ? 'pending' : location.pathname.includes('/failed') ? 'failed' : 'success'

  const txFromSummary = (): Transaction => ({
    id: 'TXN-PAY',
    reference: last?.reference ?? 'HPY-000000-000000',
    userId: 'me',
    type: 'wallet_funding',
    direction: 'credit',
    amount: last?.amount ?? 0,
    fee: last?.fee ?? 0,
    status: kind === 'failed' ? 'failed' : kind === 'pending' ? 'pending' : 'successful',
    channel: (last?.channel ?? 'card') as Transaction['channel'],
    gatewayReference: last?.gatewayReference,
    narration: last?.narration ?? 'Wallet Funding',
    description: last?.methodLabel,
    createdAt: last?.date ?? new Date().toISOString(),
  })

  const fallback = !last
  if (fallback) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <StatusIcon name="failed" className="mx-auto" />
        <h1 className="mt-6 text-2xl font-bold">No active payment</h1>
        <p className="mt-2 text-ink-soft">Start a new payment to see its result here.</p>
        <Link to="/app/wallet/fund">
          <Button className="mt-6">Fund Wallet</Button>
        </Link>
      </div>
    )
  }

  const tx = txFromSummary()

  const onCheckStatus = () => {
    resolvePending(last.reference)
    setLastPayment({ ...last, result: 'success', date: new Date().toISOString() })
    navigate('/app/payment/success')
  }

  return (
    <div className="mx-auto max-w-lg py-6 animate-fade-up">
      <div className="rounded-3xl border border-line-soft bg-white px-6 py-10 text-center shadow-card">
        {kind === 'success' && (
          <>
            <StatusIcon name="success" className="mx-auto" />
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Payment Successful</h1>
            <p className="mt-1 text-sm text-ink-soft">Your wallet has been credited.</p>
            <p className="mt-6 text-4xl font-extrabold tabular text-ink">{money(last.total)}</p>
            <p className="mt-1 text-sm text-ink-soft">via {last.methodLabel}</p>
            <div className="mt-6 space-y-2 rounded-2xl bg-canvas px-5 py-4 text-left text-sm">
              <InfoRow label="Reference" value={last.reference} mono />
              <InfoRow label="Date" value={formatDateTime(last.date)} />
              <InfoRow label="Payment method" value={last.methodLabel} />
              {last.gatewayReference && <InfoRow label="Gateway ref" value={last.gatewayReference} mono />}
              <InfoRow label="New balance" value={wallet ? money(wallet.availableBalance) : money(last.amount)} />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => setReceipt(true)} icon={<Download className="h-4 w-4" />}>
                View Receipt
              </Button>
              <Button onClick={() => navigate('/app')} icon={<Check className="h-4 w-4" />}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}

        {kind === 'pending' && (
          <>
            <StatusIcon name="pending" className="mx-auto" />
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Payment Pending</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Your payment of {money(last.total)} is being confirmed by your bank. Funds will reflect in your wallet once the
              gateway confirms it.
            </p>
            <div className="mt-6 space-y-2 rounded-2xl bg-canvas px-5 py-4 text-left text-sm">
              <InfoRow label="Reference" value={last.reference} mono />
              <InfoRow label="Date" value={formatDateTime(last.date)} />
              <InfoRow label="Amount" value={money(last.total)} />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={onCheckStatus}>
                Check Status
              </Button>
              <Button onClick={() => navigate('/app')}>Back to Dashboard</Button>
            </div>
            <p className="mt-4 text-[12px] text-ink-faint">Demo: tapping “Check Status” simulates the payment completing.</p>
          </>
        )}

        {kind === 'failed' && (
          <>
            <StatusIcon name="failed" className="mx-auto" />
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Payment Unsuccessful</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              We could not complete this payment. Your card was not charged. Please try again or use another payment method.
            </p>
            <div className="mt-6 space-y-2 rounded-2xl bg-canvas px-5 py-4 text-left text-sm">
              <InfoRow label="Reference" value={last.reference} mono />
              <InfoRow label="Amount" value={money(last.amount)} />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => navigate('/app/support')} icon={<Headphones className="h-4 w-4" />}>
                Contact Support
              </Button>
              <Button onClick={() => navigate('/app/wallet/fund')} icon={<ArrowLeft className="h-4 w-4" />}>
                Retry Payment
              </Button>
            </div>
          </>
        )}
      </div>

      <ReceiptModalOpen open={receipt} onClose={() => setReceipt(false)} tx={tx} amountOverride={money(last.total)} />
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-soft">{label}</span>
      <span className={cn('font-medium text-ink', mono && 'font-mono text-[12px]')}>{value}</span>
    </div>
  )
}

function ReceiptModalOpen({ open, onClose, tx, amountOverride }: { open: boolean; onClose: () => void; tx: Transaction; amountOverride: string }) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="no-print">
        <ReceiptView tx={tx} className="print-visible" amountOverride={amountOverride} typeLabel="Wallet Funding" />
      </div>
      <div className="mt-4 flex justify-end gap-2 no-print">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download className="h-4 w-4" /> Print
        </Button>
        <Button size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
