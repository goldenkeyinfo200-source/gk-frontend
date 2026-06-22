import { useState, useEffect, useRef } from 'react'

const SLIDES = [
  {
    id: 1,
    tag: 'Ipoteka',
    title: 'Uy oling, hoziroq\nipoteka bilan!',
    desc: 'Boshlang\'ich to\'lovsiz, qulay muddatda',
    btn: 'Batafsil →',
    action: 'ipoteka',
    bg: 'from-[#b91c1c] to-[#991b1b]',
    btnColor: 'text-[#b91c1c]',
    icon: '🏠',
  },
  {
    id: 2,
    tag: 'Bepul',
    title: 'Bepul konsultatsiya\nbugun!',
    desc: 'Mutaxassisingiz 24/7 tayyor',
    btn: 'Ariza →',
    action: 'konsultatsiya',
    bg: 'from-[#1e40af] to-[#1d4ed8]',
    btnColor: 'text-[#1e40af]',
    icon: '📋',
  },
  {
    id: 3,
    tag: 'Chegirma',
    title: '420+ ob\'yekt\neng qulay narxda',
    desc: 'Qo\'qon shahridagi eng katta baza',
    btn: 'Ko\'rish →',
    action: 'obyektlar',
    bg: 'from-[#0F6E56] to-[#065f46]',
    btnColor: 'text-[#0F6E56]',
    icon: '🏢',
  },
  {
    id: 4,
    tag: 'Yangi',
    title: 'Ijaraga uy\ntopamiz!',
    desc: 'Kunlik va oylik ijara variantlari',
    btn: 'Ijara →',
    action: 'ijara',
    bg: 'from-[#b45309] to-[#92400e]',
    btnColor: 'text-[#b45309]',
    icon: '🔑',
  },
]

export default function BannerSlider({ onAction }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)

  const goTo = (n) => {
    setCurrent((n + SLIDES.length) % SLIDES.length)
  }

  const resetAuto = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length)
    }, 4500)
  }

  useEffect(() => {
    resetAuto()
    return () => clearInterval(timerRef.current)
  }, [])

  const handlePrev = () => { goTo(current - 1); resetAuto() }
  const handleNext = () => { goTo(current + 1); resetAuto() }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); resetAuto() }
    touchStartX.current = null
  }

  const slide = SLIDES[current]

  return (
    <div className="px-4 pt-3 pb-1">
      {/* Slider */}
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide */}
        <div className={`bg-gradient-to-br ${slide.bg} h-[130px] flex items-center justify-between px-5 transition-all duration-300`}>
          {/* Decorative circles */}
          <div className="absolute right-[-10px] top-[-20px] w-[110px] h-[110px] rounded-full bg-white/[0.07] pointer-events-none" />
          <div className="absolute right-[30px] bottom-[-30px] w-[80px] h-[80px] rounded-full bg-white/[0.05] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex-1">
            <span className="inline-block bg-white/20 text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full mb-1.5">
              {slide.tag}
            </span>
            <p className="text-white font-bold text-[15px] leading-snug mb-1 whitespace-pre-line">
              {slide.title}
            </p>
            <p className="text-white/80 text-[11px] mb-2.5">{slide.desc}</p>
            <button
              onClick={() => onAction?.(slide.action)}
              className={`bg-white ${slide.btnColor} text-[12px] font-semibold px-3.5 py-1.5 rounded-lg active:scale-95 transition-transform`}
            >
              {slide.btn}
            </button>
          </div>

          {/* Icon */}
          <div className="relative z-10 text-[52px] opacity-20 flex-shrink-0 ml-2 pointer-events-none">
            {slide.icon}
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-sm transition-colors z-20"
          aria-label="Oldinga"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-sm transition-colors z-20"
          aria-label="Keyinga"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-2.5">
        {SLIDES.map((_, i) => (
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
    </div>
  )
}
