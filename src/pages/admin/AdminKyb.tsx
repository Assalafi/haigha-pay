import { useState } from 'react'
import { Building2, CheckCircle2, FileText, ShieldCheck, XCircle } from 'lucide-react'
import { Avatar, Badge, Button, Card, EmptyState, Modal, PageHeader } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDate } from '../../lib/format'
import type { Merchant } from '../../types/merchant'
import { toast } from 'sonner'

type Tab = 'pending' | 'approved' | 'rejected'

export default function AdminKybReview() {
  const merchants = useAppStore((s) => s.merchants)
  const adminMerchantAction = useAppStore((s) => s.adminMerchantAction)
  const [tab, setTab] = useState<Tab>('pending')
  const [selected, setSelected] = useState<Merchant | null>(null)
  const [confirm, setConfirm] = useState<{ m: Merchant; d: 'approved' | 'rejected' } | null>(null)

  const list = merchants.filter((m) => tab === 'pending' ? m.kybStatus === 'pending' || m.kybStatus === 'not_submitted' : m.kybStatus === tab)

  const doConfirm = () => {
    if (!confirm) return
    adminMerchantAction(confirm.m.id, confirm.d === 'approved' ? 'approveKyb' : 'rejectKyb')
    toast.success(`KYB ${confirm.d} for ${confirm.m.businessName}`)
    setConfirm(null)
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="KYB Review" subtitle="Verify merchant businesses before they access live payments." />

      <div className="flex gap-1.5">
        {(['pending', 'approved', 'rejected'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('rounded-lg px-3.5 py-2 text-sm font-medium capitalize', tab === t ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink')}>
            {t} <span className="ml-1.5 rounded-full bg-black/10 px-1.5 text-xs">{merchants.filter((m) => t === 'pending' ? m.kybStatus === 'pending' || m.kybStatus === 'not_submitted' : m.kybStatus === t).length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2.5">
          {list.length === 0 && <div className="rounded-2xl border border-line-soft bg-white"><EmptyState icon={Building2} title="No businesses here" description="Applications in this state will appear here." /></div>}
          {list.map((m) => (
            <button key={m.id} onClick={() => setSelected(m)} className={cn('w-full rounded-2xl border bg-white p-4 text-left shadow-card transition-all', selected?.id === m.id ? 'border-brand ring-2 ring-brand/10' : 'border-line-soft hover:border-brand/30')}>
              <div className="flex items-center gap-3">
                <Avatar firstName={m.businessName} lastName="" size="md" color="#086A37" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{m.businessName}</p>
                  <p className="truncate font-mono text-[11px] text-ink-faint">{m.id}</p>
                </div>
                <Badge tone={m.kybStatus === 'approved' ? 'green' : m.kybStatus === 'rejected' ? 'red' : 'amber'}>{m.kybStatus.replace('_', ' ')}</Badge>
              </div>
              <p className="mt-2 text-xs text-ink-faint">{m.industry} · joined {formatDate(m.createdAt)}</p>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar firstName={selected.businessName} lastName="" size="lg" color="#086A37" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-ink">{selected.businessName}</h2>
                  <p className="text-sm text-ink-soft">{selected.email} · {selected.phone}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                    <Badge tone="brand">{selected.id}</Badge>
                    <Badge tone="gray">{selected.industry}</Badge>
                    <span className="text-ink-faint">Submitted {formatDate(selected.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="danger" size="sm" onClick={() => setConfirm({ m: selected, d: 'rejected' })} icon={<XCircle className="h-4 w-4" />}>Reject</Button>
                  <Button size="sm" onClick={() => setConfirm({ m: selected, d: 'approved' })} icon={<CheckCircle2 className="h-4 w-4" />}>Approve KYB</Button>
                </div>
              </div>
            </Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-[15px] font-semibold text-ink">Business details</h3>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <K k="Legal name" v={selected.legalName} />
                  <K k="RC Number" v={selected.website ? 'RC 1456789' : '—'} />
                  <K k="Website" v={selected.website ?? '—'} />
                  <K k="Country" v={selected.country} />
                  <K k="Settlement" v={`${selected.settlementBank} · ${selected.settlementAccount}`} />
                </dl>
              </Card>
              <Card className="p-6">
                <h3 className="text-[15px] font-semibold text-ink">KYB documents</h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {['Certificate of Incorporation', 'Director ID', 'Bank confirmation'].map((d) => (
                    <button key={d} onClick={() => toast.info(`Previewing ${d} (demo)`)} className="flex flex-col gap-1.5 rounded-xl border border-line-soft p-3 text-left transition-colors hover:border-brand/30">
                      <FileText className="h-5 w-5 text-ink-faint" />
                      <span className="text-xs font-medium text-ink">{d}</span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4 text-sm text-ink-soft">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              Approval is required before this merchant can request live access. All decisions are logged to the audit trail.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line-soft bg-white"><EmptyState icon={Building2} title="Select a business" description="Choose a merchant to review its KYB documents." /></div>
        )}
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.d === 'approved' ? 'Approve KYB' : 'Reject KYB'} size="sm">
        <p className="text-sm text-ink-soft">{confirm?.m.businessName} · {confirm?.m.id}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant={confirm?.d === 'approved' ? 'primary' : 'danger'} onClick={doConfirm}>Confirm {confirm?.d}</Button>
        </div>
      </Modal>
    </div>
  )
}

function K({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft/60 pb-2 last:border-0">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}
