import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { LogoMark } from '../../components/common/Logo'
import { Button, FieldError, Input, Label } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { toast } from 'sonner'

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState('admin@haighapay.demo')
  const [password, setPassword] = useState('admin123')
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
      const ok = identifier.trim() === 'admin@haighapay.demo' && password === 'admin123'
      if (!ok) {
        setLoading(false)
        setError('We could not sign you in. These credentials are restricted to authorised operators only.')
        return
      }
      setActiveUser('admin')
      toast.success('Signed in to the Operations Console')
      navigate('/admin')
    }, 750)
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Dark green side panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-brand-deep lg:block">
        <div className="absolute inset-0 brand-grid opacity-30" />
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white">
            <LogoMark size={38} />
            <span className="text-lg font-extrabold tracking-tight">
              Haigha <span className="text-white/70">Pay</span>
            </span>
          </Link>
          <div>
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck className="h-8 w-8 text-brand-green" />
              <div>
                <p className="text-xl font-bold">Operations Console</p>
                <p className="text-sm text-white/60">Restricted environment for authorised staff only.</p>
              </div>
            </div>
            <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">
              This console monitors customer wallets, transactions and the payment gateway. All operator actions are logged to
              the audit trail.
            </p>
          </div>
          <p className="text-xs text-white/40">© 2026 Haigha Pay · ZainPay Sandbox</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <LogoMark size={36} />
              <span className="text-lg font-extrabold text-brand">Haigha Pay</span>
            </Link>
          </div>
          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-ink lg:mt-0">Admin Sign In</h1>
          <p className="mt-2 text-ink-soft">Sign in to monitor and manage the Haigha Pay platform.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label>Operator email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="pl-10" autoComplete="username" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink" aria-label="Toggle password">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-brand" /> Trust this device
              </label>
              <button type="button" onClick={() => toast.info('Contact your Haigha Pay administrator to reset operator access.')} className="font-medium text-brand hover:underline">
                Need help?
              </button>
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign in to Console
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-800">
            <p className="font-semibold">Demo credentials (development only)</p>
            <p className="mt-0.5 font-mono text-xs">admin@haighapay.demo · admin123</p>
          </div>
          <Link to="/login" className="mt-6 block text-center text-sm text-ink-soft hover:text-brand">
            ← Back to customer login
          </Link>
        </div>
      </div>
    </div>
  )
}
