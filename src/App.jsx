import Nav from './components/Nav'
import Hero from './components/Hero'
import Stats from './components/Stats'
import HowItWorks from './components/HowItWorks'
import Tariffs from './components/Tariffs'
import LeadForm from './components/LeadForm'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Tariffs />
        <LeadForm />
      </main>
      <footer className="border-t border-white/5 py-10 text-center text-sm text-slate-600">
        © 2026 ООО «АТОМПРИНТ» · Аутсорсинг печати · Прототип, цены демонстрационные
      </footer>
    </>
  )
}
