// Estrutura fixa da aplicação: sidebar à esquerda (ou barra no topo no celular) + conteúdo.
import { NavLink, Outlet } from 'react-router-dom'
import { useStudy } from '../../state/StudyContext.jsx'

// Páginas disponíveis nesta versão.
const NAV = [
  { to: '/', label: 'Dashboard', icon: '◧', end: true },
  { to: '/secplus', label: 'Security+', icon: '⛨' },
  { to: '/ielts', label: 'IELTS', icon: '✎' },
  { to: '/library', label: 'Biblioteca', icon: '▤' },
  { to: '/settings', label: 'Dados e ajustes', icon: '⚙' },
]

// Páginas planejadas: aparecem desativadas para mostrar o roteiro com honestidade.
const PLANNED = [
  { label: 'Flashcards', phase: 'Fase 3' },
  { label: 'Simulados', phase: 'Fase 3' },
  { label: 'Analytics', phase: 'Fase 3' },
  { label: 'Admin', phase: 'Fase 4' },
]

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap ${
    isActive ? 'bg-navy-800 text-white' : 'text-slate-400 hover:bg-navy-850 hover:text-slate-200'
  }`

export default function AppLayout() {
  const { warning, dismissWarning } = useStudy()
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="border-b border-navy-800 bg-navy-900 md:fixed md:inset-y-0 md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4 md:py-6">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-mint-400 text-xs font-bold text-navy-950">S</div>
          <span className="font-semibold tracking-tight text-white">StudyOS</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Principal">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
              <span aria-hidden className="w-4 text-center text-slate-500">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-3 pt-6 md:block">
          <div className="px-3 pb-2 text-[11px] uppercase tracking-wider text-slate-600">Em desenvolvimento</div>
          {PLANNED.map((p) => (
            <div key={p.label} className="flex items-center justify-between px-3 py-1.5 text-sm text-slate-600" aria-disabled>
              {p.label}
              <span className="text-[10px]">{p.phase}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 md:ml-60">
        {warning && (
          <div className="flex items-start justify-between gap-4 border-b border-amber-400/20 bg-amber-400/10 px-6 py-3 text-sm text-amber-100">
            <span>{warning}</span>
            <button type="button" onClick={dismissWarning} className="text-amber-200 hover:text-white">Fechar</button>
          </div>
        )}
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
