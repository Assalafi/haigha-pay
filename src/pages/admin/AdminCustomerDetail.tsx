import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, ArrowDownToLine, ArrowLeft, ArrowUpFromLine, BadgeCheck, Ban, CheckCircle2, FileText, KeyRound, MonitorSmartphone, NotebookPen, ShieldCheck, StickyNote, Wallet as WalletIcon,
} from 'lucide-react'
import { Avatar, Badge, Button, Card, EmptyState, Input, Modal, PageLoader, Textarea, Toggle } from '../../components/ui'
import { StatusPill } from './AdminCustomers'
import { useAppStore } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDate, formatDateTime, money, moneyShort, timeAgo } from '../../lib/format'
import { txTypeLabel, TxIconChip } from '../../components/common/Icons'
import { StatusBadge } from '../../components/ui'
import { toast } from 'sonner'

type Tab = 'overview' | 'wallet' | 'transactions' | 'kyc' | 'devices' | 'activity'

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAppStore((s) => s.users.find((u) => u.id === id))
  const wallet = useAppStore((s) => s.wallets.find((w) => w.userId === id))
  const transactions = useAppStore((s) => s.transactions.filter((t) => t.userId === id))
  const adminAction = useAppStore((s) => s.adminAction)
  const adjustWallet = useAppStore((s) => s.adjustWallet)
  const [tab, setTab] = useState<Tab>('overview')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ kind: 'restrict' | 'suspend' | 'unrestrict' | 'activate'; label: string } | null>(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<{ text: string; at: string }[]>([{ text: 'Customer verified on 12 May 2026.', at: '2026-05-12T11:00:00.000Z' }])
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjAmt, setAdjAmt] = useState('')
  const [adjReason, setAdjReason] = useState('')
  const [devicesList, setDevicesList] = useState([
    { id: 'd1', name: 'Chrome · Windows', ip: '102.89.44.21', last: '2026-09-09T11:02:00.000Z' },
    { id: 'd2', name: 'Safari · iPhone 15', ip: '105.112.7.80', last: '2026-09-07T18:02:00.000Z' },
  ])

  const inflow = useMemo(() => transactions.filter((t) => t.direction === 'credit' && t.status === 'successful').reduce((a, b) => a + b.amount, 0), [transactions])
  const outflow = useMemo(() => transactions.filter((t) => t.direction === 'debit' && t.status === 'successful').reduce((a, b) => a + b.amount, 0), [transactions])

  if (!user || !wallet) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold">Customer not found</p>
        <Link to="/admin/customers" className="mt-2 inline-block text-brand hover:underline">← Back to customers</Link>
      </div>
    )
  }

  const doConfirm = () => {
    if (!pendingAction) return
    adminAction(pendingAction.kind, user.id)
    setConfirmOpen(false)
    setPendingAction(null)
    toast.success(pendingAction.label === 'Restrict Account' ? 'Customer account restricted' : pendingAction.label === 'Suspend Account' ? 'Customer suspended' : `Customer ${pendingAction.label.toLowerCase()}d`)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'transactions', label: `Transactions (${transactions.length})` },
    { key: 'kyc', label: 'KYC' },
    { key: 'devices', label: 'Devices' },
    { key: 'activity', label: 'Activity' },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <button onClick={() => navigate('/admin/customers')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All customers
      </button>

      {/* Header */}
      <Card className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <Avatar firstName={user.firstName} lastName={user.lastName} color={user.avatarColor} size="xl" />
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-ink">
              {user.firstName} {user.lastName}
              <StatusPill s={user.status} />
            </h1>
            <p className="mt-0.5 text-sm text-ink-soft">{user.email} · {user.phone}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-mono text-ink-faint">ID {user.id}</span>
              <Badge tone={user.kycStatus === 'verified' ? 'green' : user.kycStatus === 'in_review' ? 'amber' : 'gray'}>
                KYC {user.kycStatus === 'verified' ? `L${user.kycLevel} · Verified` : user.kycStatus}
              </Badge>
              <span className="text-ink-faint">Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {user.status === 'active' ? (
            <>
              <Button variant="secondary" onClick={() => { setPendingAction({ kind: 'restrict', label: 'Restrict Account' }); setConfirmOpen(true) }}>
                <Ban className="h-4 w-4" /> Restrict
              </Button>
              <Button variant="danger" onClick={() => { setPendingAction({ kind: 'suspend', label: 'Suspend Account' }); setConfirmOpen(true) }}>
                Suspend
              </Button>
            </>
          ) : (
            <Button onClick={() => { setPendingAction({ kind: user.status === 'suspended' ? 'activate' : 'unrestrict', label: user.status === 'suspended' ? 'Activate Account' : 'Unrestrict Account' }); setConfirmOpen(true) }}>
              <CheckCircle2 className="h-4 w-4" /> {user.status === 'suspended' ? 'Activate' : 'Unrestrict'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => { toast.success('Transaction PIN reset requested', { description: 'A reset SMS has been sent to the customer (simulated).' }) }} icon={<KeyRound className="h-4 w-4" />}>Reset PIN</Button>
          <Button variant="secondary" onClick={() => setAdjustOpen(true)} icon={<WalletIcon className="h-4 w-4" />}>Adjust wallet</Button>
          <Button variant="secondary" onClick={() => setNoteOpen(true)} icon={<StickyNote className="h-4 w-4" />}>Add note</Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn('whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors', tab === t.key ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Wallet Balance" value={`₦${moneyShort(wallet.availableBalance)}`} sub={`${money(wallet.availableBalance)}`} icon={WalletIcon} />
          <MiniStat label="Total Inflow" value={`₦${moneyShort(inflow)}`} icon={ArrowDownToLine} tone="text-emerald-600" />
          <MiniStat label="Total Outflow" value={`₦${moneyShort(outflow)}`} icon={ArrowUpFromLine} />
          <MiniStat label="Transactions" value={String(transactions.length)} sub="All time" icon={Activity} />
        </div>
      )}

      {tab === 'wallet' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <WalletMini wallet={wallet} status={user.status} />
          </div>
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-[15px] font-semibold text-ink">Wallet ledger</h3>
            <p className="text-[13px] text-ink-soft">Recent movements on this wallet</p>
            <div className="mt-4 space-y-1">
              {transactions.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-canvas">
                  <TxIconChip type={t.type} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{txTypeLabel(t.type)}</p>
                    <p className="text-xs text-ink-faint">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <span className={cn('text-sm font-semibold tabular', t.direction === 'credit' ? 'text-emerald-600' : 'text-ink')}>
                    {t.direction === 'credit' ? '+' : '-'}{money(t.amount)}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'transactions' && (
        <Card className="overflow-hidden">
          {transactions.length === 0 ? (
            <EmptyState title="No transactions" description="This customer has no transactions yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead><tr className="border-b border-line-soft bg-canvas/60 text-[11px] uppercase tracking-wider text-ink-faint">
                  {['Reference', 'Type', 'Amount', 'Channel', 'Status', 'Date'].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                </tr></thead>
                <tbody>
                  {transactions.map((t) => (
                      <tr key={t.id} onClick={() => navigate(`/admin/transactions/${t.id}`)} className="cursor-pointer border-b border-line-soft/60 transition-colors last:border-0 hover:bg-brand-soft/25">
                        <td className="px-5 py-3.5 font-mono text-xs">{t.reference}</td>
                        <td className="px-5 py-3.5 text-sm">{txTypeLabel(t.type)}</td>
                        <td className={cn('px-5 py-3.5 font-semibold tabular', t.direction === 'credit' ? 'text-emerald-600' : '')}>{t.direction === 'credit' ? '+' : '-'}{money(t.amount)}</td>
                        <td className="px-5 py-3.5 text-sm capitalize text-ink-soft">{t.channel.replace('_', ' ')}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                        <td className="px-5 py-3.5 text-[13px] text-ink-soft">{formatDateTime(t.createdAt)}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'kyc' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><BadgeCheck className="h-4 w-4 text-brand" /> Verification</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <KRow k="KYC status" v={<Badge tone={user.kycStatus === 'verified' ? 'green' : user.kycStatus === 'in_review' ? 'amber' : 'gray'}>{user.kycStatus.replace('_', ' ')}</Badge>} />
              <KRow k="Level" v={`Level ${user.kycLevel}`} />
              <KRow k="NIN" v="•••••••••0123" mono />
              <KRow k="BVN" v="•••••••••8841" mono />
              <KRow k="Document" v="National ID · uploaded 12 Apr 2026" />
              <KRow k="Risk flags" v={<span className="text-emerald-600">None detected</span>} />
            </dl>
          </Card>
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Uploaded documents</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[['National ID', 'NIN-card-front.png'], ['Selfie', 'selfie-capture.jpg'], ['Address proof', 'utility-bill.pdf'], ['Signature', 'signature.png']].map(([t, f]) => (
                <button key={t} onClick={() => toast.info(`Opening ${f} (demo preview)`) } className="flex flex-col items-start gap-2 rounded-2xl border border-line-soft p-4 text-left transition-colors hover:border-brand/30">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-ink-soft"><FileText className="h-5 w-5" /></span>
                  <span>
                    <span className="block text-sm font-medium">{t}</span>
                    <span className="block font-mono text-[11px] text-ink-faint">{f}</span>
                  </span>
                </button>
              ))}
            </div>
            <Button variant="secondary" className="mt-4" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => navigate('/admin/kyc')}>Open KYC review</Button>
          </Card>
        </div>
      )}

      {tab === 'devices' && (
        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><MonitorSmartphone className="h-4 w-4 text-brand" /> Devices ({devicesList.length})</h3>
          <div className="mt-4 space-y-2.5">
            {devicesList.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-line-soft px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{d.name}</p>
                  <p className="font-mono text-xs text-ink-faint">{d.ip} · {timeAgo(d.last)}</p>
                </div>
                <button
                  onClick={() => { setDevicesList((ds) => ds.filter((x) => x.id !== d.id)); toast.success('Device session revoked') }}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-canvas hover:text-ink"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'activity' && (
        <Card className="p-6">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><NotebookPen className="h-4 w-4 text-brand" /> Operator notes</h3>
          <div className="mt-3 space-y-2">
            {notes.map((n, i) => (
              <div key={i} className="rounded-xl bg-canvas px-4 py-3 text-sm">
                <p className="text-ink">{n.text}</p>
                <p className="mt-1 text-xs text-ink-faint">A. Admin · {timeAgo(n.at)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Confirm modal */}
      <Modal open={confirmOpen} onClose={() => { setConfirmOpen(false); setPendingAction(null) }} title={pendingAction?.label} size="sm">
        <p className="text-sm leading-relaxed text-ink-soft">
          {pendingAction?.kind === 'restrict' && <>Restricting <span className="font-semibold text-ink">{user.firstName} {user.lastName}</span> pauses outgoing transfers and bill payments. Incoming credits still apply. This action is logged to the audit trail.</>}
          {pendingAction?.kind === 'suspend' && <>Suspending this account blocks all activity immediately. This is a critical action and will be logged.</>}
          {(pendingAction?.kind === 'unrestrict' || pendingAction?.kind === 'activate') && <>Reactivating this customer restores normal access to their wallet and services.</>}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { setConfirmOpen(false); setPendingAction(null) }}>Cancel</Button>
          <Button variant={pendingAction?.kind === 'suspend' || pendingAction?.kind === 'restrict' ? 'danger' : 'primary'} onClick={doConfirm}>
            Confirm {pendingAction?.label}
          </Button>
        </div>
      </Modal>

      {/* Note modal */}
      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Add internal note">
        <div className="space-y-4">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note visible only to operators…" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!note.trim()) return
              setNotes((ns) => [{ text: note.trim(), at: new Date().toISOString() }, ...ns])
              setNote('')
              setNoteOpen(false)
              toast.success('Note added')
            }}>Save note</Button>
          </div>
        </div>
      </Modal>

      {/* Adjust wallet */}
      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust wallet balance" subtitle="Prototype action — no real funds will move">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            <p className="font-semibold">Prototype Action — No Real Funds Will Move</p>
            <p className="mt-0.5 text-amber-700">Current balance: <span className="font-semibold">{money(wallet.availableBalance)}</span></p>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Adjustment amount</label>
            <div className="flex gap-2">
              <Input value={adjAmt} onChange={(e) => setAdjAmt(e.target.value.replace(/[^\d-]/g, ''))} placeholder="+50000 or -10000" inputMode="numeric" />
            </div>
            <p className="mt-1 text-xs text-ink-faint">Use a negative value to debit.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Reason</label>
            <Input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} placeholder="e.g. Reversal correction" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const amt = parseInt(adjAmt, 10)
              if (Number.isNaN(amt) || amt === 0) return toast.error('Enter a valid adjustment amount')
              if (!adjReason.trim()) return toast.error('Add a reason for this adjustment')
              adjustWallet(user.id, amt, adjReason)
              setAdjustOpen(false)
              setAdjAmt(''); setAdjReason('')
              toast.success(`Wallet adjusted by ${amt > 0 ? '+' : ''}${money(amt)}`)
            }}>Apply adjustment</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function MiniStat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: typeof WalletIcon; tone?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-ink-soft">{label}</p>
          <p className={cn('mt-1.5 text-2xl font-bold tabular', tone ?? 'text-ink')}>{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-ink-soft"><Icon className="h-5 w-5" /></span>
      </div>
    </Card>
  )
}

function WalletMini({ wallet, status }: { wallet: { availableBalance: number; ledgerBalance: number; id: string }; status: string }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green via-brand to-brand-deep p-6 text-white brand-grid">
      <p className="text-[11px] uppercase tracking-wider text-white/70">Available balance</p>
      <p className="mt-1 text-3xl font-extrabold tabular">{money(wallet.availableBalance)}</p>
      <p className="mt-4 font-mono text-xs text-white/60">Wallet ID · {wallet.id}</p>
      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
          <p className="text-[11px] text-white/60">Ledger</p>
          <p className="mt-0.5 font-bold tabular">{money(wallet.ledgerBalance)}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
          <p className="text-[11px] text-white/60">Status</p>
          <p className="mt-0.5 font-bold capitalize">{status}</p>
        </div>
      </div>
    </div>
  )
}

function KRow({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft/70 pb-2.5 last:border-0">
      <dt className="text-ink-soft">{k}</dt>
      <dd className={cn('font-medium text-ink', mono && 'font-mono text-xs')}>{v}</dd>
    </div>
  )
}
