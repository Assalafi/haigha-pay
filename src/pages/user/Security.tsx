import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Chrome, KeyRound, Lock, Laptop, LogOut, MonitorSmartphone, ShieldCheck, Smartphone, TimerReset } from 'lucide-react'
import { Badge, Button, Card, FieldError, Input, Label, Modal, PageHeader, Toggle } from '../../components/ui'
import { useAppStore, useCurrentUser } from '../../store/appStore'
import { cn } from '../../lib/cn'
import { formatDateTime, timeAgo } from '../../lib/format'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const devices = [
  { id: 'd1', name: 'Chrome · Windows', last: '2026-09-09T11:30:00.000Z', current: true, icon: Chrome },
  { id: 'd2', name: 'Safari · iPhone 15', last: '2026-09-07T18:02:00.000Z', icon: Smartphone },
  { id: 'd3', name: 'Firefox · macOS', last: '2026-09-03T09:14:00.000Z', icon: Laptop },
]

const loginActivity = [
  { action: 'Successful login', device: 'Chrome · Windows', ip: '102.89.44.21', at: '2026-09-09T11:30:00.000Z' },
  { action: 'PIN verified (transfer)', device: 'Chrome · Windows', ip: '102.89.44.21', at: '2026-09-09T09:41:00.000Z' },
  { action: 'Successful login', device: 'Safari · iPhone 15', ip: '105.112.7.80', at: '2026-09-07T18:02:00.000Z' },
  { action: 'Failed login attempt', device: 'Unknown · Android', ip: '41.79.210.5', at: '2026-09-06T03:22:00.000Z' },
]

