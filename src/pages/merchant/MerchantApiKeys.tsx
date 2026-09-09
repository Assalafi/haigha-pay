import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy, Eye, EyeOff, KeyRound, Lock, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import { Badge, Button, Card, Modal, PageHeader, Toggle } from '../../components/ui'
import { EnvBadge } from '../../components/common/DevKit'
import { useAppStore, useCurrentMerchant, useCurrentMerchantApps, useCurrentMerchantKeys } from '../../store/appStore'
import { formatDate, timeAgo } from '../../lib/format'
import { cn } from '../../lib/cn'
import { toast } from 'sonner'
import type { ApiKey } from '../../types/merchant'

function revealValue(k: ApiKey): string {
  const suffix = k.maskedValue.split('••••••')[1] ?? ''
  const core = k.id.slice(-6)
  return `${k.prefix}${core}${suffix}`
}

export default function MerchantApiKeys() {
  const merchant = useCurrentMerchant()
  const apps = useCurrentMerchantApps()
  const keys = useCurrentMerchantKeys()
  const generate = useAppStore((s) => s.generateSandboxKeys)
  const rotate = useAppStore((s) => s.rotateMerchantKey)
  const revoke = useAppStore((s) => s.revokeMerchantKey)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)
  const [lockOpen, setLockOpen] = useState(false)
  const navigate = useNavigate()

  const copy = async (k: ApiKey) => {
    try {
      await navigator.clipboard.writeText(revealValue(k))
    } catch {
      /* ignore */
    }
    setCopiedId(k.id)
    setTimeout(() => setCopiedId(null), 1100)
    toast.success(revealed[k.id] ? 'Key copied' : 'Public key copied (reveal secret key to copy it)')
  }

  const activeApps = apps.filter((a) => a.status === 'active')

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="API Keys"
        subtitle="Credentials for your sandbox and live environments."
        actions={
          merchant?.liveAccess ? <Badge tone="green" dot>Live enabled</Badge> : merchant?.liveRequested ? <Badge tone="amber">Live pending review</Badge> : null
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-haigha-red" />
        <div className="text-sm text-red-800">
          <p className="font-semibold">Secret keys must never be exposed in frontend JavaScript, mobile apps, or public repositories.</p>
          <p className="mt-0.5 text-red-700">In production your server communicates with the Haigha Pay API. Never publish a secret key.</p>
        </div>
      </div>

      {activeApps.length === 0 && (
        <Card className="p-8 text-center text-sm text-ink-soft">
          Create an API application first from the <button className="font-medium text-brand hover:underline" onClick={() => navigate('/app/business/integration')}>integration overview</button>.
        </Card>
      )}

      {activeApps.map((app) => {
        const appKeys = keys.filter((k) => k.applicationId === app.id)
        const liveKeys = appKeys.filter((k) => k.environment === 'live')
        const sandboxKeys = appKeys.filter((k) => k.environment === 'sandbox')
        const canGenerate = !sandboxKeys.some((k) => k.type === 'secret' && k.status === 'active')
        return (
          <Card key={app.id} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-6 py-4">
              <KeyRound className="h-5 w-5 text-brand" />
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{app.name}</h3>
                <p className="font-mono text-xs text-ink-faint">app_demo_{app.id.toLowerCase()}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge tone="gray">{app.platformType}</Badge>
                <EnvBadge env={app.environment} />
              </div>
            </div>

            <div className="space-y-4 p-6">
              {sandboxKeys.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-ink-soft">Sandbox keys</p>
                  {sandboxKeys.map((k) => (
                    <KeyRow
                      key={k.id}
                      k={k}
                      revealed={!!revealed[k.id]}
                      copied={copiedId === k.id}
                      onToggle={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                      onCopy={() => copy(k)}
                      onRotate={() => { rotate(k.id); toast.success('Key rotated — old key is now inactive') }}
                      onRevoke={() => setRevokeTarget(k)}
                    />
                  ))}
                </div>
              )}

              {canGenerate && (
                <div className="rounded-2xl border border-dashed border-brand/30 bg-brand-soft/30 px-5 py-4">
                  <p className="text-sm font-medium text-ink">Generate sandbox keys for {app.name}</p>
                  <p className="mb-3 text-[13px] text-ink-soft">Creates a new public and secret test key pair.</p>
                  <Button size="sm" onClick={() => { generate(app.id); toast.success('Sandbox keys generated') }} icon={<KeyRound className="h-3.5 w-3.5" />}>Generate sandbox keys</Button>
                </div>
              )}

              {liveKeys.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-ink-soft">Live keys</p>
                  {liveKeys.map((k) => (
                    <KeyRow
                      key={k.id}
                      k={k}
                      revealed={!!revealed[k.id]}
                      copied={copiedId === k.id}
                      onToggle={() => setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))}
                      onCopy={() => copy(k)}
                      onRotate={() => { rotate(k.id); toast.success('Live key rotated') }}
                      onRevoke={() => setRevokeTarget(k)}
                    />
                  ))}
                </div>
              ) : (
                !merchant?.liveAccess && (
                  <button
                    onClick={() => setLockOpen(true)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-line px-5 py-4 text-left transition-colors hover:bg-canvas"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-ink-faint"><Lock className="h-5 w-5" /></span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">Live keys are locked</span>
                      <span className="block text-[13px] text-ink-soft">Complete your go-live checklist and request admin approval to enable live credentials.</span>
                    </span>
                    {merchant?.liveRequested ? <Badge tone="amber">Pending review</Badge> : <Button size="sm" variant="soft" onClick={(e) => { e.stopPropagation(); navigate('/app/business/integration') }}>Request live access</Button>}
                  </button>
                )
              )}
            </div>
          </Card>
        )
      })}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Key management</h3>
          <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
            <li>· Rotate a key if you suspect it was exposed — the old key stops working immediately.</li>
            <li>· Revoke deletes the key permanently. This cannot be undone.</li>
            <li>· Sandbox keys start with <code className="rounded bg-canvas px-1 font-mono">hp_test_</code>; live keys start with <code className="rounded bg-canvas px-1 font-mono">hp_live_</code>.</li>
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Base URLs (proposed until backend finalized)</h3>
          <div className="mt-3 space-y-1.5 text-[13px]">
            <p className="flex items-center justify-between rounded-lg bg-[#0B1220] px-3 py-2 font-mono text-emerald-300">https://sandbox-api.haighapay.com/v1</p>
            <p className="flex items-center justify-between rounded-lg bg-[#0B1220] px-3 py-2 font-mono text-emerald-300">https://api.haighapay.com/v1</p>
          </div>
          <p className="mt-2 text-xs text-ink-faint">Marked as proposed until backend implementation is finalized.</p>
        </Card>
      </div>

      <RevokeModal target={revokeTarget} onClose={() => setRevokeTarget(null)} onConfirm={() => {
        if (!revokeTarget) return
        revoke(revokeTarget.id)
        setRevokeTarget(null)
        toast.success('API key revoked')
      }} />
      <Modal open={lockOpen} onClose={() => setLockOpen(false)} title="Live access" size="sm">
        <p className="text-sm text-ink-soft">
          Live credentials are generated after the Haigha Pay team approves your business. You can request approval from the
          go-live checklist on the integration overview.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setLockOpen(false)}>Close</Button>
          <Button onClick={() => { setLockOpen(false); navigate('/app/business/integration') }}>Open go-live checklist</Button>
        </div>
      </Modal>
    </div>
  )
}

