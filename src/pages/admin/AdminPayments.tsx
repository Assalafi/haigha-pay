import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeftRight, Clock3, Gauge, ShieldCheck, XCircle } from 'lucide-react'
import { Badge, PageHeader, SearchInput, Select, Skeleton, StatCard, Tabs } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime, money } from '../../lib/format'
import type { GatewayPayment } from '../../types'
import { useFakeLoading } from '../../hooks/useFakeLoading'

export default function AdminPayments() {
  const gateway = useAppStore((s) => s.gateway)
  const loading = useFakeLoading(550)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [channel, setChannel] = useState('all')

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return gateway.filter((g) => {
      if (status !== 'all' && g.gatewayStatus !== status) return false
      if (channel !== 'all' && g.channel !== channel) return false
      if (!s) return true
      return `${g.reference} ${g.gatewayReference} ${g.customer}`.toLowerCase().includes(s)
    })
  }, [gateway, q, status, channel])

  const today = gateway.filter((g) => g.createdAt.startsWith('2026-09-09')).length || gateway.length
  const successCount = gateway.filter((g) => g.gatewayStatus === 'successful').length
  const pendingCount = gateway.filter((g) => g.gatewayStatus === 'pending').length
  const failedCount = gateway.filter((g) => g.gatewayStatus === 'failed').length
  const rate = Math.round((successCount / Math.max(1, gateway.length)) * 1000) / 10

  const columns: Column<GatewayPayment>[] = [
    { key: 'ref', label: 'Haigha Ref', render: (g) => <span className="font-mono text-xs font-medium">{g.reference}</span> },
    { key: 'gref', label: 'Gateway Ref', render: (g) => <span className="font-mono text-xs text-ink-soft">{g.gatewayReference}</span>, hideOnMobile: true },
    { key: 'customer', label: 'Customer', render: (g) => <span className="text-[13px]">{g.customer}</span> },
    { key: 'amount', label: 'Amount', sortValue: (g) => g.amount, render: (g) => <span className="font-semibold tabular">{money(g.amount)}</span> },
    { key: 'channel', label: 'Channel', render: (g) => <span className="text-[13px] capitalize text-ink-soft">{g.channel.replace('_', ' ')}</span>, hideOnMobile: true },
    {
      key: 'gstatus',
      label: 'Gateway Status',
      render: (g) => <Badge tone={g.gatewayStatus === 'successful' ? 'green' : g.gatewayStatus === 'pending' ? 'amber' : 'red'} dot>{g.gatewayStatus}</Badge>,
    },
    { key: 'hstatus', label: 'Haigha Status', render: (g) => <HStatus s={g.haighaStatus} />, hideOnMobile: true },
    { key: 'date', label: 'Created', sortValue: (g) => g.createdAt, render: (g) => <span className="text-[13px] text-ink-soft">{formatDateTime(g.createdAt)}</span>, hideOnMobile: true },
  ]

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-60" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Payment Gateway Monitor"
        subtitle="Transactions routed through the ZainPay integration (demo)"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Processed (today)" value={String(today)} icon={Activity} tone="brand" />
        <StatCard label="Success Rate" value={`${rate}%`} sub={<span className="text-emerald-600">Gateway healthy</span>} icon={ShieldCheck} tone="green" />
        <StatCard label="Pending" value={String(pendingCount)} icon={Clock3} tone="amber" />
        <StatCard label="Failed" value={String(failedCount)} icon={XCircle} tone="red" />
        <StatCard label="Avg Response" value="1.4s" icon={Gauge} tone="blue" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search Haigha / gateway reference or customer…" />
        <Select value={channel} onChange={(e) => setChannel(e.target.value)} className="md:w-44">
          <option value="all">All channels</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="virtual_account">Virtual account</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-44">
          <option value="all">All gateway statuses</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={12}
          onRowClick={(g) => navigate(`/admin/payments/${g.id}`)}
          empty={{ icon: ArrowLeftRight, title: 'No gateway payments found', description: 'New ZainPay transactions will appear here automatically.' }}
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4 text-sm text-ink-soft">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand shadow-sm"><ShieldCheck className="h-4 w-4" /></span>
        <div>
          <p className="font-medium text-ink">Gateway monitoring is ready for live integration</p>
          <p className="text-[13px]">This table maps 1:1 to real ZainPay API responses once the backend is connected. Secret keys stay server-side.</p>
        </div>
      </div>
    </div>
  )
}

function HStatus({ s }: { s: string }) {
  const tone: Record<string, 'green' | 'amber' | 'red' | 'blue'> = { successful: 'green', pending: 'amber', failed: 'red', reversed: 'blue' }
  return <Badge tone={tone[s] ?? 'gray'}>{s}</Badge>
}
