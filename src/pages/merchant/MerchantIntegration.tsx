import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, KeyRound, Plus, Plug2, Sparkles, Webhook, XCircle } from 'lucide-react'
import { Badge, Button, Card, FieldError, Input, Label, Modal, PageHeader, Select } from '../../components/ui'
import { EnvBadge } from '../../components/common/DevKit'
import { useAppStore, useCurrentMerchant } from '../../store/appStore'
import { useCurrentMerchantLogs } from '../../store/appStore'
import { formatDateTime, money, timeAgo } from '../../lib/format'
import { cn } from '../../lib/cn'
import { toast } from 'sonner'

export default function MerchantIntegration() {
  const merchant = useCurrentMerchant()
  const apps = useAppStore((s) => s.merchantApps.filter((a) => a.merchantId === s.activeMerchantId))
  const webhooks = useAppStore((s) => s.merchantWebhooks.filter((w) => w.merchantId === s.activeMerchantId))
  const logs = useCurrentMerchantLogs()
  const createApp = useAppStore((s) => s.createMerchantApp)
  const merchantId = useAppStore((s) => s.activeMerchantId)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', platformType: 'Website', websiteUrl: '', description: '', contactEmail: '' })
  const [err, setErr] = useState('')

  const checklist = [
    { done: true, label: 'Business account created', sub: 'Greenline Stores Ltd' },
    { done: true, label: 'Email verified', sub: 'merchant@haighapay.demo' },
    { done: apps.length > 0, label: 'API application created', sub: apps.length ? apps.map((a) => a.name).join(', ') : 'Not yet' },
    { done: true, label: 'Sandbox key generated', sub: 'hp_test_sk_••••••2d' },
    { done: webhooks.length > 0, label: 'Webhook configured', sub: webhooks.length ? webhooks[0].url : 'Not yet' },
    { done: true, label: 'Test payment completed', sub: '₦50,000 · successful' },
    { done: true, label: 'Payment verification tested', sub: 'GET /verify → successful' },
    { done: merchant?.settlementBank ? true : false, label: 'Settlement account verified', sub: merchant?.settlementBank ?? 'Pending' },
    { done: merchant?.liveAccess ?? false, label: 'Live access approved', sub: merchant?.liveAccess ? 'Live enabled' : merchant?.liveRequested ? 'Pending admin review' : 'Not requested' },
  ]
  const doneCount = checklist.filter((c) => c.done).length

  const save = () => {
    setErr('')
    if (form.name.trim().length < 2) return setErr('Enter an application name.')
    if (form.platformType === 'Website' && !/^https?:\/\//.test(form.websiteUrl)) return setErr('Enter a valid website URL (https://…).')
    const app = createApp({ merchantId: merchantId ?? '', name: form.name.trim(), platformType: form.platformType, websiteUrl: form.websiteUrl, description: form.description })
    setForm({ name: '', platformType: 'Website', websiteUrl: '', description: '', contactEmail: '' })
    setOpen(false)
    setCreated(app.id)
    toast.success('Application created successfully')
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Integration"
        subtitle="Everything you need to connect your application to Haigha Pay."
        actions={
          <>
            <EnvBadge env="sandbox" />
            {merchant?.liveAccess ? <Badge tone="green" dot>Live enabled</Badge> : merchant?.liveRequested ? <Badge tone="amber">Live pending review</Badge> : null}
          </>
        }
      />

      {/* Status hero */}
      <Card className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white"><Plug2 className="h-6 w-6" /></span>
        <div className="flex-1">
          <p className="text-lg font-bold text-ink">{merchant?.liveAccess ? 'Live environment active' : 'You are running on Sandbox'}</p>
          <p className="text-sm text-ink-soft">
            {merchant?.liveAccess
              ? 'Your live keys are enabled. Real payments are processed through Haigha Pay (ZainPay).'
              : 'Sandbox simulation only. No real funds will move. Complete the checklist below to request live access.'}
          </p>
        </div>
        <div className="rounded-2xl bg-canvas px-5 py-3 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">API base URL</p>
          <p className="font-mono text-xs text-ink">{merchant?.liveAccess ? 'https://api.haighapay.com/v1' : 'https://sandbox-api.haighapay.com/v1'}</p>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Go-live stepper */}
        <Card className="p-6 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink">Go-live checklist</h3>
            <span className="text-sm font-bold text-brand">{doneCount}/{checklist.length}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line/60">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
          </div>
          <ol className="mt-5 space-y-0">
            {checklist.map((c, i) => (
              <li key={c.label} className="relative flex gap-3 pb-4 last:pb-0">
                {i < checklist.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-line" />}
                <span className={cn('relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', c.done ? 'bg-brand text-white' : 'border-2 border-ink-faint/30')}>
                  {c.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                </span>
                <div>
                  <p className={cn('text-sm font-medium', c.done ? 'text-ink' : 'text-ink-soft')}>{c.label}</p>
                  <p className="text-xs text-ink-faint">{c.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-5 xl:col-span-2">
          {/* Applications */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">API applications</h3>
                <p className="text-[13px] text-ink-soft">Each app has its own keys and webhooks.</p>
              </div>
              <Button size="sm" onClick={() => setOpen(true)} icon={<Plus className="h-4 w-4" />}>Create app</Button>
            </div>
            {created && (
              <div className="mx-5 mb-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Application created successfully · App ID <b className="font-mono">app_demo_{created}</b></span>
              </div>
            )}
            <div className="px-5 pb-5">
              {apps.length === 0 && <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-soft">No applications yet — create one to generate sandbox keys.</p>}
              <div className="space-y-2.5">
                {apps.map((a) => (
                  <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-line-soft p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{a.name}</p>
                      <p className="font-mono text-xs text-ink-faint">App ID · app_demo_{a.id.toLowerCase()}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge tone="gray">{a.platformType}</Badge>
                        <EnvBadge env={a.environment} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to="/app/business/integration/api-keys"><Button variant="secondary" size="sm" icon={<KeyRound className="h-3.5 w-3.5" />}>Keys</Button></Link>
                      <Link to="/app/business/integration/webhooks"><Button variant="secondary" size="sm" icon={<Webhook className="h-3.5 w-3.5" />}>Webhooks</Button></Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Latest API requests */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <h3 className="text-[15px] font-semibold text-ink">Latest API requests</h3>
              <Link to="/app/business/integration/logs" className="text-[13px] font-medium text-brand hover:underline">View API logs</Link>
            </div>
            <div className="px-3 pb-4">
              {logs.slice(0, 4).map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-canvas">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', l.statusCode < 400 ? 'bg-status-success' : 'bg-status-danger')} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] text-ink">{l.method} {l.endpoint}</p>
                    <p className="text-xs text-ink-faint">{l.requestId} · {timeAgo(l.createdAt)}</p>
                  </div>
                  <span className="font-mono text-xs text-ink-soft">{l.statusCode} · {l.responseTimeMs}ms</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Create app modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Create API application">
        <div className="space-y-4">
          <div>
            <Label>Application name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website Checkout" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Platform type</Label>
              <Select value={form.platformType} onChange={(e) => setForm({ ...form, platformType: e.target.value })}>
                {['Website', 'Mobile App', 'ERP', 'School Portal', 'E-commerce', 'Government Portal', 'Other'].map((x) => <option key={x}>{x}</option>)}
              </Select>
            </div>
            <div>
              <Label>Contact email</Label>
              <Input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="dev@company.com" />
            </div>
          </div>
          <div>
            <Label>Website / callback domain</Label>
            <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://example.com" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this app does" />
          </div>
          <FieldError>{err}</FieldError>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Create application</Button>
          </div>
        </div>
      </Modal>

      <div className="flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4 text-sm text-ink-soft">
        <Sparkles className="h-5 w-5 shrink-0 text-brand" />
        Merchants integrate with Haigha Pay's API — ZainPay stays behind Haigha Pay's backend integration layer.
        <Link to="/developers" className="ml-auto inline-flex items-center gap-1 font-semibold text-brand hover:underline">Open API docs <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  )
}
