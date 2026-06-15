import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Send, CheckCircle, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { appFetch } from './ClientApp'
import clsx from 'clsx'

const TYPE_UZ = {
  apartment: 'Kvartira', house: 'Uy / Hovli',
  office: 'Ofis', land: 'Yer (Arsa)', commercial: 'Noturar joy',
}

export default function AppPropertyDetail({ id: propId }) {
  const params = useParams()
  const id = propId || params.id
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [applyOpen, setApplyOpen] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    appFetch(`/api/app/properties/${id}`)
      .then(setProperty)
      .catch(() => navigate('/app'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-2 border-cherry-200 border-t-cherry-700 rounded-full animate-spin" />
    </div>
  )

  if (!property) return null

  const p = property
  const photos = p.photos || []
  const fmt = (n) => n ? `$${Number(n).toLocaleString('en-US')}` : ''

  return (
    <div className="max-w-lg mx-auto">
      {/* Photos */}
      <div className="relative">
        {photos.length > 0 ? (
          <>
            <img src={photos[photoIdx]} alt="" className="w-full h-64 object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx(i => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <div key={i} className={clsx('w-1.5 h-1.5 rounded-full transition-all',
                      i === photoIdx ? 'bg-white' : 'bg-white/50')} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-64 bg-cherry-50 flex items-center justify-center">
            <Building2 size={48} className="text-cherry-200" />
          </div>
        )}

        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/40 text-white rounded-xl p-2">
          <ArrowLeft size={18} />
        </button>

        <span className={clsx(
          'absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full',
          p.purpose === 'sell' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        )}>
          {p.purpose === 'sell' ? 'Sotiladi' : 'Ijaraga beriladi'}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">

        {/* Price & Type */}
        <div>
          <p className="text-2xl font-bold text-gray-900">{fmt(p.price)}{p.purpose === 'rent' ? '/oy' : ''}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {TYPE_UZ[p.property_type]}
            {p.rooms ? ` · ${p.rooms} xona` : ''}
            {p.area ? ` · ${p.area} ${p.property_type === 'land' ? 'sotix' : 'm²'}` : ''}
            {p.floor ? ` · ${p.floor}${p.total_floors ? '/' + p.total_floors : ''} qavat` : ''}
          </p>
        </div>

        {/* Location */}
        {(p.region || p.district || p.landmark) && (
          <div className="bg-white rounded-2xl p-3 border border-cherry-100">
            <p className="text-xs text-gray-500 mb-1">📍 Manzil</p>
            <p className="text-sm text-gray-800">
              {[p.district, p.region].filter(Boolean).join(', ')}
            </p>
            {p.landmark && (
              <p className="text-xs text-gray-500 mt-0.5">{p.landmark.split(' | ')[1] || p.landmark}</p>
            )}
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {p.mortgage && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">🏦 Ipoteka</span>}
          {p.installment && <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full">💳 Muddatli to'lov</span>}
        </div>

        {/* Description */}
        {p.description && (
          <div className="bg-white rounded-2xl p-3 border border-cherry-100">
            <p className="text-xs text-gray-500 mb-1">📝 Tavsif</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{p.description}</p>
          </div>
        )}

        {/* Agent */}
        <div className="bg-white rounded-2xl p-3 border border-cherry-100">
          <p className="text-xs text-gray-500 mb-2">👤 Agent</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{p.agent_name}</p>
              <p className="text-xs text-gray-500">{p.agent_phone}</p>
            </div>
            <a href={`tel:${p.agent_phone}`}
              className="flex items-center gap-2 bg-cherry-50 text-cherry-700 px-3 py-2 rounded-xl text-sm font-medium">
              <Phone size={14} /> Qo'ng'iroq
            </a>
          </div>
          {p.agent_telegram_id && (
            <a href={`https://t.me/${p.agent_telegram_id}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 mt-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-sm font-medium w-full justify-center">
              <Send size={14} /> Telegram orqali yozish
            </a>
          )}
        </div>

        {/* Apply button */}
        {applied ? (
          <div className="flex items-center gap-2 justify-center py-3 bg-green-50 text-green-700 rounded-2xl border border-green-200">
            <CheckCircle size={18} />
            <span className="font-medium text-sm">Ariza yuborildi!</span>
          </div>
        ) : (
          <button onClick={() => setApplyOpen(true)}
            className="w-full bg-cherry-700 hover:bg-cherry-800 text-white font-semibold rounded-2xl py-3.5 text-sm transition-all active:scale-95">
            Ariza qoldirish
          </button>
        )}
      </div>

      {/* Apply Modal */}
      {applyOpen && (
        <ApplyModal
          property={p}
          onClose={() => setApplyOpen(false)}
          onSuccess={() => { setApplied(true); setApplyOpen(false) }}
        />
      )}
    </div>
  )
}

function ApplyModal({ property: p, onClose, onSuccess }) {
  const [type, setType] = useState(p.purpose === 'sell' ? 'buy' : 'rent')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const typeOptions = p.purpose === 'sell'
    ? [{ key: 'buy', label: 'Sotib olmoqchiman' }]
    : [
        { key: 'rent', label: 'Ijaraga olmoqchiman' },
        { key: 'sell', label: 'Sotmoqchiman' },
        { key: 'rent_out', label: 'Ijaraga bermoqchiman' },
      ]

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      await appFetch('/api/app/applications', {
        method: 'POST',
        body: JSON.stringify({ property_id: p.id, type, message }),
      })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:50, display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'#fff', width:'100%', borderRadius:'24px 24px 0 0', maxHeight:'85vh', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:20, overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:600, fontSize:15 }}>Ariza qoldirish</span>
          <button onClick={onClose} style={{ color:'#aaa', fontSize:18, background:'none', border:'none', cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ background:'#fef1f3', borderRadius:10, padding:'8px 12px', fontSize:13, color:'#555' }}>
          🏠 {p.display_id} · {p.purpose === 'sell' ? 'Sotiladi' : 'Ijaraga'}
        </div>

        <div>
          <p style={{ fontSize:11, color:'#999', marginBottom:8 }}>Maqsadingiz:</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {typeOptions.map(t => (
              <label key={t.key} onClick={() => setType(t.key)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                borderRadius:10, border: type === t.key ? '1.5px solid #c62828' : '1px solid #eee',
                background: type === t.key ? '#fef1f3' : '#fff', cursor:'pointer'
              }}>
                <div style={{
                  width:18, height:18, borderRadius:'50%', border: type === t.key ? '5px solid #7a1a2e' : '2px solid #ccc',
                  flexShrink:0
                }} />
                <span style={{ fontSize:13, fontWeight:500, color:'#333' }}>{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize:11, color:'#999', marginBottom:4 }}>Izoh (ixtiyoriy)</p>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Qo'shimcha ma'lumot..."
            style={{ width:'100%', border:'1px solid #e8d8db', borderRadius:10, padding:'10px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}
          />
        </div>

        {error && <p style={{ fontSize:12, color:'#e53e3e', background:'#fff5f5', padding:'8px 12px', borderRadius:10 }}>{error}</p>}
      </div>

      {/* Tugma har doim pastda ko'rinadi */}
      <div style={{ padding:'12px 20px 24px', borderTop:'1px solid #f5eaec', background:'#fff' }}>
        <button onClick={submit} disabled={loading} style={{
          width:'100%', background: loading ? '#c08090' : '#7a1a2e', color:'#fff',
          fontWeight:600, borderRadius:12, padding:'14px 0', fontSize:14,
          border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          {loading
            ? <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
            : 'Ariza yuborish'
          }
        </button>
      </div>
      </div>
    </div>
  )
}
