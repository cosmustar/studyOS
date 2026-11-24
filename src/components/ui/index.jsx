// Componentes visuais reutilizáveis. Cada um é pequeno e só cuida de aparência.
import { Link } from 'react-router-dom'
import { VALIDATION_STATUSES, ORIGINS, DIFFICULTIES } from '../../lib/contentSchema.js'
import { sourceById } from '../../content/index.js'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  )
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-navy-700 bg-navy-900/70 p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-sm font-medium text-slate-300">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, hint }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  )
}

export function ProgressBar({ value, max = 1, tone = 'mint' }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  const color = tone === 'warn' ? 'bg-amber-400/80' : 'bg-mint-400'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

const BADGE_TONES = {
  neutral: 'border-navy-600 bg-navy-800 text-slate-300',
  mint: 'border-mint-500/30 bg-mint-500/10 text-mint-300',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  red: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  blue: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
}

export function Badge({ tone = 'neutral', children, title }) {
  return (
    <span title={title} className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  )
}

const STATUS_TONE = { pending_review: 'amber', validated: 'mint', needs_update: 'red', archived: 'neutral' }
export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status]}>{VALIDATION_STATUSES[status] ?? status}</Badge>
export const OriginBadge = ({ origin }) => <Badge tone={origin === 'official' ? 'blue' : 'neutral'}>{ORIGINS[origin] ?? origin}</Badge>
export const DifficultyBadge = ({ difficulty }) => <Badge>{DIFFICULTIES[difficulty] ?? difficulty}</Badge>

/** Bloco de rastreabilidade exibido em toda aula/exercício. */
export function ContentMeta({ item }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge status={item.validationStatus} />
      <OriginBadge origin={item.origin} />
      {item.difficulty && <DifficultyBadge difficulty={item.difficulty} />}
      {item.examVersion && <Badge>{item.examVersion}</Badge>}
      {item.objectiveCode && <Badge>Obj. {item.objectiveCode}</Badge>}
      {item.createdBy === 'ai' && <Badge tone="amber" title="Gerado por IA; precisa de revisão humana">Gerado por IA</Badge>}
    </div>
  )
}

export function SourceList({ ids }) {
  return (
    <ul className="space-y-1 text-xs text-slate-400">
      {ids.map((id) => {
        const s = sourceById[id]
        if (!s) return <li key={id} className="text-rose-300">Fonte desconhecida: {id}</li>
        return (
          <li key={id}>
            <a className="text-sky-300 hover:underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
            <span className="text-slate-500"> · {s.publisher} · acessada em {s.checkedAt}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** Aviso exibido quando o conteúdo ainda não foi revisado por um humano. */
export function ReviewNotice({ item }) {
  if (item.validationStatus === 'validated') return null
  return (
    <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-100/90">
      <strong className="font-medium">Conteúdo {item.origin === 'official' ? 'oficial' : 'original, não oficial'} — {VALIDATION_STATUSES[item.validationStatus].toLowerCase()}.</strong>{' '}
      Foi escrito com base nas fontes listadas, mas ainda não passou por revisão humana. Confira com o material oficial.
      {item.needsConfirmation?.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {item.needsConfirmation.map((n) => <li key={n}>Precisa de confirmação: {n}</li>)}
        </ul>
      )}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-lg border border-dashed border-navy-600 p-5 text-center">
      <p className="text-sm text-slate-300">{title}</p>
      {children && <p className="mt-1 text-xs text-slate-500">{children}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function Button({ to, variant = 'primary', size = 'md', className = '', ...props }) {
  const styles = {
    primary: 'bg-mint-400 text-navy-950 hover:bg-mint-300',
    secondary: 'border border-navy-600 bg-navy-800 text-slate-200 hover:border-navy-400',
    danger: 'border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
    ghost: 'text-slate-300 hover:bg-navy-800',
  }
  const sizes = { md: 'px-3.5 py-2 text-sm', sm: 'px-2.5 py-1 text-xs' }
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg ${sizes[size]} font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`
  if (to) return <Link to={to} className={cls} {...props} />
  return <button type="button" className={cls} {...props} />
}
