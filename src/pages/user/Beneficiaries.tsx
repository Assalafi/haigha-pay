import { useMemo, useState } from 'react'
import { Send, UserPlus, Users, Trash2 } from 'lucide-react'
import { Button, EmptyState, Input, Label, Modal, PageHeader, SearchInput, Select } from '../../components/ui'
import { banks } from '../../data/static'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../store/appStore'
import { Avatar } from '../../components/ui'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'

export default function Beneficiaries() {
  const beneficiaries = useAppStore((s) => s.beneficiaries)
  const remove = useAppStore((s) => s.removeBeneficiary)
  const add = useAppStore((s) => s.addBeneficiary)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)

  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return beneficiaries.filter((b) => !s || b.name.toLowerCase().includes(s) || b.bank?.toLowerCase().includes(s) || b.nickname?.toLowerCase().includes(s))
  }, [beneficiaries, q])

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="Beneficiaries"
        subtitle="People you send money to often"
        actions={
          <Button onClick={() => setModal(true)} icon={<UserPlus className="h-4 w-4" />}>
            Add Beneficiary
          </Button>
        }
      />
      <SearchInput value={q} onChange={setQ} placeholder="Search by name, bank or nickname…" className="max-w-sm" />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line-soft bg-white shadow-card">
          <EmptyState
            icon={Users}
            title={q ? 'No matches' : 'No beneficiaries yet'}
            description={q ? 'Try a different search.' : 'Save people you pay frequently for faster transfers.'}
            action={!q ? <Button onClick={() => setModal(true)} icon={<UserPlus className="h-4 w-4" />}>Add Beneficiary</Button> : undefined}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((b) => {
            const [first, ...rest] = b.name.split(' ')
            return (
              <div key={b.id} className="flex items-center gap-4 rounded-2xl border border-line-soft bg-white p-4 shadow-card">
                <Avatar firstName={first} lastName={rest.join(' ')} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {b.nickname ? `${b.nickname}` : b.name}
                    {b.nickname && <span className="ml-2 font-normal text-ink-faint">({b.name})</span>}
                  </p>
                  <p className="text-[13px] text-ink-soft">
                    {b.kind === 'bank' ? (
                      <>
                        {b.bank} · <span className="font-mono">{b.accountNumber}</span>
                      </>
                    ) : (
                      <>Haigha Pay · {b.accountNumber}</>
                    )}
                  </p>
                  <span className="mt-1.5 inline-flex rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                    {b.kind === 'bank' ? 'Bank' : 'Haigha Pay'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button size="sm" variant="soft" onClick={() => navigate('/app/transfer')} icon={<Send className="h-3.5 w-3.5" />}>
                    Send
                  </Button>
                  <button
                    onClick={() => {
                      remove(b.id)
                      toast.success('Beneficiary removed')
                    }}
                    className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-red-50 hover:text-status-danger"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddBeneficiaryModal open={modal} onClose={() => setModal(false)} onAdd={(data) => {
        add(data)
        setModal(false)
        toast.success('Beneficiary saved')
      }} />

      <p className="text-[13px] text-ink-soft">
        Beneficiaries make transfers faster and safer. You can still send to anyone without saving them.
      </p>
    </div>
  )
}

function AddBeneficiaryModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (d: { name: string; bank?: string; accountNumber?: string; kind: 'bank' | 'haigha' }) => void }) {
  const [kind, setKind] = useState<'bank' | 'haigha'>('bank')
  const [bank, setBank] = useState('044')
  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const accountName = account === '0123456789' ? 'AISHA MOHAMMED' : account === '0041223141' ? 'MUSA IBRAHIM' : ''

  const save = () => {
    setErr('')
    const digits = account.replace(/\D/g, '')
    if (kind === 'bank') {
      if (digits.length !== 10) return setErr('Enter a valid 10-digit account number.')
      const resolved = accountName || 'ACCOUNT HOLDER'
      onAdd({ name: resolved, bank: banks.find((b) => b.code === bank)?.name, accountNumber: digits, kind })
    } else {
      if (name.trim().length < 3) return setErr('Enter the recipient name.')
      onAdd({ name: name.trim(), kind, accountNumber: 'HPY-' + digits.slice(0, 5) })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a beneficiary" subtitle="Save a recipient for faster transfers.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(['bank', 'haigha'] as const).map((k) => (
            <button
              key={k}
              onClick={() => { setKind(k); setErr('') }}
              className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all', kind === k ? 'border-brand bg-brand-soft/40 text-brand' : 'border-line text-ink-soft')}
            >
              {k === 'bank' ? 'Bank account' : 'Haigha Pay user'}
            </button>
          ))}
        </div>
        {kind === 'bank' ? (
          <>
            <div>
              <Label>Bank</Label>
              <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Account number</Label>
              <Input value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0123456789" inputMode="numeric" />
              {accountName && <p className="mt-1.5 text-[13px] font-semibold text-brand">{accountName}</p>}
            </div>
          </>
        ) : (
          <div>
            <Label>Recipient name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aisha Mohammed" />
            <p className="mt-2 text-[13px] text-ink-soft">Tip: have them sign up with their phone number for instant sends.</p>
          </div>
        )}
        {err && <p className="text-[13px] text-status-danger">{err}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save Beneficiary</Button>
        </div>
      </div>
    </Modal>
  )
}
