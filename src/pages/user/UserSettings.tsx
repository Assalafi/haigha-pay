import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BellRing, BookOpen, Building2, ChevronRight, Code2, Globe2, KeyRound, LifeBuoy, Mail, ShieldCheck, Smartphone, Wallet } from 'lucide-react'
import { Avatar, Badge, Button, Card, PageHeader, Toggle } from '../../components/ui'
import { useAppStore, useCurrentUser } from '../../store/appStore'
import { formatDate } from '../../lib/format'
import { toast } from 'sonner'

export default function UserSettings() {
  const user = useCurrentUser()
  const hide = useAppStore((s) => s.hideBalance)
  const toggleHide = useAppStore((s) => s.toggleHideBalance)
  const [emailN, setEmailN] = useState(true)
  const [smsN, setSmsN] = useState(true)
  const [promos, setPromos] = useState(false)
  const [biometric, setBiometric] = useState(true)
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="Settings" subtitle="App preferences, account access and developer tools." />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Account */}
          <Card className="overflow-hidden">
            <div className="border-b border-line-soft px-5 py-4">
              <h3 className="text-[15px] font-semibold text-ink">Account</h3>
              <p className="text-[13px] text-ink-soft">Your profile, security and wallet information.</p>
            </div>
            <div className="p-3">
              <Link to="/app/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-canvas">
                <Avatar firstName={user.firstName} lastName={user.lastName} color={user.avatarColor} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-ink-faint">{user.email} · ID {user.id}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-faint" />
              </Link>
              {[
                { to: '/app/profile/security', icon: ShieldCheck, label: 'Security & privacy', sub: 'Password, transaction PIN, 2FA and devices' },
                { to: '/app/profile/kyc', icon: KeyRound, label: 'KYC & limits', sub: `Level ${user.kycLevel} · ${user.kycStatus.replace('_', ' ')}` },
                { to: '/app/notifications', icon: BellRing, label: 'Notifications', sub: 'Transaction, security and system alerts' },
                { to: '/app/support', icon: LifeBuoy, label: 'Help & support', sub: 'FAQs, live chat and contact options' },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-canvas">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-ink-soft"><l.icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{l.label}</p>
                    <p className="text-xs text-ink-faint">{l.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-faint" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Preferences</h3>
            <p className="mt-0.5 text-[13px] text-ink-soft">How Haigha Pay behaves for you.</p>
            <div className="mt-4 divide-y divide-line-soft/70">
              <Toggle checked={hide} onChange={toggleHide} label="Hide balances by default" description="Tap the eye icon to reveal amounts." />
              <Toggle checked={biometric} onChange={setBiometric} label="Biometric / fingerprint sign-in" description="Sign in faster on this device." />
              <Toggle checked={emailN} onChange={setEmailN} label="Email notifications" description="Payment confirmations and security alerts." />
              <Toggle checked={smsN} onChange={setSmsN} label="SMS notifications" description="Critical security alerts." />
              <Toggle checked={promos} onChange={setPromos} label="Promotions & offers" description="Occasional deals on data, airtime and more." />
            </div>
            <div className="mt-5">
              <Button variant="secondary" size="sm" onClick={() => toast.success('Preferences saved (demo)')}>Save preferences</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Developer & API */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-brand-deep p-6 text-white shadow-card brand-grid">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Code2 className="h-5 w-5" /></span>
            <h3 className="mt-4 text-lg font-bold">Developers & API</h3>
            <p className="mt-1 text-sm leading-relaxed text-white/75">
              Manage sandbox API keys, test requests and configure webhooks right here in Settings — no separate account needed.
              Full merchant access unlocks live payments when your business is approved.
            </p>
            <div className="mt-4 grid gap-2">
              <button onClick={() => navigate('/app/business')} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft">
                <span className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Business & API workspace</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/app/settings/api')} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20">
                <span className="flex items-center gap-2"><Code2 className="h-4 w-4" /> Sandbox developer tools</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-1.5 text-[13px] text-white/70">
              <p className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-brand-green" /> Sandbox keys for this account</p>
              <p className="flex items-center gap-2"><Code2 className="h-4 w-4 text-brand-green" /> Test checkout & verification</p>
              <p className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-brand-green" /> Signed webhooks & mock responses</p>
              <p className="flex items-center gap-2"><Wallet className="h-4 w-4 text-brand-green" /> Upgrade to merchant access for live payments & settlements</p>
            </div>
          </div>

          {/* Meta */}
          <Card className="p-5 text-sm text-ink-soft">
            <div className="flex items-center justify-between"><span>Member since</span><span className="font-medium text-ink">{formatDate(user.createdAt)}</span></div>
            <div className="mt-2 flex items-center justify-between"><span>Wallet</span><Badge tone="green" dot>Active</Badge></div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-canvas px-4 py-3 text-[13px]">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              For API queries email partners@haighapay.ng or open the developer documentation.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