export default function Security() {
  const user = useCurrentUser()
  const [pwOpen, setPwOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [twoFa, setTwoFa] = useState(true)
  const [logoutAllOpen, setLogoutAllOpen] = useState(false)
  const [devicesState, setDevicesState] = useState(devices)
  const navigate = useNavigate()

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="Security" subtitle="Protect your account and money." />
      <div className="flex items-start gap-3 rounded-2xl border border-brand/15 bg-brand-soft/40 px-5 py-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">Your account is secure.</span> You are signed in as <span className="font-medium text-ink">{user?.email}</span>.
          Haigha Pay never stores your PIN or password.
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Change password */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><KeyRound className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Password</h3>
              <p className="text-[13px] text-ink-soft">Last changed 12 Apr 2026</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            Use a unique password you don't use anywhere else. Haigha Pay will never ask for it.
          </p>
          <Button variant="secondary" className="mt-5" onClick={() => setPwOpen(true)}>Change password</Button>
        </Card>

        {/* Transaction PIN */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Lock className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Transaction PIN</h3>
              <p className="text-[13px] text-ink-soft">Required for transfers & bills</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            Your 4-digit PIN is used to authorise money leaving your wallet. It is never stored on this device.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="secondary" onClick={() => setPinOpen(true)}>Reset PIN</Button>
            <Badge tone="green">PIN set</Badge>
          </div>
        </Card>

        {/* 2FA */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Two-Factor Authentication</h3>
              <p className="text-[13px] text-ink-soft">Extra layer when signing in</p>
            </div>
          </div>
          <div className="mt-4">
            <Toggle
              checked={twoFa}
              onChange={(v) => {
                setTwoFa(v)
                toast.success(v ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
              }}
              label="Authenticator app (recommended)"
              description="Require a one-time code from your authenticator app on login."
            />
          </div>
        </Card>

        {/* Devices */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><MonitorSmartphone className="h-5 w-5" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Devices</h3>
              <p className="text-[13px] text-ink-soft">{devicesState.length} active session{devicesState.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {devicesState.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-xl border border-line-soft px-3 py-2.5">
                <d.icon className="h-4.5 w-4.5 h-5 w-5 text-ink-faint" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                  <p className="text-xs text-ink-faint">{d.current ? 'This device · ' : ''}Active {timeAgo(d.last)}</p>
                </div>
                {d.current ? (
                  <Badge tone="green">Current</Badge>
                ) : (
                  <button
                    onClick={() => {
                      setDevicesState((ds) => ds.filter((x) => x.id !== d.id))
                      toast.success('Device signed out')
                    }}
                    className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-red-50 hover:text-status-danger"
                    aria-label="Sign out device"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="danger"
            className="mt-4"
            onClick={() => setLogoutAllOpen(true)}
          >
            Log out all devices
          </Button>
        </Card>
      </div>

      {/* Login activity */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-ink">Login activity</h3>
          <p className="text-[13px] text-ink-soft">Recent access to your account.</p>
        </div>
        <div className="px-3 pb-4 pt-2">
          {loginActivity.map((a, i) => (
            <div key={i} className={cn('flex items-center gap-3 rounded-xl px-3 py-3', a.action === 'Failed login attempt' && 'bg-red-50/50')}>
              <span className={cn('h-2 w-2 shrink-0 rounded-full', a.action === 'Failed login attempt' ? 'bg-status-danger' : 'bg-status-success')} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-medium', a.action === 'Failed login attempt' ? 'text-status-danger' : 'text-ink')}>{a.action}</p>
                <p className="text-xs text-ink-faint">{a.device} · {a.ip}</p>
              </div>
              <span className="text-xs text-ink-faint">{formatDateTime(a.at)}</span>
            </div>
          ))}
        </div>
      </Card>

      <button
        onClick={() => {
          toast('Simulating a session timeout…')
          setTimeout(() => navigate('/session-expired'), 900)
        }}
        className="flex items-center gap-2 text-[13px] text-ink-faint transition-colors hover:text-ink-soft"
      >
        <TimerReset className="h-4 w-4" /> Simulate session expiry (demo)
      </button>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
      <ResetPinModal open={pinOpen} onClose={() => setPinOpen(false)} />
      <LogoutAllModal
        open={logoutAllOpen}
        onClose={() => setLogoutAllOpen(false)}
        onDone={() => {
          setLogoutAllOpen(false)
          toast.success('All other devices signed out')
        }}
      />
    </div>
  )
}

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [npw, setNpw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    if (npw.length < 8) return setErr('New password must be at least 8 characters.')
    if (npw !== confirm) return setErr('Passwords do not match.')
    setErr('')
    onClose()
    toast.success('Password updated successfully')
  }
  return (
    <Modal open={open} onClose={onClose} title="Change password">
      <div className="space-y-4">
        <div><Label>Current password</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" /></div>
        <div><Label>New password</Label><Input type="password" value={npw} onChange={(e) => setNpw(e.target.value)} placeholder="Min. 8 characters" /></div>
        <div><Label>Confirm new password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" /></div>
        <FieldError>{err}</FieldError>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Update password</Button>
        </div>
      </div>
    </Modal>
  )
}

function ResetPinModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    if (pin !== '1234') return setErr('Demo PIN is 1234.')
    onClose()
    toast.success('Transaction PIN reset. Use 1234 for the demo.')
  }
  return (
    <Modal open={open} onClose={onClose} title="Reset transaction PIN" subtitle="Set a new 4-digit PIN.">
      <div className="space-y-4">
        <div className="flex justify-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex h-14 w-12 items-center justify-center rounded-xl border-2 border-line text-2xl font-bold tabular">{pin[i] ? '•' : ''}</span>
          ))}
        </div>
        <input autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="sr-only" inputMode="numeric" aria-label="New PIN" />
        <FieldError>{err}</FieldError>
        <p className="text-center text-[13px] text-ink-soft">Demo PIN is <span className="font-mono font-semibold">1234</span></p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Reset PIN</Button>
        </div>
      </div>
    </Modal>
  )
}

function LogoutAllModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Log out all devices?" subtitle="You will stay signed in on this device.">
      <p className="text-sm text-ink-soft">This signs out every other session where your account is active. You'll need to sign in again on those devices.</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onDone}>Log out all devices</Button>
      </div>
    </Modal>
  )
}
