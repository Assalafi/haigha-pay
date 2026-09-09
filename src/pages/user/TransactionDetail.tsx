import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Flag, Share2 } from 'lucide-react'
import { Badge, Button, Card, Modal, PageLoader } from '../../components/ui'
import { ReceiptView, shareReceipt } from '../../components/payment/Receipt'
import { txTypeLabel, txTypeTone, TxTypeIcon } from '../../components/common/Icons'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime, money } from '../../lib/format'
import { toast } from 'sonner'

export default function TransactionDetail() {
  const { id } = useParams()
  const tx = useAppStore((s) => s.transactions.find((t) => t.id === id))
  const [receipt, setReceipt] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const navigate = useNavigate()

  if (!tx) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Transaction not found</p>
        <Link to="/app/transactions" className="mt-2 inline-block text-brand hover:underline">← Back to transactions</Link>
      </div>
    )
  }

  const rows = [
    ['Status', <Badge key="s" tone={tx.status === 'successful' ? 'green' : tx.status === 'pending' ? 'amber' : tx.status === 'failed' ? 'red' : 'blue'}>{tx.status.toUpperCase()}</Badge>],
    ['Transaction type', txTypeLabel(tx.type)],
    ['Reference', <span key="r" className="font-mono text-[13px]">{tx.reference}</span>],
    ['Recipient / Sender', tx.recipientName ?? 'Haigha Pay Wallet'],
    ['Bank', tx.bank ?? (tx.channel === 'card' ? 'Card payment' : tx.channel === 'bank_transfer' ? 'Bank transfer' : '—')],
    ['Account', tx.accountNumber ? <span key="a" className="font-mono">{tx.accountNumber}</span> : '—'],
    ['Fee', tx.fee > 0 ? money(tx.fee) : 'Free'],
    ['Payment channel', tx.channel.replace('_', ' ')],
    ['Gateway reference', tx.gatewayReference ? <span key="g" className="font-mono text-[13px]">{tx.gatewayReference}</span> : '—'],
    ['Date', formatDateTime(tx.createdAt)],
    ['Description', tx.description ?? tx.narration],
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-up">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to transactions
      </button>

      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center bg-canvas/60 px-6 py-8 text-center">
          <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-white', txTypeTone[tx.type])}>
            <TxTypeIcon type={tx.type} />
          </span>
          <p className="mt-3 text-sm text-ink-soft">{tx.recipientName ?? txTypeLabel(tx.type)}</p>
          <p className={cn('mt-1 text-3xl font-extrabold tabular text-ink', tx.direction === 'credit' && 'text-status-success')}>
            {tx.direction === 'credit' ? '+' : '-'}
            {money(Math.abs(tx.amount))}
          </p>
          <div className="mt-3">
            <StatusPill status={tx.status} />
          </div>
        </div>
        <dl className="divide-y divide-line-soft/70 px-6 py-4 text-sm">
          {rows.map(([k, v]) => (
            <div key={String(k)} className="flex items-center justify-between gap-6 py-3">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="text-right font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <Button variant="secondary" onClick={() => setReceipt(true)} icon={<Download className="h-4 w-4" />}>
          Download Receipt
        </Button>
        <Button variant="secondary" onClick={() => shareReceipt(tx)} icon={<Share2 className="h-4 w-4" />}>
          Share Receipt
        </Button>
        <Button variant="secondary" onClick={() => setReportOpen(true)} icon={<Flag className="h-4 w-4" />}>
          Report Transaction
        </Button>
      </div>

      <Modal open={receipt} onClose={() => setReceipt(false)} size="sm" hideClose>
        <div className="no-print">
          <ReceiptView tx={tx} className="print-visible" recipient={tx.recipientName} />
        </div>
        <div className="mt-4 flex justify-end gap-2 no-print">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Print
          </Button>
          <Button size="sm" onClick={() => setReceipt(false)}>Close</Button>
        </div>
      </Modal>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onDone={() => {
        setReportOpen(false)
        toast.success('Your report has been submitted. Our team will review it.', { description: 'Reference: RPT-' + tx.reference })
      }} />
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'successful' ? 'green' : status === 'pending' ? 'amber' : status === 'failed' ? 'red' : 'blue'
  return (
    <span className={cn(
      'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
      tone === 'green' && 'bg-emerald-50 text-emerald-700',
      tone === 'amber' && 'bg-amber-50 text-amber-700',
      tone === 'red' && 'bg-red-50 text-red-700',
      tone === 'blue' && 'bg-blue-50 text-blue-700',
    )}>
      {status.toUpperCase()}
    </span>
  )
}

function ReportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('I did not authorise this transaction')
  return (
    <Modal open={open} onClose={onClose} title="Report a transaction" subtitle="This is reported to our support team for review.">
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Reason for reporting</p>
          {[
            'I did not authorise this transaction',
            'I received an incorrect amount',
            'This looks fraudulent or suspicious',
            'Other',
          ].map((r) => (
            <label key={r} className="mb-1 flex items-center gap-2.5 text-sm text-ink">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-brand" />
              {r}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onDone}>Submit report</Button>
        </div>
      </div>
    </Modal>
  )
}
