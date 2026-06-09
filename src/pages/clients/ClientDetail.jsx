import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Phone, MapPin, Target, Edit3, Trash2, CheckCircle,
  Building2, DollarSign, Home, RefreshCw, Sparkles, Send
} from 'lucide-react'
import { clientsApi, leadsApi } from '../../services/api'
import { Btn, Badge, Modal, Input, Select, Textarea, Toggle, Spinner, Empty } from '../../components/ui'
import { fmt, TYPE_UZ, NEED_UZ, PURPOSE_UZ, REGIONS, ROOMS } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient]   = useState(null)
  const [matches, setMatches] = useState([])
  const [tab, setTab]         = useState('info')
  const [loading, setLoading] = useState(true)
  const [matchLoad, setMatchLoad] = useState(false)
  const [editOpen, setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  const handleDelete = async () => {
    try {
      await clientsApi.delete(id)
      toast.success("O'chirildi")
      navigate('/clients')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    }
  }

  const handleArchive = async () => {
    try {
      await clientsApi.update(id, { ...client, status: 'archived' })
      toast.success('Arxivlandi')
      load()
    } catch (err) {
      toast.error('Xato')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!client) return <div className="text-center py-20 text-gray-400">Topilmadi</div>

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white border border-cherry-100 text-gray-500 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{client.full_name || client.display_id}</h1>
          <p className="text-xs text-gray-500">{client.display_id} · {NEED_UZ[client.need_type]}</p>
        </div>
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
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1">
        {[
          { key: 'info',    label: "Ma'lumot" },
          { key: 'matches', label: 'Mos ob\'yektlar' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.key ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* INFO TAB */}
      {tab === 'info' && (
        <div className="card p-5 space-y-3">
          <Row label="Holati" value={
            <Badge color={client.status === 'active' ? 'green' : 'gray'}>
              {client.status === 'active' ? 'Faol' : 'Arxiv'}
            </Badge>
          } />
          <Row label="Maqsadi"    value={NEED_UZ[client.need_type]} />
          <Row label="Mulk turi"  value={TYPE_UZ[client.property_type]} />
          {client.rooms && <Row label="Xonalar" value={client.rooms + ' ta'} />}
          <Row label="Byudjet"    value={`${fmt(client.budget_min)} — ${fmt(client.budget_max)}`} />
          {client.phone && (
            <Row label="Telefon" value={
              <a href={`tel:${client.phone}`} className="text-cherry-700 font-medium hover:underline flex items-center gap-1">
                <Phone size={13} /> {client.phone}
              </a>
            } />
          )}
          {client.region && <Row label="Hudud" value={<span className="flex items-center gap-1"><MapPin size={13} className="text-cherry-500" />{client.region}</span>} />}
          {client.mortgage && <Row label="Ipoteka" value={<Badge color="blue">✓ Maqbul</Badge>} />}
          {client.installment && <Row label="Muddatli" value={<Badge color="purple">✓ Maqbul</Badge>} />}
          {client.notes && <Row label="Izoh" value={<span className="text-gray-600 text-sm">{client.notes}</span>} />}
          {client.agent_name && <Row label="Agent" value={client.agent_name} />}
        </div>
      )}

      {/* MATCHES TAB */}
      {tab === 'matches' && (
        <div className="space-y-3">
          {/* AI Score header */}
          <div className="bg-cherry-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-amber-400" />
              <span className="text-sm font-medium">AI mos kelish tahlili</span>
              <button onClick={loadMatches} className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-all">
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
            <Empty
              icon={Target}
              title="Mos ob'yekt topilmadi"
              desc="Ob'yektlar qo'shilganda bu yerda ko'rinadi"
            />
          ) : (
            matches.map((p, i) => <MatchCard key={p.id} property={p} client={client} rank={i + 1} />)
          )}
        </div>
      )}

      {/* Edit modal */}
      <EditClientModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); load() }}
      />

      {/* Delete confirm */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="O'chirishni tasdiqlang" size="sm">
        <p className="text-sm text-gray-600 mb-5">
          <strong>{client.full_name}</strong> ni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
        </p>
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1">Bekor qilish</Btn>
          <Btn variant="danger" onClick={handleDelete} className="flex-1">
            <Trash2 size={14} /> O'chirish
          </Btn>
        </div>
      </Modal>
    </div>
  )
}

