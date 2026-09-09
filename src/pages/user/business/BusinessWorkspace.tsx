import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight, BookOpen, Building2, FlaskConical, KeyRound, LayoutDashboard, RefreshCw,
  ReceiptText, Scale, Settings2, Users, Wallet2, Webhook,
} from 'lucide-react'
import { EnvBadge } from '../../../components/common/DevKit'
import { useCurrentMerchant } from '../../../store/appStore'
import { cn } from '../../../lib/cn'

const tabs = [
  { to: '/app/business', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/business/payments', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/app/business/reconciliation', label: 'Reconciliation', icon: Scale },
  { to: '/app/business/refunds', label: 'Refunds', icon: ReceiptText },
  { to: '/app/business/settlements', label: 'Settlements', icon: Wallet2 },
  { to: '/app/business/api-keys', label: 'API Keys', icon: KeyRound },
  { to: '/app/business/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/app/business/test-console', label: 'Test Console', icon: FlaskConical },
  { to: '/app/business/logs', label: 'API Logs', icon: RefreshCw },
  { to: '/app/business/integration', label: 'Integration', icon: Settings2 },
  { to: '/app/business/team', label: 'Team', icon: Users },
]

export function BusinessWorkspace() {
  const { pathname } = useLocation()
  const merchant = useCurrentMerchant()

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Identity bar — desktop/tablet only to keep mobile dashboard compact */}
      <div className="hidden flex-wrap items-center gap-4 rounded-2xl border border-line-soft bg-white px-5 py-4 shadow-card md:flex">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white">
          {merchant?.businessName.slice(0, 2).toUpperCase() ?? 'HP'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink">Business</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
              <Building2 className="h-3.5 w-3.5" /> {merchant?.businessName}
            </span>
            <EnvBadge env="sandbox" />
          </div>
          <p className="mt-0.5 text-[13px] text-ink-soft">
            API transactions, reconciliation, settlements and developer tools — all under your Haigha Pay account.
          </p>
        </div>
        <Link to="/developers" className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-brand/40 hover:text-brand">
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> API docs</span>
        </Link>
      </div>

      {/* Sub navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((t) => {
          const active = t.end ? pathname === t.to : pathname.startsWith(t.to)
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                active ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-sm hover:text-ink',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Link>
          )
        })}
      </div>

      <Outlet />
    </div>
  )
}
