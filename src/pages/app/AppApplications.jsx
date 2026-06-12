import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Building2, Trash2 } from 'lucide-react'
import { appFetch } from './ClientApp'
import clsx from 'clsx'

const TYPE_UZ = { buy: 'Sotib olish', rent: 'Ijaraga olish', sell: 'Sotish', rent_out: 'Ijaraga berish' }
const STATUS = {
  pending:  { label: 'Kutilmoqda', color: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Qabul qilindi', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rad etildi', color: 'bg-red-100 text-red-700' },
}

export default function AppApplications() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await appFetch('/api/app/applications')
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    if (!confirm('Arizani bekor qilasizmi?')) return
    try {
      await appFetch(`/api/app/applications/${id}`, { method: 'DELETE' })
      setItems(p => p.filter(a => a.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-cherry-200 border-t-cherry-700 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mening arizalarim</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <List size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Arizalar yo'q</p>
          <button onClick={() => navigate('/')}
            className="mt-3 text-cherry-700 text-sm font-medium underline">
            Obyektlarni ko'rish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(a => {
            const photo = a.photos?.[0]
            const st = STATUS[a.status] || STATUS.pending
            const fmt = (n) => n ? `$${Number(n).toLocaleString('en-US')}` : ''

            return (
              <div key={a.id} className="bg-white rounded-2xl border border-cherry-100 overflow-hidden">
                <div className="flex gap-3 p-3">
                  {photo ? (
                    <img src={photo} alt="" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-16 bg-cherry-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-cherry-200" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">{a.property_display_id}</span>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', st.color)}>
                        {st.label}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 mt-0.5">{fmt(a.price)}</p>
                    <p className="text-xs text-gray-500">{TYPE_UZ[a.type]}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Agent: {a.agent_name}</p>
                  </div>
                </div>

                {a.status === 'pending' && (
                  <div className="border-t border-cherry-50 px-3 py-2 flex justify-end">
                    <button onClick={() => cancel(a.id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 size={13} /> Bekor qilish
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
