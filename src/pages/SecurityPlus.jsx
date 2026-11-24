// Trilha da Security+: domínios e objetivos oficiais SY0-801, com o conteúdo
// disponível e o seu desempenho em cada objetivo.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStudy } from '../state/StudyContext.jsx'
import { Card, PageHeader, ProgressBar, Badge, SourceList, Button } from '../components/ui/index.jsx'
import { secplusObjectives, lessons, activeQuestions, questionById, topicOf } from '../content/index.js'
import { accuracyByTopic } from '../lib/progress.js'

export default function SecurityPlus() {
  const { state } = useStudy()
  const accuracy = useMemo(
    () => Object.fromEntries(accuracyByTopic(state, questionById, topicOf).map((t) => [t.key, t])),
    [state],
  )

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="CompTIA Security+"
        subtitle={`Exame ${secplusObjectives.examVersion} (V8) · objetivos extraídos do documento oficial, acessado em ${secplusObjectives.checkedAt}`}
      />

      <Card>
        <p className="text-sm text-slate-300">
          A CompTIA indica a V8 (SY0-801) como versão recomendada, lançada em 17/11/2026. A V7 (SY0-701) segue disponível
          até 11/06/2027 (inglês). Formato: máximo de 90 questões (múltipla escolha e performance-based), 90 minutos,
          aprovação com 750 numa escala de 100–900.
        </p>
        <div className="mt-3"><SourceList ids={['comptia-secplus-v8', 'comptia-sy0-801-objectives']} /></div>
      </Card>

      {secplusObjectives.domains.map((domain) => (
        <Card key={domain.code} title={<span><span className="text-slate-500">{domain.code}</span> {domain.title}</span>} action={<Badge>{domain.weight}% do exame</Badge>}>
          <ul className="divide-y divide-navy-800">
            {domain.objectives.map((o) => {
              const ls = lessons.filter((l) => l.objectiveCode === o.code && l.validationStatus !== 'archived')
              const qs = activeQuestions({ exam: 'secplus', objectiveCode: o.code })
              const acc = accuracy[`secplus:${o.code}`]
              const hasContent = ls.length > 0 || qs.length > 0
              return (
                <li key={o.code} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-200">
                      <span className="mr-2 tabular-nums text-slate-500">{o.code}</span>{o.title}
                    </div>
                    {acc && (
                      <div className="mt-1.5 flex max-w-xs items-center gap-2">
                        <ProgressBar value={acc.accuracy} tone={acc.accuracy < 0.7 ? 'warn' : 'mint'} />
                        <span className="shrink-0 text-xs tabular-nums text-slate-400">{Math.round(acc.accuracy * 100)}% em {acc.attempts}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {!hasContent && <span className="text-xs text-slate-600">Conteúdo ainda não criado</span>}
                    {ls.map((l) => (
                      <Link key={l.id} to={`/secplus/lesson/${l.id}`} className="rounded-md border border-navy-600 px-2.5 py-1 text-xs text-slate-200 hover:border-mint-500/50">
                        {state.lessons[l.id] ? '✓ ' : ''}Aula
                      </Link>
                    ))}
                    {qs.length > 0 && <Button variant="secondary" size="sm" to={`/practice?objective=${o.code}`}>Praticar ({qs.length})</Button>}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      ))}
    </div>
  )
}
