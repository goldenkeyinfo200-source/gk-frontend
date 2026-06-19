import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Building2, MapPin, Users, Send, Edit3, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { propertiesApi } from '../../services/api'
import { Btn, Empty, Spinner, Badge, Modal, Input, Select, Toggle } from '../../components/ui'
import { fmt, TYPE_UZ, PURPOSE_UZ, CITIES } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const FEATURES = {
  'Qurilish': ["G'isht", 'Beton', 'Pena/gaz blok', 'Sinch', "Xom g'isht", 'Monolit'],
  'Veranda': ['3 metrli veranda', '6 metrli veranda'],
  'Isitish': ['Ariston', 'Titan', 'Vaillant', 'Otopleniye', 'Issiq pol'],
  'Pol': ['Parket', 'Taxta pol', 'Kovrolyn', 'Linoleum'],
  "Ta'mir": ["Evro ta'mir", "O'rtacha ta'mir", "Bez ta'mir"],
  'Eshik/Rom': ['Karobka', 'Taxta rom/eshik', 'Akfa/Ekopen rom', 'MDF eshik'],
  'Jihozlar': ['Jihozlari bilan', 'Jihozsiz'],
  'Kommunal': ['Wi-Fi', 'Kamera', 'Suv', 'Gaz', 'Svet', 'Kanalizatsiya'],
  'Qulayliklar': ['Lift bor', 'Maktab', "Bog'cha", 'Supermarket', 'Parkovka', "Katta yo'l yaqinida"],
}

