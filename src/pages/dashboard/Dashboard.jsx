import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, ArrowLeftRight, TrendingUp, CheckCircle, Clock, ChevronRight, Zap } from 'lucide-react'
import { clientsApi, propertiesApi, leadsApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { StatCard, Spinner } from '../../components/ui'
import { fmt, fmtTime, TYPE_UZ, PURPOSE_UZ, STATUS_UZ } from '../../utils/helpers'

export default function Dashboard() {
  const { agent } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      clientsApi.list(),
      propertiesApi.list(),
      leadsApi.list(),
    ]).then(([c, p, l]) => {
      setData({
        clients:    c.data,
        properties: p.data,
        leads:      l.data,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-8 h-8" />
    </div>
  )

  const { clients = [], properties = [], leads = [] } = data || {}
  const activeClients    = clients.filter(c => c.status === 'active').length
  const activeProperties = properties.filter(p => p.status === 'active').length
  const pendingLeads     = leads.filter(l => l.status === 'pending').length
  const recentClients    = clients.slice(0, 4)
  const recentProperties = properties.slice(0, 4)

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Salom, {agent?.full_name?.split(' ')[0] || 'Agent'}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {pendingLeads > 0 && (
          <Link to="/leads" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors">
            <Zap size={13} />
            {pendingLeads} kutayotgan lid
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="Faol mijozlar"  value={activeClients}    color="cherry" />
        <StatCard icon={Building2}    label="Faol ob'yektlar" value={activeProperties} color="blue"   />
        <StatCard icon={ArrowLeftRight} label="Jami lidlar"  value={leads.length}     color="amber"  />
        <StatCard icon={CheckCircle}  label="Bu oy sotildi"
          value={properties.filter(p => p.status === 'sold').length} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent clients */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">So'nggi mijozlar</h2>
            <Link to="/clients" className="text-xs text-cherry-600 hover:text-cherry-800 flex items-center gap-1">
              Barchasi <ChevronRight size={13} />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Hali mijoz yo'q</p>
          ) : (
            <div className="space-y-2">
              {recentClients.map(c => (
                <Link key={c.id} to={`/clients/${c.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cherry-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-cherry-100 flex items-center justify-center text-xs font-semibold text-cherry-700 flex-shrink-0">
                    {c.full_name?.[0] || 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.full_name || c.display_id}</p>
                    <p className="text-xs text-gray-500">{TYPE_UZ[c.property_type]} · {fmt(c.budget_max)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={c.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                      {STATUS_UZ[c.status]}
                    </span>
                    {c.matched_count > 0 && (
                      <p className="text-xs text-cherry-600 mt-0.5">{c.matched_count} mos</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent properties */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">So'nggi ob'yektlar</h2>
            <Link to="/properties" className="text-xs text-cherry-600 hover:text-cherry-800 flex items-center gap-1">
              Barchasi <ChevronRight size={13} />
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Hali ob'yekt yo'q</p>
          ) : (
            <div className="space-y-2">
              {recentProperties.map(p => (
                <Link key={p.id} to={`/properties/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cherry-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-cherry-50 flex items-center justify-center flex-shrink-0">
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} className="w-9 h-9 rounded-xl object-cover" alt="" />
                      : <Building2 size={16} className="text-cherry-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{TYPE_UZ[p.property_type]} · {p.rooms ? p.rooms + ' xona' : ''}</p>
                    <p className="text-xs text-gray-500">{p.region || p.district || '—'} · {PURPOSE_UZ[p.purpose]}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-cherry-700">{fmt(p.price)}</p>
                    {p.matched_clients > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">{p.matched_clients} mos mijoz</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending leads */}
      {pendingLeads > 0 && (
        <div className="card p-5 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Kutayotgan lidlar</h2>
            <span className="badge-gold">{pendingLeads} ta</span>
          </div>
          <div className="space-y-2">
            {leads.filter(l => l.status === 'pending').slice(0, 3).map(l => (
              <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50/60">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-semibold text-amber-700 flex-shrink-0">
                  {l.sender_name?.[0] || 'A'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{l.sender_name} — lid yubordi</p>
                  <p className="text-xs text-gray-500">{TYPE_UZ[l.property_type]} · {fmt(l.budget_max)}</p>
                </div>
                <Link to="/leads" className="text-xs text-amber-700 font-medium hover:underline">Ko'rish</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
