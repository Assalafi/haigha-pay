import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CreditCard,
  FileCode2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Wallet,
  Webhook,
  X,
} from 'lucide-react'
import { WordmarkLight } from '../components/common/Logo'
import { Avatar } from '../components/ui'
import { cn } from '../lib/cn'
import { useAdminNotifications, useAppStore } from '../store/appStore'
import { timeAgo } from '../lib/format'
import { toast } from 'sonner'

const groups: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/merchants', label: 'Merchants', icon: Building2 },
      { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/settlements', label: 'Settlements', icon: Banknote },
      { to: '/admin/wallets', label: 'Wallets', icon: Wallet },
      { to: '/admin/kyc', label: 'KYC', icon: BadgeCheck },
      { to: '/admin/kyb', label: 'KYB', icon: ShieldCheck },
    ],
  },
  {
    label: 'API & Monitoring',
    items: [
      { to: '/admin/api-clients', label: 'API Clients', icon: KeyRound },
      { to: '/admin/api-logs', label: 'API Logs', icon: FileCode2 },
      { to: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
    ],
  },
  {
    label: 'Insights',
    items: [{ to: '/admin/reports', label: 'Reports', icon: BarChart3 }],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapse, setCollapse] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAppStore((s) => s.logout)
  const notifs = useAdminNotifications()
  const unread = notifs.filter((n) => !n.read).length
  const markAll = useAppStore((s) => s.markAllNotificationsRead)

  useEffect(() => {
    setMobileOpen(false)
    setBellOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <WordmarkLight />
        <button onClick={() => setCollapse(!collapse)} className="ml-auto hidden rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:block" aria-label="Collapse sidebar">
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.label}>
            {!collapse && <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{g.label}</p>}
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  title={collapse ? it.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      collapse ? 'h-10 justify-center' : 'h-10',
                      isActive ? 'bg-white text-brand shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <it.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapse && it.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <NavLink
          to="/admin/profile"
          title={collapse ? 'My Profile' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
              collapse ? 'h-10 justify-center' : 'h-10',
              isActive ? 'bg-white text-brand' : 'text-white/70 hover:bg-white/10 hover:text-white',
            )
          }
        >
          <UserCircle2 className="h-[18px] w-[18px]" />
          {!collapse && 'My Profile'}
        </NavLink>
        <button
          title={collapse ? 'Sign Out' : undefined}
          onClick={() => {
            logout()
            navigate('/admin/login')
            toast.info('Signed out of the Operations Console')
          }}
          className={cn(
            'mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white',
            collapse ? 'h-10 justify-center' : 'h-10',
          )}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapse && 'Sign Out'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-brand-deep shadow-xl animate-fade-up">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1 text-white/60 hover:bg-white/10" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden bg-brand-deep lg:block', collapse ? 'w-[76px]' : 'w-64')}>
        {sidebarInner}
      </aside>

      <div className={cn('min-h-screen transition-all', collapse ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink-soft hover:bg-canvas lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden font-medium text-ink-soft sm:block">Operations Console</span>
            <span className="hidden text-ink-faint sm:block">/</span>
            <span className="font-semibold text-ink">{pageTitle(location.pathname)}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" /> ZainPay Sandbox
            </span>
            <div className="relative">
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-canvas"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-haigha-red px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-line bg-white shadow-pop animate-scale-in">
                  <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <button
                      onClick={() => {
                        markAll('admin')
                        toast.success('All notifications marked as read')
                      }}
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifs.slice(0, 7).map((n) => (
                      <Link
                        key={n.id}
                        to="/admin/notifications"
                        className={cn('block border-b border-line-soft/60 px-4 py-3 hover:bg-canvas', !n.read && 'bg-brand-soft/30')}
                      >
                        <p className="flex items-center gap-2 text-[13px] font-medium">
                          {!n.read && <span className="h-2 w-2 rounded-full bg-brand" />}
                          {n.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 pl-4 text-xs text-ink-soft">{n.body}</p>
                        <p className="mt-1 pl-4 text-[11px] text-ink-faint">{timeAgo(n.createdAt)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-canvas"
              >
                <Avatar firstName="A" lastName="Admin" size="sm" color="#086A37" />
                <span className="hidden text-left lg:block">
                  <span className="block text-[13px] font-semibold leading-tight">A. Admin</span>
                  <span className="block text-[11px] text-ink-soft">Super Admin</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-ink-faint lg:block" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-white py-1.5 shadow-pop animate-scale-in">
                  <Link to="/admin/profile" className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-canvas hover:text-ink">
                    <UserCircle2 className="h-4 w-4" /> My Profile
                  </Link>
                  <Link to="/admin/settings" className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-canvas hover:text-ink">
                    <ShieldCheck className="h-4 w-4" /> Security Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      navigate('/admin/login')
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-line-soft px-4 py-2.5 text-[13px] font-medium text-status-danger hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6">{<Outlet />}</main>
      </div>
    </div>
  )
}

function pageTitle(path: string): string {
  if (path === '/admin') return 'Dashboard'
  const map: [string, string][] = [
    ['/merchants', 'Merchants'],
    ['/settlements', 'Settlements'],
    ['/customers', 'Customers'],
    ['/transactions', 'Transactions'],
    ['/payments', 'Payments'],
    ['/wallets', 'Wallets'],
    ['/kyc', 'KYC Review'],
    ['/kyb', 'KYB Review'],
    ['/api-clients', 'API Clients'],
    ['/api-logs', 'API Logs'],
    ['/webhooks', 'Webhooks'],
    ['/reports', 'Reports'],
    ['/notifications', 'Notifications'],
    ['/audit-logs', 'Audit Logs'],
    ['/settings', 'Settings'],
    ['/profile', 'My Profile'],
    ['/login', 'Sign In'],
  ]
  const hit = map.find(([seg]) => path.startsWith('/admin' + seg))
  if (path.includes('/customers/') || path.includes('/transactions/') || path.includes('/payments/') || path.includes('/kyc/') || path.includes('/kyb/') || path.includes('/merchants/')) return 'Details'
  return hit?.[1] ?? 'Overview'
}
