import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { Bell, ChevronDown, Home, LayoutGrid, LifeBuoy, LogOut, ReceiptText, Send, Settings, Store, UserCircle2, Wallet, BadgeCheck, ShieldCheck, X, CheckCheck } from 'lucide-react'
import { Logo } from '../components/common/Logo'
import { Avatar } from '../components/ui'
import { cn } from '../lib/cn'
import { useAppStore, useCurrentUser, useUserNotifications } from '../store/appStore'
import { timeAgo } from '../lib/format'
import { toast } from 'sonner'

const navItems = [
  { to: '/app', label: 'Home', icon: Home },
  { to: '/app/business', label: 'Business', icon: Store },
  { to: '/app/payments', label: 'Payments', icon: LayoutGrid },
  { to: '/app/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/support', label: 'Support', icon: LifeBuoy },
]

const bottomNav = [
  { to: '/app', label: 'Home', icon: Home },
  { to: '/app/payments', label: 'Payments', icon: LayoutGrid },
  { to: '/app/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/app/profile', label: 'Profile', icon: UserCircle2 },
]

export function UserLayout() {
  const [open, setOpen] = useState<'none' | 'bell' | 'avatar'>('none')
  const popRef = useRef<HTMLDivElement>(null)
  const user = useCurrentUser()
  const logout = useAppStore((s) => s.logout)
  const markRead = useAppStore((s) => s.markNotificationRead)
  const markAll = useAppStore((s) => s.markAllNotificationsRead)
  const navigate = useNavigate()
  const location = useLocation()

  const notifs = useUserNotifications()
  const unreadCount = notifs.filter((n) => !n.read).length
  const recent = notifs.slice(0, 6)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen('none')
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => setOpen('none'), [location.pathname])

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Haigha User'

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-4 sm:px-6">
          <Link to="/app" className="shrink-0">
            <Logo size={36} />
          </Link>
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-soft text-brand' : 'text-ink-soft hover:bg-canvas hover:text-ink',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2" ref={popRef}>
            {/* Settings shortcut */}
            <Link
              to="/app/settings"
              title="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setOpen(open === 'bell' ? 'none' : 'bell')}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-haigha-red px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {open === 'bell' && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-pop animate-scale-in">
                  <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
                    <p className="text-sm font-semibold text-ink">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAll('user')
                          toast.success('All notifications marked as read')
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recent.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-soft">No notifications yet.</p>}
                    {recent.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          markRead(n.id, 'user')
                          navigate('/app/notifications')
                        }}
                        className={cn('block w-full border-b border-line-soft/60 px-4 py-3 text-left transition-colors hover:bg-canvas', !n.read && 'bg-brand-soft/40')}
                      >
                        <div className="flex items-start gap-2.5">
                          {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                          <span className={cn(!n.read && 'pl-0')}>
                            <span className="block text-[13px] font-medium text-ink">{n.title}</span>
                            <span className="mt-0.5 line-clamp-2 block text-xs text-ink-soft">{n.body}</span>
                            <span className="mt-1 block text-[11px] text-ink-faint">{timeAgo(n.createdAt)}</span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Link
                    to="/app/notifications"
                    className="block border-t border-line-soft px-4 py-2.5 text-center text-[13px] font-medium text-brand hover:bg-canvas"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div className="relative">
              <button
                onClick={() => setOpen(open === 'avatar' ? 'none' : 'avatar')}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-1.5 shadow-sm ring-1 ring-line transition hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 sm:pr-2"
              >
                <Avatar firstName={user?.firstName ?? 'H'} lastName={user?.lastName} size="sm" className="ring-2 ring-white" />
                <span className="hidden text-left lg:block">
                  <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight text-ink">{fullName}</span>
                  <span className="block text-[11px] text-ink-soft">{user?.id ?? 'Customer'}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-ink-faint lg:block" />
              </button>
              {open === 'avatar' && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-pop animate-scale-in">
                  <div className="border-b border-line-soft px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{fullName}</p>
                    <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                  </div>
                  {[
                    { to: '/app/settings', label: 'Settings', icon: Settings },
                    { to: '/app/business', label: 'Business & API', icon: Store },
                    { to: '/app/profile', label: 'My Profile', icon: UserCircle2 },
                    { to: '/app/profile/kyc', label: 'KYC Verification', icon: BadgeCheck },
                    { to: '/app/profile/security', label: 'Security', icon: ShieldCheck },
                    { to: '/app/support', label: 'Help & Support', icon: LifeBuoy },
                  ].map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                    >
                      <it.icon className="h-4 w-4" />
                      {it.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout()
                      navigate('/login')
                      toast.info('Signed out of your Haigha Pay account')
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-line-soft px-4 py-2.5 text-[13px] font-medium text-status-danger transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 sm:px-6 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur md:hidden">
        <div className="relative mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {bottomNav.slice(0, 2).map(({ to, label, icon: Icon }) => (
            <NavItem to={to} icon={Icon} label={label} key={to} />
          ))}
          <div className="relative -mt-6 flex h-16 w-16 items-center justify-center">
            <Link
              to="/app/transfer"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-brand/20 transition-transform active:scale-95"
              aria-label="Send money"
            >
              <Send className="h-6 w-6" />
            </Link>
          </div>
          {bottomNav.slice(2).map(({ to, label, icon: Icon }) => (
            <NavItem to={to} icon={Icon} label={label} key={to} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn('flex w-16 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors', isActive ? 'text-brand' : 'text-ink-soft')
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.4]')} />
          {label}
        </>
      )}
    </NavLink>
  )
}
