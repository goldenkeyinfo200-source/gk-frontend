import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Building2, MapPin, Users, Send, Filter } from 'lucide-react'
import { propertiesApi } from '../../services/api'
import { Btn, Empty, Spinner, Badge, Modal, Input, Select, Textarea, Toggle } from '../../components/ui'
import { fmt, TYPE_UZ, PURPOSE_UZ, REGIONS, ROOMS } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_TABS = [
  { key: '',       label: 'Barchasi' },
  { key: 'active', label: 'Faol'     },
  { key: 'mine',   label: 'Meniki'   },
]

export default function Properties() {
  const [props, setProps]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [mine, setMine]       = useState(false)
  const [purpose, setPurpose] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await propertiesApi.list({ mine: mine || undefined, purpose: purpose || undefined })
      setProps(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [mine, purpose])

  const filtered = props.filter(p =>
    !search || [p.display_id, p.region, p.district, p.address].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ob'yektlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} ta ob'yekt</p>
        </div>
        <Btn onClick={() => setAddOpen(true)}><Plus size={16} /> Yangi ob'yekt</Btn>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-cherry-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100"
          />
        </div>
        <div className="flex gap-1 bg-white border border-cherry-100 rounded-xl p-1">
          {[
            { val: '',     label: 'Hammasi' },
            { val: 'sell', label: 'Sotuv'   },
            { val: 'rent', label: 'Ijara'   },
          ].map(t => (
            <button key={t.val} onClick={() => setPurpose(t.val)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                purpose === t.val ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700')}>
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} className="accent-cherry-700 w-4 h-4" />
          Faqat menikiler
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Empty
          icon={Building2}
          title="Ob'yektlar yo'q"
          desc="Yangi ob'yekt qo'shib boshlang"
          action={<Btn onClick={() => setAddOpen(true)}><Plus size={15} /> Qo'shish</Btn>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(p => (
            <Link key={p.id} to={`/properties/${p.id}`}>
              <div className="card overflow-hidden hover:shadow-card-hover transition-all group">
                {/* Photo */}
                <div className="h-36 bg-cherry-50 relative overflow-hidden">
                  {p.photos?.[0]
                    ? <img src={p.photos[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={32} className="text-cherry-200" />
                      </div>
                  }
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge color={p.purpose === 'sell' ? 'red' : 'amber'}>
                      {PURPOSE_UZ[p.purpose]}
                    </Badge>
                    {!p.is_own && <Badge color="gray">Boshqa agent</Badge>}
                  </div>
                  {p.photos?.length > 1 && (
                    <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">
                      {p.photos.length} rasm
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {TYPE_UZ[p.property_type]}
                        {p.rooms ? ` · ${p.rooms} xona` : ''}
                        {p.area ? ` · ${p.area}m²` : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} className="text-cherry-400" />
                        {p.display_address || p.region || '—'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-cherry-700">{fmt(p.price)}</p>
                      {p.floor && p.total_floors && (
                        <p className="text-xs text-gray-400">{p.floor}/{p.total_floors} qavat</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-cherry-50">
                    <Badge color={p.status === 'active' ? 'green' : 'gray'}>
                      {p.status === 'active' ? 'Faol' : p.status === 'archived' ? 'Arxiv' : p.status}
                    </Badge>
                    {p.matched_clients > 0 && (
                      <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <Users size={11} /> {p.matched_clients} mos mijoz
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AddPropertyModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => { setAddOpen(false); load() }}
      />
    </div>
  )
}

// ─── Add Property Modal ──────────────────────────────────
function AddPropertyModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    purpose: 'sell', property_type: 'apartment', rooms: '', area: '',
    floor: '', total_floors: '', price: '', region: '', district: '',
    address: '', owner_name: '', owner_phone: '', description: '',
    mortgage: false, installment: false,
  })
  const [files, setFiles]   = useState([])
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.price) return toast.error("Narx kiritish shart")
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach(f => fd.append('photos', f))
      await propertiesApi.create(fd)
      toast.success("Ob'yekt qo'shildi va Telegram ga yuborildi!")
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Yangi ob'yekt" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Maqsad" value={form.purpose} onChange={e => set('purpose', e.target.value)}>
            <option value="sell">Sotiladi</option>
            <option value="rent">Ijaraga</option>
          </Select>
          <Select label="Tur" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
            <option value="apartment">Kvartira</option>
            <option value="house">Uy / Hovli</option>
            <option value="office">Ofis</option>
            <option value="land">Yer</option>
          </Select>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Select label="Xonalar" value={form.rooms} onChange={e => set('rooms', e.target.value)}>
            <option value="">—</option>
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input label="Maydon m²" type="number" value={form.area} onChange={e => set('area', e.target.value)} />
          <Input label="Qavat" type="number" value={form.floor} onChange={e => set('floor', e.target.value)} />
          <Input label="Jami qavat" type="number" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} />
        </div>
        <Input label="Narx ($) *" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Viloyat" value={form.region} onChange={e => set('region', e.target.value)}>
            <option value="">Tanlang</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input label="Tuman/ko'cha" value={form.district} onChange={e => set('district', e.target.value)} />
        </div>
        <Input label="Aniq manzil (yashirin)" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ko'cha, uy raqami..." />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Mulkdor ismi" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
          <Input label="Mulkdor telefon" value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} />
        </div>
        <div className="flex gap-6">
          <Toggle checked={form.mortgage} onChange={e => set('mortgage', e.target.checked)} label="Ipoteka" />
          <Toggle checked={form.installment} onChange={e => set('installment', e.target.checked)} label="Muddatli to'lov" />
        </div>
        <Textarea label="Tavsif" value={form.description} onChange={e => set('description', e.target.value)} />
        {/* Photo upload */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Rasmlar (max 10)</label>
          <input
            type="file" multiple accept="image/*"
            onChange={e => setFiles(Array.from(e.target.files))}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-cherry-50 file:text-cherry-700 hover:file:bg-cherry-100"
          />
          {files.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {files.map((f, i) => (
                <img key={i} src={URL.createObjectURL(f)} className="w-14 h-14 rounded-xl object-cover border border-cherry-100" alt="" />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor</Btn>
          <Btn type="submit" loading={loading} className="flex-1">
            <Send size={14} /> Saqlash va post
          </Btn>
        </div>
      </form>
    </Modal>
  )
}
