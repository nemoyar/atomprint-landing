import { lazy, Suspense, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, MousePointer2 } from 'lucide-react'
import { HOTSPOTS } from '../data'

const PrinterCanvas = lazy(() => import('../three/PrinterCanvas'))

const up = (d = 0) => ({
  initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  const [active, setActive] = useState(null)
  const stage = useRef()
  const visible = useInView(stage)
  return (
    <section id="top" className="relative overflow-hidden pt-16">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-mint/15 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[520px] w-[520px] rounded-full bg-volt/10 blur-[140px]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="pt-10 lg:pt-0">
          <motion.div {...up(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            <span className="relative flex h-2 w-2"><span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-mint" /><span className="relative inline-flex h-2 w-2 rounded-full bg-mint" /></span>
            Аутсорсинг печати для бизнеса
          </motion.div>
          <motion.h1 {...up(0.08)} className="font-display text-[clamp(2rem,3.9vw,3.4rem)] font-semibold leading-[1.05] tracking-tight text-white">
            Печать по подписке: платите <span className="text-gradient">за копии</span>, а не за принтеры
          </motion.h1>
          <motion.p {...up(0.18)} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Ставим МФУ, следим за ними удалённо, сами привозим тонер и бумагу. Вы получаете один счёт в месяц по фактическому числу отпечатков.
          </motion.p>
          <motion.div {...up(0.28)} className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#lead" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-mint px-7 py-4 font-semibold text-ink shadow-[0_0_40px_-6px_#2ef2a4] transition hover:shadow-[0_0_60px_-4px_#2ef2a4]">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Заказать бесплатный аудит
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#tariffs" className="rounded-full px-5 py-4 font-medium text-slate-300 transition hover:text-white">Смотреть тарифы</a>
          </motion.div>
          <motion.div {...up(0.4)} className="mt-12 flex flex-wrap gap-2">
            {HOTSPOTS.map((h) => {
              const Icon = h.icon
              const on = active === h.id
              return (
                <button
                  key={h.id}
                  onMouseEnter={() => setActive(h.id)}
                  onClick={() => setActive(on ? null : h.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition ${on ? 'border-mint bg-mint/10 text-white' : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'}`}
                >
                  <Icon size={15} className={on ? 'text-mint' : ''} />
                  {h.title}
                </button>
              )
            })}
          </motion.div>
        </div>

        <motion.div
          ref={stage}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[460px] sm:h-[560px] lg:h-[680px]"
          onMouseLeave={() => setActive(null)}
        >
          <Suspense fallback={<div className="absolute inset-0 grid place-items-center"><div className="h-40 w-40 animate-pulse rounded-full bg-mint/10 blur-2xl" /></div>}>
            <PrinterCanvas active={active} setActive={setActive} paused={!visible} />
          </Suspense>
          <div className="pointer-events-none absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 text-xs text-slate-500">
            <MousePointer2 size={13} /> Покрутите МФУ и наведите на детали
          </div>
        </motion.div>
      </div>
    </section>
  )
}
