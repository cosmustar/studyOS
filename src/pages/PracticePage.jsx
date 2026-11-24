// Sessão de prática com correção imediata.
// URLs aceitas:
//   /practice?objective=4.5   → questões de um objetivo da Security+
//   /practice?mode=review     → questões com revisão espaçada vencida
// Cada resposta é salva na hora; a sessão é registrada ao terminar (ou ao sair no meio).
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStudy } from '../state/StudyContext.jsx'
import { activeQuestions, questionById, objectiveByCode, topicOf } from '../content/index.js'
import { dueQuestionIds } from '../lib/progress.js'
import QuestionCard from '../components/QuestionCard.jsx'
import { Card, PageHeader, ContentMeta, ReviewNotice, Button, EmptyState, ProgressBar } from '../components/ui/index.jsx'

function buildSession(params, state) {
  const objective = params.get('objective')
  if (params.get('mode') === 'review') {
    return { label: 'Revisão espaçada', exam: null, ids: dueQuestionIds(state, questionById).slice(0, 20) }
  }
  if (objective && objectiveByCode[objective]) {
    // Prioriza: nunca respondidas e erradas por último → depois as demais.
    const ids = activeQuestions({ exam: 'secplus', objectiveCode: objective })
      .map((q) => q.id)
      .sort((a, b) => priority(state.questions[a]) - priority(state.questions[b]))
    return { label: `Prática ${objective} ${objectiveByCode[objective].title}`, exam: 'secplus', ids }
  }
  return { label: 'Prática', exam: null, ids: [] }
}
const priority = (rec) => (!rec ? 1 : rec.lastCorrect ? 2 : 0)

export default function PracticePage() {
  const [params] = useSearchParams()
  const { state, recordAnswer, logActivity, setLastLocation } = useStudy()
  // useState com função: a sessão é montada uma única vez, mesmo que o progresso mude durante ela.
  const [session] = useState(() => buildSession(params, state))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState([]) // { id, correct }
  const startedAt = useRef(new Date())
  const logged = useRef(false)
  const resultsRef = useRef(results)
  resultsRef.current = results

  const finishLog = () => {
    const r = resultsRef.current
    if (logged.current || r.length === 0) return
    logged.current = true
    logActivity({
      startedAt: startedAt.current, kind: 'practice', exam: session.exam, label: session.label,
      correct: r.filter((x) => x.correct).length, total: r.length,
    })
  }

  useEffect(() => {
    setLastLocation(`/practice?${params.toString()}`, session.label)
    return finishLog // ao sair da página no meio, a parte feita ainda conta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finished = session.ids.length > 0 && index >= session.ids.length
  useEffect(() => {
    if (finished) finishLog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (session.ids.length === 0) {
    return (
      <div className="animate-in mx-auto max-w-2xl">
        <PageHeader title={session.label} />
        <EmptyState title="Não há questões para esta sessão" action={<Button to="/secplus">Ver trilha da Security+</Button>}>
          {params.get('mode') === 'review' ? 'Nenhuma revisão está vencida agora.' : 'Este objetivo ainda não tem questões na biblioteca.'}
        </EmptyState>
      </div>
    )
  }

  if (finished) {
    const correct = results.filter((r) => r.correct).length
    const wrong = results.filter((r) => !r.correct).map((r) => questionById[r.id])
    return (
      <div className="animate-in mx-auto max-w-2xl space-y-6">
        <PageHeader title="Sessão concluída" subtitle={session.label} />
        <Card>
          <div className="text-3xl font-semibold tabular-nums text-white">{correct}/{results.length}</div>
          <div className="mt-1 text-sm text-slate-400">acertos nesta sessão (exercícios internos, não é nota do exame)</div>
          <div className="mt-4"><ProgressBar value={correct} max={results.length} /></div>
        </Card>
        {wrong.length > 0 && (
          <Card title="Para revisar">
            <ul className="space-y-2 text-sm text-slate-300">
              {wrong.map((q) => <li key={q.id}>• {q.title} <span className="text-slate-500">({topicOf(q).label})</span></li>)}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Essas questões voltam na revisão espaçada.</p>
          </Card>
        )}
        <div className="flex gap-3"><Button to="/">Ir ao Dashboard</Button><Button variant="secondary" to="/secplus">Trilha da Security+</Button></div>
      </div>
    )
  }

  const q = questionById[session.ids[index]]
  const confirm = () => {
    const isCorrect = selected === q.answer
    recordAnswer(q.id, isCorrect, selected)
    setResults((r) => [...r, { id: q.id, correct: isCorrect }])
    setRevealed(true)
  }
  const next = () => { setIndex((i) => i + 1); setSelected(null); setRevealed(false) }

  return (
    <div className="animate-in mx-auto max-w-2xl space-y-5">
      <PageHeader title={session.label} subtitle={`Questão ${index + 1} de ${session.ids.length}`} />
      <ProgressBar value={index} max={session.ids.length} />
      <ContentMeta item={q} />
      <Card>
        <QuestionCard question={q} selected={selected} onSelect={setSelected} revealed={revealed} />
      </Card>
      {revealed && <ReviewNotice item={q} />}
      <div className="flex justify-end">
        {revealed
          ? <Button onClick={next}>{index + 1 === session.ids.length ? 'Ver resultado' : 'Próxima →'}</Button>
          : <Button onClick={confirm} disabled={!selected}>Confirmar resposta</Button>}
      </div>
    </div>
  )
}
