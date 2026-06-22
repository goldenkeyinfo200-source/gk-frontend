import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

// Fallback — API bo'sh bo'lsa
const FALLBACK_SLIDES = [
  {
    id: 'f1',
    company: 'GK Network',
    slogan: 'Qulay narxda uy toping',
    color: '#b91c1c',
    image_url: null,
    link_url: null,
  },
]

export default function BannerSlider({ onAction }) {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    api.get('/api/banners')
      .then(res => {
        const data = Array.isArray(res.data) && res.data.length > 0
          ? res.data
          : FALLBACK_SLIDES
        setSlides(data)
      })
      .catch(() => setSlides(FALLBACK_SLIDES))
  }, [])

  const total = slides.length

  const goTo = (n) => setCurrent((n + total) % total)

  const resetAuto = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % (slides.length || 1))
    }, 4500)
  }

  useEffect(() => {
    if (total > 0) resetAuto()
    return () => clearInterval(timerRef.current)
  }, [total])

  const handlePrev = () => { goTo(current - 1); resetAuto() }
  const handleNext = () => { goTo(current + 1); resetAuto() }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); resetAuto() }
    touchStartX.current = null
  }

  const handleClick = (slide) => {
    if (slide.link_url) {
      window.open(slide.link_url, '_blank')
    } else if (onAction) {
      onAction(slide)
    }
  }

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <div className="px-4 pt-3 pb-1">
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide */}
        {slide.image_url ? (
          // Rasm bo'lsa — faqat rasm + pastda Batafsil tugmasi
          <div
            className="h-[130px] relative cursor-pointer"
            onClick={() => handleClick(slide)}
          >
            <img
              src={slide.image_url}
              alt={slide.company}
              className="w-full h-full object-cover"
            />
            {/* Faqat link bo'lsa — Batafsil tugmasi pastda */}
            {slide.link_url && (
              <div className="absolute bottom-3 right-4">
                <span className="bg-white/90 text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                  style={{ color: '#b91c1c' }}>
                  Batafsil →
                </span>
              </div>
            )}
          </div>
        ) : (
          // Rasm yo'q — rang fon bilan
          <div
            className="h-[130px] flex items-center justify-between px-5 relative overflow-hidden cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${slide.color || '#b91c1c'} 0%, ${darken(slide.color || '#b91c1c')} 100%)` }}
            onClick={() => handleClick(slide)}
          >
            <div className="absolute right-[-10px] top-[-20px] w-[110px] h-[110px] rounded-full bg-white/[0.07] pointer-events-none" />
            <div className="absolute right-[30px] bottom-[-30px] w-[80px] h-[80px] rounded-full bg-white/[0.05] pointer-events-none" />

            <div className="relative z-10 flex-1">
              <span className="inline-block bg-white/20 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full mb-1.5">
                Reklama
              </span>
              <p className="text-white font-bold text-[15px] leading-snug mb-1">{slide.company}</p>
              {slide.slogan && (
                <p className="text-white/80 text-[12px] mb-2">{slide.slogan}</p>
              )}
              {slide.link_url && (
                <span className="inline-block bg-white text-[11px] font-semibold px-3 py-1 rounded-lg" style={{ color: slide.color || '#b91c1c' }}>
                  Batafsil →
                </span>
              )}
            </div>

            <div className="relative z-10 text-[52px] opacity-20 flex-shrink-0 ml-2 pointer-events-none">
              🏢
            </div>
          </div>
        )}

        {/* Arrows — faqat 1 dan ko'p slide bo'lsa */}
        {total > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-sm transition-colors z-20"
              aria-label="Oldinga"
            >‹</button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-sm transition-colors z-20"
              aria-label="Keyinga"
            >›</button>
          </>
        )}
      </div>

      {/* Dots — faqat 1 dan ko'p slide bo'lsa */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetAuto() }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-4 bg-cherry-700' : 'w-1.5 bg-gray-300'
              }`}
              aria-label={`Slayd ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Rangni biroz to'qlashtirish (gradient uchun)
function darken(hex) {
  try {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (n >> 16) - 30)
    const g = Math.max(0, ((n >> 8) & 0xff) - 30)
    const b = Math.max(0, (n & 0xff) - 30)
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
  } catch {
    return hex
  }
}
