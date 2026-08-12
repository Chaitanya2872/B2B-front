import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  LogIn,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../services/api/client'
import { useLogin } from '../hooks/useAuth'
import './Login.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernamePattern = /^[a-zA-Z0-9._-]+$/
const passwordResetMessage =
  'Password reset is not connected yet. Contact your ACS admin for access help.'

const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(3, 'Enter your username or email')
    .max(160, 'Keep username or email under 160 characters')
    .refine(
      (value) => emailPattern.test(value) || usernamePattern.test(value),
      'Enter a valid username or email',
    ),
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
      <div className="login-frame">
        <section className="login-workspace" aria-label="ACS Sales OS sign in">
          <aside
            className="login-brand-panel"
            aria-label="ACS Sales OS overview"
          >
            <div className="login-dot-grid" aria-hidden="true" />

            <div className="login-brand">
              <span className="login-brand-mark" aria-hidden="true">
                <Boxes size={24} strokeWidth={2.3} />
              </span>
              <div className="login-brand-copy">
                <span className="login-brand-name">ACS</span>
                <span className="login-brand-sub">Sales OS</span>
              </div>
            </div>

            <div className="login-brand-statement">
              <h1>
                <span>One view.</span>
                <span>Every deal.</span>
                <span className="login-accent-line">Better outcomes.</span>
              </h1>
              <span className="login-headline-rule" aria-hidden="true" />
              <p>
                Track pipeline movement, product coverage, approvals, and
                service commitments from the same focused dashboard.
              </p>
            </div>

            <div className="login-kpi-card" aria-label="Workspace snapshot">
              <div className="login-kpi-item login-kpi-blue">
                <span className="login-kpi-icon" aria-hidden="true">
                  <FileText size={24} strokeWidth={2.1} />
                </span>
                <strong>42</strong>
                <span>Open deals</span>
              </div>

              <div className="login-kpi-item login-kpi-green">
                <span className="login-kpi-icon" aria-hidden="true">
                  <CheckCircle2 size={24} strokeWidth={2.1} />
                </span>
                <strong>7</strong>
                <span>Approvals</span>
              </div>

              <div className="login-kpi-item login-kpi-violet">
                <span className="login-kpi-icon" aria-hidden="true">
                  <RefreshCw size={24} strokeWidth={2.1} />
                </span>
                <strong>18</strong>
                <span>Renewals</span>
              </div>
            </div>
          </aside>

          <section className="login-form-panel" aria-label="Sign in form">
            <div className="login-form-inner">
              <div className="login-form-header">
                <span className="login-form-icon" aria-hidden="true">
                  <ShieldCheck size={28} strokeWidth={2.1} />
                </span>
                <div>
                  <h2>Welcome back</h2>
                  <p>Sign in to your ACS workspace</p>
                </div>
              </div>

              <form className="login-form" onSubmit={onSubmit} noValidate>
                <div className="login-field">
                  <label htmlFor="login-identity">Username or email</label>
                  <span className="login-field-control">
                    <Mail size={22} strokeWidth={2} aria-hidden="true" />
                    <input
                      {...identityField}
                      id="login-identity"
                      type="text"
                      autoComplete="username"
                      placeholder="ravi.teja@acs.example"
                      aria-invalid={errors.identity ? 'true' : 'false'}
                      aria-describedby={
                        errors.identity ? 'login-identity-error' : undefined
                      }
                    />
                  </span>
                  {errors.identity && (
                    <em id="login-identity-error">{errors.identity.message}</em>
                  )}
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">Password</label>
                  <span className="login-field-control login-password-control">
                    <Lock size={22} strokeWidth={2} aria-hidden="true" />
                    <input
                      {...passwordField}
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={
                        errors.password ? 'login-password-error' : undefined
                      }
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={22} strokeWidth={2} />
                      ) : (
                        <Eye size={22} strokeWidth={2} />
                      )}
                    </button>
                  </span>
                  {errors.password && (
                    <em id="login-password-error">{errors.password.message}</em>
                  )}
                </div>

                <div className="login-form-row">
                  <label className="login-remember" htmlFor="login-remember">
                    <input
                      id="login-remember"
                      type="checkbox"
                      {...register('rememberMe')}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="login-link-button"
                    onClick={() => {
                      setForgotMessage(passwordResetMessage)
                      setLoginError(null)
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

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
                        size={20}
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                      Signing in
                    </>
                  ) : (
                    <>
                      <LogIn size={20} strokeWidth={2.2} />
                      Sign in
                    </>
                  )}
                </button>

                {forgotMessage && (
                  <p
                    className="login-reset-note login-reset-note-active"
                    role="status"
                    aria-live="polite"
                  >
                    {forgotMessage}
                  </p>
                )}
              </form>
            </div>
          </section>
        </section>

        <p className="login-footer">
          (c) 2025 ACS Technologies. All rights reserved.
        </p>
      </div>
    </main>
  )
}
