import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, Phone, Users, Edit3,
  ChevronLeft, ChevronRight, Target, Sparkles, Lock
} from 'lucide-react'
import { propertiesApi } from '../../services/api'
import { Btn, Badge, Spinner, Empty } from '../../components/ui'
import { fmt, TYPE_UZ, PURPOSE_UZ } from '../../utils/helpers'
import clsx from 'clsx'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [matches, setMatches]   = useState([])
  const [tab, setTab]           = useState('info')
  const [photoIdx, setPhotoIdx] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [matchLoad, setMatchLoad] = useState(false)

  useEffect(() => {
    propertiesApi.get(id).then(r => setProperty(r.data)).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (tab === 'matches') {
      setMatchLoad(true)
      propertiesApi.matches(id).then(r => setMatches(r.data)).finally(() => setMatchLoad(false))
    }
  }, [tab, id])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!property) return <p className="text-center text-gray-400 py-20">Topilmadi</p>

  const p = property
  const photos = p.photos || []

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white border border-cherry-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">
            {TYPE_UZ[p.property_type]} · {p.display_id}
          </h1>
          <p className="text-xs text-gray-500">{PURPOSE_UZ[p.purpose]} · {p.agent_name}</p>
        </div>
        {p.is_own && (
          <Btn variant="outline" size="sm">
            <Edit3 size={14} /> Tahrirlash
          </Btn>
        )}
      </div>

      {/* Photo slider */}
      {photos.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden h-56 bg-cherry-50">
          <img src={photos[photoIdx]} className="w-full h-full object-cover" alt="" />
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-xl p-1.5 hover:bg-black/60">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-xl p-1.5 hover:bg-black/60">
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <div key={i} onClick={() => setPhotoIdx(i)}
                    className={clsx('w-1.5 h-1.5 rounded-full cursor-pointer transition-all', i === photoIdx ? 'bg-white w-4' : 'bg-white/50')} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge color={p.purpose === 'sell' ? 'red' : 'amber'}>{PURPOSE_UZ[p.purpose]}</Badge>
            <Badge color={p.status === 'active' ? 'green' : 'gray'}>{p.status === 'active' ? 'Faol' : 'Noaktiv'}</Badge>
          </div>
        </div>
      )}

      {/* Price highlight */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-cherry-700">{fmt(p.price)}</p>
          {p.area && <p className="text-xs text-gray-500 mt-0.5">{fmt(p.price / p.area)}/m²</p>}
        </div>
        <div className="flex gap-2">
          {p.agent_phone && (
            <a href={`tel:${p.agent_phone}`}>
              <Btn size="sm"><Phone size={13} /> Bog'lanish</Btn>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1">
        {[
          { key: 'info',    label: "Ma'lumot" },
          { key: 'matches', label: 'Mos mijozlar' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={clsx('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
              tab === t.key ? 'bg-cherry-700 text-white' : 'text-gray-500 hover:text-cherry-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* INFO */}
      {tab === 'info' && (
        <div className="card p-5 space-y-2">
          {p.property_type !== 'land' && <InfoRow label="Xonalar" value={p.rooms ? p.rooms + ' ta' : '—'} />}
          {p.area && <InfoRow label="Maydon" value={p.area + ' m²'} />}
          {p.floor && <InfoRow label="Qavat" value={`${p.floor} / ${p.total_floors || '?'}`} />}
          <InfoRow label="Hudud" value={[p.region, p.district].filter(Boolean).join(', ') || '—'} />
          <InfoRow label="Manzil" value={
            p.is_own
              ? (p.address || '—')
              : <span className="flex items-center gap-1 text-gray-400"><Lock size={12} /> Yashirin</span>
          } />
          {p.is_own && p.owner_name && <InfoRow label="Mulkdor" value={p.owner_name} />}
          {p.is_own && p.owner_phone && (
            <InfoRow label="Mulkdor tel" value={
              <a href={`tel:${p.owner_phone}`} className="text-cherry-700 hover:underline flex items-center gap-1">
                <Phone size={12} /> {p.owner_phone}
              </a>
            } />
          )}
          {p.mortgage && <InfoRow label="Ipoteka" value={<Badge color="blue">✓ Maqbul</Badge>} />}
          {p.installment && <InfoRow label="Muddatli" value={<Badge color="purple">✓ Maqbul</Badge>} />}
          {p.description && (
            <div className="pt-2 border-t border-cherry-50">
              <p className="text-xs text-gray-500 mb-1">Tavsif</p>
              <p className="text-sm text-gray-700">{p.description}</p>
            </div>
          )}
        </div>
      )}

      {/* MATCHES */}
      {tab === 'matches' && (
        <div className="space-y-3">
          <div className="bg-cherry-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-sm font-medium">Mos mijozlar</span>
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
                    <p className="text-xs text-gray-500">{c.need_type === 'buy' ? 'Sotib oladi' : 'Ijaraga'} · {fmt(c.budget_max)}</p>
                  </div>
                  {c.is_own ? (
                    <div className="flex gap-2">
                      {c.phone && (
                        <a href={`tel:${c.phone}`}>
                          <Btn size="sm"><Phone size={12} /></Btn>
                        </a>
                      )}
                    </div>
                  ) : (
                    <Badge color="gray"><Lock size={10} /> Boshqa agent</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-cherry-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value}</span>
    </div>
  )
}
