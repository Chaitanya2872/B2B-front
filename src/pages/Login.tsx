import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Boxes,
  Eye,
  EyeOff,
  LoaderCircle,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../services/api/client'
import { useLogin } from '../hooks/useAuth'
import './Login.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(3, 'Enter your email')
    .max(160, 'Keep email under 160 characters')
    .refine((value) => emailPattern.test(value), 'Enter a valid email'),
  password: z
    .string()
    .min(5, 'Password must be at least 5 characters')
    .max(128, 'Password is too long'),
  rememberMe: z.boolean(),
})

type LoginFormInput = z.input<typeof loginSchema>
type LoginFormOutput = z.output<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: '',
      password: '',
      rememberMe: false,
    },
  })
  const identityField = register('identity', {
    onChange: () => setLoginError(null),
  })
  const passwordField = register('password', {
    onChange: () => setLoginError(null),
  })

  const onSubmit = handleSubmit(
    async (values) => {
      setLoginError(null)
      setForgotMessage(null)

      try {
        await loginMutation.mutateAsync(values)
        navigate('/', { replace: true })
      } catch (error) {
        setLoginError(
          getApiErrorMessage(error, 'Email or password was not accepted.'),
        )
      }
    },
    () => setLoginError(null),
  )

  return (
    <main className="login-page">
      <section className="login-workspace" aria-label="ACS Sales OS sign in">
        <aside className="login-brand-panel card">
          <div className="login-brand">
            <span className="login-brand-mark">
              <Boxes size={20} strokeWidth={2.2} />
            </span>
            <div className="login-brand-copy">
              <span className="login-brand-name">ACS</span>
              <span className="login-brand-sub">Sales OS</span>
            </div>
          </div>

          <div className="login-brand-statement">
            <p className="login-eyebrow">Account manager workspace</p>
            <h1>Return to your sales operating view.</h1>
            <p>
              Track pipeline movement, product coverage, approvals, and service
              commitments from the same focused dashboard.
            </p>
          </div>

          <div className="login-snapshot">
            <div className="login-snapshot-header">
              <span>Today</span>
              <span className="login-status-pill">Live queue</span>
            </div>
            <div className="login-snapshot-grid">
              <div>
                <strong>42</strong>
                <span>Open deals</span>
              </div>
              <div>
                <strong>7</strong>
                <span>Approvals</span>
              </div>
              <div>
                <strong>18</strong>
                <span>Renewals</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="login-form-panel card">
          <div className="login-form-header">
            <span className="login-form-icon">
              <ShieldCheck size={18} strokeWidth={2} />
            </span>
            <div>
              <h2>Sign in</h2>
              <p>Use your ACS workspace credentials.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={onSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-identity">Email</label>
              <input
                {...identityField}
                id="login-identity"
                type="text"
                autoComplete="email"
                placeholder="ravi.teja@acs.example"
                aria-invalid={errors.identity ? 'true' : 'false'}
              />
              {errors.identity && <em>{errors.identity.message}</em>}
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <span className="login-password-control">
                <input
                  {...passwordField}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={2} />
                  ) : (
                    <Eye size={16} strokeWidth={2} />
                  )}
                </button>
              </span>
              {errors.password && <em>{errors.password.message}</em>}
            </div>

            <div className="login-form-row">
              <label className="login-remember">
                <input type="checkbox" {...register('rememberMe')} />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="login-link-button"
                onClick={() => {
                  setForgotMessage(
                    'Password reset is not connected yet. Contact your ACS admin for access help.',
                  )
                  setLoginError(null)
                }}
              >
                Forgot password?
              </button>
            </div>

            {forgotMessage && (
              <div className="login-info" role="status">
                {forgotMessage}
              </div>
            )}

            {loginError && (
              <div className="login-error" role="alert">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <LoaderCircle
                    className="login-submit-spinner"
                    size={16}
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  Signing in
                </>
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2.2} />
                  Login
                </>
              )}
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}
