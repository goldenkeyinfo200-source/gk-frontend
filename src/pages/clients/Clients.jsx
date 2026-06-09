import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, Phone, Target, Filter } from 'lucide-react'
import { clientsApi } from '../../services/api'
import { Btn, Empty, Spinner, Badge, Modal, Input, Select, Textarea, Toggle } from '../../components/ui'
import { fmt, TYPE_UZ, NEED_UZ, REGIONS, ROOMS } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_TABS = [
  { key: '',         label: 'Barchasi' },
  { key: 'active',   label: 'Faol'     },
  { key: 'archived', label: 'Arxiv'    },
]

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [addOpen, setAddOpen]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await clientsApi.list({ search, status })
      setClients(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, status])

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mijozlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} ta mijoz</p>
        </div>
        <Btn onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Yangi mijoz
        </Btn>
      </div>

      {/* Search & filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ism yoki telefon qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-cherry-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-white border border-cherry-100 rounded-xl p-1">
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                status === t.key ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : clients.length === 0 ? (
        <Empty
          icon={Users}
          title="Mijozlar yo'q"
          desc="Yangi mijoz qo'shib boshlang"
          action={<Btn onClick={() => setAddOpen(true)}><Plus size={15} /> Qo'shish</Btn>}
        />
      ) : (
        <div className="grid gap-3">
          {clients.map(c => (
            <Link key={c.id} to={`/clients/${c.id}`}>
              <div className="card p-4 hover:shadow-card-hover transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-cherry-100 flex items-center justify-center text-sm font-semibold text-cherry-700 flex-shrink-0">
                    {c.full_name?.[0] || 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{c.full_name || '—'}</span>
                      <span className="text-xs text-gray-400">{c.display_id}</span>
                      <Badge color={c.status === 'active' ? 'green' : 'gray'}>
                        {c.status === 'active' ? 'Faol' : 'Arxiv'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={11} /> {c.phone || '—'}
                      </span>
                      <span className="text-xs text-gray-500">{NEED_UZ[c.need_type]} · {TYPE_UZ[c.property_type]}</span>
                      {c.rooms && <span className="text-xs text-gray-500">{c.rooms} xona</span>}
                      <span className="text-xs font-medium text-cherry-700">{fmt(c.budget_max)}</span>
                    </div>
                    {c.region && (
                      <p className="text-xs text-gray-400 mt-1">📍 {c.region}</p>
                    )}
                  </div>
                  {c.matched_count > 0 && (
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        <Target size={12} />
                        <span className="text-xs font-medium">{c.matched_count} mos</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add modal */}
      <AddClientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => { setAddOpen(false); load() }}
      />
    </div>
  )
}

// ─── Add Client Modal ────────────────────────────────────
function AddClientModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: '', phone: '', need_type: 'buy', property_type: 'apartment',
    rooms: '', budget_min: '', budget_max: '', region: '', notes: '',
    mortgage: false, installment: false,
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.need_type || !form.property_type) return toast.error("Kerakli maydonlarni to'ldiring")
    setLoading(true)
    try {
      await clientsApi.create(form)
      toast.success('Mijoz qo\'shildi!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Yangi mijoz" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="To'liq ism" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Sardor Rahimov" />
          <Input label="Telefon" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+998 90 123 45 67" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Maqsadi" value={form.need_type} onChange={e => set('need_type', e.target.value)}>
            <option value="buy">Sotib oladi</option>
            <option value="rent">Ijaraga oladi</option>
          </Select>
          <Select label="Mulk turi" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
            <option value="apartment">Kvartira</option>
            <option value="house">Uy / Hovli</option>
            <option value="office">Ofis</option>
            <option value="land">Yer</option>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Select label="Xonalar" value={form.rooms} onChange={e => set('rooms', e.target.value)}>
            <option value="">Farq qilmaydi</option>
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input label="Byudjet (min $)" type="number" value={form.budget_min} onChange={e => set('budget_min', e.target.value)} placeholder="0" />
          <Input label="Byudjet (max $)" type="number" value={form.budget_max} onChange={e => set('budget_max', e.target.value)} placeholder="50000" />
        </div>
        <Select label="Hudud" value={form.region} onChange={e => set('region', e.target.value)}>
          <option value="">Tanlang</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
        <div className="flex gap-6">
          <Toggle checked={form.mortgage} onChange={e => set('mortgage', e.target.checked)} label="Ipoteka" />
          <Toggle checked={form.installment} onChange={e => set('installment', e.target.checked)} label="Muddatli to'lov" />
        </div>
        <Textarea label="Izoh" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Qo'shimcha talablar..." />
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">Bekor qilish</Btn>
          <Btn type="submit" loading={loading} className="flex-1">Saqlash</Btn>
        </div>
      </form>
    </Modal>
  )
}
