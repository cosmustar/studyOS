// Lógica de progresso: funções PURAS (recebem o estado, devolvem um novo estado ou números).
// Por serem puras, são fáceis de testar e não dependem de React.

import { DAY_MS, dayKey } from './dates.js'

// ---------- Revisão espaçada (sistema de caixas, determinístico) ----------
// Acertou: sobe uma caixa e a próxima revisão fica mais distante.
// Errou: volta para a caixa 0 e a questão fica disponível para revisão imediatamente.
export const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35]

export function applyAnswer(state, questionId, isCorrect, selected, now = new Date()) {
  const prev = state.questions[questionId] ?? { attempts: 0, correct: 0, box: 0, history: [] }
  const box = isCorrect ? Math.min(prev.box + 1, REVIEW_INTERVAL_DAYS.length - 1) : 0
  const next = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    box,
    lastAnsweredAt: now.toISOString(),
    lastCorrect: isCorrect,
    nextReviewAt: new Date(now.getTime() + REVIEW_INTERVAL_DAYS[box] * DAY_MS).toISOString(),
    // Guardamos só as últimas 20 respostas para o arquivo não crescer sem limite.
    history: [...(prev.history ?? []), { at: now.toISOString(), correct: isCorrect, selected }].slice(-20),
  }
  return { ...state, questions: { ...state.questions, [questionId]: next } }
}

// ---------- Tempo de estudo ----------
export function minutesByDay(activities) {
  const map = {}
  for (const a of activities) {
    const k = dayKey(a.startedAt)
    map[k] = (map[k] ?? 0) + a.durationSec / 60
  }
  return map
}

export function totalMinutes(activities) {
  return activities.reduce((sum, a) => sum + a.durationSec / 60, 0)
}

/** Dias consecutivos com estudo, terminando hoje (ou ontem, se hoje ainda não estudou). */
export function currentStreak(activities, today = new Date()) {
  const days = new Set(activities.map((a) => dayKey(a.startedAt)))
  let cursor = new Date(today)
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return streak
}

// ---------- Desempenho por assunto ----------
/**
 * Agrupa as respostas por assunto.
 * @param topicOf função que, dada uma questão, devolve { key, label } do assunto
 */
export function accuracyByTopic(state, questionById, topicOf) {
  const topics = {}
  for (const [qid, rec] of Object.entries(state.questions)) {
    const q = questionById[qid]
    if (!q) continue // questão removida da biblioteca
    const topic = topicOf(q)
    const t = (topics[topic.key] ??= { ...topic, attempts: 0, correct: 0 })
    t.attempts += rec.attempts
    t.correct += rec.correct
  }
  return Object.values(topics).map((t) => ({ ...t, accuracy: t.attempts ? t.correct / t.attempts : 0 }))
}

// Limiares da recomendação (deterministas e explícitos).
export const WEAK_MIN_ATTEMPTS = 3
export const WEAK_ACCURACY = 0.7

export function weakTopics(topicStats) {
  return topicStats
    .filter((t) => t.attempts >= WEAK_MIN_ATTEMPTS && t.accuracy < WEAK_ACCURACY)
    .sort((a, b) => a.accuracy - b.accuracy)
}

/** Questões cuja próxima revisão já venceu. */
export function dueQuestionIds(state, questionById, now = new Date()) {
  return Object.entries(state.questions)
    .filter(([qid, rec]) => questionById[qid] && new Date(rec.nextReviewAt) <= now)
    .sort((a, b) => new Date(a[1].nextReviewAt) - new Date(b[1].nextReviewAt))
    .map(([qid]) => qid)
}
