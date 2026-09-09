import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeftRight, Bell, BookOpen, ChevronDown, FileCode2, FlaskConical, KeyRound, LayoutDashboard,
  LifeBuoy, LogOut, Menu, Plug2, ReceiptText, RefreshCw, Settings, Users, Wallet2, Webhook, X,
} from 'lucide-react'
import { WordmarkLight } from '../components/common/Logo'
import { Avatar, Badge } from '../components/ui'
import { cn } from '../lib/cn'
import { useAppStore, useCurrentMerchant } from '../store/appStore'
import { toast } from 'sonner'
import { EnvBadge } from '../components/common/DevKit'

const groups: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] }[] = [
  { label: 'Overview', items: [{ to: '/merchant', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    label: 'Payments',
    items: [
      { to: '/merchant/payments', label: 'Transactions', icon: ArrowLeftRight },
      { to: '/merchant/refunds', label: 'Refunds', icon: ReceiptText },
      { to: '/merchant/settlements', label: 'Settlements', icon: Wallet2 },
    ],
  },
  {
    label: 'Developers',
    items: [
      { to: '/merchant/integration', label: 'Integration', icon: Plug2 },
      { to: '/merchant/integration/api-keys', label: 'API Keys', icon: KeyRound },
      { to: '/merchant/integration/webhooks', label: 'Webhooks', icon: Webhook },
      { to: '/merchant/integration/test-console', label: 'Test Console', icon: FlaskConical },
      { to: '/merchant/integration/logs', label: 'API Logs', icon: FileCode2 },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/merchant/team', label: 'Team', icon: Users },
      { to: '/merchant/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function MerchantLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAppStore((s) => s.logout)
  const merchant = useCurrentMerchant()
  const adminNotifs = useAppStore((s) => s.notifications.filter((n) => n.audience === 'admin'))

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
    setBellOpen(false)
  }, [location.pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <WordmarkLight />
      </div>
      <div className="px-5 py-1">
        <div className="rounded-xl bg-white/10 px-3 py-2.5">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-[10px] font-bold">{merchant?.businessName.slice(0, 2).toUpperCase()}</span>
            {merchant?.businessName}
          </p>
          <p className="mt-0.5 pl-8 text-[11px] text-white/50">Merchant · {merchant?.id}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-white text-brand shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <it.icon className="h-[18px] w-[18px] shrink-0" />
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-0.5 border-t border-white/10 p-3">
        <a href="#/developers" onClick={(e) => { e.preventDefault(); navigate('/developers') }} className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <BookOpen className="h-[18px] w-[18px]" /> Documentation
        </a>
        <button onClick={() => { logout(); navigate('/merchant/login') }} className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-brand-deep">{sidebar}</aside>
        </div>
      )}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto bg-brand-deep lg:block">{sidebar}</aside>
      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink-soft hover:bg-canvas lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden font-medium text-ink-soft sm:block">Merchant Portal</span>
            <span className="hidden text-ink-faint sm:block">/</span>
            <span className="font-semibold text-ink">{merchant?.businessName}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <EnvBadge env="sandbox" />
            {merchant && !merchant.liveAccess && merchant.liveRequested && (
              <Badge tone="amber">Live pending review</Badge>
            )}
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-canvas"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {adminNotifs.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-haigha-red" />}
            </button>
            {bellOpen && (
              <div className="absolute right-16 top-14 w-72 rounded-2xl border border-line bg-white py-2 shadow-pop animate-scale-in">
                <p className="px-4 pb-2 pt-1 text-sm font-semibold">Account alerts</p>
                <p className="border-t border-line-soft px-4 py-3 text-[13px] text-ink-soft">No new alerts. Webhook & API health is normal.</p>
              </div>
            )}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-canvas">
                <Avatar firstName={merchant?.businessName ?? 'M'} lastName="" size="sm" color="#086A37" />
                <ChevronDown className="h-4 w-4 text-ink-faint" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white py-1.5 shadow-pop animate-scale-in">
                  <Link to="/merchant/settings" className="block px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-canvas hover:text-ink">Business settings</Link>
                  <Link to="/merchant/integration" className="block px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-canvas hover:text-ink">Integration overview</Link>
                  <Link to="/developers" className="block px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-canvas hover:text-ink">Developer documentation</Link>
                  <button onClick={() => { logout(); navigate('/merchant/login'); toast.info('Signed out') }} className="flex w-full items-center gap-2 border-t border-line-soft px-4 py-2.5 text-[13px] font-medium text-status-danger hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
