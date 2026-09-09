import { useNavigate } from 'react-router-dom'
import { Landmark, Wallet2 } from 'lucide-react'
import { Badge, Card, PageHeader, StatCard } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useCurrentMerchantSettlements } from '../../store/appStore'
import { formatDateTime, money, moneyShort } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { Settlement } from '../../types/merchant'

const tone: Record<string, 'green' | 'amber' | 'blue' | 'red'> = { completed: 'green', processing: 'amber', scheduled: 'blue', failed: 'red' }

export default function MerchantSettlements() {
  const settlements = useCurrentMerchantSettlements()
  const loading = useFakeLoading(400)

  const cols: Column<Settlement>[] = [
    { key: 'r', label: 'Reference', render: (s) => <span className="font-mono text-xs font-medium">{s.reference}</span> },
    { key: 'p', label: 'Period', render: (s) => <span className="text-[13px] text-ink-soft">{s.period}</span> },
    { key: 'g', label: 'Gross', sortValue: (s) => s.gross, render: (s) => <span className="tabular">{money(s.gross)}</span> },
    { key: 'f', label: 'Fees', render: (s) => <span className="tabular text-ink-soft">{money(s.fees)}</span> },
    { key: 'n', label: 'Net', sortValue: (s) => s.net, render: (s) => <span className="font-semibold tabular">{money(s.net)}</span> },
    { key: 'b', label: 'Bank', render: (s) => <span className="text-[13px]">{s.bank} · {s.accountNumber}</span>, hideOnMobile: true },
    { key: 's', label: 'Status', render: (s) => <Badge tone={tone[s.status]} dot>{s.status}</Badge> },
    { key: 'd', label: 'Date', sortValue: (s) => s.createdAt, render: (s) => <span className="text-[13px] text-ink-soft">{formatDateTime(s.createdAt)}</span>, hideOnMobile: true },
  ]

  const upcoming = settlements.find((s) => s.status === 'scheduled')
  const totalNet = settlements.filter((s) => s.status === 'completed').reduce((a, b) => a + b.net, 0)

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Settlements" subtitle="Money paid out to your settlement bank account." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available for payout" value={`₦${moneyShort(4850200)}`} sub="In your Haigha Pay balance" icon={Wallet2} tone="brand" />
        <StatCard label="Pending settlement" value={upcoming ? `₦${moneyShort(upcoming.net)}` : '₦0'} sub={upcoming ? upcoming.period : 'No scheduled settlement'} icon={Landmark} tone="amber" />
        <StatCard label="Settled (total)" value={`₦${moneyShort(totalNet)}`} sub="Completed payouts" icon={Landmark} tone="green" />
      </div>
      <Card className="overflow-hidden">
        <DataTable columns={cols} rows={settlements} loading={loading} pageSize={10} empty={{ icon: Landmark, title: 'No settlements yet', description: 'Settlements are created on your payout schedule.' }} />
      </Card>
    </div>
  )
}
