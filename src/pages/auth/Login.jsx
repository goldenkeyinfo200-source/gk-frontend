import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Lock, User, Eye, EyeOff, Phone, ChevronRight, ChevronLeft, Send } from 'lucide-react'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'

  return (
    <div className="min-h-screen bg-[#f8f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cherry-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GK Network</h1>
          <p className="text-gray-500 text-sm mt-1">Ko'chmas mulk CRM</p>
        </div>

        {/* Tabs — faqat login va register uchun */}
        {mode !== 'forgot' && (
          <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1 mb-5">
            <button
              onClick={() => setMode('login')}
              className={clsx('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                mode === 'login' ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700')}
            >
              Kirish
            </button>
            <button
              onClick={() => setMode('register')}
              className={clsx('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                mode === 'register' ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700')}
            >
              Ro'yxatdan o'tish
            </button>
          </div>
        )}

        {mode === 'login'   && <LoginForm onForgot={() => setMode('forgot')} />}
        {mode === 'register' && <RegisterForm onSuccess={() => setMode('login')} />}
        {mode === 'forgot'  && <ForgotForm onBack={() => setMode('login')} />}

        <p className="text-center text-xs text-gray-400 mt-6">GK Network CRM · v1.0</p>
      </div>
    </div>
  )
}

// ─── Login Form ──────────────────────────────────────────
function LoginForm({ onForgot }) {
  const [form, setForm]   = useState({ login: '', password: '' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth }       = useAuthStore()
  const navigate          = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) return toast.error("Login va parol kiriting")
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.token, data.agent)
      toast.success(`Xush kelibsiz, ${data.agent.full_name || data.agent.login}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login yoki parol xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-card border border-cherry-100 space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Login</label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="login kiriting"
            value={form.login}
            onChange={e => setForm(p => ({ ...p, login: e.target.value }))}
            className="w-full border border-cherry-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Parol</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className="w-full border border-cherry-100 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : 'Kirish'
        }
      </button>

      {/* Parolni unutdingizmi */}
      <div className="text-center">
        <button
          type="button"
          onClick={onForgot}
          className="text-xs text-cherry-600 hover:text-cherry-800 transition-colors"
        >
          Parolni unutdingizmi?
        </button>
      </div>
    </form>
  )
}

// ─── Forgot Password Form ────────────────────────────────
function ForgotForm({ onBack }) {
  const [step, setStep]         = useState(1) // 1: login kiriting, 2: kod, 3: yangi parol
  const [login, setLogin]       = useState('')
  const [code, setCode]         = useState('')
  const [newPass, setNewPass]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  // 1-bosqich: Telegram botga kod yuborish
  const sendCode = async (e) => {
    e.preventDefault()
    if (!login.trim()) return toast.error('Loginni kiriting')
    setLoading(true)
    try {
      await authApi.forgotPassword({ login: login.trim() })
      toast.success('Telegram botga kod yuborildi!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Foydalanuvchi topilmadi')
    } finally {
      setLoading(false)
    }
  }

  // 2-bosqich: Kodni tekshirish
  const verifyCode = async (e) => {
    e.preventDefault()
    if (code.length < 4) return toast.error('Kodni to\'liq kiriting')
    setLoading(true)
    try {
      await authApi.verifyResetCode({ login: login.trim(), code })
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Noto\'g\'ri kod')
    } finally {
      setLoading(false)
    }
  }

  // 3-bosqich: Yangi parol saqlash
  const resetPassword = async (e) => {
    e.preventDefault()
    if (newPass.length < 4) return toast.error('Parol kamida 4 ta belgi')
    setLoading(true)
    try {
      await authApi.resetPassword({ login: login.trim(), code, new_password: newPass })
      toast.success('Parol muvaffaqiyatli o\'zgartirildi!')
      onBack()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['Loginni kiriting', 'Kodni tasdiqlang', 'Yangi parol']

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-cherry-100">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <button type="button" onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
          className="p-1 text-gray-400 hover:text-cherry-700 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="text-sm font-semibold text-gray-800">{stepTitles[step - 1]}</p>
          <p className="text-xs text-gray-400">Qadam {step}/3</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-5">
        {[1, 2, 3].map(i => (
          <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all',
            i <= step ? 'bg-cherry-600' : 'bg-gray-100')} />
        ))}
      </div>

      {/* Step 1: Login */}
      {step === 1 && (
        <form onSubmit={sendCode} className="space-y-4">
          <p className="text-xs text-gray-500">
            Loginингизни киритинг. Telegram botga тасдиқлаш коди юборилади.
          </p>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Login</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="loginni kiriting"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="w-full border border-cherry-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
                autoFocus
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Send size={14} /> Kod yuborish</>
            }
          </button>
        </form>
      )}

      {/* Step 2: Kod */}
      {step === 2 && (
        <form onSubmit={verifyCode} className="space-y-4">
          <div className="bg-cherry-50 rounded-xl px-3 py-2.5 text-xs text-gray-600">
            <span className="font-medium">@gknet_bot</span> dan kelgan kodni kiriting
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Tasdiqlash kodi</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="· · · · · ·"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full border border-cherry-100 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || code.length < 4}
            className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Tasdiqlash'
            }
          </button>
          <button type="button" onClick={() => sendCode({ preventDefault: () => {} })}
            className="w-full text-xs text-gray-400 hover:text-cherry-600 transition-colors py-1">
            Kodni qayta yuborish
          </button>
        </form>
      )}

      {/* Step 3: Yangi parol */}
      {step === 3 && (
        <form onSubmit={resetPassword} className="space-y-4">
          <p className="text-xs text-gray-500">Yangi parolingizni o'rnating.</p>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Yangi parol</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Kamida 4 ta belgi"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full border border-cherry-100 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
                autoFocus
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {newPass && (
              <div className="mt-1.5 flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all',
                    newPass.length >= i * 3
                      ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : 'bg-green-400'
                      : 'bg-gray-100'
                  )} />
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Parolni saqlash'
            }
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Register Form ───────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({
    full_name: '', phone: '', login: '', password: '', confirm: ''
  })
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]       = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const nextStep = (e) => {
    e.preventDefault()
    if (!form.full_name) return toast.error("Ismingizni kiriting")
    if (!form.phone)     return toast.error("Telefon raqamingizni kiriting")
    if (!form.login)     return toast.error("Login tanlang")
    if (form.login.length < 4) return toast.error("Login kamida 4 ta harf")
    setStep(2)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.password)               return toast.error("Parol kiriting")
    if (form.password.length < 6)     return toast.error("Parol kamida 6 ta belgi")
    if (form.password !== form.confirm) return toast.error("Parollar mos kelmadi")
    setLoading(true)
    try {
      await authApi.registerPublic({
        full_name: form.full_name,
        phone:     form.phone,
        login:     form.login,
        password:  form.password,
      })
      toast.success('Ro\'yxatdan o\'tdingiz! 14 kunlik bepul tarif faollashtirildi.')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato yuz berdi')
      if (err.response?.status === 400) setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-cherry-100">
      <div className="flex items-center gap-2 mb-5">
        <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
          step >= 1 ? 'bg-cherry-700 text-white' : 'bg-gray-100 text-gray-400')}>1</div>
        <div className={clsx('flex-1 h-0.5 rounded transition-all', step >= 2 ? 'bg-cherry-600' : 'bg-gray-100')} />
        <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
          step >= 2 ? 'bg-cherry-700 text-white' : 'bg-gray-100 text-gray-400')}>2</div>
        <div className="text-xs text-gray-400 ml-1">{step}/2</div>
      </div>

      {step === 1 ? (
        <form onSubmit={nextStep} className="space-y-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Shaxsiy ma'lumotlar</p>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">To'liq ism *</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Sardor Rahimov" value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                className="w-full border border-cherry-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Telefon *</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" placeholder="+998 90 123 45 67" value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full border border-cherry-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Login *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input type="text" placeholder="login_tanlang" value={form.login}
                onChange={e => set('login', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                className="w-full border border-cherry-100 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Faqat lotin harflari, raqamlar va _</p>
          </div>
          <button type="submit"
            className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 flex items-center justify-center gap-2">
            Davom etish <ChevronRight size={16} />
          </button>
        </form>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <button type="button" onClick={() => setStep(1)} className="p-1 text-gray-400 hover:text-cherry-700">
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm font-medium text-gray-700">Parol o'rnating</p>
          </div>
          <div className="bg-cherry-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 space-y-0.5">
            <p><span className="text-gray-500">Ism:</span> {form.full_name}</p>
            <p><span className="text-gray-500">Login:</span> @{form.login}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Parol *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPass ? 'text' : 'password'} placeholder="Kamida 6 ta belgi"
                value={form.password} onChange={e => set('password', e.target.value)}
                className="w-full border border-cherry-100 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-1.5 flex gap-1">
                {[1,2,3].map(i => (
                  <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all',
                    form.password.length >= i * 3
                      ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : 'bg-green-400'
                      : 'bg-gray-100'
                  )} />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Parolni tasdiqlang *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showConfirm ? 'text' : 'password'} placeholder="Parolni qayta kiriting"
                value={form.confirm} onChange={e => set('confirm', e.target.value)}
                className={clsx('w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all',
                  form.confirm && form.confirm !== form.password
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-cherry-100 focus:border-cherry-400 focus:ring-cherry-100')} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.confirm && form.confirm !== form.password && (
              <p className="text-xs text-red-500 mt-1">Parollar mos kelmadi</p>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 flex items-start gap-2">
            <span className="text-base leading-none">🎁</span>
            <span>Ro'yxatdan o'tgach <strong>14 kunlik bepul</strong> tarif avtomatik faollashadi!</span>
          </div>
          <button type="submit"
            disabled={loading || (form.confirm && form.confirm !== form.password)}
            className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : "Ro'yxatdan o'tish"
            }
          </button>
        </form>
      )}
    </div>
  )
}
