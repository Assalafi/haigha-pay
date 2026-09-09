import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { AuthShell, BrandPanelMessage, DemoCredentials } from '../../components/common/AuthShell'
import { Button, FieldError, Input, Label } from '../../components/ui'
import { useAppStore } from '../../store/appStore'
import { toast } from 'sonner'

export default function Login() {
  const [identifier, setIdentifier] = useState('user@haighapay.demo')
  const [password, setPassword] = useState('password123')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setActiveUser = useAppStore((s) => s.setActiveUser)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!identifier.trim() || !password) {
      setError('Enter your email/phone and password to continue.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const ok = (identifier.trim() === 'user@haighapay.demo' || identifier.trim() === '+2348034567890') && password === 'password123'
      if (!ok) {
        setLoading(false)
        setError('We could not sign you in. Check your email/phone and password, then try again.')
        return
      }
      setActiveUser('user')
      toast.success('Welcome back, Ibrahim')
      navigate('/app')
    }, 750)
  }

  const fill = (who: 'user' | 'admin') => {
    if (who === 'user') {
      setIdentifier('user@haighapay.demo')
      setPassword('password123')
    } else {
      navigate('/admin/login')
    }
  }

  return (
    <AuthShell side={<BrandPanelMessage />}>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-2 text-ink-soft">Log in to your Haigha Pay account to continue.</p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label>Email or phone number</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@email.com" className="pl-10" autoComplete="username" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="mb-1.5 text-[13px] font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink" aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand" />
          Remember me on this device
        </label>
        <FieldError>{error}</FieldError>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log in
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-[13px] text-ink-faint">
        <span className="h-px flex-1 bg-line" /> Demo access <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => fill('user')} className="rounded-xl border border-brand/25 bg-brand-soft/40 px-3 py-3 text-center transition-colors hover:bg-brand-soft">
          <p className="text-sm font-semibold text-brand">Customer Demo</p>
          <p className="mt-0.5 text-[11px] text-ink-soft">user@haighapay.demo</p>
        </button>
        <button onClick={() => fill('admin')} className="rounded-xl border border-line px-3 py-3 text-center transition-colors hover:bg-canvas">
          <p className="text-sm font-semibold text-ink">Admin Console</p>
          <p className="mt-0.5 text-[11px] text-ink-soft">Separate secure login</p>
        </button>
      </div>
      <DemoCredentials />
      <p className="mt-6 text-center text-sm text-ink-soft">
        New to Haigha Pay?{' '}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
