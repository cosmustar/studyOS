// Prática de Reading: texto + questões, cronômetro regressivo e correção ao final.
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStudy } from '../state/StudyContext.jsx'
import { ieltsReadingSets } from '../content/index.js'
import QuestionCard from '../components/QuestionCard.jsx'
import { Card, PageHeader, ContentMeta, ReviewNotice, SourceList, Button } from '../components/ui/index.jsx'
import { formatClock } from '../lib/dates.js'
import NotFound from './NotFound.jsx'

function useCountdown(totalSec, running, resetKey) {
  const [left, setLeft] = useState(totalSec)
  useEffect(() => setLeft(totalSec), [totalSec, resetKey])
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running])
  return left
}

export default function IeltsReading() {
  const { setId } = useParams()
  const set = ieltsReadingSets.find((s) => s.id === setId)
  const { recordAnswer, logActivity, setLastLocation } = useStudy()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const startedAt = useRef(new Date())
  const left = useCountdown((set?.suggestedMinutes ?? 20) * 60, !submitted, attempt)

  useEffect(() => {
    if (set) setLastLocation(`/ielts/reading/${set.id}`, `Reading: ${set.title}`)
  }, [set, setLastLocation])

  if (!set) return <NotFound />

  const allAnswered = set.questions.every((q) => answers[q.id])
  const correctCount = set.questions.filter((q) => answers[q.id] === q.answer).length

  const submit = () => {
    for (const q of set.questions) recordAnswer(q.id, answers[q.id] === q.answer, answers[q.id])
    logActivity({ startedAt: startedAt.current, kind: 'reading', exam: 'ielts-gt', refId: set.id, label: `Reading: ${set.title}`, correct: correctCount, total: set.questions.length })
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const restart = () => { setAnswers({}); setSubmitted(false); setAttempt((n) => n + 1); startedAt.current = new Date() }

  return (
    <div className="animate-in space-y-5">
      <PageHeader
        title={set.title}
        subtitle={`Reading · Section ${set.section}`}
        actions={
          <div className={`rounded-lg border px-3 py-2 font-mono text-sm tabular-nums ${left < 0 ? 'border-rose-400/40 text-rose-200' : 'border-navy-600 text-slate-200'}`} title={set.suggestedMinutesNote}>
            {submitted ? 'Entregue' : left < 0 ? `+${formatClock(left)} além do tempo` : formatClock(left)}
          </div>
        }
      />
      <ContentMeta item={set} />
      <ReviewNotice item={set} />
      <p className="text-xs text-slate-500">{set.suggestedMinutesNote}</p>

      {submitted && (
        <Card>
          <div className="text-2xl font-semibold tabular-nums text-white">{correctCount}/{set.questions.length} corretas</div>
          <p className="mt-1 text-sm text-slate-400">Resultado de exercício interno — não é convertido em band score.</p>
          <div className="mt-3"><Button variant="secondary" onClick={restart}>Refazer</Button></div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-navy-700 bg-navy-900/70 p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          {set.passage.map((p, i) => <p key={i} className="mb-4 font-serif leading-relaxed text-slate-200 last:mb-0">{p}</p>)}
        </article>

        <div className="space-y-4">
          <p className="text-sm text-slate-400">{set.instructions}</p>
          {set.questions.map((q, i) => (
            <Card key={q.id}>
              <QuestionCard number={i + 1} question={q} selected={answers[q.id]} revealed={submitted} onSelect={(id) => setAnswers((a) => ({ ...a, [q.id]: id }))} />
            </Card>
          ))}
          {!submitted && (
            <div className="flex items-center justify-end gap-3">
              {!allAnswered && <span className="text-xs text-slate-500">Responda todas para entregar</span>}
              <Button onClick={submit} disabled={!allAnswered}>Entregar e corrigir</Button>
            </div>
          )}
          <Card title="Fontes"><SourceList ids={set.sourceIds} /></Card>
        </div>
      </div>
    </div>
  )
}
