import { zodResolver } from '@hookform/resolvers/zod'
import {
  BarChart3,
  DoorOpen,
  PersonStanding,
  PieChart,
  Settings,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../services/api/client'
import { useLogin } from '../hooks/useAuth'
import fawnixCrmLogo from '../assets/fawnix-crm-logo.png'
import './Login.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernamePattern = /^[a-zA-Z0-9._-]+$/

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
})

type LoginFormInput = z.input<typeof loginSchema>
type LoginFormOutput = z.output<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [loginError, setLoginError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: '',
      password: '',
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

      try {
        await loginMutation.mutateAsync({ ...values, rememberMe: true })
        navigate('/', { replace: true })
      } catch (error) {
        setLoginError(
          getApiErrorMessage(error, 'Email or password was not accepted.'),
        )
      }
    },
    () => setLoginError(null),
  )

  const busy = isSubmitting || loginMutation.isPending

  return (
    <main className="login-page">
      {/* Decorative wave & backdrop — now spans the full browser viewport directly, not a card floating on a separate page background */}
      <div className="login-decor" aria-hidden="true">
        <svg
          className="login-wave"
          viewBox="0 0 1000 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M450,600 C650,550 720,400 850,300 C950,220 1000,100 1050,0 L1100,600 Z"
            fill="url(#wave-gradient-1)"
            opacity="0.68"
          />
          <path
            d="M550,600 C700,560 760,450 880,380 C980,320 1030,220 1100,120 L1100,600 Z"
            fill="url(#wave-gradient-2)"
            opacity="0.88"
          />
          <defs>
            <linearGradient
              id="wave-gradient-1"
              x1="500"
              y1="200"
              x2="1050"
              y2="600"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fdba74" stopOpacity="0.65" />
              <stop offset="0.55" stopColor="#f97316" stopOpacity="0.82" />
              <stop offset="1" stopColor="#ea580c" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient
              id="wave-gradient-2"
              x1="600"
              y1="250"
              x2="1100"
              y2="600"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fed7aa" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#f97316" stopOpacity="0.88" />
              <stop offset="0.85" stopColor="#ea580c" stopOpacity="0.95" />
              <stop offset="1" stopColor="#c2410c" stopOpacity="0.98" />
            </linearGradient>
          </defs>
        </svg>
        <div className="login-dotgrid">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>

      <div className="login-shell">
        {/* Brand header */}
        <header className="login-header">
            <div className="login-brand">
              <span className="login-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 6L16.33 8.5V13.5L12 16L7.67 13.5V8.5L12 6Z"
                    fill="white"
                    fillOpacity="0.3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="11" r="2" fill="white" />
                </svg>
              </span>
              <div className="login-brand-copy">
                <span className="login-brand-name">FAWNIX</span>
                <span className="login-brand-sub">CRM</span>
              </div>
            </div>
          </header>

          {/* Middle content */}
          <div className="login-middle">
            {/* Sign-in form */}
            <div className="login-form-side">
              <div className="login-form-card">
                <div className="login-form-heading">
                  <h1>Welcome back!</h1>
                  <p>Sign in to continue to Smart CRM</p>
                </div>

                <form
                  className="login-form"
                  onSubmit={onSubmit}
                  noValidate
                >
                  <div className="login-field">
                    <label htmlFor="login-identity">Username or Email</label>
                    <input
                      {...identityField}
                      id="login-identity"
                      type="text"
                      autoComplete="username"
                      placeholder="name@company.com"
                      aria-invalid={errors.identity ? 'true' : 'false'}
                      aria-describedby={
                        errors.identity ? 'login-identity-error' : undefined
                      }
                    />
                    {errors.identity && (
                      <em id="login-identity-error">
                        {errors.identity.message}
                      </em>
                    )}
                  </div>

                  <div className="login-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                      {...passwordField}
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={
                        errors.password ? 'login-password-error' : undefined
                      }
                    />
                    {errors.password && (
                      <em id="login-password-error">
                        {errors.password.message}
                      </em>
                    )}
                  </div>

                  {loginError && (
                    <div className="login-error" role="alert">
                      {loginError}
                    </div>
                  )}

                  <div className="login-submit-row">
                    <button type="submit" className="login-submit" disabled={busy}>
                      <span className="login-btn-walk" aria-hidden="true">
                        {busy && (
                          <PersonStanding
                            className="login-btn-walker"
                            size={12}
                            strokeWidth={2.6}
                          />
                        )}
                        <DoorOpen
                          className="login-btn-door"
                          size={18}
                          strokeWidth={2.2}
                        />
                      </span>
                      <span>{busy ? 'Signing in' : 'Sign in with Fawnix'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Headline + orbital graphic */}
            <div className="login-hero-side">
              <div className="login-headline">
                <div>
                  <h2 className="login-headline-strong">Smart CRM</h2>
                  <h2 className="login-headline-light">Experience</h2>
                  <span className="login-headline-rule" aria-hidden="true" />
                </div>
                <p>Streamline. Connect. Grow.</p>
              </div>

              <div className="login-orbit-wrap">
                <div className="login-orbit">
                  <div className="login-orbit-glow" aria-hidden="true" />
                  <div className="login-orbit-ring login-orbit-ring-1" aria-hidden="true" />
                  <div className="login-orbit-ring login-orbit-ring-2" aria-hidden="true" />
                  <div className="login-orbit-ring login-orbit-ring-3" aria-hidden="true" />

                  <div className="login-orbit-core">
                    <img src={fawnixCrmLogo} alt="Fawnix CRM" />
                  </div>

                  <div className="login-orbit-satellites" aria-hidden="true">
                    <div className="login-satellite login-satellite-top">
                      <div className="login-satellite-spin">
                        <div className="login-satellite-badge" title="Analytics">
                          <BarChart3 size={24} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                    <div className="login-satellite login-satellite-right">
                      <div className="login-satellite-spin">
                        <div className="login-satellite-badge" title="Reporting">
                          <PieChart size={24} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                    <div className="login-satellite login-satellite-bottom">
                      <div className="login-satellite-spin">
                        <div className="login-satellite-badge" title="Goals">
                          <Target size={24} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                    <div className="login-satellite login-satellite-left">
                      <div className="login-satellite-spin">
                        <div className="login-satellite-badge" title="Customers">
                          <Users size={24} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <footer className="login-footer">
            <div className="login-features">
              <div className="login-feature">
                <Users size={20} strokeWidth={1.8} />
                <span>Customers</span>
              </div>
              <div className="login-feature">
                <TrendingUp size={20} strokeWidth={1.8} />
                <span>Insights</span>
              </div>
              <div className="login-feature">
                <Settings size={20} strokeWidth={1.8} />
                <span>Automation</span>
              </div>
            </div>
            <div className="login-pagination" aria-hidden="true">
              <span className="is-active" />
              <span className="is-active" />
              <span />
              <span />
              <span />
            </div>
          </footer>
      </div>
    </main>
  )
}
