import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Download } from 'lucide-react'
import { Button, PageHeader, SearchInput, Select } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { downloadTextFile, formatDateTime, money } from '../../lib/format'
import { txTypeLabel } from '../../components/common/Icons'
import type { Transaction } from '../../types'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { toast } from 'sonner'

export default function AdminTransactions() {
  const transactions = useAppStore((s) => s.transactions)
  const loading = useFakeLoading(500)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [channel, setChannel] = useState('all')

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false
      if (status !== 'all' && t.status !== status) return false
      if (channel !== 'all' && t.channel !== channel) return false
      if (!s) return true
      return `${t.reference} ${t.customerName ?? ''} ${t.recipientName ?? ''} ${t.narration}`.toLowerCase().includes(s)
    })
  }, [transactions, q, type, status, channel])

  const columns: Column<Transaction>[] = [
    {
      key: 'ref',
      label: 'Reference',
      render: (t) => <span className="font-mono text-xs font-medium text-ink">{t.reference}</span>,
    },
    { key: 'customer', label: 'Customer', render: (t) => <span className="text-[13px]">{t.customerName ?? t.recipientName ?? '—'}</span> },
    { key: 'type', label: 'Type', render: (t) => <span className="text-[13px] capitalize">{txTypeLabel(t.type)}</span>, hideOnMobile: true },
    {
      key: 'amount',
      label: 'Amount',
      sortValue: (t) => t.amount,
      render: (t) => (
        <span className={cn('font-semibold tabular', t.direction === 'credit' ? 'text-emerald-600' : 'text-ink')}>
          {t.direction === 'credit' ? '+' : '-'}{money(t.amount)}
        </span>
      ),
    },
    { key: 'fee', label: 'Fee', render: (t) => <span className="text-[13px] tabular">{t.fee > 0 ? money(t.fee) : '—'}</span>, hideOnMobile: true },
    { key: 'channel', label: 'Channel', render: (t) => <span className="text-[13px] capitalize text-ink-soft">{t.channel.replace('_', ' ')}</span>, hideOnMobile: true },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'date', label: 'Date', sortValue: (t) => t.createdAt, render: (t) => <span className="text-[13px] text-ink-soft">{formatDateTime(t.createdAt)}</span>, hideOnMobile: true },
  ]

  const exportCsv = () => {
    const header = 'Reference,Customer,Type,Direction,Amount,Fee,Status,Channel,Date'
    const lines = rows.map((t) => [t.reference, t.customerName ?? '', t.type, t.direction, t.amount, t.fee, t.status, t.channel, t.createdAt].join(','))
    downloadTextFile('haigha-transactions.csv', [header, ...lines].join('\n'))
    toast.success('Transactions exported', { description: 'haigha-transactions.csv generated locally' })
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Transactions"
        subtitle="All transactions across the platform"
        actions={
          <Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export</Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search reference, customer or narration…" />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="md:w-44">
          <option value="all">All types</option>
          <option value="wallet_funding">Funding</option>
          <option value="transfer">Transfer</option>
          <option value="airtime">Airtime</option>
          <option value="data">Data</option>
          <option value="electricity">Electricity</option>
          <option value="cable_tv">Cable TV</option>
          <option value="wallet_adjustment">Adjustment</option>
        </Select>
        <Select value={channel} onChange={(e) => setChannel(e.target.value)} className="md:w-44">
          <option value="all">All channels</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="wallet">Wallet</option>
          <option value="virtual_account">Virtual account</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-40">
          <option value="all">All statuses</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={12}
          onRowClick={(t) => navigate(`/admin/transactions/${t.id}`)}
          empty={{ icon: ArrowLeftRight, title: 'No transactions found', description: 'Adjust your filters to see more results.' }}
        />
      </div>
    </div>
  )
}