export default function Properties() {
  const [props, setProps] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [mine, setMine] = useState(false)
  const [purpose, setPurpose] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await propertiesApi.list({
        mine: mine || undefined,
        purpose: purpose || undefined,
      })
      setProps(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [mine, purpose])

  const filtered = props.filter(p =>
    !search ||
    [p.display_id, p.district, p.street, p.display_address, p.owner_phone]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ob'yektlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} ta ob'yekt</p>
        </div>
        <Btn onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Yangi ob'yekt
        </Btn>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Shahar, tuman, ko'cha yoki telefon bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-cherry-100 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex gap-1 bg-white border border-cherry-100 rounded-xl p-1">
            {[
              { val: '', label: 'Hammasi' },
              { val: 'sell', label: 'Sotuv' },
              { val: 'rent', label: 'Ijara' },
            ].map(t => (
              <button
                key={t.val}
                onClick={() => setPurpose(t.val)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  purpose === t.val
                    ? 'bg-cherry-700 text-white'
                    : 'text-gray-500 hover:text-cherry-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none bg-white border border-cherry-100 rounded-xl px-3">
            <input
              type="checkbox"
              checked={mine}
              onChange={e => setMine(e.target.checked)}
              className="accent-cherry-700 w-4 h-4"
            />
            Meniki
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          icon={Building2}
          title={search ? "Qidiruv natijasi yo'q" : "Ob'yektlar yo'q"}
          desc={search ? `"${search}" bo'yicha hech narsa topilmadi` : "Yangi ob'yekt qo'shib boshlang"}
          action={!search && (
            <Btn onClick={() => setAddOpen(true)}>
              <Plus size={15} /> Qo'shish
            </Btn>
          )}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="card overflow-hidden hover:shadow-card-hover transition-all group relative">
              {p.is_own && (
                <button
                  onClick={e => {
                    e.preventDefault()
                    setEditItem(p)
                  }}
                  className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-cherry-700 rounded-xl p-1.5 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  <Edit3 size={13} />
                </button>
              )}

              <Link to={`/properties/${p.id}`}>
                <div className="h-36 bg-cherry-50 relative overflow-hidden">
                  {p.photos?.[0] ? (
                    <img
                      src={p.photos[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={32} className="text-cherry-200" />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge color={p.purpose === 'sell' ? 'red' : 'amber'}>
                      {PURPOSE_UZ[p.purpose]}
                    </Badge>
                    {!p.is_own && <Badge color="gray">Boshqa agent</Badge>}
                  </div>

                  {p.photos?.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">
                      {p.photos.length} rasm
                    </span>
                  )}
                </div>

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
                        {[p.district, p.street].filter(Boolean).join(', ') || p.display_address || '—'}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-cherry-700">{fmt(p.price)}</p>
                      {p.floor && p.total_floors && (
                        <p className="text-xs text-gray-400">{p.floor}/{p.total_floors} qavat</p>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.description.split('\n')[0].split(',').slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-cherry-50 text-cherry-700 px-1.5 py-0.5 rounded-md">
                          {f.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-cherry-50">
                    <Badge color={p.status === 'active' ? 'green' : 'gray'}>
                      {p.status === 'active' ? 'Faol' : p.status === 'sold' ? 'Sotildi' : 'Noaktiv'}
                    </Badge>

                    {p.matched_clients > 0 && (
                      <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <Users size={11} /> {p.matched_clients} mos mijoz
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <PropertyFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false)
          load()
        }}
      />

      <PropertyFormModal
        open={!!editItem}
        property={editItem}
        onClose={() => setEditItem(null)}
        onSaved={() => {
          setEditItem(null)
          load()
        }}
      />
    </div>
  )
}

function FeatureSelector({ selected, onChange }) {
  const toggle = feat => {
    const arr = selected.includes(feat)
      ? selected.filter(f => f !== feat)
      : [...selected, feat]
    onChange(arr)
  }

  return (
    <div className="space-y-3">
      {Object.entries(FEATURES).map(([group, items]) => (
        <div key={group}>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">{group}</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggle(item)}
                className={clsx(
                  'text-xs px-2.5 py-1.5 rounded-xl border transition-all active:scale-95',
                  selected.includes(item)
                    ? 'bg-cherry-700 border-cherry-700 text-white'
                    : 'bg-white border-cherry-100 text-gray-600 hover:border-cherry-400 hover:text-cherry-700'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PropertyFormModal({ open, property, onClose, onSaved }) {
  const isEdit = !!property

  const [form, setForm] = useState({
    purpose: 'sell',
    property_type: 'apartment',
    rooms: '',
    area: '',
    floor: '',
    total_floors: '',
    price: '',
    city: '',
    district: '',
    street: '',
    house_number: '',
    landmark_note: '',
    location_url: '',
    owner_name: '',
    owner_phone: '',
    mortgage: false,
    installment: false,
    status: 'active',
  })

  const [features, setFeatures] = useState([])
  const [extraNote, setExtraNote] = useState('')
  const [files, setFiles] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [deletedPhotos, setDeletedPhotos] = useState([])
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (property) {
      const parts = (property.address || '').split(',').map(s => s.trim())
      const desc = property.description || ''
      const lines = desc.split('\n')
      const featLine = lines[0] || ''
      const noteLine = lines.slice(1).join('\n').trim()
      const savedFeats = featLine
        ? featLine.split(',').map(s => s.trim()).filter(Boolean)
        : []

      setFeatures(savedFeats)
      setExtraNote(noteLine)
      setFiles([])
      setExistingPhotos(property.photos || [])
      setDeletedPhotos([])

      setForm({
        purpose: property.purpose || 'sell',
        property_type: property.property_type || 'apartment',
        rooms: property.rooms || '',
        area: property.area || '',
        floor: property.floor || '',
        total_floors: property.total_floors || '',
        price: property.price || '',
        city: property.region || '',
        district: property.district || '',
        street: (property.landmark || '').split(' | ')[0] || parts[0] || '',
        landmark_note: (property.landmark || '').split(' | ')[1] || '',
        location_url: property.location_url || '',
        house_number: parts[1] || '',
        owner_name: property.owner_name || '',
        owner_phone: property.owner_phone || '',
        mortgage: property.mortgage || false,
        installment: property.installment || false,
        status: property.status || 'active',
      })
    } else {
      setForm({
        purpose: 'sell',
        property_type: 'apartment',
        rooms: '',
        area: '',
        floor: '',
        total_floors: '',
        price: '',
        city: '',
        district: '',
        street: '',
        house_number: '',
        landmark_note: '',
        location_url: '',
        owner_name: '',
        owner_phone: '',
        mortgage: false,
        installment: false,
        status: 'active',
      })
      setFeatures([])
      setExtraNote('')
      setFiles([])
      setExistingPhotos([])
      setDeletedPhotos([])
    }
  }, [property, open])

  const removeExistingPhoto = photo => {
    setDeletedPhotos(prev => [...prev, photo])
    setExistingPhotos(prev => prev.filter(p => p !== photo))
  }

  const removeNewFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const submit = async e => {
    e.preventDefault()

    if (!form.price) {
      return toast.error('Narx kiritish shart')
    }

    setLoading(true)

    try {
      const description = [
        features.join(', '),
        extraNote,
      ].filter(Boolean).join('\n')

      const payload = {
        ...form,
        region: form.city,
        landmark: [form.street, form.landmark_note].filter(Boolean).join(' | '),
        address: form.street + (form.house_number ? ', ' + form.house_number : ''),
        location_url: form.location_url || '',
        description,
      }

      const fd = new FormData()

      Object.entries(payload).forEach(([k, v]) => {
        fd.append(k, v ?? '')
      })

      if (isEdit) {
        fd.append('deletedPhotos', JSON.stringify(deletedPhotos))
      }

      files.forEach(f => fd.append('photos', f))

      if (isEdit) {
        await propertiesApi.update(property.id, fd)
        toast.success("Ob'yekt yangilandi!")
      } else {
        await propertiesApi.create(fd)
        toast.success("Ob'yekt qo'shildi va Telegram ga yuborildi!")
      }

      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Ob'yektni tahrirlash" : "Yangi ob'yekt"} size="lg">
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
            <option value="commercial">Noturar joy</option>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Input label="Xonalar" type="text" value={form.rooms} onChange={e => set('rooms', e.target.value)} />
          <Input label="Maydon m²" type="number" value={form.area} onChange={e => set('area', e.target.value)} />
          <Input label="Qavat" type="number" value={form.floor} onChange={e => set('floor', e.target.value)} />
          <Input label="Jami" type="number" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} />
        </div>

        <Input label="Narx ($) *" type="number" value={form.price} onChange={e => set('price', e.target.value)} />

        <div className="bg-cherry-50 rounded-xl p-3 space-y-3">
          <p className="text-xs font-semibold text-cherry-700 flex items-center gap-1.5">
            <MapPin size={13} /> Manzil
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Shahar" value={form.city} onChange={e => set('city', e.target.value)}>
              <option value="">Tanlang</option>
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>

            <Input label="Tuman" value={form.district} onChange={e => set('district', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Ko'cha" value={form.street} onChange={e => set('street', e.target.value)} />
            <Input label="Uy raqami" value={form.house_number} onChange={e => set('house_number', e.target.value)} />
          </div>

          <Input label="Mo'ljal" value={form.landmark_note} onChange={e => set('landmark_note', e.target.value)} />
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Lokatsiya</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.location_url || ''}
                onChange={e => set('location_url', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="flex-1 bg-white border border-cherry-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
                        set('location_url', url)
                      },
                      () => toast.error("Lokatsiya ruxsat berilmadi")
                    )
                  }
                }}
                className="px-3 py-2 bg-cherry-50 border border-cherry-100 rounded-xl text-cherry-700 hover:bg-cherry-100 transition-all text-sm"
              >
                📍
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Mulkdor ismi" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
          <Input label="Mulkdor telefon" value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} />
        </div>

        {isEdit && (
          <Select label="Holat" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Faol</option>
            <option value="reserved">Band</option>
            <option value="sold">Sotildi</option>
            <option value="archived">Arxivlash</option>
          </Select>
        )}

        <div className="flex gap-6">
          <Toggle checked={form.mortgage} onChange={e => set('mortgage', e.target.checked)} label="Ipoteka" />
          <Toggle checked={form.installment} onChange={e => set('installment', e.target.checked)} label="Muddatli to'lov" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Xususiyatlar
          </label>
          <FeatureSelector selected={features} onChange={setFeatures} />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Qo'shimcha izoh
          </label>
          <textarea
            rows={2}
            value={extraNote}
            onChange={e => setExtraNote(e.target.value)}
            placeholder="Qo'shimcha ma'lumot..."
            className="w-full bg-white border border-cherry-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Rasmlar (max 10)
          </label>

          {isEdit && existingPhotos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {existingPhotos.map((photo, i) => (
                <div key={photo + i} className="relative">
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-20 rounded-xl object-cover border border-cherry-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photo)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm flex items-center justify-center shadow"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {isEdit && existingPhotos.length === 0 && (
            <p className="text-xs text-gray-400 mb-2">Mavjud rasm yo'q</p>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setFiles(Array.from(e.target.files || []))}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-cherry-50 file:text-cherry-700 hover:file:bg-cherry-100"
          />

          {files.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-full h-20 rounded-xl object-cover border border-cherry-100"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm flex items-center justify-center shadow"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">
            Bekor
          </Btn>

          <Btn type="submit" loading={loading} className="flex-1">
            {isEdit ? <><Edit3 size={14} /> Saqlash</> : <><Send size={14} /> Saqlash va post</>}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}