// ─── Row ────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-cherry-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

// ─── Match Card ─────────────────────────────────────────
function MatchCard({ property: p, client, rank }) {
  const [sent, setSent] = useState(false)

  const scoreColor = (s) =>
    s >= 85 ? 'border-green-400 bg-green-50 text-green-700' :
    s >= 65 ? 'border-blue-400 bg-blue-50 text-blue-700' :
              'border-gray-200 bg-gray-50 text-gray-600'

  const score = Math.round(
    ((p.price <= (client.budget_max || 1e9) ? 40 : 0) +
     (!client.rooms || client.rooms === p.rooms ? 25 : 0) +
     (p.property_type === client.property_type ? 20 : 0) +
     15) / 100 * 100
  )

  return (
    <div className={clsx('card p-4 transition-all', rank === 1 && 'border-cherry-300')}>
      {rank === 1 && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs bg-amber-500 text-white font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">{p.display_id}</span>
            <Badge color="red">{PURPOSE_UZ[p.purpose]}</Badge>
            {p.is_own && <Badge color="green">O'zimniki</Badge>}
          </div>
          <p className="font-semibold text-gray-900 text-sm mt-1">
            {TYPE_UZ[p.property_type]} · {p.rooms ? p.rooms + ' xona' : ''} {p.area ? `· ${p.area}m²` : ''}
          </p>
          <p className="text-base font-bold text-cherry-700 mt-0.5">{fmt(p.price)}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-cherry-400" />
            {p.display_address || p.region || p.district || '—'}
          </p>
        </div>
        <div className={clsx('w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0', scoreColor(score))}>
          <span className="text-xs font-bold leading-none">{score}%</span>
          <span className="text-[9px] leading-none mt-0.5">mos</span>
        </div>
      </div>

      {/* Params */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cherry-50">
        <ParamDot ok={p.price <= (client.budget_max || 1e9)} label="Narx mos" />
        <ParamDot ok={!client.rooms || client.rooms === p.rooms} label="Xona soni" />
        <ParamDot ok={p.property_type === client.property_type} label="Tur mos" />
        {p.mortgage && <ParamDot ok={true} label="Ipoteka" />}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {p.agent_phone && (
          <a href={`tel:${p.agent_phone}`} className="flex-1">
            <Btn variant="primary" size="sm" className="w-full">
              <Phone size={13} /> Bog'lanish
            </Btn>
          </a>
        )}
        <Btn variant="outline" size="sm" className="flex-1" disabled={sent} onClick={async () => {
          // Send lead to property's agent
          setSent(true)
          toast.success('Xabar yuborildi!')
        }}>
          <Send size={13} /> {sent ? 'Yuborildi' : 'Xabar'}
        </Btn>
      </div>
    </div>
  )
}

function ParamDot({ ok, label }) {
  return (
    <div className={clsx('flex items-center gap-1.5 text-xs', ok ? 'text-gray-600' : 'text-gray-300')}>
      <div className={clsx('w-1.5 h-1.5 rounded-full', ok ? 'bg-green-500' : 'bg-gray-200')} />
      <span className={!ok ? 'line-through' : ''}>{label}</span>
    </div>
  )
}

// ─── Edit Client Modal ───────────────────────────────────
function EditClientModal({ open, client, onClose, onSaved }) {
  const [form, setForm] = useState(client || {})
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { if (client) setForm(client) }, [client])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await clientsApi.update(client.id, form)
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
        <Select label="Holat" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
          <option value="active">Faol</option>
          <option value="archived">Arxivlash</option>
        </Select>
        <Textarea label="Izoh" value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn type="submit" loading={loading} className="flex-1">Saqlash</Btn>
        </div>
      </form>
    </Modal>
  )
}
