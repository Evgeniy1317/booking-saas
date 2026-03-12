import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Particles from '@/components/landing/Particles'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Подключить Supabase позже
      // Временно: просто редирект на dashboard
      console.log('Login data:', formData)
      
      // Симуляция задержки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingCode(true)
    setError('')

    try {
      // TODO: Подключить Supabase позже
      console.log('Sending reset code to:', resetEmail)
      
      // Симуляция отправки кода
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCodeSent(true)
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки кода')
    } finally {
      setSendingCode(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Только одна цифра
    
    const newCode = [...code]
    newCode[index] = value.replace(/[^0-9]/g, '') // Только цифры
    
    setCode(newCode)
    
    // Автоматический переход на следующее поле
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    
    if (fullCode.length !== 6) {
      setError('Введите полный код')
      return
    }

    setLoading(true)
    setError('')

    try {
      // TODO: Подключить Supabase позже
      console.log('Verifying code:', fullCode)
      
      // Симуляция проверки кода
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // После успешной проверки можно перейти на форму смены пароля
      // Пока просто возвращаемся к форме входа
      setShowForgotPassword(false)
      setCodeSent(false)
      setCode(['', '', '', '', '', ''])
      setResetEmail('')
    } catch (err: any) {
      setError(err.message || 'Неверный код')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Particles Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Particles 
          particleColors={['#ffffff', '#ffffff']} 
          particleCount={150} 
          particleSpread={10} 
          speed={0.1} 
          particleBaseSize={80} 
          moveParticlesOnHover={true} 
          alphaParticles={true} 
          disableRotation={false} 
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Home Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Домой</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Войдите в свой аккаунт
          </p>
        </div>

        {/* Glass Form Card */}
        <div className="backdrop-blur-2xl bg-card/30 border border-border/50 rounded-2xl shadow-2xl shadow-black/20 p-8 md:p-10">
          {!showForgotPassword ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground"
                    >
                      Пароль
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-accent hover:text-accent/80 transition-colors"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50 pr-12"
                      placeholder="Введите пароль"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30"
                >
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </form>

              {/* Registration Link */}
              <div className="mt-8 text-center pt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Нет аккаунта?{' '}
                  <Link
                    to="/register"
                    className="text-accent hover:text-accent/80 font-semibold transition-colors"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
              </div>
            </>
          ) : !codeSent ? (
            // Форма отправки кода
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  Восстановление пароля
                </h2>
                <p className="text-sm text-muted-foreground">
                  Введите email для получения кода восстановления
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  type="email"
                  id="reset-email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-accent/50"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setError('')
                  }}
                  className="flex-1 h-12 rounded-full"
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                  disabled={sendingCode}
                  size="lg"
                  className="flex-1 h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30"
                >
                  {sendingCode ? 'Отправка...' : 'Отправить код'}
                </Button>
              </div>
            </form>
          ) : (
            // Форма ввода кода
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  Введите код
                </h2>
                <p className="text-sm text-muted-foreground">
                  Мы отправили код на {resetEmail}
                </p>
              </div>

              {/* Код ввода - шарики */}
              <div className="flex justify-center gap-3 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold bg-card/40 backdrop-blur-sm border border-border/50 rounded-full focus:ring-2 focus:ring-accent/50 focus:border-accent/50 outline-none transition-all text-foreground"
                  />
                ))}
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCodeSent(false)
                    setCode(['', '', '', '', '', ''])
                    setError('')
                  }}
                  className="flex-1 h-12 rounded-full"
                >
                  Назад
                </Button>
                <Button
                  type="submit"
                  disabled={loading || code.join('').length !== 6}
                  size="lg"
                  className="flex-1 h-12 rounded-full backdrop-blur-xl bg-accent/80 hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/20 transition-all hover:shadow-accent/30 border border-accent/30 disabled:opacity-50"
                >
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false)
                    setCode(['', '', '', '', '', ''])
                  }}
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Отправить код повторно
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

