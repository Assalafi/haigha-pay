import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, Download } from 'lucide-react'
import { Button, PageHeader, SearchInput, Select } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EnvBadge, MerchantPaymentBadge } from '../../components/common/DevKit'
import { useCurrentMerchantPayments } from '../../store/appStore'
import { downloadTextFile, formatDateTime, money } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { MerchantPayment } from '../../types/merchant'
import { toast } from 'sonner'

export default function MerchantPayments() {
  const payments = useCurrentMerchantPayments()
  const loading = useFakeLoading(450)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [env, setEnv] = useState('all')

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return payments.filter((p) => {
      if (status !== 'all' && p.status !== status) return false
      if (env !== 'all' && p.environment !== env) return false
      if (!s) return true
      return `${p.haighaRef} ${p.merchantRef} ${p.customerName}`.toLowerCase().includes(s)
    })
  }, [payments, q, status, env])

  const columns: Column<MerchantPayment>[] = [
    { key: 'h', label: 'Haigha Reference', render: (p) => <span className="font-mono text-xs font-medium">{p.haighaRef}</span> },
    { key: 'm', label: 'Merchant Reference', render: (p) => <span className="font-mono text-xs text-ink-soft">{p.merchantRef}</span> },
    { key: 'c', label: 'Customer', render: (p) => <span className="text-[13px]">{p.customerName}</span>, hideOnMobile: true },
    { key: 'a', label: 'Amount', sortValue: (p) => p.amount, render: (p) => <span className="font-semibold tabular">{money(p.amount)}</span> },
    { key: 'ch', label: 'Channel', render: (p) => <span className="text-[13px] capitalize text-ink-soft">{p.channel.replace('_', ' ')}</span>, hideOnMobile: true },
    { key: 's', label: 'Status', render: (p) => <MerchantPaymentBadge status={p.status} /> },
    { key: 'e', label: 'Env', render: (p) => <EnvBadge env={p.environment} />, hideOnMobile: true },
    { key: 'd', label: 'Date', sortValue: (p) => p.createdAt, render: (p) => <span className="text-[13px] text-ink-soft">{formatDateTime(p.createdAt)}</span>, hideOnMobile: true },
  ]

  const exportCsv = () => {
    const header = 'HaighaRef,MerchantRef,Customer,Amount,Channel,Status,Env,Date'
    const lines = rows.map((p) => [p.haighaRef, p.merchantRef, p.customerName, p.amount, p.channel, p.status, p.environment, p.createdAt].join(','))
    downloadTextFile('merchant-payments.csv', [header, ...lines].join('\n'))
    toast.success('Payments exported')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Transactions" subtitle="Payments initialized through your Haigha Pay API." actions={<Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export</Button>} />
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search Haigha / merchant reference or customer…" />
        <Select value={env} onChange={(e) => setEnv(e.target.value)} className="md:w-40">
          <option value="all">All environments</option>
          <option value="sandbox">Sandbox</option>
          <option value="live">Live</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-44">
          <option value="all">All statuses</option>
          {['initialized', 'pending', 'successful', 'failed', 'reversed', 'refunded', 'partially_refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={12}
          onRowClick={(p) => navigate(`/app/business/payments/${p.id}`)}
          empty={{ icon: ArrowLeftRight, title: 'No payments yet', description: 'Initialize a payment from the Test Console to see it here.' }}
          mobileCard={(p) => (
            <div onClick={() => navigate(`/app/business/payments/${p.id}`)} className="cursor-pointer rounded-2xl border border-line-soft bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium">{p.merchantRef}</span>
                <MerchantPaymentBadge status={p.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-ink-faint">{p.haighaRef}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink-soft">{p.customerName}</span>
                <span className="font-bold tabular">{money(p.amount)}</span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  )
}
