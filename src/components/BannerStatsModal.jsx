import { useState, useEffect } from 'react'
import { X, TrendingUp, Eye, Calendar } from 'lucide-react'
import api from '../services/api'

export default function BannerStatsModal({ banner, onClose }) {
  const [period, setPeriod] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!banner?.id) return
    setLoading(true)
    api.get(`/api/banners/${banner.id}/stats?period=${period}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [banner?.id, period])

  if (!banner) return null

  const maxViews = data?.daily?.length
    ? Math.max(...data.daily.map(d => d.views), 1)
    : 1

  // So'nggi N kun uchun to'liq kunlar massivi (bo'sh kunlar 0 bilan)
  const buildChart = () => {
    if (!data?.daily) return []
    const map = {}
    data.daily.forEach(d => { map[d.day] = d.views })
    const result = []
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      result.push({ day: key, views: map[key] || 0 })
    }
    return result
  }

  const chartData = buildChart()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">{banner.company}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ko'rishlar statistikasi</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Period tanlash */}
        <div className="flex gap-2 mb-4">
          {[7, 30].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? 'bg-cherry-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p} kun
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-cherry-200 border-t-cherry-700 rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <p className="text-center text-sm text-gray-400 py-8">Statistika yuklanmadi</p>
        ) : (
          <>
            {/* Umumiy raqamlar */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-cherry-50 rounded-2xl p-3 text-center">
                <Eye size={16} className="text-cherry-700 mx-auto mb-1" />
                <p className="text-2xl font-bold text-cherry-700">{data.totals.today}</p>
                <p className="text-xs text-gray-500">Bugun</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3 text-center">
                <Calendar size={16} className="text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{data.totals.week}</p>
                <p className="text-xs text-gray-500">Bu hafta</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-3 text-center">
                <TrendingUp size={16} className="text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{data.totals.month}</p>
                <p className="text-xs text-gray-500">Bu oy</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-3 text-center">
                <Eye size={16} className="text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-600">{data.totals.total}</p>
                <p className="text-xs text-gray-500">Jami</p>
              </div>
            </div>

            {/* Grafik */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-cherry-700" />
                So'nggi {period} kunlik ko'rishlar
              </p>

              {chartData.every(d => d.views === 0) ? (
                <p className="text-center text-sm text-gray-400 py-6">Bu davrda ko'rishlar yo'q</p>
              ) : (
                <div className="flex items-end gap-[3px] h-28">
                  {chartData.map((d, i) => {
                    const height = maxViews > 0 ? (d.views / maxViews) * 100 : 0
                    const isToday = d.day === new Date().toISOString().slice(0, 10)
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            d.views > 0
                              ? isToday ? 'bg-cherry-600' : 'bg-cherry-300'
                              : 'bg-gray-100'
                          }`}
                          style={{ height: `${Math.max(height, d.views > 0 ? 4 : 0)}%` }}
                        />
                        {/* Tooltip */}
                        {d.views > 0 && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {d.views}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* X o'qi — boshlanish va tugash sanasi */}
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-gray-400">
                  {chartData[0]?.day?.slice(5).replace('-', '/')}
                </span>
                <span className="text-[10px] text-gray-400 text-cherry-600 font-medium">Bugun</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
