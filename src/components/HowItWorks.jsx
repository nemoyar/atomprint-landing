import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Reveal from './Reveal'
import { STEPS } from '../data'

export default function HowItWorks() {
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Как это работает</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">От аудита до первого счёта - 4 шага</h2>
      </Reveal>
      <div ref={ref} className="relative mt-16">
        <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-white/10 md:block" />
        <motion.div style={{ width }} className="absolute left-0 top-[22px] hidden h-px bg-gradient-to-r from-mint to-volt shadow-[0_0_12px_#2ef2a4] md:block" />
        <div className="grid gap-10 md:grid-cols-4 md:gap-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative grid h-11 w-11 place-items-center rounded-full border border-mint/40 bg-ink font-display text-sm text-mint shadow-[0_0_24px_-4px_#2ef2a4]">{s.n}</div>
              <h3 className="mt-6 font-display text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-400">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
