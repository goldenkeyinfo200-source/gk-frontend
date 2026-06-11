import { useEffect, useState } from 'react'
import {
  Users, TrendingUp, AlertCircle, CheckCircle, Clock,
  XCircle, RefreshCw, Plus, Send, Shield, BarChart2,
  Phone, Calendar, Zap, Crown, Gift, Trash2
} from 'lucide-react'
import api from '../../services/api'
import { Btn, Badge, Modal, Input, Select, Spinner, StatCard } from '../../components/ui'
import { fmtDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const adminApi = {
  agents:      ()           => api.get('/api/admin/agents'),
  stats:       ()           => api.get('/api/admin/stats'),
  toggle:      (id)         => api.put(`/api/admin/agents/${id}/toggle`),
  setPlan:     (id, data)   => api.put(`/api/admin/agents/${id}/plan`, data),
  addAgent:    (data)       => api.post('/api/admin/agents', data),
  sendReport:  ()           => api.post('/api/admin/report'),
  banners:     ()           => api.get('/api/banners'),
  addBanner:   (data)       => api.post('/api/banners', data),
  delBanner:   (id)         => api.delete(`/api/banners/${id}`),
  togBanner:   (id, active) => api.put(`/api/banners/${id}`, { is_active: active }),
}

const STATUS_COLORS = {
  pro:        { color: 'gold',  label: 'Pro',        icon: Crown  },
  corporate:  { color: 'blue',  label: 'Korporativ', icon: Shield },
  trial:      { color: 'green', label: 'Sinov',      icon: Gift   },
  expired:    { color: 'red',   label: 'Tugagan',    icon: XCircle},
}

export default function AdminPanel() {
  const [agents, setAgents]     = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('agents')
  const [filter, setFilter]     = useState('all')
  const [planModal, setPlanModal] = useState(null) // agent object
  const [addModal, setAddModal] = useState(false)
  const [reporting, setReporting] = useState(false)

  // Reklama bannerlar uchun state
  const [banners, setBanners] = useState([])
  const [bannerForm, setBannerForm] = useState({
    company: '',
    slogan: '',
    color: '#8B1A2B',
    link_url: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [a, s, b] = await Promise.all([adminApi.agents(), adminApi.stats(), adminApi.banners()])
      setAgents(Array.isArray(a.data) ? a.data : [])
      setStats(s.data || null)
      setBanners(Array.isArray(b.data) ? b.data : [])
    } catch (err) {
      toast.error('Yuklashda xato')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.toggle(id)
      toast.success(data.is_active ? 'Faollashtirildi ✅' : "O'chirildi ⛔")
      load()
    } catch { toast.error('Xato') }
  }

  const handleReport = async () => {
    setReporting(true)
    try {
      const { data } = await adminApi.sendReport()
      toast.success(data.report_sent
        ? '✅ Hisobot Telegram ga yuborildi!'
        : '✅ Hisobot tayyorlandi (Telegram ID yo\'q)')
    } catch { toast.error('Xato') } finally { setReporting(false) }
  }

  const filtered = agents.filter(a => {
    if (filter === 'all')     return true
    if (filter === 'active')  return a.is_active && a.subscription_status !== 'expired'
    if (filter === 'expired') return a.subscription_status === 'expired'
    if (filter === 'paid')    return ['pro','corporate'].includes(a.plan)
    if (filter === 'trial')   return a.subscription_status === 'trial'
    return true
  })

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-cherry-700" /> Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Agentlar va tariflarni boshqarish</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Btn variant="outline" size="sm" onClick={load}>
            <RefreshCw size={14} /> Yangilash
          </Btn>
          <Btn variant="outline" size="sm" loading={reporting} onClick={handleReport}>
            <Send size={14} /> Hisobot yuborish
          </Btn>
          <Btn size="sm" onClick={() => setAddModal(true)}>
            <Plus size={14} /> Agent qo'shish
          </Btn>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users}       label="Jami agentlar"  value={stats.total_agents}   color="cherry" />
          <StatCard icon={CheckCircle} label="Faol"           value={stats.active_agents}  color="green"  />
          <StatCard icon={Crown}       label="To'lovli"       value={stats.paid_agents}    color="amber"  />
          <StatCard icon={AlertCircle} label="Muddati o'tgan" value={stats.expired_agents} color="cherry" />
        </div>
      )}

      {/* Today */}
      {stats && (
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-500" /> Bugungi faollik
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-cherry-700">{stats.clients_today}</p>
              <p className="text-xs text-gray-500 mt-0.5">Yangi mijoz</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.props_today}</p>
              <p className="text-xs text-gray-500 mt-0.5">Yangi ob'yekt</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.leads_today}</p>
              <p className="text-xs text-gray-500 mt-0.5">Yangi lid</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1 flex-wrap">
        {[
          { key: 'all',     label: `Barchasi (${agents.length})` },
          { key: 'active',  label: 'Faol'        },
          { key: 'trial',   label: 'Sinov'        },
          { key: 'paid',    label: 'To\'lovli'    },
          { key: 'expired', label: 'Tugagan'      },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={clsx('px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
              filter === f.key ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700')}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Agents list */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">Agent topilmadi</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <AgentCard
              key={a.id}
              agent={a}
              onToggle={() => handleToggle(a.id)}
              onPlan={() => setPlanModal(a)}
            />
          ))}
        </div>
      )}

      {/* Banners */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Zap size={15} className="text-amber-500" /> Reklama bannerlar
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <input
            placeholder="Kompaniya nomi *"
            value={bannerForm.company}
            onChange={e => setBannerForm(f => ({ ...f, company: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Slogan (ixtiyoriy)"
            value={bannerForm.slogan}
            onChange={e => setBannerForm(f => ({ ...f, slogan: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Link (https://...)"
            value={bannerForm.link_url}
            onChange={e => setBannerForm(f => ({ ...f, link_url: e.target.value }))}
            className="input"
          />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs text-gray-500">Rang:</label>
          <input type="color" value={bannerForm.color}
            onChange={e => setBannerForm(f => ({ ...f, color: e.target.value }))}
            className="w-10 h-8 rounded cursor-pointer border border-gray-200" />
          <div className="flex-1 h-10 rounded-xl flex items-center px-3"
            style={{ background: bannerForm.color }}>
            <span className="text-white text-xs opacity-80">
              {bannerForm.company || 'Kompaniya nomi'}
            </span>
          </div>
          <Btn size="sm" onClick={async () => {
            if (!bannerForm.company) return toast.error('Kompaniya nomini kiriting')
            await adminApi.addBanner(bannerForm)
            setBannerForm({ company: '', slogan: '', color: '#8B1A2B', link_url: '' })
            const b = await adminApi.banners()
            setBanners(b.data || [])
            toast.success('Banner qo\'shildi!')
          }}>
            <Plus size={14} /> Qo'shish
          </Btn>
        </div>

        {banners.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Hali banner yo'q</p>
        ) : (
          <div className="space-y-2">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: b.color || '#8B1A2B' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{b.company}</p>
                  {b.slogan && <p className="text-xs text-gray-400">{b.slogan}</p>}
                </div>
                <button
                  onClick={async () => {
                    await adminApi.togBanner(b.id, !b.is_active)
                    const res = await adminApi.banners()
                    setBanners(res.data || [])
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.is_active ? 'Faol' : 'Nofaol'}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('O\'chirasizmi?')) return
                    await adminApi.delBanner(b.id)
                    const res = await adminApi.banners()
                    setBanners(res.data || [])
                  }}
                  className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan modal */}
      <PlanModal
        open={!!planModal}
        agent={planModal}
        onClose={() => setPlanModal(null)}
        onSaved={() => { setPlanModal(null); load() }}
      />

      {/* Add agent modal */}
      <AddAgentModal
        open={addModal}
        onClose={() => setAddModal(false)}
        onSaved={() => { setAddModal(false); load() }}
      />
    </div>
  )
}

// ─── Agent Card ──────────────────────────────────────────
function AgentCard({ agent: a, onToggle, onPlan }) {
  const st = STATUS_COLORS[a.subscription_status] || STATUS_COLORS.expired
  const StatusIcon = st.icon

  const daysColor =
    a.days_left === 0  ? 'text-red-600 bg-red-50'    :
    a.days_left <= 3   ? 'text-amber-600 bg-amber-50' :
    a.days_left <= 7   ? 'text-orange-500 bg-orange-50' :
                         'text-green-600 bg-green-50'

  return (
    <div className={clsx(
      'card p-4 transition-all',
      !a.is_active && 'opacity-60',
      a.subscription_status === 'expired' && a.is_active && 'border-red-200'
    )}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
          a.is_active ? 'bg-cherry-100 text-cherry-700' : 'bg-gray-100 text-gray-400'
        )}>
          {a.full_name?.[0] || a.login?.[0] || 'A'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{a.full_name || '—'}</span>
            <span className="text-xs text-gray-400">@{a.login}</span>
            <Badge color={st.color} className="flex items-center gap-1">
              <StatusIcon size={10} />
              {st.label}
            </Badge>
            {!a.is_active && <Badge color="gray">O'chirilgan</Badge>}
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
            {a.phone && (
              <span className="flex items-center gap-1">
                <Phone size={11} /> {a.phone}
              </span>
            )}
            <span>{a.clients_count} mijoz · {a.props_count} ob'yekt</span>
            {a.telegram_id
              ? <span className="text-blue-500">✓ Telegram ulangan</span>
              : <span className="text-gray-400">Telegram yo'q</span>
            }
          </div>

          {/* Days left */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-lg', daysColor)}>
              {a.days_left === 0
                ? '⛔ Muddati tugagan'
                : `⏱ ${a.days_left} kun qoldi`
              }
            </span>
            {a.trial_end && a.subscription_status === 'trial' && (
              <span className="text-xs text-gray-400">
                Sinov tugaydi: {fmtDate(a.trial_end)}
              </span>
            )}
            {a.plan_end && ['pro','corporate'].includes(a.plan) && (
              <span className="text-xs text-gray-400">
                Tarif tugaydi: {fmtDate(a.plan_end)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Btn variant="outline" size="sm" onClick={onPlan}>
            <Crown size={13} /> Tarif
          </Btn>
          <Btn
            variant={a.is_active ? 'outline' : 'primary'}
            size="sm"
            onClick={onToggle}
          >
            {a.is_active
              ? <><XCircle size={13} /> O'chirish</>
              : <><CheckCircle size={13} /> Yoqish</>
            }
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Plan Modal ──────────────────────────────────────────
function PlanModal({ open, agent, onClose, onSaved }) {
  const [form, setForm]   = useState({ plan: 'pro', days: '30' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminApi.setPlan(agent.id, form)
      toast.success('Tarif yangilandi!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  if (!agent) return null

  return (
    <Modal open={open} onClose={onClose} title={`Tarif — ${agent.full_name || agent.login}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        {/* Hozirgi holat */}
        <div className="bg-cherry-50 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Hozirgi tarif</span>
            <span className="font-medium">{agent.plan || 'Sinov/Bepul'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Qolgan kunlar</span>
            <span className={clsx('font-medium', agent.days_left === 0 ? 'text-red-600' : 'text-green-600')}>
              {agent.days_left} kun
            </span>
          </div>
        </div>

        <Select label="Yangi tarif" value={form.plan}
          onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
          <option value="trial">🎁 Sinov (bepul)</option>
          <option value="pro">⭐ Pro</option>
          <option value="corporate">🏢 Korporativ</option>
          <option value="free">⛔ Bloklash (bepul)</option>
        </Select>

        {form.plan !== 'free' && (
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Necha kun</label>
            <div className="flex gap-2">
              {['7', '14', '30', '90', '365'].map(d => (
                <button key={d} type="button"
                  onClick={() => setForm(p => ({ ...p, days: d }))}
                  className={clsx(
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                    form.days === d
                      ? 'bg-cherry-700 text-white border-cherry-700'
                      : 'bg-white text-gray-600 border-cherry-100 hover:border-cherry-400'
                  )}>
                  {d === '365' ? '1 yil' : d + ' kun'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Telegram xabar preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">📱 Agent Telegram ga xabar oladi:</p>
          {form.plan === 'free'
            ? '"⚠️ Hisobingiz vaqtincha to\'xtatildi."'
            : `"🎉 ${form.plan === 'trial' ? 'Sinov' : form.plan} tarifi ${form.days} kun faollashtirildi!"`
          }
        </div>

        <div className="flex gap-2">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn type="submit" loading={loading} className="flex-1">
            <CheckCircle size={14} /> Saqlash
          </Btn>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Agent Modal ─────────────────────────────────────
function AddAgentModal({ open, onClose, onSaved }) {
  const [form, setForm]   = useState({
    login: '', password: '', full_name: '', phone: '', plan: '', days: '30'
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) return toast.error("Login va parol kerak")
    setLoading(true)
    try {
      await adminApi.addAgent(form)
      toast.success("Agent qo'shildi!")
      setForm({ login: '', password: '', full_name: '', phone: '', plan: '', days: '30' })
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Yangi agent qo'shish" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="To'liq ism" value={form.full_name}
            onChange={e => set('full_name', e.target.value)} placeholder="Sardor Rahimov" />
          <Input label="Telefon" value={form.phone}
            onChange={e => set('phone', e.target.value)} placeholder="+998 90 123 45 67" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Login *" value={form.login}
            onChange={e => set('login', e.target.value.toLowerCase())}
            placeholder="sardor" />
          <Input label="Parol *" type="password" value={form.password}
            onChange={e => set('password', e.target.value)} placeholder="••••••••" />
        </div>
        <Select label="Tarif" value={form.plan}
          onChange={e => set('plan', e.target.value)}>
          <option value="">Sinov (14 kun bepul)</option>
          <option value="pro">Pro</option>
          <option value="corporate">Korporativ</option>
        </Select>
        {form.plan && (
          <Input label="Necha kun" type="number" value={form.days}
            onChange={e => set('days', e.target.value)} />
        )}
        <div className="flex gap-2">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn type="submit" loading={loading} className="flex-1">
            <Plus size={14} /> Qo'shish
          </Btn>
        </div>
      </form>
    </Modal>
  )
}
