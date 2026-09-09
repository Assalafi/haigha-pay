import React from 'react'
import { AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CodeBlock, MethodChip } from './DevKit'
import { cn } from '../../lib/cn'

export function H1({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h1 id={id} className="text-3xl font-extrabold tracking-tight text-ink">{children}</h1>
  )
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{children}</p>
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-10 border-b border-line pb-2 text-xl font-bold text-ink">{children}</h2>
  )
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-base font-semibold text-ink">{children}</h3>
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{children}</p>
}

export function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-soft">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md bg-brand-soft px-1.5 py-0.5 font-mono text-[12.5px] text-brand-dark">{children}</code>
}

export function Code({ code, lang = 'json', title }: { code: string; lang?: string; title?: string }) {
  return <div className="mt-4"><CodeBlock code={code} language={lang} title={title} /></div>
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'success' | 'danger'; title?: string; children: React.ReactNode }) {
  const map = {
    info: { cls: 'border-blue-200 bg-blue-50 text-blue-800', icon: Info },
    warn: { cls: 'border-amber-200 bg-amber-50 text-amber-800', icon: AlertTriangle },
    success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
    danger: { cls: 'border-red-200 bg-red-50 text-red-800', icon: Zap },
  }
  const m = map[tone]
  return (
    <div className={cn('mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5', m.cls)}>
      <m.icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-[13.5px] leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

export function Endpoint({ method, path, desc }: { method: 'GET' | 'POST'; path: string; desc: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3">
      <MethodChip method={method} />
      <code className="font-mono text-[13px] text-ink">{path}</code>
      <span className="ml-auto text-[13px] text-ink-soft">{desc}</span>
    </div>
  )
}

export function HeadersCode({ lines }: { lines: string[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl bg-[#0B1220]">
      <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-white/50">Headers</div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-emerald-300">{lines.join('\n')}</pre>
    </div>
  )
}

export function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas/70">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line-soft/70 last:border-0">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-2.5 text-[13px] text-ink">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TryButton({ label = 'Try in Test Console' }: { label?: string }) {
  return (
    <Link to="/merchant/integration/test-console" className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
      <Zap className="h-4 w-4" /> {label}
    </Link>
  )
}
