import { useMemo, useState } from 'react'
import { Activity, CheckCircle2, RefreshCw, Webhook, XCircle } from 'lucide-react'
import { Badge, Card, PageHeader, SearchInput, Select, StatCard } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime, timeAgo } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { WebhookDelivery } from '../../types/merchant'
import { toast } from 'sonner'

export default function AdminWebhookMonitor() {
  const deliveries = useAppStore((s) => s.webhookDeliveries)
  const merchants = useAppStore((s) => s.merchants)
  const retry = useAppStore((s) => s.retryWebhookDelivery)
  const loading = useFakeLoading(450)
  const [status, setStatus] = useState('all')

  const nameOf = (id: string) => merchants.find((m) => m.id === id)?.businessName ?? id

  const rows = useMemo(() => deliveries.filter((d) => status === 'all' || d.status === status), [deliveries, status])

  const delivered = deliveries.filter((d) => d.status === 'delivered').length
  const failed = deliveries.filter((d) => d.status === 'failed').length
  const retrying = deliveries.filter((d) => d.status === 'retrying').length

  const cols: Column<WebhookDelivery>[] = [
    { key: 'm', label: 'Merchant', render: (d) => <span className="text-[13px] font-medium">{nameOf(d.merchantId)}</span> },
    { key: 'e', label: 'Event', render: (d) => <span className="font-mono text-xs">{d.event}</span> },
    { key: 'u', label: 'Destination', render: (d) => <span className="font-mono text-xs text-ink-soft">{d.url}</span>, hideOnMobile: true },
    { key: 'c', label: 'HTTP', render: (d) => <Badge tone={d.httpCode < 400 ? 'green' : 'red'}>{d.httpCode}</Badge> },
    { key: 'a', label: 'Attempts', render: (d) => <span className="tabular text-ink-soft">{d.attempts}</span> },
    { key: 't', label: 'Last Attempt', render: (d) => <span className="text-[13px] text-ink-soft">{timeAgo(d.createdAt)}</span> },
    {
      key: 's',
      label: 'Status',
      render: (d) =>
        d.status === 'delivered' ? (
          <Badge tone="green" dot>Delivered</Badge>
        ) : d.status === 'failed' ? (
          <span className="flex items-center gap-2">
            <Badge tone="red" dot>Failed</Badge>
            <button onClick={() => { retry(d.id); toast.success('Redelivery queued') }} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><RefreshCw className="h-3 w-3" /> Retry</button>
          </span>
        ) : (
          <Badge tone="amber" dot>Retrying</Badge>
        ),
    },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Webhook Monitoring" subtitle="Delivery health across all merchant webhook endpoints." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={String(deliveries.length)} icon={Webhook} tone="brand" />
        <StatCard label="Delivered" value={String(delivered)} icon={CheckCircle2} tone="green" />
        <StatCard label="Failed" value={String(failed)} icon={XCircle} tone="red" />
        <StatCard label="Retrying" value={String(retrying)} icon={Activity} tone="amber" />
      </div>
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
        <option value="all">All statuses</option>
        <option value="delivered">Delivered</option>
        <option value="failed">Failed</option>
        <option value="retrying">Retrying</option>
      </Select>
      <Card className="overflow-hidden">
        <DataTable columns={cols} rows={rows} loading={loading} pageSize={10} empty={{ icon: Webhook, title: 'No webhook events yet', description: 'Events delivered to merchants appear here.' }} mobileCard={(d) => (
          <div className="rounded-2xl border border-line-soft bg-white p-4 shadow-card">
            <div className="flex items-center justify-between"><span className="font-mono text-xs">{d.event}</span><Badge tone={d.httpCode < 400 ? 'green' : 'red'}>{d.httpCode}</Badge></div>
            <p className="mt-1 text-sm font-medium">{nameOf(d.merchantId)}</p>
            <p className="mt-1 truncate font-mono text-[11px] text-ink-faint">{d.url}</p>
            <div className={cn('mt-2 text-xs font-semibold', d.status === 'delivered' ? 'text-emerald-600' : d.status === 'failed' ? 'text-red-600' : 'text-amber-600')}>{d.status} · {d.attempts} attempts</div>
          </div>
        )} />
      </Card>
    </div>
  )
}
