import { Link } from 'react-router-dom'
import { Logo } from '../components/common/Logo'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 text-center">
      <Logo size={44} className="mb-8" />
      <p className="font-mono text-5xl font-extrabold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">The page you are looking for doesn't exist or has moved.</p>
      <div className="mt-6 flex gap-2">
        <Link to="/" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm">Go home</Link>
        <Link to="/login" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">Sign in</Link>
      </div>
    </div>
  )
}
