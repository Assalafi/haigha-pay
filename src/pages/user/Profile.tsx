import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, ChevronRight, Mail, Phone, Save, ShieldCheck, Smartphone, UserRound } from 'lucide-react'
import { Avatar, Badge, Button, Card, FieldError, Input, Label, PageHeader, Toggle } from '../../components/ui'
import { useAppStore, useCurrentUser } from '../../store/appStore'
import { formatDate } from '../../lib/format'
import { cn } from '../../lib/cn'
import { toast } from 'sonner'

export default function Profile() {
  const user = useCurrentUser()
  const updateProfile = useAppStore((s) => s.updateProfile)
  const hide = useAppStore((s) => s.hideBalance)
  const toggleHide = useAppStore((s) => s.toggleHideBalance)
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', address: user?.address ?? '' })
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSms, setNotifSms] = useState(true)
  const [promos, setPromos] = useState(false)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const saveProfile = () => {
    setErr('')
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) return setErr('First and last names are required.')
    setSaving(true)
    setTimeout(() => {
      updateProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), address: form.address.trim() })
      setSaving(false)
      toast.success('Profile updated successfully')
    }, 600)
  }

  const kyc = user.kycStatus === 'verified'
  const kycTone = user.kycStatus === 'verified' ? 'green' : user.kycStatus === 'in_review' ? 'amber' : user.kycStatus === 'rejected' ? 'red' : 'gray'

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader title="Profile" subtitle="Manage your personal information and account settings." />

      {/* Header card */}
      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar firstName={user.firstName} lastName={user.lastName} size="xl" color={user.avatarColor} />
        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            {user.firstName} {user.lastName}
            {kyc && <BadgeCheck className="h-5 w-5 text-status-info" />}
          </h2>
          <p className="text-sm text-ink-soft">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={user.status === 'active' ? 'green' : user.status === 'restricted' ? 'amber' : 'red'} dot>
              {user.status}
            </Badge>
            <Badge tone="brand">ID {user.id}</Badge>
            <span className="text-[13px] text-ink-faint">Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/app/profile/security"><Button variant="secondary">Security</Button></Link>
          <Link to="/app/profile/kyc"><Button>KYC</Button></Link>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Personal */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Personal Information</h3>
            <p className="mt-0.5 text-[13px] text-ink-soft">Update your legal name and address.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Home address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city, state" />
              </div>
            </div>
            <FieldError>{err}</FieldError>
            <div className="mt-5">
              <Button onClick={saveProfile} loading={saving} icon={<Save className="h-4 w-4" />}>Save changes</Button>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Contact Information</h3>
            <p className="mt-0.5 text-[13px] text-ink-soft">Used for receipts and security alerts. Contact support to change these.</p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-line-soft px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Mail className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-medium text-ink">{user.email}</p>
                  <p className="text-xs text-ink-soft">Email address</p>
                </div>
                <Badge tone="green" className="ml-auto">Verified</Badge>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-line-soft px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Smartphone className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-medium text-ink">{user.phone}</p>
                  <p className="text-xs text-ink-soft">Phone number</p>
                </div>
                <Badge tone="green" className="ml-auto">Verified</Badge>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Preferences</h3>
            <p className="mt-0.5 text-[13px] text-ink-soft">Control how Haigha Pay works for you.</p>
            <div className="mt-4 divide-y divide-line-soft/70">
              <Toggle checked={hide} onChange={toggleHide} label="Hide balance by default" description="Require you to tap the eye icon to reveal amounts." />
              <Toggle checked={notifEmail} onChange={setNotifEmail} label="Email notifications" description="Payment confirmations and security alerts by email." />
              <Toggle checked={notifSms} onChange={setNotifSms} label="SMS notifications" description="Critical security alerts by SMS." />
              <Toggle checked={promos} onChange={setPromos} label="Promotions & offers" description="Occasional deals on data, airtime and more." />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* KYC status */}
          <Card className={cn('p-6', kyc && 'bg-gradient-to-br from-brand-soft/70 to-white')}>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-brand" />
              <h3 className="text-[15px] font-semibold text-ink">KYC Verification</h3>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">
              {kyc ? `KYC Level ${user.kycLevel} — Verified` : user.kycStatus === 'in_review' ? 'In Review' : 'Not completed'}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              {kyc ? 'Your identity is verified. Enjoy full access and higher limits.' : user.kycStatus === 'in_review' ? 'We are reviewing your documents. This usually takes under 24 hours.' : 'Complete verification to increase your transaction limits.'}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-line/60">
              <div className="h-full rounded-full bg-brand" style={{ width: user.kycStatus === 'verified' ? '100%' : user.kycStatus === 'in_review' ? '66%' : '15%' }} />
            </div>
            <ul className="mt-4 space-y-1.5 text-[13px] text-ink-soft">
              {kyc ? (
                <>
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Increased transaction limits</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Full transfer access</li>
                </>
              ) : (
                <>
                  <li>Verification opens higher limits</li>
                  <li>One-time process, takes ~2 minutes</li>
                </>
              )}
            </ul>
            <Link to="/app/profile/kyc" className="mt-4 block">
              <Button variant={kyc ? 'secondary' : 'primary'} className="w-full">
                {kyc ? 'View verification details' : 'Complete KYC'}
              </Button>
            </Link>
          </Card>

          {/* Quick links */}
          <Card className="overflow-hidden p-2">
            {[
              { to: '/app/profile/security', label: 'Security settings', sub: 'Password, PIN, 2FA & devices', icon: ShieldCheck },
              { to: '/app/profile/kyc', label: 'KYC & limits', sub: 'Identity documents', icon: UserRound },
              { to: '/app/beneficiaries', label: 'Beneficiaries', sub: `${'0'} saved recipients`, icon: UserRound },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-canvas">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas text-ink-soft"><l.icon className="h-5 w-5" /></span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-ink">{l.label}</span>
                  <span className="block text-xs text-ink-faint">{l.sub}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ink-faint" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