function KeyRow({ k, revealed, copied, onToggle, onCopy, onRotate, onRevoke }: {
  k: ApiKey
  revealed: boolean
  copied: boolean
  onToggle: () => void
  onCopy: () => void
  onRotate: () => void
  onRevoke: () => void
}) {
  const isSecret = k.type === 'secret'
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line-soft p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isSecret ? 'brand' : 'blue'}>{isSecret ? 'Secret' : 'Public'}</Badge>
          {k.status === 'revoked' && <Badge tone="red">Revoked</Badge>}
          <span className="text-xs text-ink-faint">Created {formatDate(k.createdAt)}</span>
          {k.lastUsedAt && <span className="text-xs text-ink-faint">· Used {timeAgo(k.lastUsedAt)}</span>}
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0B1220] px-3.5 py-2.5">
          <span className={cn('flex-1 truncate font-mono text-[13px]', k.status === 'revoked' ? 'text-white/40' : revealed ? 'text-emerald-300' : 'text-white/80')}>
            {revealed ? revealValue(k) : k.maskedValue}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={onToggle} className="rounded p-1 text-white/60 hover:text-white" aria-label="Reveal">
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={onCopy} className="rounded p-1 text-white/60 hover:text-white" aria-label="Copy">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      {k.status === 'active' && (
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onRotate} icon={<RefreshCw className="h-3.5 w-3.5" />}>Rotate</Button>
          <Button variant="danger" size="sm" onClick={onRevoke} icon={<Trash2 className="h-3.5 w-3.5" />}>Revoke</Button>
        </div>
      )}
    </div>
  )
}

function RevokeModal({ target, onClose, onConfirm }: { target: ApiKey | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={!!target} onClose={onClose} title="Revoke API key?" size="sm">
      <p className="text-sm leading-relaxed text-ink-soft">
        Revoking <span className="font-mono text-xs">{target?.maskedValue}</span> will immediately stop requests that use it.
        This action cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Revoke key</Button>
      </div>
    </Modal>
  )
}
