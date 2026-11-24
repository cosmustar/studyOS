// Ponto único de acesso à biblioteca de conteúdo.
// Os JSON são importados no build (Vite) — por isso o app funciona offline.
// No futuro, este módulo pode buscar os mesmos dados de uma API sem mudar as páginas.

import sourcesFile from './sources.json'
import objectivesFile from './secplus/objectives.json'
import lessonsFile from './secplus/lessons.json'
import questionsFile from './secplus/questions.json'
import flashcardsFile from './secplus/flashcards.json'
import ieltsSkillsFile from './ielts/skills.json'
import ieltsReadingFile from './ielts/reading.json'
import { validateItem } from '../lib/contentSchema.js'

// Aplica os "defaults" de um arquivo a cada item.
const withDefaults = (file) => file.items.map((item) => ({ ...file.defaults, ...item }))

export const sources = sourcesFile.sources
export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]))

export const secplusObjectives = objectivesFile
export const objectiveByCode = Object.fromEntries(
  objectivesFile.domains.flatMap((d) => d.objectives.map((o) => [o.code, { ...o, domain: d.code, domainTitle: d.title }])),
)

export const ieltsSkills = ieltsSkillsFile.skills

const secplusLessons = lessonsFile.lessons
const secplusQuestions = withDefaults(questionsFile)
const secplusFlashcards = withDefaults(flashcardsFile)

// Questões dos sets de Reading herdam os metadados do set.
const readingSets = ieltsReadingFile.sets
const readingQuestions = readingSets.flatMap((set) =>
  set.questions.map((q) => {
    const { questions: _omit, passage: _p, ...setMeta } = set
    return { ...setMeta, ...q, type: 'mcq', title: q.stem.slice(0, 60), setId: set.id }
  }),
)

export const lessons = secplusLessons
export const questions = [...secplusQuestions, ...readingQuestions]
export const flashcards = secplusFlashcards
export const ieltsReadingSets = readingSets

export const questionById = Object.fromEntries(questions.map((q) => [q.id, q]))
export const lessonById = Object.fromEntries(lessons.map((l) => [l.id, l]))

/** Todos os itens catalogáveis (para a Biblioteca). */
export const catalog = [...lessons, ...secplusQuestions, ...secplusFlashcards, ...readingSets]

// Validação ao carregar: problemas aparecem na Biblioteca e no console.
const ctx = {
  sourceIds: new Set(sources.map((s) => s.id)),
  objectiveCodes: new Set(Object.keys(objectiveByCode)),
}
export const contentProblems = [...catalog, ...readingQuestions].flatMap((item) => validateItem(item, ctx))
if (contentProblems.length) console.warn('[StudyOS] Problemas na biblioteca:', contentProblems)

/** Questões publicadas (arquivadas ficam fora das sessões). */
export const activeQuestions = (filter = {}) =>
  questions.filter(
    (q) =>
      q.validationStatus !== 'archived' &&
      (!filter.exam || q.exam === filter.exam) &&
      (!filter.objectiveCode || q.objectiveCode === filter.objectiveCode) &&
      (!filter.setId || q.setId === filter.setId),
  )

/** Assunto de uma questão, usado para agrupar desempenho. */
export function topicOf(q) {
  if (q.exam === 'secplus') {
    const o = objectiveByCode[q.objectiveCode]
    return { key: `secplus:${q.objectiveCode}`, label: `${q.objectiveCode} ${o?.title ?? ''}`.trim(), exam: 'secplus', path: `/practice?objective=${q.objectiveCode}` }
  }
  const skill = ieltsSkills.find((s) => s.id === q.domain)
  return { key: `ielts:${q.domain}`, label: `IELTS ${skill?.title ?? q.domain}`, exam: 'ielts-gt', path: '/ielts' }
}
