import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FlaskConical, Lock, Mail, Rocket } from 'lucide-react'
import { LogoMark } from '../../components/common/Logo'
import { Button, FieldError, Input, Label } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { toast } from 'sonner'

export default function MerchantLogin() {
  const [email, setEmail] = useState('merchant@haighapay.demo')
  const [password, setPassword] = useState('merchant123')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setActiveUser = useAppStore((s) => s.setActiveUser)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = email.trim() === 'merchant@haighapay.demo' && password === 'merchant123'
      if (!ok) {
        setLoading(false)
        setError('We could not sign you in. Use the demo merchant credentials below.')
        return
      }
      setActiveUser('merchant', 'MCH-1001')
      toast.success('Welcome, Greenline Stores Ltd')
      navigate('/merchant')
    }, 750)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-[46%] overflow-hidden bg-brand-deep lg:block">
        <div className="absolute inset-0 brand-grid opacity-30" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LogoMark size={38} />
            <span className="text-lg font-extrabold tracking-tight">Haigha <span className="text-white/70">Pay</span></span>
          </Link>
          <div>
            <FlaskConical className="h-9 w-9 text-brand-green" />
            <h2 className="mt-4 text-3xl font-bold leading-tight">The merchant API for modern Nigerian business</h2>
            <p className="mt-3 max-w-md text-white/70">
              Accept payments on your website, mobile app, ERP or school portal with a clean Haigha-branded API. Underlying processing is powered by ZainPay.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>· Hosted checkout in minutes</li>
              <li>· Sandbox keys for testing</li>
              <li>· Signed webhooks & verification</li>
            </ul>
          </div>
          <p className="text-xs text-white/40">© 2026 Haigha Pay · Merchant Developer Portal</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2"><LogoMark size={36} /><span className="text-lg font-extrabold text-brand">Haigha Pay</span></Link>
          </div>
          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-ink lg:mt-0">Merchant sign in</h1>
          <p className="mt-2 text-ink-soft">Access your dashboard, API keys and live access.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label>Business email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" autoComplete="username" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" loading={loading} size="lg" className="w-full">Sign in to merchant dashboard</Button>
          </form>
          <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3.5 text-[13px] text-amber-800">
            <p className="font-semibold">Demo merchant (development only)</p>
            <p className="mt-0.5 font-mono text-xs">merchant@haighapay.demo · merchant123</p>
          </div>
          <Link to="/merchant/onboarding" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-brand hover:underline">
            <Rocket className="h-4 w-4" /> Register a new business instead
          </Link>
        </div>
      </div>
    </div>
  )
}
