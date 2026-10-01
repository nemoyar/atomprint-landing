import { motion, useScroll, useTransform } from 'framer-motion'

export default function Nav() {
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 120], ['rgba(7,11,20,0)', 'rgba(7,11,20,0.78)'])
  const border = useTransform(scrollY, [0, 120], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.07)'])
  return (
    <motion.header style={{ backgroundColor: bg, borderColor: border }} className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="./favicon.svg" alt="" className="h-8 w-8" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-white">АТОМПРИНТ</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a href="#how" className="transition hover:text-white">Как работает</a>
          <a href="#tariffs" className="transition hover:text-white">Тарифы</a>
          <a href="#calc" className="transition hover:text-white">Калькулятор</a>
        </nav>
        <a href="#lead" className="rounded-full border border-mint/40 px-4 py-2 text-sm font-semibold text-mint transition hover:bg-mint hover:text-ink">
          Аудит бесплатно
        </a>
      </div>
    </motion.header>
  )
}
