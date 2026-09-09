import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, BookOpen, Menu, Search, X } from 'lucide-react'
import { Logo } from '../components/common/Logo'
import { cn } from '../lib/cn'

const groups: { label: string; items: { to: string; label: string }[] }[] = [
  {
    label: 'Getting Started',
    items: [
      { to: '/developers/introduction', label: 'Introduction' },
      { to: '/developers/environments', label: 'Environments' },
      { to: '/developers/authentication', label: 'Authentication' },
      { to: '/developers/quickstart', label: 'Quick Start' },
    ],
  },
  {
    label: 'Payments',
    items: [
      { to: '/developers/payments', label: 'Initialize Payment' },
      { to: '/developers/verification', label: 'Verify Payment' },
      { to: '/developers/payment-details', label: 'Get & List Payments' },
    ],
  },
  {
    label: 'Money Movement',
    items: [
      { to: '/developers/refunds', label: 'Refunds' },
      { to: '/developers/webhooks', label: 'Webhooks' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { to: '/developers/errors', label: 'Errors & Status Codes' },
      { to: '/developers/testing', label: 'Sandbox & Testing' },
      { to: '/developers/sdk', label: 'SDKs & Libraries' },
      { to: '/developers/changelog', label: 'Changelog' },
    ],
  },
]

export function DeveloperLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => setMobileOpen(false), [location.pathname])

  const allItems = groups.flatMap((g) => g.items)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs…"
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-brand-green"
          />
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {q ? (
          <div className="space-y-0.5">
            {allItems.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).map((i) => (
              <button key={i.to} onClick={() => { setQ(''); navigate(i.to) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10">
                <BookOpen className="h-4 w-4 text-brand-green" /> {i.label}
              </button>
            ))}
            {allItems.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).length === 0 && (
              <p className="px-3 text-sm text-white/40">No documentation found for “{q}”.</p>
            )}
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{g.label}</p>
              <div className="space-y-0.5">
                {g.items.map((it) => (
                  <NavLink key={it.to} to={it.to} className={({ isActive }) => cn('flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors', isActive ? 'bg-brand-green/20 font-semibold text-brand-green' : 'text-white/70 hover:bg-white/10 hover:text-white')}>
                    {it.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))
        )}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/app/settings/api" className="flex items-center justify-center gap-2 rounded-xl bg-brand-green px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand">
          Developer tools in app <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0B1220]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0D1526]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-white/70 hover:bg-white/10 xl:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <Link to="/developers/introduction"><Logo size={34} /></Link>
          <span className="rounded-full border border-brand-green/40 bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-green">Developer Docs</span>
          <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-white/60 lg:flex">
            <Link to="/developers/introduction" className="hover:text-white">Guides</Link>
            <Link to="/developers/payments" className="hover:text-white">API Reference</Link>
            <Link to="/developers/webhooks" className="hover:text-white">Webhooks</Link>
            <Link to="/developers/sdk" className="hover:text-white">SDKs</Link>
            <Link to="/developers/changelog" className="hover:text-white">Changelog</Link>
          </nav>
          <Link to="/" className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/60 hover:bg-white/10 hover:text-white sm:block">Back to site</Link>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-[#0D1526]">{sidebar}</aside>
        </div>
      )}
      <aside className="fixed inset-y-16 left-0 z-20 hidden w-72 overflow-y-auto border-r border-white/10 bg-[#0D1526] xl:block">{sidebar}</aside>

      <div className="xl:pl-72">
        <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
