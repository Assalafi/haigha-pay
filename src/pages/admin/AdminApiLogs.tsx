import { useMemo, useState } from 'react'
import { FileCode2 } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SearchInput, Select } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { MethodChip, EnvBadge } from '../../components/common/DevKit'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { ApiRequestLog } from '../../types/merchant'

export default function AdminApiLogs() {
  const logs = useAppStore((s) => s.merchantApiLogs)
  const merchants = useAppStore((s) => s.merchants)
  const loading = useFakeLoading(450)
  const [q, setQ] = useState('')
  const [merchant, setMerchant] = useState('all')
  const [code, setCode] = useState('all')
  const [detail, setDetail] = useState<ApiRequestLog | null>(null)

  const nameOf = (id: string) => merchants.find((m) => m.id === id)?.businessName ?? id

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return logs.filter((l) => {
      if (merchant !== 'all' && l.merchantId !== merchant) return false
      if (code === 'success' && l.statusCode >= 400) return false
      if (code === 'error' && l.statusCode < 400) return false
      if (!s) return true
      return `${l.requestId} ${l.endpoint} ${l.method}`.toLowerCase().includes(s)
    })
  }, [logs, merchant, code, q])

  const cols: Column<ApiRequestLog>[] = [
    { key: 'm', label: 'Merchant', render: (l) => <span className="text-[13px] font-medium">{nameOf(l.merchantId)}</span> },
    { key: 'r', label: 'Request ID', render: (l) => <span className="font-mono text-xs text-brand">{l.requestId}</span> },
    { key: 'e', label: 'Endpoint', render: (l) => <span className="font-mono text-xs text-ink-soft">{l.endpoint}</span> },
    { key: 'meth', label: 'Method', render: (l) => <MethodChip method={l.method} /> },
    { key: 's', label: 'HTTP', render: (l) => <Badge tone={l.statusCode < 400 ? 'green' : 'red'}>{l.statusCode}</Badge> },
    { key: 'lat', label: 'Latency', render: (l) => <span className="font-mono text-xs text-ink-soft">{l.responseTimeMs}ms</span>, hideOnMobile: true },
    { key: 'env', label: 'Env', render: (l) => <EnvBadge env={l.environment} />, hideOnMobile: true },
    { key: 'ip', label: 'IP', render: (l) => <span className="font-mono text-xs text-ink-faint">{l.ip}</span>, hideOnMobile: true },
    { key: 'd', label: 'Time', sortValue: (l) => l.createdAt, render: (l) => <span className="text-[13px] text-ink-soft">{formatDateTime(l.createdAt)}</span>, hideOnMobile: true },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="API Logs" subtitle="Every request across all merchant API clients." />
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search request ID, endpoint…" />
        <Select value={merchant} onChange={(e) => setMerchant(e.target.value)} className="md:w-48">
          <option value="all">All merchants</option>
          {merchants.map((m) => <option key={m.id} value={m.id}>{m.businessName}</option>)}
        </Select>
        <Select value={code} onChange={(e) => setCode(e.target.value)} className="md:w-40">
          <option value="all">All responses</option>
          <option value="success">Success only</option>
          <option value="error">Errors only</option>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable columns={cols} rows={rows} loading={loading} pageSize={12} onRowClick={setDetail} empty={{ icon: FileCode2, title: 'No API activity yet', description: 'Requests across merchant clients appear here in real time.' }} />
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Request details" subtitle={detail?.requestId} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <MethodChip method={detail.method} />
              <span className="font-mono text-sm">{detail.endpoint}</span>
              <Badge tone={detail.statusCode < 400 ? 'green' : 'red'} className="ml-auto">HTTP {detail.statusCode}</Badge>
              <span className="font-mono text-xs text-ink-soft">{detail.responseTimeMs}ms</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Block title="Headers" body={`Authorization: Bearer ${detail.keyPrefix}••••••\nContent-Type: application/json`} />
              <Block title="Request body" body={detail.requestBody ?? '(no body)'} />
            </div>
            <Block title="Response body" body={detail.responseBody} />
            <p className="text-[13px] text-ink-faint">IP <span className="font-mono">{detail.ip}</span> · Merchant {nameOf(detail.merchantId)} · {formatDateTime(detail.createdAt)}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[13px] font-medium text-ink-soft">{title}</p>
      <pre className={cn('max-h-44 overflow-auto rounded-xl bg-[#0B1220] p-3 font-mono text-xs leading-relaxed text-white/80')}>{body}</pre>
    </div>
  )
}
