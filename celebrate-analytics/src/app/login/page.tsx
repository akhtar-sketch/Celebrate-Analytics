'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (err) { setError(err.message); return }
      setStep('otp')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      if (err) { setError(err.message); return }
      router.push('/dashboard/executive')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <Image
            src="/logo.png"
            alt="Celebrate Analytics"
            width={0}
            height={0}
            sizes="200px"
            style={{ width: 'auto', height: '88px' }}
            className="mx-auto mb-5"
            priority
          />
          <p className="text-sm text-ink-3">
            {step === 'email' ? 'Sign in to your account' : `Code sent to ${email}`}
          </p>
        </div>

        <div className="bg-surface border border-edge rounded-2xl p-6 shadow-sm">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Field label="Email address" htmlFor="email">
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@celebratedental.com"
                />
              </Field>

              {error && <ErrorBanner message={error} />}

              <button
                type="submit" disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors mt-1"
              >
                {loading ? 'Sending code…' : 'Send code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Field label="One-time code" htmlFor="otp">
                <input
                  id="otp" type="text" inputMode="numeric" autoComplete="one-time-code"
                  required value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputCls} tracking-[0.5em] text-center font-mono text-lg`}
                  placeholder="000000"
                  maxLength={6}
                />
              </Field>

              {error && <ErrorBanner message={error} />}

              <button
                type="submit" disabled={loading || otp.length < 6}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors mt-1"
              >
                {loading ? 'Verifying…' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(null); setOtp('') }}
                className="w-full text-center text-sm text-ink-3 hover:text-ink transition-colors py-1"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-edge text-ink placeholder-ink-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-500/8 border border-red-500/20 px-3.5 py-2.5">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  )
}
