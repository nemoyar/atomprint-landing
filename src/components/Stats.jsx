import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

const STATS = [
  { to: 30, prefix: 'до −', suffix: '%', label: 'затрат на печать' },
  { to: 2, suffix: ' ч', label: 'выезд инженера' },
  { to: 24, suffix: '/7', label: 'удалённый мониторинг' },
  { to: 1, suffix: ' счёт', label: 'в месяц за всё' },
]

function Counter({ to, prefix = '', suffix = '' }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => (ref.current.textContent = prefix + Math.round(v) + suffix) })
    return () => c.stop()
  }, [inView, to, prefix, suffix])
  return <span ref={ref}>{prefix}0{suffix}</span>
}

const WORDS = ['Тонер', 'Бумага', 'Запчасти', 'Подменный фонд', 'Мониторинг 24/7', 'Печать по пропуску', 'Отчёты по отделам', 'Выезд за 2 часа']

export default function Stats() {
  return (
    <section className="relative border-y border-white/5 bg-panel/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="py-10 text-center md:py-12">
            <div className="font-display text-3xl font-semibold text-white sm:text-4xl"><Counter {...s} /></div>
            <div className="mt-2 text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden border-t border-white/5 py-5 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="marquee flex w-max gap-14 whitespace-nowrap text-sm uppercase tracking-[0.25em] text-slate-600">
          {[...WORDS, ...WORDS].map((w, i) => <span key={i} className="flex items-center gap-14">{w}<span className="text-mint/50">✦</span></span>)}
        </div>
      </div>
    </section>
  )
}
