import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Wallet as WalletIcon } from 'lucide-react'
import { Avatar, Badge, Button, EmptyState, Input, Modal, PageHeader, SearchInput, Select, StatCard } from '../../components/ui'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useAppStore } from '../../store/appStore'
import { formatDateTime, money, moneyShort } from '../../lib/format'
import { useFakeLoading } from '../../hooks/useFakeLoading'
import type { User, Wallet } from '../../types'
import { toast } from 'sonner'

type Row = { user: User; wallet: Wallet }

export default function AdminWallets() {
  const users = useAppStore((s) => s.users)
  const wallets = useAppStore((s) => s.wallets)
  const adminAction = useAppStore((s) => s.adminAction)
  const adjustWallet = useAppStore((s) => s.adjustWallet)
  const loading = useFakeLoading(500)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<Row | null>(null)
  const [adjOpen, setAdjOpen] = useState(false)
  const [adjAmt, setAdjAmt] = useState('')
  const [adjReason, setAdjReason] = useState('')

  const rows = useMemo<Row[]>(() => {
    const s = q.toLowerCase()
    return wallets
      .map((w) => ({ wallet: w, user: users.find((u) => u.id === w.userId)! }))
      .filter((r) => r.user)
      .filter((r) => {
        if (status !== 'all' && r.wallet.status !== status) return false
        if (!s) return true
        return `${r.user.firstName} ${r.user.lastName} ${r.wallet.id} ${r.user.id}`.toLowerCase().includes(s)
      })
  }, [wallets, users, q, status])

  const totalBalance = wallets.reduce((a, w) => a + w.availableBalance, 0)
  const restricted = wallets.filter((w) => w.status === 'restricted').length

  const columns: Column<Row>[] = [
    {
      key: 'customer',
      label: 'Customer',
      sortValue: (r) => `${r.user.firstName} ${r.user.lastName}`,
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={r.user.firstName} lastName={r.user.lastName} color={r.user.avatarColor} size="sm" />
          <div>
            <p className="text-sm font-medium">{r.user.firstName} {r.user.lastName}</p>
            <p className="font-mono text-[11px] text-ink-faint">{r.user.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'wid', label: 'Wallet ID', render: (r) => <span className="font-mono text-xs">{r.wallet.id}</span> },
    {
      key: 'balance',
      label: 'Available',
      sortValue: (r) => r.wallet.availableBalance,
      render: (r) => <span className="font-semibold tabular">{money(r.wallet.availableBalance)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge tone={r.wallet.status === 'active' ? 'green' : 'amber'} dot>{r.wallet.status}</Badge>,
    },
    {
      key: 'last',
      label: 'Last Activity',
      sortValue: (r) => r.user.createdAt,
      render: (r) => <span className="text-[13px] text-ink-soft">{formatDateTime(r.user.createdAt)}</span>,
      hideOnMobile: true,
    },
  ]

  const applyAdj = () => {
    const amt = parseInt(adjAmt, 10)
    if (Number.isNaN(amt) || amt === 0 || !selected) return toast.error('Enter a valid amount')
    if (!adjReason.trim()) return toast.error('Add a reason')
    adjustWallet(selected.wallet.userId, amt, adjReason)
    setAdjOpen(false)
    setAdjAmt('')
    setAdjReason('')
    toast.success(`Wallet adjusted by ${amt > 0 ? '+' : ''}${money(amt)}`)
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Wallet Management" subtitle="Monitor customer wallet balances and activity." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Wallet Balance" value={`₦${moneyShort(totalBalance)}`} icon={WalletIcon} tone="brand" />
        <StatCard label="Credits Today" value={`₦${moneyShort(41820000)}`} icon={ArrowDownToLine} tone="green" />
        <StatCard label="Debits Today" value={`₦${moneyShort(39150000)}`} icon={ArrowUpFromLine} tone="gray" />
        <StatCard label="Wallets Restricted" value={String(restricted)} icon={ShieldCheck} tone="amber" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchInput value={q} onChange={setQ} placeholder="Search by customer, wallet ID or customer ID…" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="md:w-48">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pageSize={10}
          onRowClick={setSelected}
          empty={{ icon: WalletIcon, title: 'No wallets found', description: 'Adjust your search to see more results.' }}
        />
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Wallet · ${selected.user.firstName} ${selected.user.lastName}` : ''} subtitle={selected?.wallet.id} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-brand-soft/60 px-2 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Available</p>
                <p className="mt-1 text-lg font-bold tabular text-brand">{money(selected.wallet.availableBalance)}</p>
              </div>
              <div className="rounded-2xl bg-canvas px-2 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Ledger</p>
                <p className="mt-1 text-lg font-bold tabular text-ink">{money(selected.wallet.ledgerBalance)}</p>
              </div>
              <div className="rounded-2xl bg-canvas px-2 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Holds</p>
                <p className="mt-1 text-lg font-bold tabular text-ink">₦0.00</p>
              </div>
            </div>
            <div className="space-y-2.5 rounded-2xl border border-line px-4 py-3 text-sm">
              <LRow k="Customer" v={`${selected.user.firstName} ${selected.user.lastName} (${selected.user.id})`} />
              <LRow k="Status" v={<Badge tone={selected.wallet.status === 'active' ? 'green' : 'amber'} dot>{selected.wallet.status}</Badge>} />
              <LRow k="Limits" v="₦10,000,000 balance · ₦1,000,000 daily" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => setAdjOpen(true)}>Adjust balance</Button>
              {selected.wallet.status === 'active' ? (
                <Button variant="danger" onClick={() => {
                  adminAction('restrict', selected.wallet.userId)
                  setSelected(null)
                  toast.success('Wallet restricted')
                }}>Restrict wallet</Button>
              ) : (
                <Button onClick={() => {
                  adminAction('unrestrict', selected.wallet.userId)
                  setSelected(null)
                  toast.success('Wallet unrestricted')
                }}>Unrestrict wallet</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={adjOpen} onClose={() => setAdjOpen(false)} title="Adjust wallet balance" subtitle="Prototype action — no real funds will move" size="sm">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            <p className="font-semibold">Prototype Action — No Real Funds Will Move</p>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Adjustment</label>
            <Input value={adjAmt} onChange={(e) => setAdjAmt(e.target.value.replace(/[^\d-]/g, ''))} placeholder="e.g. 50000 or -10000" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Reason</label>
            <Input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} placeholder="Reason for adjustment" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <Button onClick={applyAdj}>Apply</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function LRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-soft">{k}</span>
      <span className="font-medium text-ink">{v}</span>
    </div>
  )
}
