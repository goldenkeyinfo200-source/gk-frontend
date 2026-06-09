import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Users, Building2, ArrowLeftRight, LogOut, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import clsx from 'clsx'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { agent, logout } = useAuthStore()
  const navigate = useNavigate()

  const NAV = [
    { to: '/',           icon: Home,           label: 'Bosh sahifa' },
    { to: '/clients',    icon: Users,          label: 'Mijozlar'    },
    { to: '/properties', icon: Building2,      label: "Ob'yektlar"  },
    { to: '/leads',      icon: ArrowLeftRight, label: 'Lidlar'      },
    ...(agent?.role === 'admin'
      ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }]
      : []
    ),
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavItems = ({ onClick }) => NAV.map(({ to, icon: Icon, label }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive
          ? 'bg-cherry-700 text-white'
          : to === '/admin'
          ? 'text-amber-400 hover:bg-white/10 hover:text-amber-300'
          : 'text-cherry-300 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  ))

  return (
    <div className="min-h-screen flex bg-[#f8f5f5]">

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-cherry-900 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cherry-700 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">GK Network</p>
              <p className="text-cherry-300 text-xs">CRM tizimi</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItems />
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
            <div className="w-8 h-8 rounded-full bg-cherry-700 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {agent?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{agent?.full_name || 'Agent'}</p>
              <p className="text-cherry-400 text-xs capitalize">{agent?.role || 'agent'}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-cherry-400 hover:text-white hover:bg-white/10 text-sm transition-all">
            <LogOut size={15} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-cherry-900 flex flex-col">
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cherry-700 rounded-xl flex items-center justify-center">
                  <Building2 size={16} className="text-white" />
                </div>
                <p className="text-white font-semibold text-sm">GK Network</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-cherry-300"><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <NavItems onClick={() => setOpen(false)} />
            </nav>
            <div className="px-3 py-4 border-t border-white/10">
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-cherry-400 hover:text-white text-sm">
                <LogOut size={15} /> Chiqish
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-20 bg-cherry-900 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="text-white p-1">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-cherry-700 rounded-lg flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">GK Network</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-cherry-700 flex items-center justify-center text-xs font-semibold text-white">
            {agent?.full_name?.[0] || 'A'}
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
