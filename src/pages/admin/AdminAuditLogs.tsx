import { useMemo, useState } from 'react'
import { Download, ScrollText, ShieldAlert } from 'lucide-react'
import { Badge, Button, PageHeader, SearchInput, Select, Skeleton } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { downloadTextFile, formatDateTime } from '../../lib/format'
import type { AuditLog } from '../../types'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { toast } from 'sonner'

export default function AdminAuditLogs() {
  const logs = useAppStore((s) => s.auditLogs)
  const loading = useFakeLoading(500)
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('all')

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    return logs.filter((l) => {
      if (level !== 'all' && l.level !== level) return false
      if (!s) return true
      return `${l.admin} ${l.action} ${l.resource} ${l.resourceType} ${l.ip}`.toLowerCase().includes(s)
    })
  }, [logs, q, level])

  const columns: Column<AuditLog>[] = [
    { key: 'admin', label: 'Admin', render: (l) => <span className="text-[13px] font-medium">{l.admin}</span>, hideOnMobile: true },
    { key: 'action', label: 'Action', render: (l) => <span className="text-sm">{l.action}</span> },
    { key: 'resource', label: 'Resource', render: (l) => <span className="font-mono text-xs text-brand">{l.resource}</span> },
    { key: 'resourceType', label: 'Type', render: (l) => <Badge tone="gray">{l.resourceType}</Badge>, hideOnMobile: true },
    { key: 'ip', label: 'IP Address', render: (l) => <span className="font-mono text-xs text-ink-soft">{l.ip}</span> },
    { key: 'device', label: 'Device', render: (l) => <span className="text-[13px] text-ink-soft">{l.device}</span>, hideOnMobile: true },
    {
      key: 'date',
      label: 'Date',
      sortValue: (l) => l.createdAt,
      render: (l) => <span className="text-[13px] text-ink-soft">{formatDateTime(l.createdAt)}</span>,
    },
  ]

  const exportCsv = () => {
    const header = 'Admin,Action,Resource,Type,IP,Device,Date,Level'
    const lines = rows.map((l) => [l.admin, l.action, l.resource, l.resourceType, l.ip, l.device, l.createdAt, l.level].join(','))
    downloadTextFile('haigha-audit-log.csv', [header, ...lines].join('\n'))
    toast.success('Audit log exported')
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Audit Logs"
        subtitle="Every operator action is recorded — immutable for this demo."
        actions={<Button variant="secondary" onClick={exportCsv} icon={<Download className="h-4 w-4" />}>Export</Button>}
      />

      <div className="flex items-start gap-3 rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm text-ink-soft">
          Audit logs are critical for a financial platform. In production these records are append-only and cannot be edited by operators.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search admin, action, resource or IP…" />
        <Select value={level} onChange={(e) => setLevel(e.target.value)} className="md:w-44">
          <option value="all">All levels</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={12}
          empty={{ icon: ScrollText, title: 'No audit entries found', description: 'Adjust filters to see more.' }}
          mobileCard={(l) => (
            <div className={cn('rounded-2xl border p-4 shadow-card', l.level === 'critical' ? 'border-red-200 bg-red-50/40' : 'border-line-soft bg-white')}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{l.action}</span>
                <LevelBadge level={l.level} />
              </div>
              <p className="mt-1 font-mono text-xs text-brand">{l.resource}</p>
              <p className="mt-1 text-xs text-ink-faint">{l.admin} · {l.ip}</p>
              <p className="mt-1 text-xs text-ink-faint">{formatDateTime(l.createdAt)}</p>
            </div>
          )}
        />
      </div>
    </div>
  )
}

function LevelBadge({ level }: { level: AuditLog['level'] }) {
  return <Badge tone={level === 'critical' ? 'red' : level === 'warning' ? 'amber' : 'gray'} dot>{level}</Badge>
}
