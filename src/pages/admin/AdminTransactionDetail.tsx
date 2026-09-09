import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ClipboardList, Printer, RefreshCw, StickyNote } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Modal, Textarea } from '../../components/ui'
import { StatusBadge } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../store/appStore'
import { formatDateTime, money } from '../../lib/format'
import { txTypeLabel } from '../../components/common/Icons'
import { toast } from 'sonner'

export default function AdminTransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tx = useAppStore((s) => s.transactions.find((t) => t.id === id))
  const [requerying, setRequerying] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<string[]>([])

  if (!tx) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Transaction not found</p>
        <Link to="/admin/transactions" className="mt-2 inline-block text-brand hover:underline">← Back to transactions</Link>
      </div>
    )
  }

  const timeline = [
    { t: 'Transaction Created', at: '', done: true },
    { t: 'Sent for Processing', at: '', done: true },
    { t: 'Gateway Accepted', at: '', done: tx.status !== 'failed' },
    { t: tx.status === 'failed' ? 'Gateway Rejected' : 'Payment Successful', at: '', done: tx.status === 'successful' || tx.status === 'reversed' },
    { t: 'Wallet Updated', at: '', done: tx.status === 'successful' },
  ]

  const requery = () => {
    setRequerying(true)
    setTimeout(() => {
      setRequerying(false)
      if (tx.status === 'pending') {
        toast.success('Gateway requery: status confirmed as successful', { description: 'This simulated requery returned a success for demo purposes.' })
      } else {
        toast.success('Gateway requery: no change in status', { description: 'ZainPay reports the same state already stored.' })
      }
    }, 1400)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-up">
      <button onClick={() => navigate('/admin/transactions')} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All transactions
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">{txTypeLabel(tx.type)}</h1>
          <p className="font-mono text-sm text-ink-soft">{tx.reference}</p>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Summary */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Transaction summary</h3>
            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Info k="Amount" v={<span className={cn('font-bold text-lg', tx.direction === 'credit' ? 'text-emerald-600' : 'text-ink')}>{tx.direction === 'credit' ? '+' : '-'}{money(tx.amount)}</span>} />
              <Info k="Fee" v={tx.fee > 0 ? money(tx.fee) : 'Free'} />
              <Info k="Customer" v={tx.customerName ?? tx.recipientName ?? '—'} />
              <Info k="Reference" v={<span className="font-mono text-xs">{tx.reference}</span>} />
              <Info k="Date" v={formatDateTime(tx.createdAt)} />
              <Info k="Direction" v={tx.direction} />
              <Info k="Description" v={tx.narration} />
              <Info k="Recipient" v={tx.recipientName ?? '—'} />
            </div>
          </Card>

          {/* Payment info */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Payment information</h3>
            <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Info k="Channel" v={<span className="capitalize">{tx.channel.replace('_', ' ')}</span>} />
              <Info k="Provider" v="ZainPay (Sandbox)" />
              <Info k="Gateway reference" v={tx.gatewayReference ? <span className="font-mono text-xs">{tx.gatewayReference}</span> : '—'} />
              <Info k="Bank / Account" v={`${tx.bank ?? '—'}${tx.accountNumber ? ' · ' + tx.accountNumber : ''}`} />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 text-[13px] text-ink-soft">
              <RefreshCw className="h-4 w-4 text-brand" />
              This screen can later be mapped directly to real ZainPay API data.
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Timeline</h3>
            <ol className="mt-4 space-y-0">
              {timeline.map((s, i) => {
                const time = new Date(new Date(tx.createdAt).getTime() + i * 1000).toISOString()
                return (
                  <li key={s.t} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < timeline.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-line" />}
                    <span className={cn('relative z-10 flex h-5 w-5 items-center justify-center rounded-full', s.done ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400')}>
                      {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    </span>
                    <div className="-mt-0.5 text-sm">
                      <p className={cn('font-medium', s.done ? 'text-ink' : 'text-ink-faint')}>{s.t}</p>
                      <p className="font-mono text-xs text-ink-faint">{formatDateTime(time)}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>

        {/* Side */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">Actions</h3>
            <div className="space-y-2.5">
              <Button variant="secondary" className="w-full justify-start" onClick={requery} loading={requerying} icon={<RefreshCw className="h-4 w-4" />}>
                Requery status
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setReviewOpen(true)} icon={<ClipboardList className="h-4 w-4" />}>
                Mark for review
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setNoteOpen(true)} icon={<StickyNote className="h-4 w-4" />}>
                Add note
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
                Print details
              </Button>
            </div>
            {tx.status === 'failed' && (
              <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-700">
                This transaction failed at the gateway. If the customer was debited, create a reversal via the wallet tools.
              </p>
            )}
            <p className="mt-4 rounded-xl bg-canvas px-3.5 py-2.5 text-[12px] leading-relaxed text-ink-faint">
              Manual status overrides are intentionally not available. Statuses must reflect gateway truth.
            </p>
          </Card>

          {notes.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-2 text-[15px] font-semibold text-ink">Notes</h3>
              {notes.map((n, i) => <p key={i} className="mb-2 rounded-xl bg-canvas px-4 py-3 text-sm">{n}</p>)}
            </Card>
          )}
        </div>
      </div>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Mark for review">
        <p className="text-sm text-ink-soft">This flags the transaction for the risk & reconciliation queue. Our team will investigate before any manual action.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setReviewOpen(false)}>Cancel</Button>
          <Button onClick={() => { setReviewOpen(false); toast.success('Transaction marked for review', { description: 'Flagged for risk & reconciliation.' }) }}>Confirm</Button>
        </div>
      </Modal>

      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Add note">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note for this transaction…" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setNoteOpen(false)}>Cancel</Button>
          <Button onClick={() => { if (note.trim()) { setNotes((n) => [...n, note.trim()]); setNote(''); setNoteOpen(false); toast.success('Note added') } }}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}

function Info({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[12px] text-ink-faint">{k}</dt>
      <dd className="mt-0.5 font-medium text-ink">{v}</dd>
    </div>
  )
}
