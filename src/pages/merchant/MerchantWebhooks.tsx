import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, RefreshCw, Webhook, XCircle } from 'lucide-react'
import { Badge, Button, Card, Input, Label, Modal, PageHeader } from '../../components/ui'
import { useAppStore, useCurrentMerchant, useCurrentMerchantApps } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime, timeAgo } from '../../lib/format'
import { toast } from 'sonner'
import type { WebhookDelivery } from '../../types/merchant'

const events = ['payment.pending', 'payment.successful', 'payment.failed', 'payment.reversed', 'refund.processing', 'refund.successful', 'settlement.created', 'settlement.completed']

export default function MerchantWebhooks() {
  const merchant = useCurrentMerchant()
  const apps = useCurrentMerchantApps()
  const webhooks = useAppStore((s) => s.merchantWebhooks.filter((w) => w.merchantId === s.activeMerchantId))
  const deliveries = useAppStore((s) => s.webhookDeliveries.filter((d) => d.merchantId === s.activeMerchantId))
  const save = useAppStore((s) => s.saveWebhook)
  const retry = useAppStore((s) => s.retryWebhookDelivery)
  const [selected, setSelected] = useState<WebhookDelivery | null>(null)

  const activeHook = webhooks[0]
  const [url, setUrl] = useState(activeHook?.url ?? '')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(activeHook?.events ?? ['payment.successful', 'payment.failed'])
  const [appId, setAppId] = useState(apps[0]?.id ?? '')
  const cfgApp = apps.find((a) => a.id === appId)

  const counts = useMemo(() => {
    const delivered = deliveries.filter((d) => d.status === 'delivered').length
    const failed = deliveries.filter((d) => d.status === 'failed').length
    const retrying = deliveries.filter((d) => d.status === 'retrying').length
    return { delivered, failed, retrying }
  }, [deliveries])

  const toggleEvent = (ev: string) =>
    setSelectedEvents((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]))

  const persist = () => {
    if (!/^https:\/\//.test(url)) return toast.error('Webhook URL must start with https://')
    if (selectedEvents.length === 0) return toast.error('Select at least one event')
    if (!appId) return toast.error('Create an API application first')
    save({ applicationId: appId, url, events: selectedEvents })
    toast.success('Webhook configuration saved')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Webhooks" subtitle="Receive real-time events when payment status changes." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-4 p-6 lg:col-span-2">
          <div>
            <Label>Application</Label>
            <select value={appId} onChange={(e) => setAppId(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10">
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Webhook URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourdomain.com/haigha/webhook" className="font-mono text-[13px]" />
          </div>
          <div>
            <Label>Events to receive</Label>
            <div className="flex flex-wrap gap-2">
              {events.map((ev) => (
                <button key={ev} onClick={() => toggleEvent(ev)} className={cn('rounded-full border px-3 py-1.5 font-mono text-xs transition-colors', selectedEvents.includes(ev) ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink-soft hover:border-brand/40')}>
                  {ev}
                </button>
              ))}
            </div>
          </div>
          {activeHook && (
            <div className="rounded-xl bg-canvas px-4 py-3 text-sm">
              <p className="flex items-center justify-between"><span className="text-ink-soft">Status</span><Badge tone="green" dot>Active · retries: {activeHook.retryPolicy}</Badge></p>
              <p className="mt-1.5 flex items-center justify-between"><span className="text-ink-soft">Signing secret</span><span className="font-mono text-xs">{activeHook.secretPrefix}••••••••</span></p>
            </div>
          )}
          <Button onClick={persist} icon={<Webhook className="h-4 w-4" />}>Save webhook</Button>
          <p className="flex items-start gap-2 rounded-xl bg-canvas px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
            <Webhook className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            Each delivery includes an <code className="font-mono">X-Haigha-Signature: sha256=…</code> header. Always verify the signature on your backend before acting on an event.
          </p>
        </Card>

        {/* Stats */}
        <div className="space-y-3">
          <Stat label="Total events" value={String(deliveries.length)} />
          <Stat label="Delivered" value={String(counts.delivered)} tone="text-status-success" icon={CheckCircle2} />
          <Stat label="Failed" value={String(counts.failed)} tone="text-status-danger" icon={XCircle} />
          <Stat label="Retrying" value={String(counts.retrying)} tone="text-amber-600" icon={Clock3} />
          <Card className="p-5">
            <p className="text-[13px] font-semibold text-ink">Success rate</p>
            <p className="mt-1 text-3xl font-extrabold tabular text-ink">
              {Math.round((counts.delivered / Math.max(1, deliveries.length)) * 100)}%
            </p>
            <p className="mt-1 text-xs text-ink-faint">across {deliveries.length} events</p>
          </Card>
        </div>
      </div>

      {/* Delivery history */}
      <Card className="overflow-hidden">
        <div className="px-5 pb-2 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Delivery history</h3>
          <p className="text-[13px] text-ink-soft">Click an event to inspect headers, body and response.</p>
        </div>
        <div className="px-3 pb-4">
          {deliveries.length === 0 && <p className="rounded-xl bg-canvas px-4 py-10 text-center text-sm text-ink-soft">No webhook events yet.</p>}
          {deliveries.map((d) => (
            <button key={d.id} onClick={() => setSelected(d)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-canvas">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', d.status === 'delivered' ? 'bg-status-success' : d.status === 'failed' ? 'bg-status-danger' : 'bg-amber-500')} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] text-ink">{d.event}</p>
                <p className="truncate text-xs text-ink-faint">{d.url}</p>
              </div>
              <span className="hidden text-xs text-ink-faint sm:block">{d.attempts} attempt{d.attempts > 1 ? 's' : ''} · {timeAgo(d.createdAt)}</span>
              <Badge tone={d.status === 'delivered' ? 'green' : d.status === 'failed' ? 'red' : 'amber'}>{d.status} · HTTP {d.httpCode}</Badge>
            </button>
          ))}
        </div>
      </Card>

      <DeliveryModal delivery={selected} onClose={() => setSelected(null)} onRetry={() => {
        if (!selected) return
        retry(selected.id)
        toast.success('Webhook queued for redelivery')
        setSelected(null)
      }} />
    </div>
  )
}

function Stat({ label, value, tone, icon: Icon }: { label: string; value: string; tone?: string; icon?: typeof CheckCircle2 }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      {Icon && <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-canvas', tone ?? 'text-ink-soft')}><Icon className="h-4 w-4" /></span>}
      <div>
        <p className="text-[12px] text-ink-soft">{label}</p>
        <p className="text-lg font-bold tabular text-ink">{value}</p>
      </div>
    </Card>
  )
}

function DeliveryModal({ delivery, onClose, onRetry }: { delivery: WebhookDelivery | null; onClose: () => void; onRetry: () => void }) {
  return (
    <Modal open={!!delivery} onClose={onClose} title={delivery ? `${delivery.event} delivery` : ''} subtitle={delivery ? formatDateTime(delivery.createdAt) : undefined} size="lg">
      {delivery && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={delivery.status === 'delivered' ? 'green' : delivery.status === 'failed' ? 'red' : 'amber'} dot>{delivery.status}</Badge>
            <span className="font-mono text-xs text-ink-soft">{delivery.url}</span>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-soft">Request headers</p>
            <pre className="overflow-x-auto rounded-xl bg-[#0B1220] p-3 text-xs text-white/80">{delivery.requestHeaders.join('\n')}</pre>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-soft">Response</p>
            <pre className="overflow-x-auto rounded-xl bg-[#0B1220] p-3 text-xs text-emerald-300">HTTP {delivery.httpCode}\n{delivery.responseBody}</pre>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Attempts: <b>{delivery.attempts}</b></span>
            {delivery.status !== 'delivered' && <Button size="sm" onClick={onRetry} icon={<RefreshCw className="h-3.5 w-3.5" />}>Retry now</Button>}
          </div>
        </div>
      )}
    </Modal>
  )
}
