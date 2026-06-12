import { useState, useEffect } from 'react'
import { Building2 } from 'lucide-react'
import { useApp, appFetch } from './ClientApp'

export default function AppAuth() {
  const { login } = useApp()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Telegram WebApp orqali ma'lumot olish
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
      if (name) set('full_name', name)
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) return setError("Ismingizni kiriting")
    if (!form.phone.trim()) return setError("Telefon raqamingizni kiriting")
    setError('')
    setLoading(true)

    try {
      const tg = window.Telegram?.WebApp
      const telegram_id = tg?.initDataUnsafe?.user?.id || null

      const data = await appFetch('/api/app/auth', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          telegram_id,
        }),
      })

      login(data.token, data.client)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cherry-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GK Network</h1>
          <p className="text-gray-500 text-sm mt-1">Ko'chmas mulk — eng yaxshi tanlov</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-cherry-100">
          <h2 className="font-semibold text-gray-900 mb-1">Kirish</h2>
          <p className="text-xs text-gray-500 mb-5">Ism va telefon raqamingizni kiriting</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">To'liq ism</label>
              <input
                type="text"
                placeholder="Sardor Rahimov"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                className="w-full border border-cherry-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Telefon</label>
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full border border-cherry-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-medium rounded-xl py-3 text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Kirish'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">GK Network CRM · v1.0</p>
      </div>
    </div>
  )
}
