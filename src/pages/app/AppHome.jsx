import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Building2 } from 'lucide-react'
import { appFetch } from './ClientApp'
import clsx from 'clsx'

const TYPE_UZ = {
  apartment: 'Kvartira', house: 'Uy / Hovli',
  office: 'Ofis', land: 'Yer (Arsa)', commercial: 'Noturar joy',
}

const PURPOSE_TABS = [
  { key: '', label: 'Hammasi' },
  { key: 'sell', label: 'Sotiladi' },
  { key: 'rent', label: 'Ijaraga' },
]

const TYPE_TABS = [
  { key: '', label: 'Barchasi' },
  { key: 'apartment', label: 'Kvartira' },
  { key: 'house', label: 'Uy' },
  { key: 'office', label: 'Ofis' },
  { key: 'land', label: 'Yer' },
]

export default function AppHome() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState({
    purpose: '', property_type: '', rooms: '',
    price_min: '', price_max: '', region: '',
    mortgage: false, installment: false,
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  const load = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 })
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== false) params.append(k, v)
      })
      if (search) params.append('region', search)

      const res = await appFetch(`/api/app/properties?${params}`)
      if (pg === 1) setProperties(res.data)
      else setProperties(p => [...p, ...res.data])
      setTotal(res.total)
      setPage(pg)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => { load(1) }, [load])

  const fmt = (n) => n ? `$${Number(n).toLocaleString('en-US')}` : ''

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#f8f5f5] z-10 px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Shahar, tuman qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-cherry-100 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={clsx(
              'p-2.5 rounded-xl border transition-all',
              filterOpen ? 'bg-cherry-700 border-cherry-700 text-white' : 'bg-white border-cherry-100 text-gray-600'
            )}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Purpose tabs */}
        <div className="flex gap-1 bg-white border border-cherry-100 rounded-xl p-1">
          {PURPOSE_TABS.map(t => (
            <button key={t.key} onClick={() => setF('purpose', t.key)}
              className={clsx('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                filters.purpose === t.key ? 'bg-cherry-700 text-white' : 'text-gray-500')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TYPE_TABS.map(t => (
            <button key={t.key} onClick={() => setF('property_type', t.key)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                filters.property_type === t.key
                  ? 'bg-cherry-700 border-cherry-700 text-white'
                  : 'bg-white border-cherry-100 text-gray-500'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="bg-white border border-cherry-100 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min narx $</label>
                <input type="number" placeholder="0" value={filters.price_min}
                  onChange={e => setF('price_min', e.target.value)}
                  className="w-full border border-cherry-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cherry-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max narx $</label>
                <input type="number" placeholder="999999" value={filters.price_max}
                  onChange={e => setF('price_max', e.target.value)}
                  className="w-full border border-cherry-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cherry-400" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Xonalar soni</label>
              <div className="flex gap-1">
                {['', '1', '2', '3', '4', '5'].map(r => (
                  <button key={r} onClick={() => setF('rooms', r)}
                    className={clsx('flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      filters.rooms === r ? 'bg-cherry-700 border-cherry-700 text-white' : 'bg-white border-cherry-100 text-gray-500')}>
                    {r || 'Hammasi'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={filters.mortgage}
                  onChange={e => setF('mortgage', e.target.checked)}
                  className="accent-cherry-700 w-4 h-4" />
                Ipoteka
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={filters.installment}
                  onChange={e => setF('installment', e.target.checked)}
                  className="accent-cherry-700 w-4 h-4" />
                Muddatli to'lov
              </label>
            </div>

            <button
              onClick={() => {
                setFilters({ purpose: '', property_type: '', rooms: '', price_min: '', price_max: '', region: '', mortgage: false, installment: false })
                setFilterOpen(false)
              }}
              className="w-full text-xs text-gray-400 hover:text-cherry-600 py-1 transition-colors"
            >
              Filtrni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-400 mb-3">{total} ta obyekt topildi</p>

        {loading && properties.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cherry-200 border-t-cherry-700 rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Obyektlar topilmadi</p>
            <p className="text-gray-400 text-xs mt-1">Filtrni o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => navigate(`/property/${p.id}`)} />
            ))}

            {properties.length < total && (
              <button
                onClick={() => load(page + 1)}
                disabled={loading}
                className="w-full py-3 bg-white border border-cherry-100 rounded-xl text-sm text-cherry-700 font-medium hover:bg-cherry-50 transition-all disabled:opacity-50"
              >
                {loading ? 'Yuklanmoqda...' : 'Ko\'proq ko\'rish'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PropertyCard({ property: p, onClick }) {
  const photo = p.photos?.[0]
  const fmt = (n) => n ? `$${Number(n).toLocaleString('en-US')}` : ''

  return (
    <button onClick={onClick} className="w-full bg-white rounded-2xl border border-cherry-100 overflow-hidden hover:shadow-md transition-all active:scale-98 text-left">
      {photo ? (
        <img src={photo} alt="" className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-cherry-50 flex items-center justify-center">
          <Building2 size={32} className="text-cherry-200" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
            p.purpose === 'sell' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
            {p.purpose === 'sell' ? 'Sotiladi' : 'Ijaraga'}
          </span>
          <span className="text-xs text-gray-400">{p.display_id}</span>
        </div>

        <p className="font-bold text-gray-900 text-base">{fmt(p.price)}</p>

        <p className="text-xs text-gray-500 mt-0.5">
          {TYPE_UZ[p.property_type]}
          {p.rooms ? ` · ${p.rooms} xona` : ''}
          {p.area ? ` · ${p.area} m²` : ''}
        </p>

        {(p.region || p.district) && (
          <p className="text-xs text-gray-400 mt-1">
            📍 {[p.district, p.region].filter(Boolean).join(', ')}
          </p>
        )}

        <div className="flex gap-2 mt-2">
          {p.mortgage && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Ipoteka</span>}
          {p.installment && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">B/to'lov</span>}
        </div>
      </div>
    </button>
  )
}
