import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Badge } from '../ui'
import type { Env, MerchantPaymentStatus } from '../../types/merchant'

export function CodeBlock({ code, language = 'json', title, className }: { code: string; language?: string; title?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* ignore */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-ink/10 bg-[#0B1220] text-left', className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs text-white/60">
          {title ?? language}
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">{language}</span>
        </span>
        <button onClick={copy} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-[#E5E7EB]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function EnvBadge({ env }: { env: Env }) {
  return (
    <Badge tone={env === 'sandbox' ? 'blue' : 'green'} dot>
      {env === 'sandbox' ? 'Sandbox' : 'Live'}
    </Badge>
  )
}

export function MethodChip({ method }: { method: 'GET' | 'POST' }) {
  return (
    <span
      className={cn(
        'inline-flex w-14 justify-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold',
        method === 'GET' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700',
      )}
    >
      {method}
    </span>
  )
}

const mpTone: Record<MerchantPaymentStatus, 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple'> = {
  initialized: 'gray',
  pending: 'amber',
  successful: 'green',
  failed: 'red',
  reversed: 'blue',
  refunded: 'purple',
  partially_refunded: 'purple',
}

export function MerchantPaymentBadge({ status }: { status: MerchantPaymentStatus }) {
  const label = status.replace('_', ' ')
  return <Badge tone={mpTone[status] ?? 'gray'}>{label.charAt(0).toUpperCase() + label.slice(1)}</Badge>
}

export const sandboxBaseUrl = 'https://sandbox-api.haighapay.com/v1'
export const liveBaseUrl = 'https://api.haighapay.com/v1'
