import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, FileText, Flag, Mail, MoreHorizontal, Phone, ShieldAlert, UserRound, XCircle } from 'lucide-react'
import { Avatar, Badge, Button, Card, EmptyState, Modal, PageHeader, Skeleton } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDate, timeAgo } from '../../lib/format'
import type { KycApplication } from '../../types'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import { toast } from 'sonner'

export default function AdminKyc() {
  const kyc = useAppStore((s) => s.kyc)
  const reviewKyc = useAppStore((s) => s.reviewKyc)
  const users = useAppStore((s) => s.users)
  const loading = useFakeLoading(500)
  const { id } = useParams()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'in_review' | 'approved' | 'rejected'>('in_review')
  const [confirm, setConfirm] = useState<{ app: KycApplication; decision: 'approved' | 'rejected' } | null>(null)
  const [infoOpen, setInfoOpen] = useState<KycApplication | null>(null)

  const list = useMemo(() => kyc.filter((k) => k.status === tab), [kyc, tab])

  const selected = kyc.find((k) => k.id === id) ?? list[0]
  const customer = users.find((u) => u.id === selected?.userId)

  if (loading) {
    return (
      <div className="flex gap-5">
        <Skeleton className="h-[560px] w-72 rounded-2xl" />
        <Skeleton className="h-[560px] flex-1 rounded-2xl" />
      </div>
    )
  }

  const doReview = () => {
    if (!confirm) return
    reviewKyc(confirm.app.id, confirm.decision)
    toast.success(`KYC ${confirm.decision}`)
    setConfirm(null)
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="KYC Review"
        subtitle="Verify customer identity applications."
        actions={<Badge tone="amber">{kyc.filter((k) => k.status === 'in_review').length} awaiting review</Badge>}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['in_review', 'approved', 'rejected'] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); navigate('/admin/kyc') }} className={cn('rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition-colors', tab === t ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink')}>
              {t.replace('_', ' ')}
              <span className="ml-2 rounded-full bg-black/10 px-1.5 text-xs">{kyc.filter((k) => k.status === t).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* List */}
        <div className="space-y-2.5">
          {list.length === 0 && (
            <div className="rounded-2xl border border-line-soft bg-white">
              <EmptyState icon={BadgeCheck} title="No applications" description={`No KYC submissions in ${tab.replace('_', ' ')}.`} />
            </div>
          )}
          {list.map((k) => {
            const active = selected?.id === k.id
            const u = users.find((x) => x.id === k.userId)
            return (
              <button key={k.id} onClick={() => navigate(`/admin/kyc/${k.id}`)} className={cn('w-full rounded-2xl border bg-white p-4 text-left shadow-card transition-all', active ? 'border-brand ring-2 ring-brand/10' : 'border-line-soft hover:border-brand/30')}>
                <div className="flex items-center gap-3">
                  <Avatar firstName={k.customer.firstName} lastName={k.customer.lastName} size="md" color={k.customer.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{k.customerName}</p>
                    <p className="font-mono text-[11px] text-ink-faint">{k.id}</p>
                  </div>
                  <Badge tone={k.status === 'in_review' ? 'amber' : k.status === 'approved' ? 'green' : 'red'}>{k.status.replace('_', ' ')}</Badge>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs text-ink-faint">
                  <span>Level {k.level} · {k.idType}</span>
                  <span>{timeAgo(k.submittedAt)}</span>
                </div>
                {k.riskFlags.length > 0 && (
                  <p className="mt-2 flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
                    <ShieldAlert className="h-3.5 w-3.5" /> {k.riskFlags.length} risk flag(s)
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Detail */}
        {selected && customer ? (
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar firstName={selected.customer.firstName} lastName={selected.customer.lastName} size="lg" color={selected.customer.avatarColor} />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-ink">{selected.customerName}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge tone="brand">ID {customer.id}</Badge>
                    <Badge tone="blue">Applying Level {selected.level}</Badge>
                    <span className="text-ink-faint">Submitted {formatDate(selected.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setInfoOpen(selected); }} icon={<MoreHorizontal className="h-4 w-4" />}>
                    Request info
                  </Button>
                </div>
              </div>
              {selected.riskFlags.length > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-800"><Flag className="h-4 w-4" /> Risk flags</p>
                  <ul className="mt-1 list-inside list-disc text-[13px] text-red-700">
                    {selected.riskFlags.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              )}
              {selected.note && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-[13px] text-amber-800">Reviewer note: {selected.note}</p>}
            </Card>

            <div className="grid gap-5 sm:grid-cols-2">
              <Card className="p-5">
                <h3 className="text-[15px] font-semibold text-ink">Identity details</h3>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <D k="NIN" v={<span className="font-mono text-xs">•••••••••{selected.nin.slice(-4)}</span>} />
                  <D k="BVN" v={<span className="font-mono text-xs">•••••••••{selected.bvn.slice(-4)}</span>} />
                  <D k="Document type" v={selected.idType} />
                  <D k="Applicant" v={`${customer.firstName} ${customer.lastName}`} />
                  <D k="Current KYC" v={`Level ${customer.kycLevel} (${customer.kycStatus})`} />
                </dl>
              </Card>
              <Card className="p-5">
                <h3 className="text-[15px] font-semibold text-ink">Documents</h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[['ID document', 'id-front.jpeg'], ['ID back', 'id-back.jpeg'], ['Selfie', 'selfie.jpg'], ['Proof of address', 'utility.pdf']].map(([t, f]) => (
                    <button key={t} onClick={() => toast.info(`Previewing ${f} (demo)`) } className="flex flex-col items-start gap-1.5 rounded-xl border border-line-soft p-3 text-left transition-colors hover:border-brand/30">
                      <FileText className="h-5 w-5 text-ink-faint" />
                      <span className="text-xs font-medium text-ink">{t}</span>
                      <span className="font-mono text-[10px] text-ink-faint">{f}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-faint">
                  <UserRound className="h-3.5 w-3.5" /> Selfie used for liveness check (demo)
                </p>
              </Card>
            </div>

            <Card className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-soft">Decision updates local state only — no documents are moved.</p>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => setConfirm({ app: selected, decision: 'rejected' })} icon={<XCircle className="h-4 w-4" />}>
                  Reject
                </Button>
                <Button onClick={() => setConfirm({ app: selected, decision: 'approved' })} icon={<BadgeCheck className="h-4 w-4" />}>
                  Approve application
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="rounded-2xl border border-line-soft bg-white">
            <EmptyState icon={UserRound} title="Select an application" description="Choose an applicant from the list to review their documents." />
          </div>
        )}
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.decision === 'approved' ? 'Approve KYC application' : 'Reject KYC application'} size="sm">
        <p className="text-sm leading-relaxed text-ink-soft">
          {confirm?.decision === 'approved'
            ? <>Approving <span className="font-semibold text-ink">{confirm.app.customerName}</span> upgrades their account to Level {confirm.app.level}. The customer is notified and their limits increase.</>
            : <>Rejecting this application will notify the customer that their documents did not pass review. They can resubmit with clearer documents.</>}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant={confirm?.decision === 'approved' ? 'primary' : 'danger'} onClick={doReview}>
            {confirm?.decision === 'approved' ? 'Confirm approval' : 'Confirm rejection'}
          </Button>
        </div>
      </Modal>

      <Modal open={!!infoOpen} onClose={() => setInfoOpen(null)} title="Request more information" size="sm">
        <p className="text-sm text-ink-soft">An email is sent to the applicant asking them to provide better or additional documents (simulated).</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setInfoOpen(null)}>Cancel</Button>
          <Button onClick={() => { setInfoOpen(null); toast.success('Request sent to applicant') }}>Send request</Button>
        </div>
      </Modal>
    </div>
  )
}

function D({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft/60 pb-2 last:border-0">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  )
}
