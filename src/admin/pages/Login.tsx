import { Eye, EyeOff, Info, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { DEMO_ADMIN, isAdminSignedIn, signIn } from '../../lib/auth'
import { buttonClass } from '../../lib/ui'
import { Field, inputClass } from '../components'

export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = params.get('next')?.startsWith('/admin') ? params.get('next')! : '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isAdminSignedIn()) return <Navigate to={next} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (signIn(email, password)) navigate(next, { replace: true })
    else setError('Incorrect email or password')
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-ivory px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo />
          <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.025em]">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Manage products, inventory, prices and orders</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-card ring-1 ring-line">
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field label="Password">
            <span className="relative block">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </span>
          </Field>
          {error && (
            <p role="alert" className="rounded-xl bg-blush px-3.5 py-2.5 text-sm font-semibold text-rose-dark">
              {error}
            </p>
          )}
          <button type="submit" className={buttonClass('primary', 'md', 'w-full')}>
            <Lock className="size-4" /> Sign in
          </button>
        </form>

        <div className="mt-4 flex gap-3 rounded-2xl border border-dashed border-gold/60 bg-gold-soft/60 p-4 text-sm">
          <Info className="mt-0.5 size-[18px] shrink-0 text-gold" />
          <div>
            <p className="font-semibold">Demo login</p>
            <p className="text-muted">
              {DEMO_ADMIN.email}
              <br />
              {DEMO_ADMIN.password}
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_ADMIN.email)
                setPassword(DEMO_ADMIN.password)
              }}
              className="mt-1 font-bold text-maroon hover:underline"
            >
              Fill in for me
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
