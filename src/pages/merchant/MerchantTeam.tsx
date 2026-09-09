import { useState } from 'react'
import { KeyRound, Shield, Users, Wallet2, Webhook, UserPlus } from 'lucide-react'
import { Avatar, Badge, Button, Card, Input, Label, Modal, PageHeader, Select } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import type { TeamMember, TeamRole } from '../../types/merchant'
import { toast } from 'sonner'

const roles: TeamRole[] = ['owner', 'admin', 'developer', 'finance', 'viewer']

const permissions: { feature: string; owner: string; admin: string; developer: string; finance: string; viewer: string }[] = [
  { feature: 'API Keys', owner: 'Full', admin: 'Full', developer: 'Sandbox', finance: 'No', viewer: 'No' },
  { feature: 'Webhooks', owner: 'Full', admin: 'Full', developer: 'Full', finance: 'No', viewer: 'No' },
  { feature: 'Payments', owner: 'Full', admin: 'Full', developer: 'View', finance: 'View', viewer: 'View' },
  { feature: 'Settlements', owner: 'Full', admin: 'Full', developer: 'No', finance: 'Full', viewer: 'View' },
  { feature: 'Team', owner: 'Full', admin: 'Manage', developer: 'No', finance: 'No', viewer: 'No' },
]

export default function MerchantTeam() {
  const team = useAppStore((s) => s.merchantTeam)
  const [members, setMembers] = useState<TeamMember[]>(team)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('developer')

  const invite = () => {
    if (!/^\S+@\S+\.\S+$/.test(email) || name.trim().length < 2) return toast.error('Enter a valid name and email')
    setMembers((m) => [...m, { id: `TM-${Date.now()}`, merchantId: 'MCH-1001', name: name.trim(), email: email.trim(), role, status: 'invited' }])
    setName(''); setEmail(''); setOpen(false)
    toast.success(`Invitation sent to ${email}`)
  }

  const changeRole = (id: string, r: TeamRole) => {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, role: r } : x)))
    toast.success('Role updated')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Team" subtitle="Control who can access this merchant account and what they can do." actions={<Button onClick={() => setOpen(true)} icon={<UserPlus className="h-4 w-4" />}>Invite member</Button>} />

      <Card className="overflow-hidden">
        <div className="px-5 pb-3 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Members</h3>
          <p className="text-[13px] text-ink-soft">Role changes apply instantly (simulated).</p>
        </div>
        <div className="px-3 pb-4">
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-3 hover:bg-canvas">
              <Avatar firstName={m.name} lastName="" size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                <p className="text-xs text-ink-faint">{m.email}</p>
              </div>
              {m.status === 'invited' && <Badge tone="blue">Invited</Badge>}
              <Select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as TeamRole)} className="h-9 w-40 text-[13px]">
                {roles.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </Select>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 pb-3 pt-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Shield className="h-4 w-4 text-brand" /> Role permissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line-soft bg-canvas/60 text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="px-5 py-3 font-semibold">Feature</th>
                {roles.map((r) => <th key={r} className="px-4 py-3 font-semibold">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p.feature} className={i % 2 ? 'bg-canvas/40' : ''}>
                  <td className="px-5 py-3 font-medium text-ink">{p.feature}</td>
                  {roles.map((r) => {
                    const v = p[r as keyof typeof p]
                    const full = v === 'Full'
                    const none = v === 'No'
                    return (
                      <td key={r} className="px-4 py-3">
                        <span className={none ? 'text-ink-faint' : full ? 'font-semibold text-brand' : 'text-ink-soft'}>{v}</span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex items-start gap-3 p-5 text-sm text-ink-soft">
        <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        Role-based developer access is planned (key expiry, IP allowlists). All changes here are frontend simulations.
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Invite a team member">
        <div className="space-y-4">
          <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Halima Sani" /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev@company.com" /></div>
          <div>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
              {roles.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={invite}>Send invitation</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
