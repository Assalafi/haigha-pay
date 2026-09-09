import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { AuthShell } from '../../components/common/AuthShell'
import { Button, FieldError, Input, Label } from '../../components/ui'
import { toast } from 'sonner'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    setTimeout(() => {
      toast.success('Password updated successfully')
      navigate('/login')
    }, 800)
  }

  return (
    <AuthShell>
      <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
        <Lock className="h-6 w-6 text-brand" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Choose a new password</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Your new password must be different from previously used passwords.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <Label>New password</Label>
          <div className="relative">
            <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="pr-10" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink" aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>Confirm new password</Label>
          <Input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-[12px] text-ink-soft">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-brand" /> 8+ characters</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-brand" /> A number</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-brand" /> A symbol</span>
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Update password
        </Button>
      </form>
    </AuthShell>
  )
}
