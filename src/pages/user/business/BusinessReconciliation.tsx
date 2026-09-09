import { useMemo, useState } from 'react'
import { BadgeCheck, CheckCircle2, Loader2, Scale, XCircle } from 'lucide-react'
import { Badge, Button, Card, PageHeader, StatCard } from '../../../components/ui'
import { DataTable, type Column } from '../../../components/common/DataTable'
import { MerchantPaymentBadge } from '../../../components/common/DevKit'
import { useCurrentMerchantPayments, useCurrentMerchantSettlements, useCurrentMerchantRefunds, useCurrentMerchantLogs } from '../../../store/appStore'
import type { MerchantPaymentStatus } from '../../../types/merchant'
import { cn } from '../../../lib/cn'
import { formatDateTime, money, moneyShort } from '../../../lib/format'
import { toast } from 'sonner'

type ReconRow = {
  id: string
  ref: string
  merchantRef: string
  amount: number
  gateway: MerchantPaymentStatus
  haigha: MerchantPaymentStatus
  matched: boolean
  note: string
}

export default function BusinessReconciliation() {
  const payments = useCurrentMerchantPayments()
  const settlements = useCurrentMerchantSettlements()
  const refunds = useCurrentMerchantRefunds()
  const logs = useCurrentMerchantLogs()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<null | { status: 'balanced' | 'exceptions'; scanned: number; matched: number; exceptions: number }>(null)

  const processed = payments.filter((p) => p.status === 'successful' || p.status === 'refunded').reduce((a, p) => a + p.amount, 0)
  const refundedTotal = refunds.filter((r) => r.status === 'successful').reduce((a, r) => a + r.amount, 0)
  const settled = settlements.filter((s) => s.status === 'completed').reduce((a, s) => a + s.net, 0)
  const pendingSettle = settlements.filter((s) => s.status === 'processing' || s.status === 'scheduled').reduce((a, s) => a + s.net, 0)
  const fees = settlements.filter((s) => s.status === 'completed').reduce((a, s) => a + s.fees, 0)
  const unsettled = processed - refundedTotal - settled - pendingSettle
  const apiErrors = logs.filter((l) => l.statusCode >= 400).length

  const rows = useMemo<ReconRow[]>(() => {
    const base: ReconRow[] = payments.map((p) => ({
      id: p.id,
      ref: p.haighaRef,
      merchantRef: p.merchantRef,
      amount: p.amount,
      gateway: p.status === 'successful' || p.status === 'refunded' ? 'successful' : p.status === 'failed' ? 'failed' : p.status === 'reversed' ? 'reversed' : 'pending',
      haigha: p.status,
      matched: p.status === 'successful' || p.status === 'refunded' || p.status === 'pending' || p.status === 'reversed',
      note: p.status === 'failed'
        ? 'Gateway declined — no funds moved'
        : p.status === 'reversed'
          ? 'Reversal applied to gateway & ledger'
          : p.status === 'refunded'
            ? 'Refunded after settlement — net effect zero'
            : p.status === 'pending'
              ? 'In flight — awaiting gateway confirmation'
              : 'Matched to gateway & settlement',
    }))
    return base
  }, [payments])

  const exceptions = rows.filter((r) => !r.matched || r.note.startsWith('Refunded')).length

  const run = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      const matched = rows.length - exceptions
      setResult({ status: matched === rows.length ? 'balanced' : 'exceptions', scanned: rows.length, matched, exceptions })
      toast.success(matched === rows.length ? 'Reconciliation complete — ledger balanced' : 'Reconciliation complete — exceptions found')
    }, 1500)
  }

  const cols: Column<ReconRow>[] = [
    { key: 'ref', label: 'Reference', render: (r) => <span className="font-mono text-xs font-medium">{r.ref}</span> },
    { key: 'merch', label: 'Merchant Ref', render: (r) => <span className="font-mono text-xs text-ink-soft">{r.merchantRef}</span>, hideOnMobile: true },
    { key: 'amt', label: 'Amount', sortValue: (r) => r.amount, render: (r) => <span className="font-semibold tabular">{money(r.amount)}</span> },
    { key: 'gw', label: 'Gateway', render: (r) => <MerchantPaymentBadge status={r.gateway} /> },
    { key: 'hp', label: 'Haigha Ledger', render: (r) => <MerchantPaymentBadge status={r.haigha} />, hideOnMobile: true },
    {
      key: 'm',
      label: 'Matched',
      render: (r) =>
        r.matched && !r.note.startsWith('Refunded') ? (
          <Badge tone="green" dot>Matched</Badge>
        ) : r.note.startsWith('Refunded') ? (
          <Badge tone="purple" dot>Net zero</Badge>
        ) : (
          <Badge tone="red" dot>Exception</Badge>
        ),
    },
    { key: 'note', label: 'Note', render: (r) => <span className="text-[13px] text-ink-soft">{r.note}</span>, hideOnMobile: true },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Reconciliation"
        subtitle="Match gateway outcomes against your Haigha Pay ledger and settlements."
        actions={
          <Button onClick={run} loading={running} icon={<Scale className="h-4 w-4" />}>
            {running ? 'Reconciling…' : 'Run reconciliation'}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Processed (gross)" value={`₦${moneyShort(processed)}`} sub={`${rows.length} payments`} icon={CheckCircle2} tone="brand" />
        <StatCard label="Settled (net)" value={`₦${moneyShort(settled)}`} sub={`Fees ${money(fees)}`} icon={Scale} tone="green" />
        <StatCard label="Pending settlement" value={`₦${moneyShort(pendingSettle)}`} sub="Next payout window" icon={BadgeCheck} tone="amber" />
        <StatCard label="Exceptions" value={String(exceptions)} sub={`${apiErrors} API errors in period`} icon={XCircle} tone={exceptions > 0 ? 'red' : 'gray'} />
      </div>

      {result && (
        <div className={cn('flex items-start gap-3 rounded-2xl border px-5 py-4', result.status === 'balanced' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800')}>
          {result.status === 'balanced' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <div className="text-sm">
            <p className="font-semibold">{result.status === 'balanced' ? 'Ledger balanced' : 'Exceptions found — review below'}</p>
            <p className="mt-0.5 text-[13px]">
              Scanned {result.scanned} payments · {result.matched} matched to gateway &amp; ledger · {result.exceptions} exception(s).
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Expected wallet impact" value={money(processed - refundedTotal)} sub="Successful minus refunds" />
        <Metric label="Settled + pending" value={money(settled + pendingSettle)} sub="Paid out or scheduled" />
        <Metric label="Unsettled balance" value={money(Math.max(0, unsettled))} sub={Math.abs(unsettled) > 1 ? 'Will pay out next window' : 'Fully reconciled'} />
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 pb-2 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Payment vs ledger</h3>
          <p className="text-[13px] text-ink-soft">Each payment compared against gateway and Haigha Pay ledger state.</p>
        </div>
        <DataTable
          columns={cols}
          rows={rows}
          pageSize={12}
          empty={{ icon: Scale, title: 'Nothing to reconcile', description: 'Payments will appear here once initialized.' }}
          mobileCard={(r) => (
            <div className="rounded-2xl border border-line-soft bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium">{r.ref}</span>
                <span className="font-semibold tabular">{money(r.amount)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <MerchantPaymentBadge status={r.gateway} />
                <span className="text-xs text-ink-soft">ledger: {r.haigha}</span>
                {r.matched ? <Badge tone="green" dot>Matched</Badge> : <Badge tone="red" dot>Exception</Badge>}
              </div>
              <p className="mt-1.5 text-xs text-ink-soft">{r.note}</p>
            </div>
          )}
        />
      </Card>

      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm text-ink-soft shadow-card">
        <Loader2 className="h-4 w-4 shrink-0 text-brand" />
        In production, reconciliation runs automatically from verified gateway webhooks. This page compares simulated gateway and ledger state only.
      </div>
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-5">
      <p className="text-[13px] font-medium text-ink-soft">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-faint">{sub}</p>
    </Card>
  )
}
