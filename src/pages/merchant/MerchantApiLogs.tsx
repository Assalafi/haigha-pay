import { useMemo, useState } from 'react'
import { Download, FileCode2 } from 'lucide-react'
import { Badge, Button, Card, Modal, PageHeader, SearchInput, Select } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { MethodChip } from '../../components/common/DevKit'
import { useCurrentMerchantLogs } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { downloadTextFile, formatDateTime } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { ApiRequestLog } from '../../types/merchant'
import { toast } from 'sonner'

export default function MerchantApiLogs() {
  const logs = useCurrentMerchantLogs()
  const loading = useFakeLoading(450)
  const [q, setQ] = useState('')
  const [code, setCode] = useState('all')
  const [detail, setDetail] = useState<ApiRequestLog | null>(null)

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return logs.filter((l) => {
      if (code === 'success' && l.statusCode >= 400) return false
      if (code === 'error' && l.statusCode < 400) return false
      if (!s) return true
      return `${l.requestId} ${l.endpoint} ${l.method}`.toLowerCase().includes(s)
    })
  }, [logs, q, code])

  const columns: Column<ApiRequestLog>[] = [
    { key: 'r', label: 'Request ID', render: (l) => <span className="font-mono text-xs font-medium text-brand">{l.requestId}</span> },
    { key: 'm', label: 'Method', render: (l) => <MethodChip method={l.method} /> },
    { key: 'e', label: 'Endpoint', render: (l) => <span className="font-mono text-xs text-ink-soft">{l.endpoint}</span> },
    {
      key: 's',
      label: 'Status',
      sortValue: (l) => l.statusCode,
      render: (l) => <Badge tone={l.statusCode < 400 ? 'green' : 'red'}>{l.statusCode}</Badge>,
    },
    { key: 't', label: 'Time', render: (l) => <span className="font-mono text-xs text-ink-soft">{l.responseTimeMs}ms</span>, hideOnMobile: true },
    { key: 'ip', label: 'IP', render: (l) => <span className="font-mono text-xs text-ink-faint">{l.ip}</span>, hideOnMobile: true },
    { key: 'd', label: 'Date', sortValue: (l) => l.createdAt, render: (l) => <span className="text-[13px] text-ink-soft">{formatDateTime(l.createdAt)}</span>, hideOnMobile: true },
  ]

  const exportCsv = () => {
    const header = 'RequestID,Method,Endpoint,Status,Time(ms),IP,Date'
    const lines = rows.map((l) => [l.requestId, l.method, l.endpoint, l.statusCode, l.responseTimeMs, l.ip, l.createdAt].join(','))
    downloadTextFile('merchant-api-logs.csv', [header, ...lines].join('\n'))
    toast.success('API logs exported')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="API Logs" subtitle="Every request made with your keys — sensitive values are masked." actions={<Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export</Button>} />
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search request ID, endpoint or method…" />
        <Select value={code} onChange={(e) => setCode(e.target.value)} className="md:w-44">
          <option value="all">All responses</option>
          <option value="success">Success only</option>
          <option value="error">Errors only</option>
        </Select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable columns={columns} rows={rows} loading={loading} pageSize={12} onRowClick={setDetail} empty={{ icon: FileCode2, title: 'No API requests yet', description: 'Requests from the Test Console appear here.' }} />
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Request details" subtitle={detail?.requestId} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <MethodChip method={detail.method} />
              <span className="font-mono text-sm text-ink">{detail.endpoint}</span>
              <Badge tone={detail.statusCode < 400 ? 'green' : 'red'} className="ml-auto">HTTP {detail.statusCode}</Badge>
              <span className="font-mono text-xs text-ink-soft">{detail.responseTimeMs}ms</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Section title="Request headers" body={`Authorization: Bearer ${detail.keyPrefix}••••••••\nContent-Type: application/json\nIdempotency-Key: ${detail.requestId}-1`} />
              {detail.requestBody ? <Section title="Request body" body={detail.requestBody} /> : <Section title="Request body" body="(no body — GET)" />}
            </div>
            <Section title="Response body" body={detail.responseBody} />
            <div className="grid grid-cols-3 gap-2 text-[13px] text-ink-soft">
              <p>IP: <span className="font-mono text-ink">{detail.ip}</span></p>
              <p>Environment: <span className="font-medium text-ink">Sandbox</span></p>
              <p>Time: <span className="font-mono text-ink">{formatDateTime(detail.createdAt)}</span></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[13px] font-medium text-ink-soft">{title}</p>
      <pre className={cn('max-h-48 min-h-[72px] overflow-auto rounded-xl bg-[#0B1220] p-3 font-mono text-xs leading-relaxed text-white/80')}>{body}</pre>
    </div>
  )
}
