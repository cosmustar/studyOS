// Exibe uma aula. O tempo na página é registrado quando você marca a aula como concluída.
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useStudy } from '../state/StudyContext.jsx'
import { lessonById, objectiveByCode, activeQuestions } from '../content/index.js'
import { Card, PageHeader, ContentMeta, ReviewNotice, SourceList, Button } from '../components/ui/index.jsx'
import NotFound from './NotFound.jsx'

function Block({ block }) {
  switch (block.type) {
    case 'h': return <h2 className="mt-8 text-lg font-semibold text-white first:mt-0">{block.text}</h2>
    case 'p': return <p className="mt-3 leading-relaxed text-slate-300">{block.text}</p>
    case 'list': return <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-300">{block.items.map((t) => <li key={t}>{t}</li>)}</ul>
    case 'example': return <div className="mt-4 rounded-lg border-l-2 border-sky-400/60 bg-sky-400/5 p-4 text-sm leading-relaxed text-slate-300"><strong className="text-sky-200">Exemplo prático. </strong>{block.text}</div>
    case 'note': return <div className="mt-4 rounded-lg border-l-2 border-mint-400/60 bg-mint-400/5 p-4 text-sm leading-relaxed text-slate-300">{block.text}</div>
    default: return null
  }
}

export default function LessonPage() {
  const { lessonId } = useParams()
  const lesson = lessonById[lessonId]
  const { state, completeLesson, logActivity, setLastLocation } = useStudy()
  const startedAt = useRef(new Date())

  useEffect(() => {
    if (lesson) setLastLocation(`/secplus/lesson/${lesson.id}`, lesson.title)
  }, [lesson, setLastLocation])

  if (!lesson) return <NotFound />
  const objective = objectiveByCode[lesson.objectiveCode]
  const done = state.lessons[lesson.id]
  const practiceCount = activeQuestions({ objectiveCode: lesson.objectiveCode }).length

  const finish = () => {
    completeLesson(lesson.id)
    logActivity({ startedAt: startedAt.current, kind: 'lesson', exam: lesson.exam, refId: lesson.id, label: `Aula: ${lesson.title}` })
    startedAt.current = new Date()
  }

  return (
    <div className="animate-in mx-auto max-w-3xl space-y-6">
      <PageHeader title={lesson.title} subtitle={`${objective.code} ${objective.title}`} />
      <ContentMeta item={lesson} />
      <ReviewNotice item={lesson} />

      <Card title="Objetivos de aprendizagem">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">{lesson.learningObjectives.map((o) => <li key={o}>{o}</li>)}</ul>
      </Card>

      <article className="rounded-xl border border-navy-700 bg-navy-900/70 p-6 md:p-8">
        {lesson.body.map((b, i) => <Block key={i} block={b} />)}
      </article>

      <Card title="Fontes"><SourceList ids={lesson.sourceIds} /></Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={finish} variant={done ? 'secondary' : 'primary'}>
          {done ? `Concluída em ${new Date(done.completedAt).toLocaleDateString('pt-BR')} · registrar nova leitura` : 'Marcar como concluída'}
        </Button>
        {practiceCount > 0 && <Button variant="secondary" to={`/practice?objective=${lesson.objectiveCode}`}>Praticar {practiceCount} questões →</Button>}
      </div>
    </div>
  )
}
