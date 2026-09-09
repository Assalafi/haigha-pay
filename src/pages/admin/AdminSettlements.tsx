import { useMemo, useState } from 'react'
import { Landmark } from 'lucide-react'
import { Badge, Card, PageHeader, SearchInput, Select, StatCard } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { formatDate, money, moneyShort } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { Settlement } from '../../types/merchant'

const tone: Record<string, 'green' | 'amber' | 'blue' | 'red'> = { completed: 'green', processing: 'amber', scheduled: 'blue', failed: 'red' }

export default function AdminSettlements() {
  const settlements = useAppStore((s) => s.merchantSettlements)
  const merchants = useAppStore((s) => s.merchants)
  const loading = useFakeLoading(450)
  const [status, setStatus] = useState('all')

  const rows = useMemo(() => settlements.filter((s) => status === 'all' || s.status === status), [settlements, status])

  const nameOf = (id: string) => merchants.find((m) => m.id === id)?.businessName ?? id

  const cols: Column<Settlement>[] = [
    { key: 'r', label: 'Reference', render: (s) => <span className="font-mono text-xs font-medium">{s.reference}</span> },
    { key: 'm', label: 'Merchant', render: (s) => <span className="text-[13px]">{nameOf(s.merchantId)}</span> },
    { key: 'g', label: 'Gross', sortValue: (s) => s.gross, render: (s) => <span className="tabular">{money(s.gross)}</span> },
    { key: 'n', label: 'Net', sortValue: (s) => s.net, render: (s) => <span className="font-semibold tabular">{money(s.net)}</span> },
    { key: 'b', label: 'Bank', render: (s) => <span className="text-[13px] text-ink-soft">{s.bank} · {s.accountNumber}</span>, hideOnMobile: true },
    { key: 's', label: 'Status', render: (s) => <Badge tone={tone[s.status]} dot>{s.status}</Badge> },
    { key: 'd', label: 'Date', render: (s) => <span className="text-[13px] text-ink-soft">{formatDate(s.createdAt)}</span>, hideOnMobile: true },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Settlements" subtitle="Payouts processed to merchant settlement accounts." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Settled (this week)" value={`₦${moneyShort(1198920)}`} icon={Landmark} tone="green" />
        <StatCard label="Processing" value={`₦${moneyShort(862269)}`} icon={Landmark} tone="amber" />
        <StatCard label="Scheduled" value={`₦${moneyShort(1186925)}`} icon={Landmark} tone="blue" />
      </div>
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
        <option value="all">All statuses</option>
        <option value="scheduled">Scheduled</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </Select>
      <Card className="overflow-hidden">
        <DataTable columns={cols} rows={rows} loading={loading} pageSize={10} empty={{ icon: Landmark, title: 'No settlements found', description: 'Settlements appear after merchants generate volume.' }} />
      </Card>
    </div>
  )
}
