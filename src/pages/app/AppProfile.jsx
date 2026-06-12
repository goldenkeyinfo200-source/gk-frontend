import { useApp } from './ClientApp'
import { User, Phone, LogOut } from 'lucide-react'

export default function AppProfile() {
  const { client, logout } = useApp()

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Profil</h1>

      <div className="bg-white rounded-2xl border border-cherry-100 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-cherry-100 flex items-center justify-center">
            <span className="text-xl font-bold text-cherry-700">
              {client?.full_name?.[0] || 'M'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{client?.full_name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone size={12} /> {client?.phone}
            </p>
          </div>
        </div>

        {client?.telegram_id && (
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
            ✅ Telegram ulangan
          </div>
        )}
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-100 text-red-500 rounded-2xl text-sm font-medium hover:bg-red-50 transition-all"
      >
        <LogOut size={16} /> Chiqish
      </button>

      <p className="text-center text-xs text-gray-400">GK Network CRM · v1.0</p>
    </div>
  )
}
