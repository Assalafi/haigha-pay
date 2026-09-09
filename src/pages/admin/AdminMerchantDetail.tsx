import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2, KeyRound, Rocket, ShieldAlert, Webhook, XCircle } from 'lucide-react'
import { Avatar, Badge, Button, Card, Modal } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDate, formatDateTime, money } from '../../lib/format'
import { EnvBadge, MerchantPaymentBadge } from '../../components/common/DevKit'
import { toast } from 'sonner'

type Tab = 'overview' | 'kyb' | 'apps' | 'transactions' | 'webhooks' | 'settlements'

export default function AdminMerchantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const merchant = useAppStore((s) => s.merchants.find((m) => m.id === id))
  const apps = useAppStore((s) => s.merchantApps.filter((a) => a.merchantId === id))
  const keys = useAppStore((s) => s.merchantKeys.filter((k) => k.merchantId === id))
  const payments = useAppStore((s) => s.merchantPayments.filter((p) => p.merchantId === id))
  const webhooks = useAppStore((s) => s.merchantWebhooks.filter((w) => w.merchantId === id))
  const settlements = useAppStore((s) => s.merchantSettlements.filter((st) => st.merchantId === id))
  const adminMerchantAction = useAppStore((s) => s.adminMerchantAction)
  const [tab, setTab] = useState<Tab>('overview')
  const [confirm, setConfirm] = useState<{ kind: 'suspend' | 'unsuspend' | 'approveLive' | 'disableLive' | 'approveKyb' | 'rejectKyb'; label: string } | null>(null)

  if (!merchant) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Merchant not found</p>
        <Link to="/admin/merchants" className="mt-2 inline-block text-brand hover:underline">← Back to merchants</Link>
      </div>
    )
  }

  const volume = payments.reduce((a, p) => a + p.amount, 0)

  const run = () => {
    if (!confirm) return
    adminMerchantAction(merchant.id, confirm.kind)
    toast.success(confirm.label)
    setConfirm(null)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'kyb', label: 'KYB' },
    { key: 'apps', label: 'API Applications' },
    { key: 'transactions', label: `Transactions (${payments.length})` },
    { key: 'webhooks', label: 'Webhooks' },
    { key: 'settlements', label: 'Settlements' },
  ]

  const actions: { label: string; kind: 'suspend' | 'unsuspend' | 'approveLive' | 'disableLive' | 'approveKyb' | 'rejectKyb'; tone: 'primary' | 'secondary' | 'danger' }[] = [
    ...(merchant.kybStatus !== 'approved' ? [{ label: merchant.kybStatus === 'rejected' ? 'Re-approve KYB' : 'Approve KYB', kind: 'approveKyb' as const, tone: 'primary' as const }] : []),
    ...(merchant.liveRequested || !merchant.liveAccess ? (merchant.liveAccess ? [] : [{ label: 'Approve live access', kind: 'approveLive' as const, tone: 'primary' as const }]) : []),
    ...(merchant.liveAccess ? [{ label: 'Disable live access', kind: 'disableLive' as const, tone: 'secondary' as const }] : []),
    ...(merchant.status === 'suspended' ? [{ label: 'Re-activate', kind: 'unsuspend' as const, tone: 'primary' as const }] : [{ label: 'Suspend merchant', kind: 'suspend' as const, tone: 'danger' as const }]),
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <button onClick={() => navigate('/admin/merchants')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All merchants
      </button>

      <Card className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white">{merchant.businessName.slice(0, 2).toUpperCase()}</span>
        <div className="flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-ink">{merchant.businessName}
            <Badge tone={merchant.status === 'active' ? 'green' : merchant.status === 'pending' ? 'amber' : 'red'} dot>{merchant.status}</Badge>
          </h1>
          <p className="text-sm text-ink-soft">{merchant.email} · {merchant.phone}</p>
          <div className="mt-1.5 flex flex-wrap gap-2 text-[13px]">
            <Badge tone={merchant.kybStatus === 'approved' ? 'green' : merchant.kybStatus === 'pending' ? 'amber' : 'gray'}>KYB {merchant.kybStatus.replace('_', ' ')}</Badge>
            <span className="text-ink-faint">ID {merchant.id} · Joined {formatDate(merchant.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {actions.map((a) => (
            <Button key={a.kind} variant={a.tone === 'danger' ? 'danger' : a.tone === 'secondary' ? 'secondary' : 'primary'} onClick={() => setConfirm({ kind: a.kind, label: a.label })} icon={a.kind.includes('approve') ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}>
              {a.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors', tab === t.key ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink')}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Total volume" value={money(volume)} />
          <MiniStat label="Transactions" value={String(payments.length)} />
          <MiniStat label="Apps" value={String(apps.length)} />
          <MiniStat label="Live" value={merchant.liveAccess ? 'Enabled' : merchant.liveRequested ? 'Requested' : 'No'} />
          <Card className="p-5 sm:col-span-2 xl:col-span-4">
            <h3 className="text-[15px] font-semibold text-ink">Business profile</h3>
            <dl className="mt-3 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              <MiniRow k="Legal name" v={merchant.legalName} />
              <MiniRow k="Industry" v={merchant.industry} />
              <MiniRow k="Website" v={merchant.website ?? '—'} />
              <MiniRow k="Country" v={merchant.country} />
              <MiniRow k="Settlement" v={`${merchant.settlementBank} · ${merchant.settlementAccount}`} />
              <MiniRow k="Account name" v={merchant.settlementAccountName} />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'kyb' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">KYB status</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <MiniRow k="Status" v={<Badge tone={merchant.kybStatus === 'approved' ? 'green' : 'amber'}>{merchant.kybStatus.replace('_', ' ')}</Badge>} />
              <MiniRow k="Documents" v="Certificate of Incorporation · Director ID · Utility bill" />
              <MiniRow k="Submitted" v={formatDate(merchant.createdAt)} />
              <MiniRow k="Reviewer" v="A. Admin" />
            </dl>
          </Card>
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Documents (demo previews)</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['Certificate of Incorporation', 'Director ID', 'Bank confirmation', 'Utility bill'].map((d) => (
                <button key={d} onClick={() => toast.info(`Previewing ${d}`)} className="rounded-2xl border border-line-soft p-4 text-left text-sm font-medium text-ink transition-colors hover:border-brand/30">
                  <Building2 className="mb-2 h-5 w-5 text-ink-faint" />
                  {d}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'apps' && (
        <div className="space-y-3">
          {apps.map((a) => (
            <Card key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><KeyRound className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{a.name}</p>
                <p className="font-mono text-xs text-ink-faint">app_demo_{a.id.toLowerCase()} · {a.description ?? a.platformType}</p>
              </div>
              <Badge tone="gray">{a.platformType}</Badge>
              <EnvBadge env={a.environment} />
            </Card>
          ))}
          {apps.length === 0 && <Card className="p-8 text-center text-sm text-ink-soft">No API applications.</Card>}
        </div>
      )}

      {tab === 'transactions' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead><tr className="border-b border-line-soft bg-canvas/60 text-[11px] uppercase tracking-wider text-ink-faint">{['Reference', 'Merchant Ref', 'Amount', 'Channel', 'Status', 'Date'].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {payments.slice(0, 12).map((p) => (
                <tr key={p.id} onClick={() => navigate(`/merchant/payments/${p.id}`)} className="cursor-pointer border-b border-line-soft/60 last:border-0 hover:bg-brand-soft/20">
                  <td className="px-5 py-3 font-mono text-xs">{p.haighaRef}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">{p.merchantRef}</td>
                  <td className="px-5 py-3 font-semibold tabular">{money(p.amount)}</td>
                  <td className="px-5 py-3 text-[13px] capitalize text-ink-soft">{p.channel.replace('_', ' ')}</td>
                  <td className="px-5 py-3"><MerchantPaymentBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-[13px] text-ink-soft">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'webhooks' && (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <Card key={w.id} className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink"><Webhook className="h-4 w-4 text-brand" /> {w.url}</h3>
                <Badge tone="green" dot>Active</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {w.events.map((e) => <span key={e} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-ink-soft">{e}</span>)}
              </div>
            </Card>
          ))}
          {webhooks.length === 0 && <Card className="p-8 text-center text-sm text-ink-soft">No webhooks configured.</Card>}
        </div>
      )}

      {tab === 'settlements' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead><tr className="border-b border-line-soft bg-canvas/60 text-[11px] uppercase tracking-wider text-ink-faint">{['Reference', 'Gross', 'Fees', 'Net', 'Status', 'Date'].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-line-soft/60 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">{s.reference}</td>
                  <td className="px-5 py-3 tabular">{money(s.gross)}</td>
                  <td className="px-5 py-3 tabular text-ink-soft">{money(s.fees)}</td>
                  <td className="px-5 py-3 font-semibold tabular">{money(s.net)}</td>
                  <td className="px-5 py-3"><Badge tone={s.status === 'completed' ? 'green' : s.status === 'processing' ? 'amber' : s.status === 'scheduled' ? 'blue' : 'red'}>{s.status}</Badge></td>
                  <td className="px-5 py-3 text-[13px] text-ink-soft">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.label} size="sm">
        <p className="text-sm leading-relaxed text-ink-soft">
          {confirm?.kind === 'approveLive' && <>Approve live access for <span className="font-semibold text-ink">{merchant.businessName}</span>. Live API keys are generated and the merchant is notified.</>}
          {confirm?.kind === 'suspend' && <>Suspending this merchant blocks all API requests and freezes settlements immediately.</>}
          {confirm?.kind === 'approveKyb' && <>Mark this business as KYB verified. The merchant can then request live access.</>}
          {confirm?.kind === 'unsuspend' && <>Reactivate this merchant and restore API access.</>}
          {confirm?.kind === 'disableLive' && <>Live keys are disabled. Existing keys stop working.</>}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant={confirm?.kind === 'suspend' || confirm?.kind === 'disableLive' ? 'danger' : 'primary'} onClick={run}>Confirm {confirm?.label}</Button>
        </div>
      </Modal>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-[13px] font-medium text-ink-soft">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular text-ink">{value}</p>
    </Card>
  )
}

function MiniRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft/60 pb-2 last:border-0">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="text-right font-medium text-ink">{v}</dd>
    </div>
  )
}
