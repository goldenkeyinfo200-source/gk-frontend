import { useEffect, useState } from 'react'
import {
  Users, AlertCircle, CheckCircle, XCircle, RefreshCw,
  Plus, Send, Shield, Phone, Zap, Crown, Gift, Trash2,
  Pencil, Image as ImageIcon, BarChart2
} from 'lucide-react'
import api from '../../services/api'
import { Btn, Badge, Modal, Input, Select, Spinner, StatCard } from '../../components/ui'
import { fmtDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import BannerStatsModal from '../../components/BannerStatsModal'

const adminApi = {
  agents: () => api.get('/api/admin/agents'),
  stats: () => api.get('/api/admin/stats'),
  toggle: (id) => api.put(`/api/admin/agents/${id}/toggle`),
  setPlan: (id, data) => api.put(`/api/admin/agents/${id}/plan`, data),
  addAgent: (data) => api.post('/api/admin/agents', data),
  sendReport: () => api.post('/api/admin/report'),
  clientStats: () => api.get('/api/admin/client-stats'),
  setTelegramId: (id, telegram_id) => api.put(`/api/admin/agents/${id}/telegram`, { telegram_id }),
  setChannel:    (id, channel)     => api.put(`/api/admin/agents/${id}/channel`, { channel }),

  banners: () => api.get('/api/banners/admin/all'),
  addBanner: (data) => api.post('/api/banners', data),
  editBanner: (id, data) => api.put(`/api/banners/${id}`, data),
  delBanner: (id) => api.delete(`/api/banners/${id}`),
  togBanner: (id, active) => api.put(`/api/banners/${id}`, { is_active: active }),

  uploadBanner: (file) => {
    const formData = new FormData()
    formData.append('image', file)

    return api.post('/api/banners/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

const STATUS_COLORS = {
  pro: { color: 'gold', label: 'Pro', icon: Crown },
  corporate: { color: 'blue', label: 'Korporativ', icon: Shield },
  trial: { color: 'green', label: 'Sinov', icon: Gift },
  expired: { color: 'red', label: 'Tugagan', icon: XCircle },
}

const emptyBannerForm = {
  company: '',
  slogan: '',
  color: '#8B1A2B',
  link_url: '',
  image_url: '',
  start_date: '',
  end_date: '',
  sort_order: 0,
}

export default function AdminPanel() {
  const [agents, setAgents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [planModal, setPlanModal] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [telegramModal, setTelegramModal] = useState(null)
  const [channelModal, setChannelModal] = useState(null)
  const [clientStats, setClientStats] = useState(null)

  const [banners, setBanners] = useState([])
  const [bannerForm, setBannerForm] = useState(emptyBannerForm)
  const [editingBanner, setEditingBanner] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [statsModal, setStatsModal] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [a, s, b, cs] = await Promise.all([
        adminApi.agents(),
        adminApi.stats(),
        adminApi.banners(),
        adminApi.clientStats().catch(() => ({ data: null })),
      ])

      setAgents(Array.isArray(a.data) ? a.data : [])
      setStats(s.data || null)
      setBanners(Array.isArray(b.data) ? b.data : [])
      setClientStats(cs.data || null)
    } catch (err) {
      console.error(err)
      toast.error('Yuklashda xato')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggle = async (id) => {
    try {
      const { data } = await adminApi.toggle(id)
      toast.success(data.is_active ? 'Faollashtirildi ✅' : "O'chirildi ⛔")
      load()
    } catch {
      toast.error('Xato')
    }
  }

  const handleReport = async () => {
    setReporting(true)
    try {
      const { data } = await adminApi.sendReport()
      toast.success(data.report_sent ? '✅ Hisobot Telegram ga yuborildi!' : '✅ Hisobot tayyorlandi')
    } catch {
      toast.error('Xato')
    } finally {
      setReporting(false)
    }
  }

  const resetBannerForm = () => {
    setBannerForm(emptyBannerForm)
    setEditingBanner(null)
  }

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return toast.error('Faqat rasm yuklash mumkin')
    }

    setUploadingBanner(true)

    try {
      const { data } = await adminApi.uploadBanner(file)

      setBannerForm(f => ({
        ...f,
        image_url: data.image_url,
      }))

      toast.success('Rasm yuklandi!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Rasm yuklashda xato')
    } finally {
      setUploadingBanner(false)
    }
  }

  const saveBanner = async () => {
    try {
      if (!bannerForm.company.trim()) {
        return toast.error('Kompaniya nomini kiriting')
      }

      const payload = {
        company: bannerForm.company.trim(),
        slogan: bannerForm.slogan || null,
        color: bannerForm.color || '#8B1A2B',
        link_url: bannerForm.link_url || null,
        image_url: bannerForm.image_url || null,
        start_date: bannerForm.start_date || null,
        end_date: bannerForm.end_date || null,
        sort_order: Number(bannerForm.sort_order || 0),
      }

      if (editingBanner) {
        await adminApi.editBanner(editingBanner.id, payload)
        toast.success('Banner yangilandi!')
      } else {
        await adminApi.addBanner(payload)
        toast.success("Banner qo'shildi!")
      }

      resetBannerForm()
      const res = await adminApi.banners()
      setBanners(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Banner saqlashda xato')
    }
  }

  const startEditBanner = (banner) => {
    setEditingBanner(banner)
    setBannerForm({
      company: banner.company || '',
      slogan: banner.slogan || '',
      color: banner.color || '#8B1A2B',
      link_url: banner.link_url || '',
      image_url: banner.image_url || '',
      start_date: banner.start_date ? String(banner.start_date).slice(0, 16) : '',
      end_date: banner.end_date ? String(banner.end_date).slice(0, 16) : '',
      sort_order: banner.sort_order || 0,
    })
  }

  const filtered = agents.filter(a => {
    if (filter === 'all') return true
    if (filter === 'active') return a.is_active && a.subscription_status !== 'expired'
    if (filter === 'expired') return a.subscription_status === 'expired'
    if (filter === 'paid') return ['pro', 'corporate'].includes(a.plan)
    if (filter === 'trial') return a.subscription_status === 'trial'
    return true
  })

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-cherry-700" /> Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Agentlar, tariflar va reklamalarni boshqarish</p>
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

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Jami agentlar" value={stats.total_agents} color="cherry" />
          <StatCard icon={CheckCircle} label="Faol" value={stats.active_agents} color="green" />
          <StatCard icon={Crown} label="To'lovli" value={stats.paid_agents} color="amber" />
          <StatCard icon={AlertCircle} label="Muddati o'tgan" value={stats.expired_agents} color="cherry" />
        </div>
      )}

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

      {clientStats && (
        <div className="card p-4 space-y-3">
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
            <Users size={13} className="text-blue-500" /> Mini App — Mijozlar statistikasi
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-2xl font-bold text-blue-600">{clientStats.total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Jami mijozlar</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3">
              <p className="text-2xl font-bold text-green-600">{clientStats.today}</p>
              <p className="text-xs text-gray-500 mt-0.5">Bugun ro'yxatdan o'tdi</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-3">
              <p className="text-2xl font-bold text-amber-600">{clientStats.this_week}</p>
              <p className="text-xs text-gray-500 mt-0.5">Bu hafta</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3">
              <p className="text-2xl font-bold text-purple-600">{clientStats.applications}</p>
              <p className="text-xs text-gray-500 mt-0.5">Jami arizalar</p>
            </div>
          </div>

          {clientStats.recent && clientStats.recent.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">So'nggi ro'yxatdan o'tganlar:</p>
              <div className="space-y-1.5">
                {clientStats.recent.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                        {c.full_name?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.full_name}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{fmtDate(c.created_at)}</p>
                      {c.telegram_id && <p className="text-xs text-blue-500">✓ Telegram</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Zap size={15} className="text-amber-500" /> Reklama bannerlar
          </h2>

          {editingBanner && (
            <button onClick={resetBannerForm} className="text-xs text-gray-500 hover:text-cherry-700">
              Bekor qilish
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            placeholder="Kompaniya nomi *"
            value={bannerForm.company}
            onChange={e => setBannerForm(f => ({ ...f, company: e.target.value }))}
            className="input"
          />

          <input
            placeholder="Slogan"
            value={bannerForm.slogan}
            onChange={e => setBannerForm(f => ({ ...f, slogan: e.target.value }))}
            className="input"
          />

          <input
            placeholder="Link: https://..."
            value={bannerForm.link_url}
            onChange={e => setBannerForm(f => ({ ...f, link_url: e.target.value }))}
            className="input sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
              Reklama banner rasmi
            </label>

            <label className="border border-dashed border-cherry-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-cherry-50 transition">
              <ImageIcon size={22} className="text-cherry-700" />
              <span className="text-sm font-medium text-gray-700">
                {uploadingBanner ? 'Rasm yuklanmoqda...' : 'Rasm tanlash'}
              </span>
              <span className="text-xs text-gray-400">
                Tavsiya: 1200×400 px, JPG yoki PNG
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleBannerImageUpload}
                className="hidden"
                disabled={uploadingBanner}
              />
            </label>

            {bannerForm.image_url && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Rasm yuklandi
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Boshlanish vaqti</label>
            <input
              type="datetime-local"
              value={bannerForm.start_date}
              onChange={e => setBannerForm(f => ({ ...f, start_date: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tugash vaqti</label>
            <input
              type="datetime-local"
              value={bannerForm.end_date}
              onChange={e => setBannerForm(f => ({ ...f, end_date: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        {bannerForm.image_url ? (
          <div className="mb-3 rounded-xl overflow-hidden border border-cherry-100 bg-white">
            <img
              src={bannerForm.image_url}
              alt="Banner preview"
              className="w-full h-32 object-cover"
            />
          </div>
        ) : (
          <div
            className="mb-3 h-20 rounded-xl flex items-center px-4"
            style={{ background: bannerForm.color }}
          >
            <div>
              <p className="text-white text-sm font-semibold">
                {bannerForm.company || 'Kompaniya nomi'}
              </p>
              <p className="text-white/80 text-xs">
                {bannerForm.slogan || 'Slogan'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <label className="text-xs text-gray-500">Rang:</label>

          <input
            type="color"
            value={bannerForm.color}
            onChange={e => setBannerForm(f => ({ ...f, color: e.target.value }))}
            className="w-10 h-8 rounded cursor-pointer border border-gray-200"
          />

          <input
            type="number"
            placeholder="Tartib"
            value={bannerForm.sort_order}
            onChange={e => setBannerForm(f => ({ ...f, sort_order: e.target.value }))}
            className="input w-24"
          />

          <Btn size="sm" onClick={saveBanner} disabled={uploadingBanner}>
            <Plus size={14} />
            {editingBanner ? 'Saqlash' : "Qo'shish"}
          </Btn>
        </div>

        {banners.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Hali banner yo'q</p>
        ) : (
          <div className="space-y-2">
            {banners.map(b => (
              <div key={b.id} className="p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  {b.image_url ? (
                    <img
                      src={b.image_url}
                      alt={b.company}
                      className="w-14 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0"
                      style={{ background: b.color || '#8B1A2B' }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{b.company}</p>
                    {b.slogan && <p className="text-xs text-gray-400">{b.slogan}</p>}

                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[11px] text-gray-400">
                        {b.start_date ? `Boshlanish: ${fmtDate(b.start_date)} · ` : ''}
                        {b.end_date ? `Tugash: ${fmtDate(b.end_date)}` : 'Muddat belgilanmagan'}
                      </p>
                      {/* Ko'rishlar soni */}
                      <span className="text-[11px] text-amber-600 font-medium flex items-center gap-0.5">
                        👁 {b.views_month ?? 0} oy
                      </span>
                    </div>
                  </div>

                  {/* Statistika tugmasi */}
                  <button
                    onClick={() => setStatsModal(b)}
                    className="text-amber-500 hover:text-amber-700 p-1"
                    title="Statistika"
                  >
                    <BarChart2 size={14} />
                  </button>

                  <button
                    onClick={async () => {
                      await adminApi.togBanner(b.id, !b.is_active)
                      const res = await adminApi.banners()
                      setBanners(Array.isArray(res.data) ? res.data : [])
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {b.is_active ? 'Faol' : 'Nofaol'}
                  </button>

                  <button
                    onClick={() => startEditBanner(b)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Tahrirlash"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm("O'chirasizmi?")) return
                      await adminApi.delBanner(b.id)
                      const res = await adminApi.banners()
                      setBanners(Array.isArray(res.data) ? res.data : [])
                      toast.success("Banner o'chirildi")
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="O'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner statistika modali */}
      {statsModal && (
        <BannerStatsModal
          banner={statsModal}
          onClose={() => setStatsModal(null)}
        />
      )}

      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1 flex-wrap">
        {[
          { key: 'all', label: `Barchasi (${agents.length})` },
          { key: 'active', label: 'Faol' },
          { key: 'trial', label: 'Sinov' },
          { key: 'paid', label: "To'lovli" },
          { key: 'expired', label: 'Tugagan' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
              filter === f.key ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

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
              onTelegram={() => setTelegramModal(a)}
              onChannel={() => setChannelModal(a)}
            />
          ))}
        </div>
      )}

      <TelegramLinkModal
        open={!!telegramModal}
        agent={telegramModal}
        onClose={() => setTelegramModal(null)}
        onSaved={() => { setTelegramModal(null); load() }}
      />

      <ChannelModal
        open={!!channelModal}
        agent={channelModal}
        onClose={() => setChannelModal(null)}
        onSaved={() => { setChannelModal(null); load() }}
      />

      <PlanModal
        open={!!planModal}
        agent={planModal}
        onClose={() => setPlanModal(null)}
        onSaved={() => { setPlanModal(null); load() }}
      />

      <AddAgentModal
        open={addModal}
        onClose={() => setAddModal(false)}
        onSaved={() => { setAddModal(false); load() }}
      />
    </div>
  )
}

function AgentCard({ agent: a, onToggle, onPlan, onTelegram, onChannel }) {
  const st = STATUS_COLORS[a.subscription_status] || STATUS_COLORS.expired
  const StatusIcon = st.icon

  const daysColor =
    a.days_left === 0 ? 'text-red-600 bg-red-50' :
    a.days_left <= 3 ? 'text-amber-600 bg-amber-50' :
    a.days_left <= 7 ? 'text-orange-500 bg-orange-50' :
    'text-green-600 bg-green-50'

  return (
    <div className={clsx(
      'card p-4 transition-all',
      !a.is_active && 'opacity-60',
      a.subscription_status === 'expired' && a.is_active && 'border-red-200'
    )}>
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
          a.is_active ? 'bg-cherry-100 text-cherry-700' : 'bg-gray-100 text-gray-400'
        )}>
          {a.full_name?.[0] || a.login?.[0] || 'A'}
        </div>

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
              : <button onClick={onTelegram} className="text-xs text-amber-500 hover:text-amber-700 underline transition-colors">⚠ Telegram yo'q — bog'lash</button>
            }
            {a.channel && (
              <span className="text-xs text-green-600">📢 {a.channel}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-lg', daysColor)}>
              {a.days_left === 0 ? '⛔ Muddati tugagan' : `⏱ ${a.days_left} kun qoldi`}
            </span>

            {a.trial_end && a.subscription_status === 'trial' && (
              <span className="text-xs text-gray-400">
                Sinov tugaydi: {fmtDate(a.trial_end)}
              </span>
            )}

            {a.plan_end && ['pro', 'corporate'].includes(a.plan) && (
              <span className="text-xs text-gray-400">
                Tarif tugaydi: {fmtDate(a.plan_end)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Btn variant="outline" size="sm" onClick={onPlan}>
            <Crown size={13} /> Tarif
          </Btn>

          <Btn variant="outline" size="sm" onClick={onChannel}>
            📢 Kanal
          </Btn>

          <Btn variant={a.is_active ? 'outline' : 'primary'} size="sm" onClick={onToggle}>
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

function ChannelModal({ open, agent, onClose, onSaved }) {
  const [channel, setChannel] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (agent) setChannel(agent.channel || '')
  }, [agent])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminApi.setChannel(agent.id, channel.trim())
      toast.success('Kanal saqlandi!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  if (!agent) return null

  return (
    <Modal open={open} onClose={onClose} title={`Kanal — ${agent.full_name || agent.login}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Telegram kanal username"
          value={channel}
          onChange={e => setChannel(e.target.value)}
          placeholder="@agent_kanal"
        />
        <p className="text-xs text-gray-400">Bot kanalga admin bo'lishi kerak</p>
        <div className="flex gap-2">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn type="submit" loading={loading} className="flex-1">Saqlash</Btn>
        </div>
      </form>
    </Modal>
  )
}

function PlanModal({ open, agent, onClose, onSaved }) {
  const [form, setForm] = useState({ plan: 'pro', days: '30' })
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

        <Select label="Yangi tarif" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
          <option value="trial">🎁 Sinov</option>
          <option value="pro">⭐ Pro</option>
          <option value="corporate">🏢 Korporativ</option>
          <option value="free">⛔ Bloklash</option>
        </Select>

        {form.plan !== 'free' && (
          <Input
            label="Necha kun"
            type="number"
            value={form.days}
            onChange={e => setForm(p => ({ ...p, days: e.target.value }))}
          />
        )}

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

function AddAgentModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    login: '',
    password: '',
    full_name: '',
    phone: '',
    channel: '',
    plan: '',
    days: '30',
  })

  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.login || !form.password) return toast.error('Login va parol kerak')

    setLoading(true)

    try {
      await adminApi.addAgent(form)
      toast.success("Agent qo'shildi!")
      setForm({ login: '', password: '', full_name: '', phone: '', channel: '', plan: '', days: '30' })
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
          <Input
            label="To'liq ism"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            placeholder="Sardor Rahimov"
          />

          <Input
            label="Telefon"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+998 90 123 45 67"
          />
        </div>

        <Input
          label="Telegram kanal (ixtiyoriy)"
          value={form.channel}
          onChange={e => set('channel', e.target.value)}
          placeholder="@agent_kanal"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Login *"
            value={form.login}
            onChange={e => set('login', e.target.value.toLowerCase())}
            placeholder="sardor"
          />

          <Input
            label="Parol *"
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Select label="Tarif" value={form.plan} onChange={e => set('plan', e.target.value)}>
          <option value="">Sinov 14 kun</option>
          <option value="pro">Pro</option>
          <option value="corporate">Korporativ</option>
        </Select>

        {form.plan && (
          <Input
            label="Necha kun"
            type="number"
            value={form.days}
            onChange={e => set('days', e.target.value)}
          />
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
function TelegramLinkModal({ open, agent, onClose, onSaved }) {
  const [telegramId, setTelegramId] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const tid = telegramId.trim()
    if (!tid) return toast.error('Telegram ID kiriting')
    if (isNaN(Number(tid))) return toast.error("Telegram ID faqat raqamlardan iborat bo'lishi kerak")
    setLoading(true)
    try {
      await adminApi.setTelegramId(agent.id, Number(tid))
      toast.success('Telegram ID saqlandi!')
      setTelegramId('')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  if (!agent) return null

  return (
    <Modal open={open} onClose={onClose} title={`Telegram bog'lash — ${agent.full_name || agent.login}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
          <p className="font-medium">Telegram ID qanday topiladi?</p>
          <p>1. @userinfobot ga istalgan xabar yozsin</p>
          <p>2. Bot "Id: <b>123456789</b>" ko'rinishida javob beradi</p>
          <p>3. Shu raqamni quyiga kiriting</p>
        </div>
        <Input
          label="Telegram ID (faqat raqam)"
          value={telegramId}
          onChange={e => setTelegramId(e.target.value.replace(/\D/g, ''))}
          placeholder="123456789"
        />
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
