import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import Reveal from './Reveal'

function formatPhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (!d.startsWith('7')) d = '7' + d
  d = d.slice(0, 11)
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
  let out = '+7'
  if (p[0]) out += ` (${p[0]}`
  if (p[0].length === 3) out += ')'
  if (p[1]) out += ` ${p[1]}`
  if (p[2]) out += `-${p[2]}`
  if (p[3]) out += `-${p[3]}`
  return out
}

function Field({ label, value, onChange, type = 'text', required, inputMode }) {
  const [focus, setFocus] = useState(false)
  const up = focus || value
  return (
    <label className="relative block">
      <motion.span
        animate={{ y: up ? -30 : 0, scale: up ? 0.82 : 1, color: focus ? '#2ef2a4' : '#64748b' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="pointer-events-none absolute left-0 top-4 origin-left text-lg"
      >
        {label}
      </motion.span>
      <input
        type={type} value={value} required={required} inputMode={inputMode}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-white/15 bg-transparent pb-3 pt-4 text-lg text-white outline-none"
      />
      <motion.span
        initial={false}
        animate={{ scaleX: focus ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-mint to-volt shadow-[0_0_14px_#2ef2a4]"
      />
    </label>
  )
}

function Success({ name, onReset }) {
  return (
    <motion.div
      key="ok"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative flex flex-col items-center py-10 text-center"
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute top-16 h-3 w-2 rounded-[2px] bg-white/90"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 170, y: Math.sin((i / 14) * Math.PI * 2) * 120 - 30, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.15 }}
        />
      ))}
      <svg viewBox="0 0 80 80" className="h-24 w-24">
        <motion.circle cx="40" cy="40" r="36" fill="none" stroke="#2ef2a4" strokeWidth="3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M25 41 l10 10 l20 -22" fill="none" stroke="#2ef2a4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
      </svg>
      <h3 className="mt-6 font-display text-2xl font-semibold text-white">Заявка принята{name ? `, ${name}` : ''}</h3>
      <p className="mt-2 max-w-sm text-slate-400">Инженер свяжется с вами в течение рабочего дня и согласует время аудита.</p>
      <button onClick={onReset} className="mt-8 text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline">Отправить ещё одну</button>
    </motion.div>
  )
}

export default function LeadForm() {
  const [f, setF] = useState({ name: '', phone: '', company: '' })
  const [state, setState] = useState('idle')
  const submit = (e) => {
    e.preventDefault()
    setState('sending')
    setTimeout(() => setState('done'), 1200) // прототип: без отправки на сервер
  }
  return (
    <section id="lead" className="relative mx-auto max-w-7xl px-4 pb-28 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-panel p-7 sm:p-14">
          <div className="pointer-events-none absolute -left-24 bottom-[-40%] h-96 w-96 rounded-full bg-mint/15 blur-[100px]" />
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">Бесплатный аудит</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">Узнайте реальную цену своей страницы</h2>
              <p className="mt-5 max-w-md text-lg text-slate-400">Обследуем парк, посчитаем расходы и покажем, сколько вы сэкономите на подписке. Это ни к чему не обязывает.</p>
            </div>
            <AnimatePresence mode="wait">
              {state === 'done' ? (
                <Success name={f.name.trim().split(' ')[0]} onReset={() => { setF({ name: '', phone: '', company: '' }); setState('idle') }} />
              ) : (
                <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <Field label="Имя" value={f.name} onChange={(v) => setF({ ...f, name: v })} required />
                  <Field label="Телефон" type="tel" inputMode="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v ? formatPhone(v) : '' })} required />
                  <Field label="Компания" value={f.company} onChange={(v) => setF({ ...f, company: v })} />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={state === 'sending'}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint py-4 font-semibold text-ink shadow-[0_0_40px_-8px_#2ef2a4] transition hover:shadow-[0_0_60px_-6px_#2ef2a4] disabled:opacity-80"
                  >
                    {state === 'sending' ? <Loader2 size={20} className="animate-spin" /> : <>Заказать аудит <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>}
                  </motion.button>
                  <p className="text-xs text-slate-600">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
