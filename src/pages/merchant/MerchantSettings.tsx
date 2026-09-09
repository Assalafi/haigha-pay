import { useState } from 'react'
import { Building2, KeyRound, Landmark, Rocket, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card, Input, Label, Modal, PageHeader, Select, Toggle } from '../../components/ui'
import { useAppStore, useCurrentMerchant } from '../../store/appStore'
import { formatDate } from '../../lib/format'
import { toast } from 'sonner'

export default function MerchantSettings() {
  const merchant = useCurrentMerchant()
  const requestLive = useAppStore((s) => s.requestLiveAccess)
  const [form, setForm] = useState({
    businessName: merchant?.businessName ?? '',
    legalName: merchant?.legalName ?? '',
    website: merchant?.website ?? '',
    industry: merchant?.industry ?? '',
    phone: merchant?.phone ?? '',
  })
  const [twoFa, setTwoFa] = useState(true)
  const [allowedDomains, setAllowedDomains] = useState('greenlinestores.ng')
  const [ipAllowlist, setIpAllowlist] = useState('')
  const [goLive, setGoLive] = useState(false)
  const [requested, setRequested] = useState(merchant?.liveRequested ?? false)

  if (!merchant) return null

  const saveProfile = () => {
    toast.success('Business profile saved')
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Settings" subtitle="Business profile, settlement and API security." />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-4 p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Building2 className="h-4 w-4 text-brand" /> Business profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Business name</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
              <div><Label>Legal name</Label><Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} /></div>
              <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <Button onClick={saveProfile}>Save profile</Button>
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Landmark className="h-4 w-4 text-brand" /> Settlement account</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Settlement bank</Label><Select defaultValue={merchant.settlementBank}>{['Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Moniepoint'].map((b) => <option key={b}>{b}</option>)}</Select></div>
              <div><Label>Account number</Label><Input defaultValue={merchant.settlementAccount} /></div>
            </div>
            <div className="rounded-xl bg-canvas px-4 py-3 text-sm">
              <p className="flex items-center justify-between"><span className="text-ink-soft">Account name</span><span className="font-semibold text-ink">{merchant.settlementAccountName}</span></p>
              <p className="mt-1 flex items-center justify-between"><span className="text-ink-soft">Verified</span><Badge tone="green">Yes</Badge></p>
            </div>
            <Button onClick={() => toast.success('Settlement details saved')}>Save settlement details</Button>
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><KeyRound className="h-4 w-4 text-brand" /> API security</h3>
            <Toggle checked={twoFa} onChange={(v) => { setTwoFa(v); toast.success(v ? '2FA enabled for all team logins' : '2FA disabled') }} label="Require two-factor authentication" description="Every team member must use an authenticator app." />
            <div><Label>Allowed callback domains</Label><Input value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} placeholder="yourdomain.com, *.yourdomain.com" /></div>
            <div><Label>IP allowlist (optional — blank = no restriction)</Label><Input value={ipAllowlist} onChange={(e) => setIpAllowlist(e.target.value)} placeholder="102.89.44.21, 41.79.0.0/16" /></div>
            <p className="flex items-start gap-2 rounded-xl bg-canvas px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> Key expiry, IP allowlists and role-based developer access are future features shown here for the prototype.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink">KYB & go-live</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Row k="KYB status" v={<Badge tone={merchant.kybStatus === 'approved' ? 'green' : 'amber'}>{merchant.kybStatus}</Badge>} />
              <Row k="Environment" v={<Badge tone={merchant.liveAccess ? 'green' : 'blue'} dot>{merchant.liveAccess ? 'Live' : 'Sandbox'}</Badge>} />
              <Row k="Joined" v={formatDate(merchant.createdAt)} />
            </div>
            <div className="mt-5">
              {merchant.liveAccess ? (
                <Badge tone="green">Live payments enabled</Badge>
              ) : requested || merchant.liveRequested ? (
                <div>
                  <Badge tone="amber" dot>Live access pending review</Badge>
                  <p className="mt-2 text-[13px] text-ink-soft">The Haigha Pay team reviews your application before enabling live credentials.</p>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setGoLive(true)} icon={<Rocket className="h-4 w-4" />}>Request live access</Button>
              )}
            </div>
          </Card>
          <Card className="p-5 text-[13px] text-ink-soft">
            <p className="text-sm font-semibold text-ink">Security tips</p>
            <ul className="mt-3 space-y-2">
              <li>· Store secret keys only on your server</li>
              <li>· Rotate keys if you suspect a leak</li>
              <li>· Verify webhook signatures before acting</li>
              <li>· Never log full secret keys</li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal open={goLive} onClose={() => setGoLive(false)} title="Request live access" subtitle="Go-live review checklist">
        <p className="text-sm leading-relaxed text-ink-soft">Before requesting production access, confirm that you have completed sandbox testing, configured webhooks, and tested verification.</p>
        <div className="mt-4 space-y-1.5 text-sm">
          {['Sandbox test payment completed', 'Payment verification tested', 'Webhook configured'].map((c) => (
            <label key={c} className="flex items-center gap-2.5 text-ink"><input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-brand" /> {c}</label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setGoLive(false)}>Cancel</Button>
          <Button onClick={() => { requestLive(merchant.id); setRequested(true); setGoLive(false); toast.success('Live access request submitted', { description: 'The Haigha Pay team will review your business.' }) }} icon={<Rocket className="h-4 w-4" />}>Submit request</Button>
        </div>
      </Modal>
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{k}</span>
      <span>{v}</span>
    </div>
  )
}
