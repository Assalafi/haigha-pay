import { useMemo, useState } from 'react'
import { ArrowLeftRight, Bell, CheckCheck, LayoutGrid, Megaphone, ShieldCheck, Send } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Textarea, Tabs } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore, useAdminNotifications } from '../../store/appStore'
import { timeAgo } from '../../lib/format'
import type { AppNotification } from '../../types'
import { toast } from 'sonner'

const iconMap: Record<string, { icon: typeof Bell; cls: string }> = {
  gateway: { icon: Bell, cls: 'bg-violet-50 text-violet-600' },
  security: { icon: ShieldCheck, cls: 'bg-red-50 text-red-600' },
  kyc: { icon: ShieldCheck, cls: 'bg-cyan-50 text-cyan-600' },
  transaction: { icon: ArrowLeftRight, cls: 'bg-emerald-50 text-emerald-600' },
  platform: { icon: LayoutGrid, cls: 'bg-slate-100 text-slate-600' },
  promotion: { icon: Megaphone, cls: 'bg-amber-50 text-amber-600' },
  system: { icon: LayoutGrid, cls: 'bg-blue-50 text-blue-600' },
}

export default function AdminNotificationsPage() {
  const notifs = useAdminNotifications()
  const mark = useAppStore((s) => s.markNotificationRead)
  const markAll = useAppStore((s) => s.markAllNotificationsRead)
  const push = useAppStore((s) => s.pushNotification)
  const [tab, setTab] = useState<'all' | AppNotification['category']>('all')
  const [compose, setCompose] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'admin' | 'user'>('user')

  const list = useMemo(() => notifs.filter((n) => tab === 'all' || n.category === tab), [notifs, tab])
  const unread = notifs.filter((n) => !n.read).length

  const send = () => {
    if (!title.trim() || !body.trim()) return toast.error('Add a title and message')
    push({ category: 'platform', title: title.trim(), body: body.trim(), audience })
    setTitle(''); setBody(''); setCompose(false)
    toast.success(`Broadcast sent to ${audience === 'admin' ? 'admins' : 'customers'}`)
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Notifications"
        subtitle="Gateway, security, KYC and platform alerts"
        actions={
          <>
            <Button variant="secondary" onClick={() => { markAll('admin'); toast.success('All marked as read') }} icon={<CheckCheck className="h-4 w-4" />}>
              Mark all read
            </Button>
            <Button onClick={() => setCompose(!compose)} icon={<Send className="h-4 w-4" />}>Send broadcast</Button>
          </>
        }
      />

      {compose && (
        <Card className="space-y-3 p-5 animate-fade-up">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2"><Input placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <Select value={audience} onChange={(e) => setAudience(e.target.value as 'admin' | 'user')}>
              <option value="user">All customers</option>
              <option value="admin">All admins</option>
            </Select>
          </div>
          <Textarea placeholder="Message body…" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCompose(false)}>Cancel</Button>
            <Button onClick={send}>Send notification</Button>
          </div>
        </Card>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'all', label: 'All', count: notifs.length },
          { value: 'gateway', label: 'Gateway' },
          { value: 'kyc', label: 'KYC' },
          { value: 'security', label: 'Security' },
          { value: 'transaction', label: 'Transaction' },
          { value: 'platform', label: 'Platform' },
        ]}
      />

      {list.length === 0 ? (
        <div className="rounded-2xl border border-line-soft bg-white"><EmptyState icon={Bell} title="No notifications" description="Alerts in this category will appear here." /></div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((n) => {
            const meta = iconMap[n.category] ?? iconMap.platform
            return (
              <div key={n.id} className={cn('flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-card', n.read ? 'border-line-soft' : 'border-brand/20 bg-brand-soft/30')}>
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.cls)}><meta.icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge tone={n.audience === 'admin' ? 'purple' : 'blue'}>{n.audience}</Badge>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-haigha-red" />}
                    </div>
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-soft">{n.body}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-ink-faint">{timeAgo(n.createdAt)}</span>
                    {!n.read && <button onClick={() => mark(n.id, 'admin')} className="text-[11px] font-medium text-brand hover:underline">Mark read</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[13px] text-ink-soft">{unread} unread · for the frontend demo this is dummy data only.</p>
    </div>
  )
}
