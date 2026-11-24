// Catálogo de conteúdo com rastreabilidade (somente leitura nesta fase).
// A edição/aprovação pelo navegador chega com o painel Admin (Fase 4).
import { useMemo, useState } from 'react'
import { catalog, sources, contentProblems } from '../content/index.js'
import { VALIDATION_STATUSES, EXAMS } from '../lib/contentSchema.js'
import { Card, PageHeader, StatusBadge, OriginBadge, DifficultyBadge, Badge, EmptyState } from '../components/ui/index.jsx'

const TYPE_LABELS = { lesson: 'Aula', mcq: 'Questão', flashcard: 'Flashcard', reading_set: 'Reading set' }

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-navy-600 bg-navy-850 px-2.5 py-1.5 text-sm text-slate-200">
        <option value="">Todos</option>
        {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </label>
  )
}

export default function Library() {
  const [exam, setExam] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')

  const items = useMemo(
    () => catalog.filter((i) => (!exam || i.exam === exam) && (!type || i.type === type) && (!status || i.validationStatus === status)),
    [exam, type, status],
  )
  const counts = Object.fromEntries(Object.keys(VALIDATION_STATUSES).map((s) => [s, catalog.filter((i) => i.validationStatus === s).length]))

  return (
    <div className="animate-in space-y-6">
      <PageHeader title="Biblioteca" subtitle={`${catalog.length} itens · ${Object.entries(counts).map(([s, n]) => `${n} ${VALIDATION_STATUSES[s].toLowerCase()}`).join(' · ')}`} />

      {contentProblems.length > 0 && (
        <Card title={`${contentProblems.length} problema(s) de validação`} className="border-rose-400/30">
          <ul className="list-disc space-y-1 pl-5 text-xs text-rose-200">{contentProblems.map((p) => <li key={p}>{p}</li>)}</ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Select label="Exame" value={exam} onChange={setExam} options={EXAMS} />
        <Select label="Tipo" value={type} onChange={setType} options={TYPE_LABELS} />
        <Select label="Status" value={status} onChange={setStatus} options={VALIDATION_STATUSES} />
      </div>

      <Card className="overflow-x-auto p-0!">
        {items.length === 0 ? (
          <div className="p-5"><EmptyState title="Nenhum item com esses filtros" /></div>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-navy-700 text-xs uppercase tracking-wider text-slate-500">
              <tr>{['Título', 'Tipo', 'Exame / objetivo', 'Status', 'Origem', 'Dific.', 'Verificado'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-navy-850">
                  <td className="px-4 py-3 text-slate-200">{i.title}<div className="text-[11px] text-slate-600">{i.id}</div></td>
                  <td className="px-4 py-3 text-slate-400">{TYPE_LABELS[i.type] ?? i.type}</td>
                  <td className="px-4 py-3 text-slate-400">{i.examVersion ?? EXAMS[i.exam]}{i.objectiveCode ? ` · ${i.objectiveCode}` : ` · ${i.domain}`}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.validationStatus} /></td>
                  <td className="px-4 py-3"><OriginBadge origin={i.origin} /></td>
                  <td className="px-4 py-3"><DifficultyBadge difficulty={i.difficulty} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{i.lastVerified ?? 'nunca (revisão humana)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Fontes cadastradas">
        <ul className="divide-y divide-navy-800">
          {sources.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
              <a href={s.url} target="_blank" rel="noreferrer" className="flex-1 text-sky-300 hover:underline">{s.title}</a>
              {s.official && <Badge tone="blue">Oficial</Badge>}
              <StatusBadge status={s.status} />
              <span className="text-xs text-slate-500">acessada em {s.checkedAt}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
