// Visão geral do IELTS General Training: formato oficial (com fontes) e práticas disponíveis.
import { Link } from 'react-router-dom'
import { useStudy } from '../state/StudyContext.jsx'
import { ieltsSkills, ieltsReadingSets, sourceById } from '../content/index.js'
import { Card, PageHeader, Badge, StatusBadge, OriginBadge } from '../components/ui/index.jsx'

export default function Ielts() {
  const { state } = useStudy()
  return (
    <div className="animate-in space-y-6">
      <PageHeader title="IELTS General Training" subtitle="Formato conforme ielts.org (acessado em 2026-11-23). Exercícios do StudyOS são originais, não oficiais." />

      <div className="rounded-lg border border-navy-700 bg-navy-900/50 p-4 text-xs leading-relaxed text-slate-400">
        O StudyOS não calcula band scores. Acertos nos exercícios mostram o seu progresso interno e não equivalem a uma avaliação oficial.
        Para estimativas confiáveis, use os testes de prática oficiais e registre-os como resultados externos (planejado para a Fase 3).
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ieltsSkills.map((skill) => {
          const src = sourceById[skill.sourceId]
          return (
            <Card key={skill.id} title={skill.title} action={<a href={src.url} target="_blank" rel="noreferrer" className="text-xs text-sky-300 hover:underline">Fonte oficial ↗</a>}>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-300">{skill.facts.map((f) => <li key={f}>{f}</li>)}</ul>
              {skill.criteria && (
                <div className="mt-4">
                  <div className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Critérios de avaliação</div>
                  <div className="flex flex-wrap gap-1.5">{skill.criteria.map((c) => <Badge key={c}>{c}</Badge>)}</div>
                </div>
              )}
              <div className="mt-5 border-t border-navy-800 pt-4">
                <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">Prática</div>
                {skill.id === 'reading' ? (
                  <ul className="space-y-2">
                    {ieltsReadingSets.map((set) => {
                      const answered = set.questions.filter((q) => state.questions[q.id]).length
                      return (
                        <li key={set.id}>
                          <Link to={`/ielts/reading/${set.id}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-navy-600 p-3 text-sm hover:border-mint-500/50">
                            <span className="flex-1 text-slate-200">Section {set.section}: {set.title}</span>
                            <OriginBadge origin={set.origin} />
                            <StatusBadge status={set.validationStatus} />
                            <span className="text-xs text-slate-500">{answered}/{set.questions.length} respondidas</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Exercícios de {skill.title} ainda não implementados — próxima etapa da Fase 2.</p>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
