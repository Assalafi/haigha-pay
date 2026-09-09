import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Banknote,
  Bell,
  Check,
  Eye,
  Landmark,
  Lock,
  Mail,
  Menu,
  PhoneCall,
  ReceiptText,
  Send,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { Logo } from '../../components/common/Logo'
import { Avatar } from '../../components/ui'
import { money } from '../../lib/format'
import { cn } from '../../lib/cn'

export default function Landing() {
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
          <Logo size={42} />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
            {[
              ['Features', '#features'],
              ['Security', '#security'],
              ['Developers', '/developers'],
              ['Contact', '#contact'],
            ].map(([label, href]) =>
              href.startsWith('/') ? (
                <Link key={label} to={href} className="transition-colors hover:text-brand">
                  {label}
                </Link>
              ) : (
                <a key={href} href={href} className="transition-colors hover:text-brand">
                  {label}
                </a>
              ),
            )}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-canvas">
              Log in
            </Link>
            <Link to="/register" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
              Create Account
            </Link>
          </div>
          <button onClick={() => setMobileNav(!mobileNav)} className="rounded-lg p-2 text-ink md:hidden" aria-label="Menu">
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileNav && (
          <div className="border-t border-line bg-white px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <a href="#features">Features</a>
              <a href="#security">Security</a>
              <a href="#contact">Contact</a>
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="flex-1 rounded-xl border border-line py-2.5 text-center text-sm font-semibold">
                  Log in
                </Link>
                <Link to="/register" className="flex-1 rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white">
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-soft via-white to-white" />
        <div className="absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-brand-green/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3.5 py-1.5 text-[13px] font-medium text-brand shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
              Nigerian payments, built for everyday life
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[54px]">
              Simple payments.
              <br />
              Secure transactions.
              <br />
              <span className="text-brand">Built for everyday life.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Send money, fund your wallet, pay bills and manage your transactions from one secure platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand px-7 text-base font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark active:scale-[0.99]"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex h-[52px] items-center justify-center rounded-2xl border-2 border-brand/25 bg-white px-7 text-base font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft/40"
              >
                Sign In
              </button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-[13px] text-ink-soft">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand" /> PCI-DSS Secure
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-brand" /> Instant settlement
              </div>
              <div className="flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-brand" /> Bank-grade
              </div>
            </div>
          </div>

          {/* Device mockup */}
          <div className="relative mx-auto w-full max-w-md animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-brand/15 to-brand-green/10 blur-2xl" />
            <div className="relative rounded-[36px] border border-line bg-white p-5 shadow-pop">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar firstName="I" lastName="Ali" size="sm" />
                  <div>
                    <p className="text-[13px] font-semibold leading-tight">Ibrahim Ali</p>
                    <p className="text-[11px] text-ink-faint">Wallet ID · WLT-004102</p>
                  </div>
                </div>
                <span className="relative rounded-full bg-canvas p-2 text-ink-soft">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-haigha-red" />
                </span>
              </div>
              {/* wallet card */}
              <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green via-brand to-brand-deep p-5 text-white brand-grid">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">Available Balance</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-2xl font-extrabold tabular">{money(248500)}</p>
                  <Eye className="h-4 w-4 text-white/60" />
                </div>
                <p className="mt-4 font-mono text-[11px] text-white/60">WLT-004102</p>
                <div className="absolute bottom-4 right-4 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold text-white">HAIGHA PAY</div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { icon: Wallet, label: 'Fund' },
                  { icon: Send, label: 'Send' },
                  { icon: ReceiptText, label: 'Bills' },
                  { icon: Banknote, label: 'Cards' },
                ].map((a) => (
                  <button key={a.label} className="flex flex-col items-center gap-1.5 rounded-xl bg-canvas py-3 transition-colors hover:bg-brand-soft">
                    <a.icon className="h-5 w-5 text-brand" />
                    <span className="text-[10px] font-medium text-ink-soft">{a.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold text-ink-soft">Recent transactions</p>
                {[
                  { name: 'Wallet Funding', sub: 'Today · 09:23', amt: '+₦50,000', tone: 'text-brand' },
                  { name: 'Musa Ibrahim', sub: 'Yesterday · 10:42', amt: '-₦22,000', tone: 'text-ink' },
                  { name: 'Airtime Top-up', sub: 'Mon · 08:15', amt: '-₦5,000', tone: 'text-ink' },
                ].map((t) => (
                  <div key={t.name} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-canvas">
                    <div>
                      <p className="text-[13px] font-medium">{t.name}</p>
                      <p className="text-[11px] text-ink-faint">{t.sub}</p>
                    </div>
                    <p className={cn('text-[13px] font-bold tabular', t.tone)}>{t.amt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-10 text-center md:grid-cols-4">
          {[
            ['₦84m+', 'Processed daily'],
            ['8,200+', 'Active customers'],
            ['99.9%', 'Payment success'],
            ['24/7', 'Support & monitoring'],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-2xl font-extrabold text-brand md:text-3xl">{v}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Why Haigha Pay</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything money, in one place</h2>
          <p className="mt-3 text-ink-soft">From funding your wallet to paying bills, every action is fast, clear and secure.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Wallet, title: 'Smart wallet', body: 'Track balances, spending and history with instant updates and one-tap actions.' },
            { icon: Send, title: 'Instant transfers', body: 'Send money to any Nigerian bank or another Haigha Pay user in seconds.' },
            { icon: ReceiptText, title: 'Pay any bill', body: 'Airtime, data, electricity, cable TV, internet and education — all in one app.' },
            { icon: TrendingUp, title: 'Real-time visibility', body: 'Know exactly when a payment succeeds, is pending or needs your attention.' },
            { icon: ShieldCheck, title: 'Security first', body: 'Transaction PIN, biometric login, 2FA and continuous fraud monitoring.' },
            { icon: Bell, title: 'Smart alerts', body: 'Instant notifications for every credit, debit and security event.' },
          ].map((f) => (
            <div key={f.title} className="group rounded-2xl border border-line-soft bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-pop">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment powered */}
      <section className="bg-brand-deep py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 text-center">
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium">
            <Zap className="h-4 w-4 text-brand-green" /> Payment processing powered by ZainPay integration
          </span>
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight">Every payment is processed through a gateway built for reliability and speed</h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-8 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-green" /> Encrypted transactions</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-green" /> Webhook verification</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-brand-green" /> Automatic reconciliation</span>
          </div>
        </div>
      </section>

      {/* Security band */}
      <section id="security" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2">
        <div className="relative">
          <div className="rounded-3xl border border-line bg-canvas p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-brand" />
              <div>
                <p className="text-lg font-bold">Bank-grade security</p>
                <p className="text-sm text-ink-soft">Protection on every layer</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                ['256-bit encryption', 'All data encrypted in transit and at rest.'],
                ['Transaction PIN', 'Approve every send with your PIN.'],
                ['Device management', 'See and control every logged-in device.'],
                ['Instant alerts', 'Immediately notified of suspicious activity.'],
              ].map(([t, b]) => (
                <div key={t} className="rounded-xl border border-line bg-white p-4">
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="mt-1 text-[13px] text-ink-soft">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your money is protected like it is our own.</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Haigha Pay uses bank-grade security practices, gives you full control of your devices, and never stores your transaction PIN or secret keys on your device.
          </p>
          <ul className="mt-6 space-y-3">
            {['Transaction PIN required for sensitive actions', 'Log out all devices from anywhere', 'Session controls for admin operations', 'Status never communicated by colour alone'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50"><Check className="h-3.5 w-3.5 text-brand" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="mx-auto max-w-4xl px-5 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-brand-deep px-6 py-14 text-center text-white sm:px-14">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to pay the simple way?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">Create your free account in under two minutes. No paperwork, no waiting.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-7 font-semibold text-brand transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
            <Link to="/contact-support" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/30 px-7 font-semibold text-white hover:bg-white/10 sm:w-auto">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size={36} />
            <p className="mt-4 max-w-sm text-sm text-ink-soft">
              Haigha Pay is a modern Nigerian digital wallet. Simple payments, secure transactions — built for everyday life.
            </p>
            <p className="mt-4 text-[13px] text-ink-faint">This is a click-through prototype. No real funds move and no payment is processed.</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li><a href="#features" className="hover:text-brand">Features</a></li>
              <li><a href="#security" className="hover:text-brand">Security</a></li>
              <li><Link to="/register" className="hover:text-brand">Create account</Link></li>
              <li><Link to="/developers" className="hover:text-brand">Developers & API</Link></li>
              <li><Link to="/app/settings/api" className="hover:text-brand">Developer tools</Link></li>
              <li><Link to="/admin/login" className="hover:text-brand">Operations Console</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@haighapay.ng</li>
              <li className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /> +234 700 000 0000</li>
              <li className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> 24/7 in-app chat</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-[13px] text-ink-faint">
          © 2026 Haigha Pay · Prototype build — powered by ZainPay (demo only)
        </div>
      </footer>
    </div>
  )
}
