import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { AuthShell } from '../../components/common/AuthShell'
import { Button, Input, Label } from '../../components/ui'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return
    setLoading(true)
    setTimeout(() => {
      setSent(true)
      setLoading(false)
    }, 700)
  }

  return (
    <AuthShell>
      <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      {!sent ? (
        <>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Reset your password</h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            Enter your account email and we'll send you a secure reset link.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label>Email address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Send reset link
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <MailCheck className="h-7 w-7 text-status-success" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Check your email</h1>
          <p className="mt-2 text-[15px] text-ink-soft">
            We sent a password reset link to <span className="font-semibold text-ink">{email}</span>. The link expires in 30 minutes.
          </p>
          <Link to="/reset-password">
            <Button size="lg" className="mt-7 w-full">
              Continue to reset password
            </Button>
          </Link>
          <button onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-brand hover:underline">
            Use a different email
          </button>
        </div>
      )}
    </AuthShell>
  )
}
