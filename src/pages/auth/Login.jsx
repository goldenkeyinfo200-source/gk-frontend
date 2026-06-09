import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Lock, User, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) return toast.error("Login va parol kiriting")
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.token, data.agent)
      toast.success(`Xush kelibsiz, ${data.agent.full_name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato yuz berdi')
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
          <p className="text-gray-500 text-sm mt-1">Ko'chmas mulk CRM</p>
        </div>

        {/* Form */}
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
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : 'Kirish'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          GK Network CRM · v1.0
        </p>
      </div>
    </div>
  )
}
