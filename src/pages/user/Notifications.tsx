import { useMemo, useState } from 'react'
import { ArrowLeftRight, Bell, CheckCheck, LayoutGrid, Megaphone, ShieldCheck } from 'lucide-react'
import { Button, EmptyState, PageHeader, Tabs } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../store/appStore'
import { timeAgo } from '../../lib/format'
import type { AppNotification } from '../../types'
import { toast } from 'sonner'

const catIcons: Record<AppNotification['category'], { icon: typeof Bell; cls: string }> = {
  transaction: { icon: ArrowLeftRight, cls: 'bg-emerald-50 text-emerald-600' },
  security: { icon: ShieldCheck, cls: 'bg-red-50 text-red-600' },
  system: { icon: LayoutGrid, cls: 'bg-blue-50 text-blue-600' },
  promotion: { icon: Megaphone, cls: 'bg-amber-50 text-amber-600' },
  gateway: { icon: Bell, cls: 'bg-violet-50 text-violet-600' },
  kyc: { icon: ShieldCheck, cls: 'bg-cyan-50 text-cyan-600' },
  platform: { icon: LayoutGrid, cls: 'bg-slate-100 text-slate-600' },
}

type Tab = 'all' | 'transaction' | 'security' | 'system' | 'promotion'

export default function Notifications() {
  const notifications = useAppStore((s) => s.notifications.filter((n) => n.audience === 'user' || n.audience === 'all'))
  const mark = useAppStore((s) => s.markNotificationRead)
  const markAll = useAppStore((s) => s.markAllNotificationsRead)
  const [tab, setTab] = useState<Tab>('all')

  const list = useMemo(() => {
    const valid = notifications.filter((n) => tab === 'all' || n.category === tab)
    return valid
  }, [notifications, tab])

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread === 1 ? '' : 's'}`}
        actions={
          unread > 0 ? (
            <Button variant="soft" onClick={() => {
              markAll('user')
              toast.success('All notifications marked as read')
            }} icon={<CheckCheck className="h-4 w-4" />}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'all', label: 'All' },
          { value: 'transaction', label: 'Transactions' },
          { value: 'security', label: 'Security' },
          { value: 'system', label: 'System' },
          { value: 'promotion', label: 'Promotions' },
        ]}
      />

      <div className="space-y-2.5">
        {list.length === 0 && (
          <div className="rounded-2xl border border-line-soft bg-white shadow-card">
            <EmptyState icon={Bell} title="Nothing here" description="Notifications in this category will appear here." />
          </div>
        )}
        {list.map((n) => {
          const meta = catIcons[n.category]
          return (
            <button
              key={n.id}
              onClick={() => mark(n.id, 'user')}
              className={cn(
                'flex w-full items-start gap-4 rounded-2xl border p-4 text-left shadow-card transition-all',
                n.read ? 'border-line-soft bg-white' : 'border-brand/20 bg-brand-soft/40',
              )}
            >
              <span className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.cls)}>
                <meta.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  <span className="text-sm font-semibold text-ink">{n.title}</span>
                </span>
                <span className="mt-0.5 block text-sm text-ink-soft">{n.body}</span>
                <span className="mt-1.5 block text-xs text-ink-faint">{timeAgo(n.createdAt)}</span>
              </span>
              <span className="mt-1 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                {n.category}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
