import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, List, User } from 'lucide-react'
import clsx from 'clsx'

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

// ─── Simple page router (no nested router) ────────────────
function AppRouter({ client }) {
  const location = useLocation()
  const path = location.pathname

  if (!client) return <AppAuth />

  if (path.startsWith('/app/property/')) {
    const id = path.replace('/app/property/', '')
    return (
      <div style={{ minHeight: '100vh', background: '#f8f5f5', paddingBottom: 80 }}>
        <AppPropertyDetail id={id} />
        <BottomNav />
      </div>
    )
  }

  if (path === '/app/applications') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f5f5', paddingBottom: 80 }}>
        <AppApplications />
        <BottomNav />
      </div>
    )
  }

  if (path === '/app/profile') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f5f5', paddingBottom: 80 }}>
        <AppProfile />
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f5', paddingBottom: 80 }}>
      <AppHome />
      <BottomNav />
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────
export default function ClientApp() {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const token = localStorage.getItem('gk_app_token')
      const saved = localStorage.getItem('gk_app_client')
      if (token && saved) {
        setClient(JSON.parse(saved))
      }
    } catch (e) {
      localStorage.removeItem('gk_app_token')
      localStorage.removeItem('gk_app_client')
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f5f5' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e8d8db', borderTopColor: '#7a1a2e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ client, login, logout }}>
      <AppRouter client={client} />
    </AppContext.Provider>
  )
}

// ─── Bottom Navigation ────────────────────────────────────
function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/app',              icon: Home, label: 'Bosh sahifa' },
    { path: '/app/applications', icon: List, label: 'Arizalarim'  },
    { path: '/app/profile',      icon: User, label: 'Profil'      },
  ]

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e0e3', display: 'flex', zIndex: 50 }}>
      {tabs.map(t => {
        const active = location.pathname === t.path || (t.path === '/app' && location.pathname === '/app')
        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '10px 0 14px', fontSize: 11, fontWeight: 500,
              color: active ? '#7a1a2e' : '#aaa', border: 'none', background: 'none', cursor: 'pointer'
            }}
          >
            <t.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
