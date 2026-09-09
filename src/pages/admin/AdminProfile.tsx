import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, KeyRound, LogOut, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Avatar, Badge, Button, Card, Input, Label, Modal, PageHeader, Toggle } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { formatDateTime } from '../../lib/format'
import { toast } from 'sonner'

export default function AdminProfilePage() {
  const logout = useAppStore((s) => s.logout)
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)
  const [ip, setIp] = useState('')
  const [devices, setDevices] = useState(['Chrome · Windows', 'Chrome · macOS'])

  const admin = { name: 'Aisha Admin', email: 'admin@haighapay.demo', phone: '+234 700 000 0001', role: 'Super Admin', id: 'ADM-301', lastLogin: '2026-09-09T09:30:00.000Z', location: 'Kaduna, Nigeria' }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="My Profile" subtitle="Your operator account and sessions." />

      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar firstName="Aisha" lastName="Admin" size="xl" color="#086A37" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-ink">{admin.name}</h2>
          <p className="text-sm text-ink-soft">{admin.email} · {admin.phone}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
            <Badge tone="brand">{admin.id}</Badge>
            <Badge tone="purple">{admin.role}</Badge>
            <Badge tone="green" dot>Active session</Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => { logout(); navigate('/admin/login'); toast.info('Signed out') }} icon={<LogOut className="h-4 w-4" />}>Sign out</Button>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Operator details</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Employee ID</dt><dd className="font-mono font-medium">{admin.id}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Role</dt><dd className="font-medium">{admin.role}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Last login</dt><dd className="font-medium">{formatDateTime(admin.lastLogin)}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-ink-soft"><MapPin className="h-3.5 w-3.5" /> Location</dt><dd className="font-medium">{admin.location}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-ink-soft"><Mail className="h-3.5 w-3.5" /> 2FA</dt><dd className="flex items-center gap-1 font-medium text-emerald-600"><ShieldCheck className="h-4 w-4" /> Enabled</dd></div>
          </dl>
          <Button variant="secondary" className="mt-5" icon={<KeyRound className="h-4 w-4" />} onClick={() => setResetOpen(true)}>Reset operator password</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ink">Session & access controls</h3>
          <div className="mt-3 divide-y divide-line-soft/70">
            <Toggle checked label="Two-factor authentication" description="Required for all admin sign-ins" onChange={() => toast.success('2FA is enforced for admins')} disabled />
            <Toggle checked={false} label="Login alerts by email" description="Notify on every admin sign-in" onChange={(v) => toast.success(v ? 'Login alerts enabled' : 'Login alerts disabled')} />
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-[13px] font-medium text-ink-soft">Authorised devices ({devices.length})</p>
            {devices.map((d) => (
              <div key={d} className="flex items-center justify-between rounded-xl border border-line-soft px-3.5 py-2.5">
                <span className="text-sm font-medium text-ink">{d}</span>
                {d === 'Chrome · Windows' ? <Badge tone="green">This device</Badge> : (
                  <button onClick={() => { setDevices((ds) => ds.filter((x) => x !== d)); toast.success('Device session revoked') }} className="text-xs font-medium text-status-danger hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-[15px] font-semibold text-ink">Security best practices</h3>
        <ul className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
          {['Never share your password or OTP codes', 'Verify URLs before entering credentials', 'Review the audit log for your own actions', 'Sign out when leaving a shared machine'].map((b) => (
            <li key={b} className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 shrink-0 text-brand" /> {b}</li>
          ))}
        </ul>
        <Link to="/admin/settings" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">Manage security settings →</Link>
      </Card>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset operator password">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">A reset link will be emailed to <span className="font-semibold text-ink">{admin.email}</span>. For demo, verify with an OTP below.</p>
          <div>
            <Label>Enter one-time code</Label>
            <div className="flex gap-2">
              <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="6-digit code" inputMode="numeric" />
              <Button variant="secondary" onClick={() => toast.info('OTP sent to operator email (demo)')}>Send OTP</Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button onClick={() => { setResetOpen(false); setIp(''); toast.success('Reset link sent successfully') }}>Send reset link</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
