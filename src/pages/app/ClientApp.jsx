import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Home, List, User } from 'lucide-react'
import clsx from 'clsx'

// Pages
import AppAuth from './AppAuth'
import AppHome from './AppHome'
import AppPropertyDetail from './AppPropertyDetail'
import AppApplications from './AppApplications'
import AppProfile from './AppProfile'

// ─── Context ──────────────────────────────────────────────
const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const API = import.meta.env.VITE_API_URL || 'https://gk-network-production.up.railway.app'

export async function appFetch(path, options = {}) {
  const token = localStorage.getItem('gk_app_token')
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Xato')
  return data
}

// ─── Main App ─────────────────────────────────────────────
export default function ClientApp() {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gk_app_token')
    const saved = localStorage.getItem('gk_app_client')
    if (token && saved) {
      setClient(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  const login = (token, clientData) => {
    localStorage.setItem('gk_app_token', token)
    localStorage.setItem('gk_app_client', JSON.stringify(clientData))
    setClient(clientData)
  }

  const logout = () => {
    localStorage.removeItem('gk_app_token')
    localStorage.removeItem('gk_app_client')
    setClient(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f5] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-cherry-200 border-t-cherry-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ client, login, logout }}>
      <Routes>
        {!client ? (
          <Route path="*" element={<AppAuth />} />
        ) : (
          <>
            <Route path="/app"              element={<><AppHome /><BottomNav /></>} />
            <Route path="/app/property/:id" element={<><AppPropertyDetail /><BottomNav /></>} />
            <Route path="/app/applications" element={<><AppApplications /><BottomNav /></>} />
            <Route path="/app/profile"      element={<><AppProfile /><BottomNav /></>} />
            <Route path="*"                 element={<Navigate to="/app" replace />} />
          </>
        )}
      </Routes>
    </AppContext.Provider>
  )
}

// ─── Bottom Navigation ────────────────────────────────────
function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/app',         icon: Home,   label: 'Bosh sahifa' },
    { path: '/app/applications', icon: List, label: 'Arizalarim' },
    { path: '/app/profile', icon: User,   label: 'Profil'      },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-cherry-100 flex z-50 safe-area-pb">
      {tabs.map(t => {
        const active = location.pathname === t.path
        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              active ? 'text-cherry-700' : 'text-gray-400'
            )}
          >
            <t.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
