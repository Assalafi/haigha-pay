import { useMemo, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { Badge, Card, PageHeader, SearchInput, Select, StatCard } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { EnvBadge } from '../../components/common/DevKit'
import { useAppStore } from '../../store/appStore'
import { formatDate, timeAgo } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'

type Row = { merchantId: string; appId: string; appName: string; merchantName: string; env: 'sandbox' | 'live'; prefix: string; lastUsed?: string; status: 'active' | 'revoked'; requestsToday: number }

export default function AdminApiClients() {
  const keys = useAppStore((s) => s.merchantKeys)
  const merchants = useAppStore((s) => s.merchants)
  const apps = useAppStore((s) => s.merchantApps)
  const apiLogs = useAppStore((s) => s.merchantApiLogs)
  const loading = useFakeLoading(450)
  const [env, setEnv] = useState('all')
  const [q, setQ] = useState('')

  const rows = useMemo<Row[]>(() => {
    const s = q.toLowerCase()
    return keys
      .filter((k) => k.type === 'secret')
      .map((k) => {
        const app = apps.find((a) => a.id === k.applicationId)
        const merchant = merchants.find((m) => m.id === k.merchantId)
        const requestsToday = apiLogs.filter((l) => l.keyPrefix === k.prefix).length
        return {
          merchantId: k.merchantId,
          appId: k.applicationId,
          appName: app?.name ?? k.applicationId,
          merchantName: merchant?.businessName ?? k.merchantId,
          env: k.environment,
          prefix: k.prefix + (k.maskedValue.split('••••••')[1] ?? '••••'),
          lastUsed: k.lastUsedAt,
          status: k.status,
          requestsToday,
        }
      })
      .filter((r) => (env === 'all' || r.env === env) && (!s || `${r.merchantName} ${r.appName} ${r.prefix}`.toLowerCase().includes(s)))
  }, [keys, merchants, apps, apiLogs, env, q])

  const cols: Column<Row>[] = [
    { key: 'm', label: 'Merchant', render: (r) => <span className="text-[13px] font-medium text-ink">{r.merchantName}</span> },
    { key: 'a', label: 'Application', render: (r) => <span className="text-[13px] text-ink-soft">{r.appName}</span> },
    { key: 'e', label: 'Environment', render: (r) => <EnvBadge env={r.env} /> },
    { key: 'p', label: 'Key Prefix', render: (r) => <span className="font-mono text-xs">{r.prefix}</span> },
    { key: 'req', label: 'Requests Today', sortValue: (r) => r.requestsToday, render: (r) => <span className="font-semibold tabular">{r.requestsToday}</span> },
    { key: 'err', label: 'Error Rate', render: (r) => <span className="tabular text-ink-soft">0.9%</span> },
    { key: 'last', label: 'Last Used', render: (r) => <span className="text-[13px] text-ink-soft">{r.lastUsed ? timeAgo(r.lastUsed) : 'Never'}</span>, hideOnMobile: true },
    { key: 's', label: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'green' : 'red'} dot>{r.status}</Badge> },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="API Clients" subtitle="Monitor every merchant API application and its keys." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Clients" value={String(rows.filter((r) => r.status === 'active').length)} icon={Globe2} tone="brand" />
        <StatCard label="Sandbox Clients" value={String(rows.filter((r) => r.env === 'sandbox').length)} icon={Globe2} tone="blue" />
        <StatCard label="Live Clients" value={String(rows.filter((r) => r.env === 'live').length)} icon={Globe2} tone="green" />
        <StatCard label="Revoked" value={String(rows.filter((r) => r.status === 'revoked').length)} icon={Globe2} tone="red" />
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search merchant, app or key prefix…" />
        <Select value={env} onChange={(e) => setEnv(e.target.value)} className="md:w-44">
          <option value="all">All environments</option>
          <option value="sandbox">Sandbox</option>
          <option value="live">Live</option>
        </Select>
      </div>
      <Card className="overflow-hidden">
        <DataTable columns={cols} rows={rows} loading={loading} pageSize={10} empty={{ icon: Globe2, title: 'No API clients found', description: 'Merchant applications with secret keys appear here.' }} />
      </Card>
    </div>
  )
}
