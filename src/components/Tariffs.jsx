import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import Reveal from './Reveal'
import { PLANS } from '../data'

const rub = (v, d = 2) => v.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })

function TiltCard({ plan, i }) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 })
  const glow = useTransform([mx, my], ([x, y]) => `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, #2ef2a422, transparent 45%)`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onMouseLeave={() => { mx.set(0.5); my.set(0.5) }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={`relative h-full overflow-hidden rounded-3xl border p-7 sm:p-8 ${plan.featured ? 'border-mint/50 bg-gradient-to-b from-mint/10 to-panel shadow-[0_0_80px_-20px_#2ef2a4]' : 'border-white/10 bg-panel'}`}
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
        {plan.featured && (
          <div className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">
            <Sparkles size={12} /> Популярный
          </div>
        )}
        <div style={{ transform: 'translateZ(30px)' }}>
          <h3 className="font-display text-2xl font-semibold text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{plan.volume}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wider text-slate-500">ч/б, А4</div>
              <div className="mt-1 font-display text-3xl font-semibold text-white">{rub(plan.mono)}<span className="ml-1 text-base text-slate-400">₽</span></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wider text-slate-500">цвет, А4</div>
              <div className="mt-1 font-display text-3xl font-semibold"><span className="text-gradient">{rub(plan.color)}</span><span className="ml-1 text-base text-slate-400">₽</span></div>
            </div>
          </div>
          <ul className="mt-8 space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-slate-300">
                <Check size={18} className="mt-0.5 shrink-0 text-mint" /> {f}
              </li>
            ))}
          </ul>
          <a href="#lead" className={`mt-9 block rounded-full py-3.5 text-center font-semibold transition ${plan.featured ? 'bg-mint text-ink hover:brightness-110' : 'border border-white/15 text-white hover:border-mint hover:text-mint'}`}>
            Обсудить тариф
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Slider({ label, value, setValue, max, step }) {
  const pct = (value / max) * 100
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="font-display text-xl text-white">{value.toLocaleString('ru-RU')} <span className="text-sm text-slate-500">стр./мес</span></span>
      </div>
      <input
        type="range" min={0} max={max} step={step} value={value}
        onChange={(e) => setValue(+e.target.value)}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-[#2ef2a4]"
        style={{ background: `linear-gradient(90deg,#2ef2a4 ${pct}%,#1c2638 ${pct}%)` }}
      />
    </label>
  )
}

function Calculator() {
  const [mono, setMono] = useState(12000)
  const [color, setColor] = useState(1500)
  const total = mono + color
  const plan = total < 5000 ? PLANS[0] : total < 30000 ? PLANS[1] : PLANS[2]
  const sum = mono * plan.mono + color * plan.color
  return (
    <Reveal>
      <div id="calc" className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-panel to-ink p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-volt/15 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-9">
            <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">Посчитайте свой месяц</h3>
            <Slider label="Чёрно-белая печать" value={mono} setValue={setMono} max={60000} step={500} />
            <Slider label="Цветная печать" value={color} setValue={setColor} max={15000} step={100} />
          </div>
          <div className="rounded-2xl border border-mint/30 bg-mint/5 p-7 text-center">
            <div className="text-sm text-slate-400">Тариф</div>
            <AnimatePresence mode="wait">
              <motion.div key={plan.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="font-display text-xl text-mint">
                {plan.name}
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 text-sm text-slate-400">Платёж в месяц, без НДС</div>
            <div className="mt-1 font-display text-4xl font-semibold text-white sm:text-5xl">{rub(Math.round(sum), 0)} ₽</div>
            <div className="mt-4 text-sm text-slate-500">МФУ, сервис, тонер и бумага включены</div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export default function Tariffs() {
  return (
    <section id="tariffs" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Прозрачные тарифы</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">Цена одного отпечатка. Без аренды и скрытых платежей</h2>
      </Reveal>
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {PLANS.map((p, i) => <TiltCard key={p.name} plan={p} i={i} />)}
      </div>
      <Calculator />
    </section>
  )
}
