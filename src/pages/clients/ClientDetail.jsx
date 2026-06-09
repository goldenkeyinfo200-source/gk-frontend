import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Phone, MapPin, Target, Edit3, CheckCircle,
  Building2, Sparkles, RefreshCw, Send, Lock, Eye, EyeOff
} from 'lucide-react'
import { clientsApi, leadsApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { Btn, Badge, Modal, Input, Select, Textarea, Toggle, Spinner, Empty } from '../../components/ui'
import { fmt, TYPE_UZ, NEED_UZ, PURPOSE_UZ, CITIES, ROOMS } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ClientDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { agent }    = useAuthStore()
  const [client, setClient]     = useState(null)
  const [matches, setMatches]   = useState([])
  const [tab, setTab]           = useState('info')
  const [loading, setLoading]   = useState(true)
  const [matchLoad, setMatchLoad] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await clientsApi.get(id)
      setClient(data)
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    setMatchLoad(true)
    try {
      const { data } = await clientsApi.matches(id)
      setMatches(data)
    } finally {
      setMatchLoad(false)
    }
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { if (tab === 'matches') loadMatches() }, [tab, id])

  const handleArchive = async () => {
    try {
      await clientsApi.update(id, { ...client, status: 'archived' })
      toast.success('Mijoz yopildi')
      load()
    } catch { toast.error('Xato') }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!client)  return <div className="text-center py-20 text-gray-400">Topilmadi</div>

  // O'z mijozimi yoki boshqa agentniki?
  const isOwn = client.agent_id === agent?.id || agent?.role === 'admin'

  return (
    <div className="max-w-2xl space-y-4">

      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white border border-cherry-100 text-gray-500 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          {/* Boshqa agentning mijozida ism yashirin */}
          <h1 className="text-lg font-bold text-gray-900">
            {isOwn ? (client.full_name || client.display_id) : ('Mijoz ' + client.display_id)}
          </h1>
          <p className="text-xs text-gray-500">
            {client.display_id} · {NEED_UZ[client.need_type]}
            {!isOwn && <span className="ml-2 text-amber-600">· Boshqa agent</span>}
          </p>
        </div>
        {/* Tahrirlash va Yopish — FAQAT o'z mijozida */}
        {isOwn && (
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit3 size={14} /> Tahrirlash
            </Btn>
            {client.status === 'active' && (
              <Btn variant="outline" size="sm" onClick={handleArchive}>
                <CheckCircle size={14} /> Yopish
              </Btn>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1">
        {[
          { key: 'info',    label: "Ma'lumot"       },
          { key: 'matches', label: "Mos ob'yektlar" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={clsx('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.key ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── INFO TAB ── */}
      {tab === 'info' && (
        <div className="card p-5 space-y-1">

          {/* Boshqa agentning mijozi — ogоhlantirish */}
          {!isOwn && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
              <Lock size={14} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Bu boshqa agentning mijozi. Shaxsiy ma'lumotlar yashirin.
              </p>
            </div>
          )}

          <Row label="Holati" value={
            <Badge color={client.status === 'active' ? 'green' : 'gray'}>
              {client.status === 'active' ? 'Faol' : 'Arxiv'}
            </Badge>
          } />
          <Row label="Maqsadi"   value={NEED_UZ[client.need_type]} />
          <Row label="Mulk turi" value={TYPE_UZ[client.property_type]} />
          {client.rooms && <Row label="Xonalar" value={client.rooms + ' ta'} />}
          <Row label="Byudjet"   value={`${fmt(client.budget_min)} — ${fmt(client.budget_max)}`} />

          {/* Telefon — FAQAT o'z mijozida */}
          <Row label="Telefon" value={
            isOwn
              ? <a href={`tel:${client.phone}`} className="text-cherry-700 font-medium hover:underline flex items-center gap-1">
                  <Phone size={13} /> {client.phone || '—'}
                </a>
              : <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <Lock size={12} /> Yashirin
                </span>
          } />

          {/* To'liq ism — FAQAT o'z mijozida */}
          {isOwn && client.full_name && (
            <Row label="To'liq ism" value={client.full_name} />
          )}

          {client.district && (
            <Row label="Hudud" value={
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-cherry-500" />
                {client.district}
              </span>
            } />
          )}
          {client.mortgage    && <Row label="Ipoteka"   value={<Badge color="blue">✓ Maqbul</Badge>} />}
          {client.installment && <Row label="Muddatli"  value={<Badge color="purple">✓ Maqbul</Badge>} />}

          {/* Izoh — FAQAT o'z mijozida */}
          {isOwn && client.notes && (
            <Row label="Izoh" value={<span className="text-gray-600 text-sm">{client.notes}</span>} />
          )}

          {/* Agent nomi */}
          <Row label="Agent" value={
            <span className="text-sm font-medium">
              {isOwn ? 'Siz' : (client.agent_name || '—')}
            </span>
          } />
        </div>
      )}

      {/* ── MATCHES TAB ── */}
      {tab === 'matches' && (
        <div className="space-y-3">
          <div className="bg-cherry-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-sm font-medium">AI mos kelish tahlili</span>
              <button onClick={loadMatches} className="ml-auto p-1 rounded-lg hover:bg-white/10">
                <RefreshCw size={13} className={matchLoad ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-lg font-bold">{matches.length}</p>
                <p className="text-xs text-cherry-300">Mos ob'yekt</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-lg font-bold text-amber-400">{fmt(client.budget_max)}</p>
                <p className="text-xs text-cherry-300">Byudjet</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-lg font-bold">{client.rooms || '—'}</p>
                <p className="text-xs text-cherry-300">Xona</p>
              </div>
            </div>
          </div>

          {matchLoad ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : matches.length === 0 ? (
            <Empty icon={Target} title="Mos ob'yekt topilmadi"
              desc="Ob'yektlar qo'shilganda bu yerda ko'rinadi" />
          ) : (
            matches.map((p, i) => (
              <MatchCard key={p.id} property={p} client={client} rank={i + 1} />
            ))
          )}
        </div>
      )}

      {/* Edit modal — FAQAT isOwn */}
      {isOwn && (
        <EditClientModal
          open={editOpen}
          client={client}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); load() }}
        />
      )}
    </div>
  )
}

// ─── Row ────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-cherry-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right ml-4">{value}</span>
    </div>
  )
}

// ─── Match Card ─────────────────────────────────────────
function MatchCard({ property: p, client, rank }) {
  const [sent, setSent] = useState(false)

  const score = Math.min(100, Math.round(
    ((p.price <= (client.budget_max || 1e9) ? 40 : 20) +
     (!client.rooms || client.rooms === p.rooms ? 25 : 10) +
     (p.property_type === client.property_type ? 20 : 0) +
     15)
  ))

  const scoreColor =
    score >= 85 ? 'border-green-400 bg-green-50 text-green-700' :
    score >= 65 ? 'border-blue-400 bg-blue-50 text-blue-700'   :
                  'border-gray-200 bg-gray-50 text-gray-600'

  return (
    <div className={clsx('card p-4', rank === 1 && 'border-cherry-400')}>
      {rank === 1 && (
        <div className="mb-2">
          <span className="text-xs bg-amber-500 text-white font-semibold px-2 py-0.5 rounded-md">
            👑 Eng yaxshi mos
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {p.photos?.[0]
          ? <img src={p.photos[0]} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" />
          : <div className="w-14 h-14 rounded-xl bg-cherry-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-cherry-400" />
            </div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs text-gray-400">{p.display_id}</span>
            <Badge color="red">{PURPOSE_UZ[p.purpose]}</Badge>
            {p.is_own && <Badge color="green">O'zimniki</Badge>}
          </div>
          <p className="font-semibold text-gray-900 text-sm">
            {TYPE_UZ[p.property_type]}
            {p.rooms ? ' · ' + p.rooms + ' xona' : ''}
            {p.area  ? ' · ' + p.area + 'm²'     : ''}
          </p>
          <p className="text-base font-bold text-cherry-700 mt-0.5">{fmt(p.price)}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-cherry-400" />
            {/* Ko'cha nomi ko'rinadi, uy raqami yo'q */}
            {p.landmark || p.display_address || p.district || '—'}
          </p>
        </div>
        <div className={clsx('w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0', scoreColor)}>
          <span className="text-xs font-bold leading-none">{score}%</span>
          <span className="text-[9px] mt-0.5">mos</span>
        </div>
      </div>

      {/* Mos parametrlar */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-cherry-50">
        <Param ok={p.price <= (client.budget_max || 1e9)} label="Narx mos" />
        <Param ok={!client.rooms || client.rooms === p.rooms} label="Xona soni" />
        <Param ok={p.property_type === client.property_type} label="Tur mos" />
        {p.mortgage    && <Param ok label="Ipoteka" />}
        {p.installment && <Param ok label="Muddatli" />}
      </div>

      {/* Harakatlar */}
      <div className="flex gap-2 mt-3">
        {p.is_own ? (
          /* O'z ob'yekti — mulkdor tel */
          p.owner_phone ? (
            <a href={`tel:${p.owner_phone}`} className="flex-1">
              <Btn variant="primary" size="sm" className="w-full">
                <Phone size={13} /> Mulkdorga qo'ng'iroq
              </Btn>
            </a>
          ) : null
        ) : (
          /* Boshqa agentniki — agentga bog'lanish */
          p.agent_phone ? (
            <a href={`tel:${p.agent_phone}`} className="flex-1">
              <Btn variant="primary" size="sm" className="w-full">
                <Phone size={13} /> Agentga bog'lanish
              </Btn>
            </a>
          ) : null
        )}
        <Btn variant="outline" size="sm" className="flex-1"
          disabled={sent}
          onClick={() => { setSent(true); toast.success('Xabar yuborildi!') }}>
          <Send size={13} /> {sent ? 'Yuborildi' : 'Xabar'}
        </Btn>
      </div>
    </div>
  )
}

function Param({ ok, label }) {
  return (
    <div className={clsx('flex items-center gap-1.5 text-xs', ok ? 'text-gray-600' : 'text-gray-300')}>
      <div className={clsx('w-1.5 h-1.5 rounded-full', ok ? 'bg-green-500' : 'bg-gray-200')} />
      <span className={!ok ? 'line-through' : ''}>{label}</span>
    </div>
  )
}

// ─── Edit Client Modal ───────────────────────────────────
function EditClientModal({ open, client, onClose, onSaved }) {
  const [form, setForm]   = useState({})
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (client) setForm({
      full_name:     client.full_name     || '',
      phone:         client.phone         || '',
      need_type:     client.need_type     || 'buy',
      property_type: client.property_type || 'apartment',
      rooms:         client.rooms         || '',
      budget_min:    client.budget_min    || '',
      budget_max:    client.budget_max    || '',
      district:      client.district || client.region || '',
      notes:         client.notes         || '',
      mortgage:      client.mortgage      || false,
      installment:   client.installment   || false,
      status:        client.status        || 'active',
    })
  }, [client, open])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await clientsApi.update(client.id, { ...form, region: form.district })
      toast.success('Yangilandi!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mijozni tahrirlash" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="To'liq ism" value={form.full_name || ''} onChange={e => set('full_name', e.target.value)} />
          <Input label="Telefon" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Maqsadi" value={form.need_type || 'buy'} onChange={e => set('need_type', e.target.value)}>
            <option value="buy">Sotib oladi</option>
            <option value="rent">Ijaraga oladi</option>
          </Select>
          <Select label="Mulk turi" value={form.property_type || 'apartment'} onChange={e => set('property_type', e.target.value)}>
            <option value="apartment">Kvartira</option>
            <option value="house">Uy / Hovli</option>
            <option value="office">Ofis</option>
            <option value="land">Yer</option>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Select label="Xonalar" value={form.rooms || ''} onChange={e => set('rooms', e.target.value)}>
            <option value="">Farq qilmaydi</option>
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input label="Min $" type="number" value={form.budget_min || ''} onChange={e => set('budget_min', e.target.value)} />
          <Input label="Max $" type="number" value={form.budget_max || ''} onChange={e => set('budget_max', e.target.value)} />
        </div>
        <Input label="Shahar / Tuman" value={form.district || ''} onChange={e => set('district', e.target.value)} />
        <Select label="Holat" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
          <option value="active">Faol</option>
          <option value="archived">Arxivlash (yopildi)</option>
        </Select>
        <div className="flex gap-6">
          <Toggle checked={!!form.mortgage} onChange={e => set('mortgage', e.target.checked)} label="Ipoteka" />
          <Toggle checked={!!form.installment} onChange={e => set('installment', e.target.checked)} label="Muddatli to'lov" />
        </div>
        <Textarea label="Izoh" value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn type="submit" loading={loading} className="flex-1">Saqlash</Btn>
        </div>
      </form>
    </Modal>
  )
}
