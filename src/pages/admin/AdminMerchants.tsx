import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Download, Users } from 'lucide-react'
import { Badge, Button, EmptyState, PageHeader, SearchInput, Select, StatCard } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { formatDate, downloadTextFile } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { Merchant } from '../../types/merchant'
import { toast } from 'sonner'

export default function AdminMerchants() {
  const merchants = useAppStore((s) => s.merchants)
  const loading = useFakeLoading(500)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [kyb, setKyb] = useState('all')

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return merchants.filter((m) => {
      if (status !== 'all' && m.status !== status) return false
      if (kyb !== 'all' && m.kybStatus !== kyb) return false
      if (!s) return true
      return `${m.businessName} ${m.email} ${m.id} ${m.industry}`.toLowerCase().includes(s)
    })
  }, [merchants, q, status, kyb])

  const kybTone: Record<string, 'green' | 'amber' | 'red' | 'gray'> = { approved: 'green', pending: 'amber', not_submitted: 'gray', rejected: 'red' }

  const cols: Column<Merchant>[] = [
    {
      key: 'merchant',
      label: 'Merchant',
      sortValue: (m) => m.businessName,
      render: (m) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-bold text-white">{m.businessName.slice(0, 2).toUpperCase()}</span>
          <div>
            <p className="text-sm font-medium text-ink">{m.businessName}</p>
            <p className="text-xs text-ink-faint">{m.id} · {m.industry}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', render: (m) => <span className="text-[13px] text-ink-soft">{m.email}</span>, hideOnMobile: true },
    { key: 'kyb', label: 'KYB', render: (m) => <Badge tone={kybTone[m.kybStatus]}>{m.kybStatus.replace('_', ' ')}</Badge> },
    { key: 'live', label: 'Live Access', render: (m) => (m.liveAccess ? <Badge tone="green" dot>Enabled</Badge> : m.liveRequested ? <Badge tone="amber" dot>Requested</Badge> : <Badge tone="gray">No</Badge>) },
    { key: 'status', label: 'Status', render: (m) => <Badge tone={m.status === 'active' ? 'green' : m.status === 'pending' ? 'amber' : 'red'} dot>{m.status}</Badge> },
    { key: 'joined', label: 'Joined', sortValue: (m) => m.createdAt, render: (m) => <span className="text-[13px] text-ink-soft">{formatDate(m.createdAt)}</span>, hideOnMobile: true },
  ]

  const exportCsv = () => {
    downloadTextFile('merchants.csv', ['Business,Email,Industry,KYB,Live,Status,Joined', ...rows.map((m) => [m.businessName, m.email, m.industry, m.kybStatus, m.liveAccess ? 'yes' : 'no', m.status, m.createdAt].join(','))].join('\n'))
    toast.success('Merchants exported')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Merchants" subtitle="Businesses integrating with the Haigha Pay API." actions={<Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Merchants" value={String(merchants.length)} icon={Building2} tone="brand" />
        <StatCard label="Live Enabled" value={String(merchants.filter((m) => m.liveAccess).length)} icon={Building2} tone="green" />
        <StatCard label="KYB Pending" value={String(merchants.filter((m) => m.kybStatus === 'pending').length)} icon={Users} tone="amber" />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search by business, email or ID…" />
        <Select value={kyb} onChange={(e) => setKyb(e.target.value)} className="md:w-44">
          <option value="all">All KYB</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="not_submitted">Not submitted</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-40">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable columns={cols} rows={rows} loading={loading} pageSize={10} onRowClick={(m) => navigate(`/admin/merchants/${m.id}`)} empty={{ icon: Building2, title: 'No merchants match your filters', description: 'New merchant registrations appear here.' }} />
      </div>
    </div>
  )
}
