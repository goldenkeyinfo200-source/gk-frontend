import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Phone, Users, Edit3,
  ChevronLeft, ChevronRight, Sparkles, Lock, Send,
  RefreshCw, Heart
} from 'lucide-react'
import { propertiesApi } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { Btn, Badge, Spinner, Empty, Modal, Input, Select, Textarea, Toggle } from '../../components/ui'
import { fmt, TYPE_UZ, PURPOSE_UZ, CITIES, ROOMS } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agent } = useAuthStore()

  const [property, setProperty] = useState(null)
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('info')
  const [photoIdx, setPhotoIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [matchLoad, setMatchLoad] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)

  const load = () => {
    setLoading(true)
    propertiesApi.get(id)
      .then(r => setProperty(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    if (tab === 'matches') {
      setMatchLoad(true)
      propertiesApi.matches(id)
        .then(r => setMatches(r.data))
        .finally(() => setMatchLoad(false))
    }
  }, [tab, id])

  const handleRepost = async () => {
    setPosting(true)
    try {
      await propertiesApi.update(id, { post_status: 'pending' })
      toast.success('Post Telegram ga yuborildi!')
      load()
    } catch {
      toast.error('Xato yuz berdi')
    } finally {
      setPosting(false)
    }
  }

  const handleHaveClient = async () => {
    setLeadLoading(true)
    try {
      navigate(`/clients?property=${id}`)
    } catch {
      toast.error('Xato yuz berdi')
    } finally {
      setLeadLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>
  }

  if (!property) {
    return <p className="text-center text-gray-400 py-20">Topilmadi</p>
  }

  const p = property
  const photos = p.photos || []
  const isOwn = p.is_own || p.agent_id === agent?.id || agent?.role === 'admin'

  return (
    <div className="max-w-2xl space-y-4">

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white border border-cherry-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">
            {TYPE_UZ[p.property_type]} · {p.display_id}
          </h1>
          <p className="text-xs text-gray-500">
            {PURPOSE_UZ[p.purpose]} · {p.agent_name}
            {!isOwn && <span className="ml-2 text-amber-600">· Boshqa agent</span>}
          </p>
        </div>

        {isOwn && (
          <Btn variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit3 size={14} /> Tahrirlash
          </Btn>
        )}
      </div>

      {photos.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden h-56 bg-cherry-50">
          <img src={photos[photoIdx]} className="w-full h-full object-cover" alt="" />

          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-xl p-1.5 hover:bg-black/60"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-xl p-1.5 hover:bg-black/60"
              >
                <ChevronRight size={16} />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full cursor-pointer transition-all',
                      i === photoIdx ? 'bg-white w-4' : 'bg-white/50'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge color={p.purpose === 'sell' ? 'red' : 'amber'}>
              {PURPOSE_UZ[p.purpose]}
            </Badge>
            <Badge color={p.status === 'active' ? 'green' : 'gray'}>
              {p.status === 'active' ? 'Faol' : 'Noaktiv'}
            </Badge>
          </div>

          {isOwn && (
            <div className="absolute top-3 right-3">
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-lg font-medium',
                p.post_status === 'posted'
                  ? 'bg-green-500/90 text-white'
                  : p.post_status === 'failed'
                  ? 'bg-red-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              )}>
                {p.post_status === 'posted'
                  ? '✓ Post yuborildi'
                  : p.post_status === 'failed'
                  ? '✕ Post xato'
                  : '⏳ Kutmoqda'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-cherry-700">{fmt(p.price)}</p>
          {p.area && (
            <p className="text-xs text-gray-500 mt-0.5">
              {fmt(Math.round(p.price / p.area))}/m²
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {!isOwn && (
            <Btn size="sm" onClick={handleHaveClient} loading={leadLoading}>
              <Heart size={13} /> Mijozim bor
            </Btn>
          )}

          {isOwn && p.owner_phone && (
            <a href={`tel:${p.owner_phone}`}>
              <Btn size="sm">
                <Phone size={13} /> Mulkdor
              </Btn>
            </a>
          )}

          {isOwn && (
            <Btn variant="outline" size="sm" onClick={handleRepost} loading={posting}>
              <Send size={13} /> Telegram post
            </Btn>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1">
        {[
          { key: 'info', label: "Ma'lumot" },
          { key: 'matches', label: 'Mos mijozlar' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.key
                ? 'bg-cherry-700 text-white'
                : 'text-gray-500 hover:text-cherry-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card p-5 space-y-1">
          {!isOwn && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
              <Lock size={14} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 flex-1">
                Boshqa agentning obyekti. Mulkdor va aniq manzil yashirin.
              </p>
              {p.agent_phone && (
                <a href={`tel:${p.agent_phone}`} className="flex-shrink-0">
                  <Btn size="sm">
                    <Phone size={12} /> {p.agent_name || 'Agent'}
                  </Btn>
                </a>
              )}
            </div>
          )}

          {p.property_type !== 'land' && (
            <InfoRow label="Xonalar" value={p.rooms ? p.rooms + ' ta' : '—'} />
          )}

          {p.area && <InfoRow label="Maydon" value={p.area + ' m²'} />}
          {p.floor && <InfoRow label="Qavat" value={`${p.floor} / ${p.total_floors || '?'}`} />}

          <InfoRow label="Ko'cha" value={p.landmark || p.display_address || p.district || '—'} />

          {p.district && <InfoRow label="Tuman" value={p.district} />}

          <InfoRow
            label="Aniq manzil"
            value={
              isOwn
                ? (p.address || '—')
                : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <Lock size={12} /> Yashirin
                  </span>
                )
            }
          />

          {isOwn && p.owner_name && <InfoRow label="Mulkdor" value={p.owner_name} />}

          {isOwn && p.owner_phone && (
            <InfoRow
              label="Mulkdor tel"
              value={
                <a href={`tel:${p.owner_phone}`} className="text-cherry-700 hover:underline flex items-center gap-1">
                  <Phone size={12} /> {p.owner_phone}
                </a>
              }
            />
          )}

          {p.mortgage && <InfoRow label="Ipoteka" value={<Badge color="blue">✓ Maqbul</Badge>} />}
          {p.installment && <InfoRow label="Muddatli" value={<Badge color="purple">✓ Maqbul</Badge>} />}

          {p.description && (
            <div className="pt-3 border-t border-cherry-50">
              <p className="text-xs text-gray-400 mb-1">Tavsif</p>
              <p className="text-sm text-gray-700 leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'matches' && (
        <div className="space-y-3">
          <div className="bg-cherry-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-sm font-medium">Mos mijozlar</span>

              <button
                onClick={() => {
                  setMatchLoad(true)
                  propertiesApi.matches(id)
                    .then(r => setMatches(r.data))
                    .finally(() => setMatchLoad(false))
                }}
                className="ml-auto p-1 rounded-lg hover:bg-white/10"
              >
                <RefreshCw size={13} className={matchLoad ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-lg font-bold">{matches.length}</p>
                <p className="text-xs text-cherry-300">Topildi</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-lg font-bold text-amber-400">{fmt(p.price)}</p>
                <p className="text-xs text-cherry-300">Narx</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <p className="text-lg font-bold">{p.rooms || '—'}</p>
                <p className="text-xs text-cherry-300">Xona</p>
              </div>
            </div>
          </div>

          {matchLoad ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : matches.length === 0 ? (
            <Empty icon={Users} title="Mos mijoz topilmadi" />
          ) : (
            matches.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cherry-100 flex items-center justify-center text-sm font-semibold text-cherry-700 flex-shrink-0">
                    {c.display_name?.[0] || 'M'}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{c.display_name}</p>
                    <p className="text-xs text-gray-500">
                      {c.need_type === 'buy' ? 'Sotib oladi' : 'Ijaraga'} · {fmt(c.budget_max)}
                    </p>
                  </div>

                  {c.is_own ? (
                    c.phone && (
                      <a href={`tel:${c.phone}`}>
                        <Btn size="sm">
                          <Phone size={12} /> Bog'lanish
                        </Btn>
                      </a>
                    )
                  ) : (
                    c.agent_phone ? (
                      <a href={`tel:${c.agent_phone}`}>
                        <Btn size="sm" variant="outline">
                          <Phone size={12} /> {c.agent_name || 'Agent'}
                        </Btn>
                      </a>
                    ) : (
                      <Badge color="gray">
                        <Lock size={10} /> Boshqa agent
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isOwn && (
        <EditPropertyModal
          open={editOpen}
          property={p}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-cherry-50 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right ml-4 max-w-xs">{value}</span>
    </div>
  )
}

function EditPropertyModal({ open, property: p, onClose, onSaved }) {
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    if (p) {
      const parts = (p.address || '').split(',').map(s => s.trim())

      setForm({
        purpose: p.purpose || 'sell',
        property_type: p.property_type || 'apartment',
        rooms: p.rooms || '',
        area: p.area || '',
        floor: p.floor || '',
        total_floors: p.total_floors || '',
        price: p.price || '',
        city: p.region || '',
        district: p.district || '',
        street: p.landmark || parts[0] || '',
        house_number: parts[1] || '',
        owner_name: p.owner_name || '',
        owner_phone: p.owner_phone || '',
        description: p.description || '',
        mortgage: p.mortgage || false,
        installment: p.installment || false,
        status: p.status || 'active',
      })
    }
  }, [p, open])

  const submit = async (e) => {
    e.preventDefault()

    if (!form.price) {
      return toast.error('Narx kiritish shart')
    }

    setLoading(true)

    try {
      await propertiesApi.update(p.id, {
        ...form,
        region: form.city,
        landmark: form.street,
        address: form.street + (form.house_number ? ', ' + form.house_number : ''),
      })

      toast.success("Obyekt yangilandi!")
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Obyektni tahrirlash" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Maqsad" value={form.purpose || 'sell'} onChange={e => set('purpose', e.target.value)}>
            <option value="sell">Sotiladi</option>
            <option value="rent">Ijaraga</option>
          </Select>

          <Select label="Tur" value={form.property_type || 'apartment'} onChange={e => set('property_type', e.target.value)}>
            <option value="apartment">Kvartira</option>
            <option value="house">Uy / Hovli</option>
            <option value="office">Ofis</option>
            <option value="land">Yer</option>
            <option value="commercial">Noturar joy</option>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Input label="Xonalar" type="text" value={form.rooms || ''} onChange={e => set('rooms', e.target.value)} placeholder="2" />

          <Input label="Maydon m²" type="number" value={form.area || ''} onChange={e => set('area', e.target.value)} />
          <Input label="Qavat" type="number" value={form.floor || ''} onChange={e => set('floor', e.target.value)} />
          <Input label="Jami" type="number" value={form.total_floors || ''} onChange={e => set('total_floors', e.target.value)} />
        </div>

        <Input label="Narx ($) *" type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} />

        <div className="bg-cherry-50 rounded-xl p-3 space-y-3">
          <p className="text-xs font-semibold text-cherry-700 flex items-center gap-1.5">
            <MapPin size={13} /> Manzil
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Shahar" value={form.city || ''} onChange={e => set('city', e.target.value)}>
              <option value="">Tanlang</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Input label="Tuman" value={form.district || ''} onChange={e => set('district', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input label="Ko'cha" value={form.street || ''} onChange={e => set('street', e.target.value)} />
              <p className="text-xs text-green-600 mt-1">✓ E'londa ko'rsatiladi</p>
            </div>

            <div>
              <Input label="Uy raqami" value={form.house_number || ''} onChange={e => set('house_number', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">🔒 Faqat agentga</p>
            </div>
          </div>
          <Input label="Mo'ljal" value={form.landmark_note || ''} onChange={e => set('landmark_note', e.target.value)} placeholder="Supermarket yonida, 5-avtobus bekati" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Mulkdor ismi" value={form.owner_name || ''} onChange={e => set('owner_name', e.target.value)} />
          <Input label="Mulkdor telefon" value={form.owner_phone || ''} onChange={e => set('owner_phone', e.target.value)} />
        </div>

        <Select label="Holat" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
          <option value="active">Faol</option>
          <option value="reserved">Band</option>
          <option value="archived">Arxivlash</option>
        </Select>

        <div className="flex gap-6">
          <Toggle checked={!!form.mortgage} onChange={e => set('mortgage', e.target.checked)} label="Ipoteka" />
          <Toggle checked={!!form.installment} onChange={e => set('installment', e.target.checked)} label="Muddatli to'lov" />
        </div>

        <Textarea label="Tavsif" value={form.description || ''} onChange={e => set('description', e.target.value)} />

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">
            Bekor
          </Btn>

          <Btn type="submit" loading={loading} className="flex-1">
            <Edit3 size={14} /> Saqlash
          </Btn>
        </div>
      </form>
    </Modal>
  )
}