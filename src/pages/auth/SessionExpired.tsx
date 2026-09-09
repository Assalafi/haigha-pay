import { Link, useNavigate } from 'react-router-dom'
import { AlarmClockOff, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui'
import { Logo } from '../../components/common/Logo'

export default function SessionExpired() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5">
      <Logo size={44} className="mb-8" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-card">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/10" style={{ animationDuration: '2s' }} />
        <AlarmClockOff className="relative h-9 w-9 text-brand" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold text-ink">Your session has expired</h1>
      <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-ink-soft">
        For your security, your session timed out after a period of inactivity. Please sign in again to continue.
      </p>
      <div className="mt-6 flex gap-2">
        <Link to="/login"><Button variant="secondary">Customer login</Button></Link>
        <Button onClick={() => navigate('/login')}>Sign in again</Button>
      </div>
      <p className="mt-8 flex items-center gap-1.5 text-[13px] text-ink-faint">
        <ShieldCheck className="h-4 w-4 text-brand" /> Automatic session timeouts protect your account.
      </p>
    </div>
  )
}
