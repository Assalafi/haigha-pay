import React from 'react'
import { Download, Printer } from 'lucide-react'
import { Modal } from '../ui'
import { LogoMark } from '../common/Logo'
import type { Transaction } from '../../types'
import { formatDate, formatTime, money } from '../../lib/format'
import { txTypeLabel } from '../common/Icons'
import { toast } from 'sonner'
import { cn } from '../../lib/cn'

export function ReceiptView({
  tx,
  typeLabel,
  amountOverride,
  recipient,
  extraRows,
  className,
}: {
  tx: {
    reference: string
    type: Transaction['type']
    status: Transaction['status']
    channel?: Transaction['channel']
    gatewayReference?: string
    createdAt: string
    amount: number
    fee: number
    narration?: string
    bank?: string
    accountNumber?: string
  }
  typeLabel?: string
  amountOverride?: string
  recipient?: string
  extraRows?: { label: string; value: React.ReactNode }[]
  className?: string
}) {
  const statusLabel =
    tx.status === 'successful' ? 'Successful' : tx.status === 'pending' ? 'Pending' : tx.status === 'failed' ? 'Failed' : 'Reversed'
  return (
    <div className={cn('mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-line-soft bg-white', className)}>
      <div className="bg-brand px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="text-sm font-bold text-white">
              Haigha <span className="font-medium text-white/70">Pay</span>
            </span>
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white">Payment Receipt</span>
        </div>
      </div>
      <div className="px-5 py-5">
        <div className="text-center">
          <p className="text-[13px] font-medium text-ink-soft">{typeLabel ?? txTypeLabel(tx.type)}</p>
          <p className="mt-1 text-[28px] font-extrabold tabular text-ink">{amountOverride ?? money(tx.amount)}</p>
          <span
            className={cn(
              'mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
              tx.status === 'successful' && 'bg-emerald-50 text-emerald-700',
              tx.status === 'pending' && 'bg-amber-50 text-amber-700',
              tx.status === 'failed' && 'bg-red-50 text-red-700',
              tx.status === 'reversed' && 'bg-blue-50 text-blue-700',
            )}
          >
            {statusLabel}
          </span>
        </div>
        {recipient && (
          <div className="mt-4 rounded-xl bg-canvas px-4 py-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Paid to</p>
            <p className="mt-0.5 text-[15px] font-semibold text-ink">{recipient}</p>
            {tx.bank && <p className="text-[13px] text-ink-soft">{tx.bank}</p>}
          </div>
        )}
        <dl className="mt-5 space-y-2.5 border-t border-dashed border-line pt-4 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Reference</dt>
            <dd className="font-mono font-medium text-ink">{tx.reference}</dd>
          </div>
          {tx.gatewayReference && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Gateway Ref</dt>
              <dd className="font-mono font-medium text-ink">{tx.gatewayReference}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Date</dt>
            <dd className="font-medium text-ink">
              {formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Payment method</dt>
            <dd className="font-medium capitalize text-ink">{(tx.channel ?? 'wallet').replace('_', ' ')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Fee</dt>
            <dd className="font-medium tabular text-ink">{tx.fee > 0 ? money(tx.fee) : 'Free'}</dd>
          </div>
          {tx.narration && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Narration</dt>
              <dd className="max-w-[55%] truncate text-right font-medium text-ink">{tx.narration}</dd>
            </div>
          )}
          {extraRows?.map((r) => (
            <div key={String(r.label)} className="flex justify-between gap-4">
              <dt className="text-ink-soft">{r.label}</dt>
              <dd className="text-right font-medium text-ink">{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-center text-[11px] text-ink-faint">Transaction is simulated for demonstration purposes.</p>
      </div>
    </div>
  )
}

export function ReceiptModal({
  open,
  onClose,
  tx,
  typeLabel,
  recipient,
  amountOverride,
}: {
  open: boolean
  onClose: () => void
  tx: Transaction
  typeLabel?: string
  recipient?: string
  amountOverride?: string
}) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="no-print -mx-1">
        <ReceiptView
          tx={tx}
          typeLabel={typeLabel}
          recipient={recipient}
          amountOverride={amountOverride}
          className="print-visible shadow-card"
        />
      </div>
      <div className="mt-4 flex justify-end gap-2 no-print">
        <button
          onClick={() => {
            window.print()
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
        <button
          onClick={() => toast.success('Receipt downloaded as PDF')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-dark"
        >
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </Modal>
  )
}

export function shareReceipt(tx: Transaction) {
  const lines = [
    'Haigha Pay — Payment Receipt',
    'Reference: ' + tx.reference,
    `Amount: ${money(tx.amount)}`,
    `Status: ${tx.status}`,
    'Date: ' + tx.createdAt,
  ]
  if (navigator.share) {
    void navigator.share({ title: 'Haigha Pay Receipt', text: lines.join('\n') }).catch(() => {})
  } else {
    void navigator.clipboard.writeText(lines.join('\n')).then(() => toast.success('Receipt copied to clipboard'))
  }
}
