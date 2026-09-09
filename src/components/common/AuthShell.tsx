import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, Zap } from 'lucide-react'
import { Logo } from './Logo'

export function AuthShell({
  children,
  side,
  demoBox,
}: {
  children: React.ReactNode
  side?: React.ReactNode
  demoBox?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-brand-deep lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 brand-grid opacity-40" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-green/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white">
            <Logo size={38} />
          </Link>
        </div>
        <div className="relative z-10 px-10 pb-10">{side}</div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-[54%]">
        <div className="flex justify-between px-6 pt-6 lg:hidden">
          <Link to="/">
            <Logo size={34} />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-10">
          <div className="w-full max-w-md animate-fade-up">
            {demoBox && <div className="mb-6">{demoBox}</div>}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BrandPanelMessage() {
  return (
    <div className="max-w-sm text-white">
      <h2 className="text-3xl font-bold leading-tight">Simple payments. Secure transactions.</h2>
      <p className="mt-3 text-white/70">Send money, fund your wallet, pay bills and manage your transactions from one secure platform.</p>
      <ul className="mt-8 space-y-4">
        {[
          { icon: ShieldCheck, text: 'Bank-grade security on every transaction' },
          { icon: Zap, text: 'Instant wallet funding and transfers' },
          { icon: Lock, text: 'Your money is protected with PIN & 2FA' },
        ].map((f) => (
          <li key={f.text} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <f.icon className="h-5 w-5 text-brand-green" />
            </span>
            <span className="text-sm text-white/80">{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DemoCredentials() {
  return (
    <div className="rounded-2xl border border-dashed border-brand/30 bg-brand-soft/60 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Development demo — remove before production</p>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[13px]">
        <div>
          <p className="font-semibold text-ink">User</p>
          <p className="font-mono text-xs text-ink-soft">user@haighapay.demo</p>
          <p className="font-mono text-xs text-ink-soft">password123</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Admin</p>
          <p className="font-mono text-xs text-ink-soft">admin@haighapay.demo</p>
          <p className="font-mono text-xs text-ink-soft">admin123</p>
        </div>
      </div>
    </div>
  )
}
