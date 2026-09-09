import { useState } from 'react'
import { KeyRound, Palette, ShieldCheck, SlidersHorizontal, Wallet2, Zap } from 'lucide-react'
import { Badge, Button, Card, Input, Label, PageHeader, Select, Textarea, Toggle } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useAppStore } from '../../store/appStore'
import type { AdminSettings } from '../../store/appStore'
import { toast } from 'sonner'

type Tab = 'general' | 'transactions' | 'gateway' | 'branding' | 'security'

export default function AdminSettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const seedAdminLog = useAppStore((s) => s.seedAdminLog)
  const [tab, setTab] = useState<Tab>('general')
  const [form, setForm] = useState<AdminSettings>(settings)

  const save = (msg = 'Settings saved') => {
    updateSettings(form)
    seedAdminLog({ action: 'Updated Settings', resource: tab, resourceType: 'Settings' })
    toast.success(msg)
  }

  const tabs: { key: Tab; label: string; icon: typeof SlidersHorizontal }[] = [
    { key: 'general', label: 'General', icon: SlidersHorizontal },
    { key: 'transactions', label: 'Transactions', icon: Wallet2 },
    { key: 'gateway', label: 'Payment Gateway', icon: Zap },
    { key: 'branding', label: 'Branding', icon: Palette },
    { key: 'security', label: 'Security', icon: ShieldCheck },
  ]

  const set = (patch: Partial<AdminSettings>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader title="Settings" subtitle="Configure platform-wide preferences." />

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors', tab === t.key ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink')}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="space-y-5 p-6 lg:col-span-2">
          {tab === 'general' && (
            <>
              <Field label="Platform name"><Input value={form.platformName} onChange={(e) => set({ platformName: e.target.value })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Support email"><Input value={form.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} /></Field>
                <Field label="Support phone"><Input value={form.supportPhone} onChange={(e) => set({ supportPhone: e.target.value })} /></Field>
              </div>
              <Field label="Default currency"><Select value={form.currency} onChange={(e) => set({ currency: e.target.value })}><option>NGN</option></Select></Field>
            </>
          )}

          {tab === 'transactions' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Daily transfer limit (₦)"><Input type="number" value={form.dailyLimit} onChange={(e) => set({ dailyLimit: Number(e.target.value) })} /></Field>
                <Field label="Minimum wallet funding (₦)"><Input type="number" value={form.minFunding} onChange={(e) => set({ minFunding: Number(e.target.value) })} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Maximum wallet funding (₦)"><Input type="number" value={form.maxFunding} onChange={(e) => set({ maxFunding: Number(e.target.value) })} /></Field>
                <div className="pt-6">
                  <Toggle checked={form.showTransferFee} onChange={(v) => set({ showTransferFee: v })} label="Show transfer fee to customers" />
                </div>
              </div>
            </>
          )}

          {tab === 'gateway' && (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-brand/15 bg-brand-soft/40 px-4 py-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="text-sm font-semibold text-ink">ZainPay integration preview</p>
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    The frontend only shows masked placeholders. Real secret API keys must never be stored in a React frontend — when backend integration begins, secret keys must remain server-side.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Provider"><Input value={form.gateway.provider} readOnly /></Field>
                <Field label="Environment">
                  <Select value={form.gateway.environment} onChange={(e) => set({ gateway: { ...form.gateway, environment: e.target.value } })}>
                    <option>Sandbox</option>
                    <option>Live</option>
                  </Select>
                </Field>
              </div>
              <div>
                <Label>Integration status</Label>
                <Badge tone="amber" dot>Not Connected</Badge>
                <p className="mt-1 text-[12px] text-ink-faint">Sandbox keys should be configured during backend integration.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Public key"><Input value={form.gateway.publicKey} onChange={(e) => set({ gateway: { ...form.gateway, publicKey: e.target.value } })} className="font-mono text-xs" /></Field>
                <Field label="Secret key" hint="masked — server only"><Input value={form.gateway.secretKey} onChange={(e) => set({ gateway: { ...form.gateway, secretKey: e.target.value } })} className="font-mono text-xs" /></Field>
              </div>
              <Field label="Webhook / callback URL"><Input value={form.gateway.callbackUrl} onChange={(e) => set({ gateway: { ...form.gateway, callbackUrl: e.target.value } })} className="font-mono text-xs" /></Field>
            </>
          )}

          {tab === 'branding' && (
            <>
              <Field label="Primary color"><ColorRow hex={form.brand.primary} onChange={(hex) => set({ brand: { ...form.brand, primary: hex } })} /></Field>
              <Field label="Secondary color"><ColorRow hex={form.brand.secondary} onChange={(hex) => set({ brand: { ...form.brand, secondary: hex } })} /></Field>
              <div>
                <Label>Logo</Label>
                <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line px-5 py-6">
                  <span className="text-sm text-ink-soft">Haigha Pay brand mark (SVG)</span>
                  <Button variant="secondary" size="sm" onClick={() => toast.info('Logo upload simulated')}>Change logo</Button>
                </div>
              </div>
            </>
          )}

          {tab === 'security' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Admin session timeout (minutes)"><Input type="number" value={form.security.sessionTimeout} onChange={(e) => set({ security: { ...form.security, sessionTimeout: Number(e.target.value) } })} /></Field>
                <Field label="Password minimum length"><Input type="number" value={form.security.passwordMinLength} onChange={(e) => set({ security: { ...form.security, passwordMinLength: Number(e.target.value) } })} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="pt-4">
                  <Toggle checked={form.security.twoFactor} onChange={(v) => set({ security: { ...form.security, twoFactor: v } })} label="Require 2FA for admin sign-in" />
                </div>
                <div className="pt-4">
                  <Toggle checked label="Lock admin access on public networks" onChange={() => undefined} disabled />
                </div>
              </div>
              <div className="rounded-xl bg-canvas px-4 py-3 text-[13px] text-ink-soft">
                Failed sign-in lockout after <b>{form.security.lockoutAfter}</b> attempts.
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
            <Button variant="secondary" onClick={() => setForm(settings)}>Discard</Button>
            <Button onClick={() => save()}>Save settings</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink">About this console</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              These settings configure the Haigha Pay platform. All changes here are prototype-only and logged to the audit trail.
            </p>
          </Card>
          <Card className="space-y-2.5 p-5 text-sm">
            <Row k="Provider" v="ZainPay" />
            <Row k="Environment" v={form.gateway.environment} />
            <Row k="Integration" v={<span className="font-medium text-amber-600">Not Connected</span>} />
            <Row k="Currency" v={form.currency} />
            <Row k="Daily limit" v={form.dailyLimit.toLocaleString()} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{k}</span>
      <span className="font-medium text-ink">{v}</span>
    </div>
  )
}

function ColorRow({ hex, onChange }: { hex: string; onChange: (h: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-white" />
      <Input value={hex} onChange={(e) => onChange(e.target.value)} className="w-36 font-mono uppercase" />
      <span className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: hex }}>{hex}</span>
    </div>
  )
}
