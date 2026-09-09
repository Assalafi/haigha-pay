import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDownToLine, ArrowRight, ChevronRight } from 'lucide-react'
import { Button, PageHeader, SearchInput, Select, Skeleton, StatusBadge, Tabs, EmptyState } from '../../components/ui'
import { TxIconChip } from '../../components/common/Icons'
import { useCurrentTransactions } from '../../store/appStore'
import type { Transaction, TxStatus, TxType } from '../../types'
import { cn } from '../../lib/cn'
import { formatDateTime, money } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { useAppStore } from '../../store/appStore'

type TypeFilter = 'all' | TxType
type StatusFilter = 'all' | TxStatus
type RangeFilter = 'all' | '7d' | '30d'

export default function Transactions() {
  const txns = useCurrentTransactions()
  const loading = useFakeLoading(450)
  const navigate = useNavigate()
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === s.activeUserId))
  const [q, setQ] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [range, setRange] = useState<RangeFilter>('all')

  const filtered = useMemo(() => {
    const cutoff = range === '7d' ? Date.now() - 7 * 86400000 : range === '30d' ? Date.now() - 30 * 86400000 : 0
    return txns.filter((t) => {
      if (cutoff && new Date(t.createdAt).getTime() < cutoff) return false
      if (type !== 'all' && t.type !== type) return false
      if (status !== 'all' && t.status !== status) return false
      if (q) {
        const hay = `${t.narration} ${t.reference} ${t.recipientName ?? ''}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [txns, q, type, status, range])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="space-y-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Transactions"
        subtitle={`${txns.length} transaction${txns.length === 1 ? '' : 's'} on this wallet`}
        actions={
          <Link to="/app/wallet/fund">
            <Button icon={<ArrowDownToLine className="h-4 w-4" />}>Fund Wallet</Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search by description or reference…" />
        <Select value={type} onChange={(e) => setType(e.target.value as TypeFilter)} className="md:w-48">
          <option value="all">All types</option>
          <option value="wallet_funding">Wallet funding</option>
          <option value="transfer">Transfers</option>
          <option value="airtime">Airtime</option>
          <option value="data">Data</option>
          <option value="electricity">Electricity</option>
          <option value="cable_tv">Cable TV</option>
        </Select>
        <Select value={range} onChange={(e) => setRange(e.target.value as RangeFilter)} className="md:w-44">
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>
      </div>

      <Tabs
        value={status}
        onChange={setStatus}
        items={[
          { value: 'all', label: 'All' },
          { value: 'successful', label: 'Successful' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
          { value: 'reversed', label: 'Reversed' },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line-soft bg-white shadow-card">
          <EmptyState
            icon={ArrowDownToLine}
            title="No transactions yet"
            description="Your payments and transfers will appear here."
            action={
              <Link to="/app/wallet/fund">
                <Button>Fund Wallet</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line-soft bg-canvas/60">
                  {['Transaction', 'Reference', 'Date', 'Amount', 'Status', ''].map((h, i) => (
                    <th key={i} className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint', i === 0 && 'w-[34%]')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 12).map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/app/transactions/${t.id}`)}
                    className="cursor-pointer border-b border-line-soft/60 transition-colors last:border-0 hover:bg-brand-soft/25"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <TxIconChip type={t.type} className="h-9 w-9" />
                        <div>
                          <p className="text-sm font-medium text-ink">{t.recipientName ?? t.narration}</p>
                          <p className="text-xs text-ink-faint">{t.description ?? t.narration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{t.reference}</td>
                    <td className="px-5 py-3.5 text-sm text-ink-soft">{formatDateTime(t.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-sm font-bold tabular', t.direction === 'credit' ? 'text-status-success' : 'text-ink')}>
                        {t.direction === 'credit' ? '+' : '-'}
                        {money(Math.abs(t.amount))}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-ink-faint" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 12 && (
              <p className="px-5 py-4 text-center text-[13px] text-ink-soft">Showing 12 of {filtered.length} · refine filters to narrow results</p>
            )}
          </div>

          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {filtered.slice(0, 15).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/app/transactions/${t.id}`)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line-soft bg-white p-4 shadow-card"
              >
                <TxIconChip type={t.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{t.recipientName ?? t.narration}</p>
                  <p className="text-xs text-ink-faint">{formatDateTime(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-bold tabular', t.direction === 'credit' ? 'text-status-success' : 'text-ink')}>
                    {t.direction === 'credit' ? '+' : '-'}
                    {money(Math.abs(t.amount))}
                  </p>
                  <div className="mt-0.5"><StatusBadge status={t.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-line-soft bg-white px-5 py-4 shadow-card">
        <p className="text-sm text-ink-soft">
          Available balance: <span className="font-bold tabular text-ink">{wallet ? money(wallet.availableBalance) : '—'}</span>
        </p>
        <Link to="/app/transactions" className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          Refresh <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
