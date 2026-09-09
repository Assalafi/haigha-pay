import { cn } from '../../lib/cn'
import { money } from '../../lib/format'
import { StatusBadge } from '../ui'
import { TxIconChip, txTypeLabel } from './Icons'
import type { Transaction } from '../../types'

export function txSubtitle(t: Transaction): string {
  if (t.narration === 'Wallet Funding') return 'Wallet top-up'
  return t.narration || txTypeLabel(t.type)
}

export function TxListItem({ tx, onClick }: { tx: Transaction; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn('flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors', onClick && 'cursor-pointer hover:bg-canvas')}
    >
      <TxIconChip type={tx.type} className="h-10 w-10" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{txSubtitle(tx)}</p>
        <p className="mt-0.5 text-xs text-ink-faint">{tx.reference}</p>
      </div>
      <div className="text-right">
        <p className={cn('text-sm font-bold tabular', tx.direction === 'credit' ? 'text-status-success' : 'text-ink')}>
          {tx.direction === 'credit' ? '+' : '-'}
          {money(Math.abs(tx.amount))}
        </p>
        <p className="mt-0.5 flex justify-end">
          <StatusBadge status={tx.status} />
        </p>
      </div>
    </div>
  )
}
