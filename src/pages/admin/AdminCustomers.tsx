import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, UserPlus, Users } from 'lucide-react'
import { Avatar, Badge, Button, EmptyState, PageHeader, SearchInput, Select } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { formatDate, money, downloadTextFile } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { User, Wallet } from '../../types'
import { toast } from 'sonner'

type Row = User & { wallet?: Wallet }

export default function AdminCustomers() {
  const users = useAppStore((s) => s.users)
  const wallets = useAppStore((s) => s.wallets)
  const loading = useFakeLoading(550)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [kyc, setKyc] = useState('all')

  const rows = useMemo<Row[]>(() => {
    const s = q.toLowerCase()
    return users
      .map((u) => ({ ...u, wallet: wallets.find((w) => w.userId === u.id) }))
      .filter((u) => {
        if (status !== 'all' && u.status !== status) return false
        if (kyc !== 'all' && u.kycStatus !== kyc) return false
        if (!s) return true
        return `${u.firstName} ${u.lastName} ${u.email} ${u.phone} ${u.id}`.toLowerCase().includes(s)
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [users, wallets, q, status, kyc])

  const kycTone: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
    verified: 'green',
    in_review: 'amber',
    not_started: 'gray',
    rejected: 'red',
  }

  const columns: Column<Row>[] = [
    {
      key: 'customer',
      label: 'Customer',
      sortValue: (r) => `${r.firstName} ${r.lastName}`,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={r.firstName} lastName={r.lastName} color={r.avatarColor} size="sm" />
          <div>
            <p className="text-sm font-medium text-ink">{r.firstName} {r.lastName}</p>
            <p className="font-mono text-[11px] text-ink-faint">{r.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (r) => <span className="font-mono text-[13px]">{r.phone}</span>, hideOnMobile: true },
    { key: 'email', label: 'Email', render: (r) => <span className="text-[13px] text-ink-soft">{r.email}</span>, hideOnMobile: true },
    {
      key: 'kyc',
      label: 'KYC',
      sortValue: (r) => r.kycLevel,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Badge tone={kycTone[r.kycStatus]}>{r.kycStatus === 'verified' ? `L${r.kycLevel} · Verified` : r.kycStatus.replace('_', ' ')}</Badge>
        </div>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      sortValue: (r) => r.wallet?.availableBalance ?? 0,
      render: (r) => <span className="font-semibold tabular text-ink">{money(r.wallet?.availableBalance ?? 0)}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusPill s={r.status} /> },
    { key: 'joined', label: 'Joined', sortValue: (r) => r.createdAt, render: (r) => <span className="text-[13px] text-ink-soft">{formatDate(r.createdAt)}</span>, hideOnMobile: true },
  ]

  const exportCsv = () => {
    const header = 'Customer ID,Name,Phone,Email,KYC,Status,Balance,Joined'
    const lines = rows.map((r) =>
      [r.id, `"${r.firstName} ${r.lastName}"`, r.phone, r.email, r.kycStatus, r.status, (r.wallet?.availableBalance ?? 0).toFixed(2), r.createdAt].join(','),
    )
    downloadTextFile('haigha-customers.csv', [header, ...lines].join('\n'))
    toast.success('Customer list exported', { description: 'haigha-customers.csv generated locally' })
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Customers"
        subtitle={`${users.length} registered customers`}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export</Button>
            <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => toast.info('Customer creation is managed on the user side of this prototype.')}>Add Customer</Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, email, phone or ID…" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-44">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select value={kyc} onChange={(e) => setKyc(e.target.value)} className="md:w-44">
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="in_review">In review</option>
          <option value="not_started">Not started</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={10}
          onRowClick={(r) => navigate(`/admin/customers/${r.id}`)}
          empty={{ icon: Users, title: 'No customers match your filters', description: 'Adjust your search or clear the filters.' }}
          mobileCard={(r) => (
            <div onClick={() => navigate(`/admin/customers/${r.id}`)} className="cursor-pointer rounded-2xl border border-line-soft bg-white p-4 shadow-card">
              <div className="flex items-center gap-3">
                <Avatar firstName={r.firstName} lastName={r.lastName} color={r.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.firstName} {r.lastName}</p>
                  <p className="font-mono text-[11px] text-ink-faint">{r.id}</p>
                </div>
                <StatusPill s={r.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink-soft">Balance</span>
                <span className="font-bold tabular">{money(r.wallet?.availableBalance ?? 0)}</span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  )
}

export function StatusPill({ s }: { s: User['status'] }) {
  return (
    <Badge tone={s === 'active' ? 'green' : s === 'restricted' ? 'amber' : 'red'} dot>
      {s}
    </Badge>
  )
}
