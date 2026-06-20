import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, ArrowLeftRight, TrendingUp, CheckCircle, Clock, ChevronRight, Zap, ExternalLink, AlertTriangle, Crown } from 'lucide-react'
import { clientsApi, propertiesApi, leadsApi } from '../../services/api'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import { StatCard, Spinner } from '../../components/ui'
import { fmt, fmtTime, TYPE_UZ, PURPOSE_UZ, STATUS_UZ } from '../../utils/helpers'

function BannerSlider({ banners }) {
  const [cur, setCur] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => {
      setCur(c => (c + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timerRef.current)
  }, [banners.length])

  if (!banners.length) return null
  const b = banners[cur]

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ background: b.color || '#8B1A2B', minHeight: '80px' }}>
      {b.image_url && (
        <img src={b.image_url} alt={b.company} className="absolute inset-0 w-full h-full object-cover object-center" />
      )}
      <div className="relative flex items-center gap-3 p-4">
        {!b.image_url && (
          <>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)' }}>
              <Building2 size={20} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Hamkor reklama</p>
              <p className="text-sm font-semibold text-white truncate">{b.company}</p>
              {b.slogan && <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{b.slogan}</p>}
            </div>
          </>
        )}
        {b.image_url && <div className="flex-1" />}
        {b.link_url && (
          <a href={b.link_url} target="_blank" rel="noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ background: 'rgba(0,0,0,0.40)' }}>
            Batafsil <ExternalLink size={12} color="#fff" />
          </a>
        )}
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1 pb-2.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCur(i)}
              className="rounded-full transition-all"
              style={{
                height: '4px',
                width: i === cur ? '18px' : '6px',
                background: i === cur ? '#fff' : 'rgba(255,255,255,0.35)',
                border: 'none', padding: 0, cursor: 'pointer'
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { agent } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState([])

  useEffect(() => {
    Promise.all([
      clientsApi.list(),
      propertiesApi.list(),
      leadsApi.list(),
      api.get('/api/banners').catch(() => ({ data: [] })),
      api.get('/api/auth/me').catch(() => ({ data: null })),
    ]).then(([c, p, l, b, me]) => {
      setData({
        clients:    c.data,
        properties: p.data,
        leads:      l.data,
      })
      setBanners(b.data || [])
      // Agent ma'lumotini yangilash (plan, plan_end, trial_end)
      if (me.data) {
        useAuthStore.getState().setAuth(
          localStorage.getItem('gk_token'),
          { ...useAuthStore.getState().agent, ...me.data }
        )
      }
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

  // Obuna hisoblash
  const subDaysLeft = (() => {
    if (agent?.role === 'admin') return null
    if (agent?.plan && agent?.plan_end) {
      const d = Math.ceil((new Date(agent.plan_end) - new Date()) / 86400000)
      return Math.max(0, d)
    }
    if (agent?.trial_end) {
      const d = Math.ceil((new Date(agent.trial_end) - new Date()) / 86400000)
      return Math.max(0, d)
    }
    return 0
  })()
  const subPlan = agent?.plan || 'trial'
  const subExpired = subDaysLeft !== null && subDaysLeft <= 0

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Banner slider */}
      {banners.length > 0 && <BannerSlider banners={banners} />}

      {/* Obuna holati */}
      {subDaysLeft !== null && (
        subExpired ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Obuna muddati tugadi!</p>
              <p className="text-xs text-red-500">Tizimdan to'liq foydalanish uchun admin bilan bog'laning.</p>
            </div>
          </div>
        ) : subDaysLeft <= 3 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700">Obuna yaqinda tugaydi!</p>
              <p className="text-xs text-amber-600">Faqat <b>{subDaysLeft} kun</b> qoldi. Uzilishni oldini olish uchun to'lovni amalga oshiring.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Crown size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-700 capitalize">
                {subPlan === 'trial' ? 'Sinov davri' : subPlan === 'pro' ? 'Pro tarif' : 'Korporativ tarif'}
              </p>
              <p className="text-xs text-green-600"><b>{subDaysLeft} kun</b> qoldi</p>
            </div>
          </div>
        )
      )}

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
