// Página inicial. Todos os números são calculados a partir do seu histórico salvo —
// nada aqui é fixo. Sem histórico, os cards mostram estados vazios.
import { useMemo } from 'react'
import { useStudy } from '../state/StudyContext.jsx'
import { Card, PageHeader, Stat, ProgressBar, EmptyState, Button, Badge } from '../components/ui/index.jsx'
import { currentWeek, dayKey, formatMinutes, relativeDay } from '../lib/dates.js'
import { minutesByDay, totalMinutes, currentStreak, accuracyByTopic, weakTopics, dueQuestionIds, WEAK_ACCURACY, WEAK_MIN_ATTEMPTS } from '../lib/progress.js'
import { lessons, questions, questionById, topicOf } from '../content/index.js'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function greeting(name) {
  const h = new Date().getHours()
  const part = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return name ? `${part}, ${name}` : part
}

export default function Dashboard() {
  const { state } = useStudy()
  const { activities, settings } = state

  const stats = useMemo(() => {
    const byDay = minutesByDay(activities)
    const topics = accuracyByTopic(state, questionById, topicOf)
    const due = dueQuestionIds(state, questionById)
    const dueByTopic = {}
    for (const id of due) {
      const t = topicOf(questionById[id])
      dueByTopic[t.key] = { ...t, count: (dueByTopic[t.key]?.count ?? 0) + 1 }
    }
    const examProgress = (exam) => {
      const ls = lessons.filter((l) => l.exam === exam)
      const qs = questions.filter((q) => q.exam === exam)
      return {
        lessonsDone: ls.filter((l) => state.lessons[l.id]).length,
        lessonsTotal: ls.length,
        questionsSeen: qs.filter((q) => state.questions[q.id]).length,
        questionsTotal: qs.length,
      }
    }
    return {
      byDay,
      today: byDay[dayKey()] ?? 0,
      total: totalMinutes(activities),
      streak: currentStreak(activities),
      weak: weakTopics(topics),
      due: due.length,
      dueByTopic: Object.values(dueByTopic),
      secplus: examProgress('secplus'),
      ielts: examProgress('ielts-gt'),
    }
  }, [state, activities])

  const week = currentWeek()
  const weekMax = Math.max(settings.dailyGoalMinutes, ...week.map((d) => stats.byDay[dayKey(d)] ?? 0))
  const recent = [...activities].reverse().slice(0, 6)
  const goal = settings.dailyGoalMinutes

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title={greeting(settings.name)}
        subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          state.lastLocation ? (
            <Button to={state.lastLocation.path}>Continuar: {state.lastLocation.label} →</Button>
          ) : (
            <Button to="/secplus">Começar a estudar →</Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <Stat label="Meta de hoje" value={`${Math.round(stats.today)} / ${goal} min`} />
          <div className="mt-3"><ProgressBar value={stats.today} max={goal} /></div>
        </Card>
        <Card><Stat label="Sequência" value={`${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`} hint="dias seguidos com estudo" /></Card>
        <Card><Stat label="Tempo total" value={formatMinutes(stats.total)} hint={`${activities.length} sessões registradas`} /></Card>
        <Card><Stat label="Revisões pendentes" value={stats.due} hint="questões com revisão vencida" /></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Esta semana" className="lg:col-span-2">
          <div className="flex h-40 items-end gap-3">
            {week.map((d, i) => {
              const mins = stats.byDay[dayKey(d)] ?? 0
              const isToday = dayKey(d) === dayKey()
              return (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] tabular-nums text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">{Math.round(mins)}m</span>
                  <div className="relative flex h-28 w-full items-end overflow-hidden rounded-md bg-navy-800">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${mins >= goal ? 'bg-mint-400' : 'bg-mint-500/50'}`}
                      style={{ height: `${(mins / weekMax) * 100}%` }}
                      title={`${formatMinutes(mins)} em ${d.toLocaleDateString('pt-BR')}`}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? 'font-medium text-white' : 'text-slate-500'}`}>{WEEKDAYS[i]}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">Barras em verde sólido = meta diária de {goal} min atingida.</p>
        </Card>

        <Card title="Progresso na biblioteca">
          <div className="space-y-5">
            <ExamProgress label="Security+ (SY0-801)" p={stats.secplus} />
            <ExamProgress label="IELTS General Training" p={stats.ielts} />
          </div>
          <p className="mt-4 text-xs text-slate-500">Relativo ao conteúdo disponível hoje na biblioteca — não é uma estimativa de nota.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Próximas revisões" action={stats.due > 0 && <Button variant="secondary" to="/practice?mode=review">Revisar {stats.due}</Button>}>
          {stats.dueByTopic.length === 0 ? (
            <EmptyState title="Nenhuma revisão vencida">Questões respondidas entram aqui conforme o intervalo de revisão espaçada.</EmptyState>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.dueByTopic.map((t) => (
                <li key={t.key} className="flex justify-between gap-2"><span className="truncate text-slate-300">{t.label}</span><Badge>{t.count}</Badge></li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Precisam de atenção">
          {stats.weak.length === 0 ? (
            <EmptyState title="Nenhum assunto sinalizado">
              Um assunto aparece aqui com {WEAK_MIN_ATTEMPTS}+ respostas e acerto abaixo de {WEAK_ACCURACY * 100}%.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {stats.weak.map((t) => (
                <li key={t.key}>
                  <a href={`#${t.path}`} className="block text-sm text-slate-300 hover:text-white">{t.label}</a>
                  <div className="mt-1 flex items-center gap-2">
                    <ProgressBar value={t.accuracy} tone="warn" />
                    <span className="text-xs tabular-nums text-slate-400">{Math.round(t.accuracy * 100)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Últimas atividades">
          {recent.length === 0 ? (
            <EmptyState title="Nada registrado ainda">Conclua uma aula ou uma prática para começar seu histórico.</EmptyState>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {recent.map((a) => (
                <li key={a.id} className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-slate-300">{a.label}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {a.total ? `${a.correct}/${a.total} · ` : ''}{formatMinutes(a.durationSec / 60)} · {relativeDay(a.startedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function ExamProgress({ label, p }) {
  return (
    <div>
      <div className="mb-1.5 text-sm text-slate-300">{label}</div>
      <div className="space-y-2 text-xs text-slate-500">
        {p.lessonsTotal > 0 && (
          <div>
            <div className="mb-1 flex justify-between"><span>Aulas</span><span className="tabular-nums">{p.lessonsDone}/{p.lessonsTotal}</span></div>
            <ProgressBar value={p.lessonsDone} max={p.lessonsTotal} />
          </div>
        )}
        <div>
          <div className="mb-1 flex justify-between"><span>Questões respondidas</span><span className="tabular-nums">{p.questionsSeen}/{p.questionsTotal}</span></div>
          <ProgressBar value={p.questionsSeen} max={p.questionsTotal} />
        </div>
      </div>
    </div>
  )
}
